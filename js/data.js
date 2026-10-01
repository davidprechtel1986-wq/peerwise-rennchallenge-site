/* Shared storage + league config for PEERWISE Team-Challenge */
window.PW = (function () {
  var STORAGE = "pw-rennchallenge-drivers-v8";
  var RANKING_KEY = "pw-rennchallenge-day-ranking-v1";
  var META_KEY = "pw-rennchallenge-meta-v1";
  var STREAK_KEY = "pw-rennchallenge-streaks-v1";
  var DAY_SYNC_KEY = "pw-rennchallenge-day-sync-v1";
  var DAY_HISTORY_KEY = "pw-rennchallenge-day-history-v1";
  var ROSTER_KEY = "pw-rennchallenge-roster-v1";
  var MUTE_KEY = "pw-rennchallenge-mute-v1";
  var PACK_KEY = "pw-rennchallenge-soundpack-v1";
  var PASS_KEY = "pw-rennchallenge-pass-v3";
  var SOUND_PACKS = ["stadion", "arcade", "quiet"];
  var SESSION = "pw-rennchallenge-session-v3";
  var ADMIN_PASSWORD = "1986";
  var START = new Date("2026-09-23T00:00:00");
  // Nachoffiziell Ende 30.09. — Nachtrage-Frist bis 07.10. (Admin / fehlende Tageszahlen)
  var END = new Date("2026-10-07T23:59:59");
  var MAX_PLACES = 20;

  var LIGAS = {
    high: { id: "high", n: 1, title: "HIGH PERFORMERS", note: "1 Bahn", slots: 1 },
    rising: { id: "rising", n: 2, title: "RISING STARS", note: "1 Bahn", slots: 1 },
    challengers: { id: "challengers", n: 3, title: "CHALLENGERS", note: "1 Bahn · Warteliste (WL)", slots: 1 }
  };

  // Start: alles 0 — je Liga genau 1 Auto
  var DEMO = [
    { id: "h1", name: "", league: "high", ins: 0, color: "#e30613", number: 1, vehicle: "bobby" },
    { id: "r1", name: "", league: "rising", ins: 0, color: "#1565c0", number: 2, vehicle: "bobby" },
    { id: "c1", name: "", league: "challengers", ins: 0, color: "#f9a825", number: 3, vehicle: "bobby" }
  ];

  // Alte Passwort-Keys entfernen, fest auf 1986 setzen
  try {
    localStorage.removeItem("pw-rennchallenge-pass-v1");
    localStorage.removeItem("pw-rennchallenge-pass-v2");
    localStorage.setItem(PASS_KEY, ADMIN_PASSWORD);
  } catch (e) {}

  var API = "/api/state";
  var STATIC_STATE = "/data/live.json";
  // false = speichern erlaubt, wenn /api/state erreichbar (lokaler Server).
  // Online (GitHub Pages) fällt Lesen auf live.json zurück; Schreiben nur lokal.
  var STATIC_HOST = false;
  var remoteReady = null; // null=unknown, true/false
  var pushTimer = null;

  function snapshot() {
    return {
      drivers: load(),
      ranking: loadRanking(),
      meta: loadMeta(),
      streaks: (function () {
        try {
          return JSON.parse(localStorage.getItem(STREAK_KEY) || "{}");
        } catch (e) {
          return { high: [], rising: [], challengers: [] };
        }
      })(),
      daySync: loadDaySync(),
      dayHistory: loadDayHistory(),
      roster: loadRoster(),
      updatedAt: Date.now()
    };
  }

  function rankingNameCount(ranking) {
    var n = 0;
    var keys = ["high", "rising", "challengers"];
    for (var k = 0; k < keys.length; k++) {
      var list = (ranking && ranking[keys[k]]) || [];
      for (var i = 0; i < list.length; i++) {
        if (String(list[i].name || "").trim()) n++;
      }
    }
    return n;
  }

  function rosterNameCount(roster) {
    var n = 0;
    var keys = ["high", "rising", "challengers"];
    for (var k = 0; k < keys.length; k++) {
      var list = (roster && roster[keys[k]]) || [];
      n += list.length;
    }
    return n;
  }

  function applySnapshot(state) {
    if (!state || typeof state !== "object") return;

    var localRanking = null;
    var localRoster = null;
    try {
      localRanking = JSON.parse(localStorage.getItem(RANKING_KEY) || "null");
    } catch (e1) {}
    try {
      localRoster = JSON.parse(localStorage.getItem(ROSTER_KEY) || "null");
    } catch (e2) {}

    if (Array.isArray(state.drivers)) {
      localStorage.setItem(STORAGE, JSON.stringify(state.drivers));
    }

    if (state.ranking) {
      var remoteR = normalizeRanking(state.ranking);
      // Leeren Server-Stand nicht über volle lokale Namen-Liste legen
      if (rankingNameCount(remoteR) === 0 && rankingNameCount(localRanking) > 0) {
        remoteR = normalizeRanking(localRanking);
      }
      localStorage.setItem(RANKING_KEY, JSON.stringify(remoteR));
    }

    if (state.roster) {
      var remoteRoster = normalizeRoster(state.roster);
      if (rosterNameCount(remoteRoster) === 0 && rosterNameCount(localRoster) > 0) {
        remoteRoster = normalizeRoster(localRoster);
      }
      localStorage.setItem(ROSTER_KEY, JSON.stringify(remoteRoster));
    } else if (rosterNameCount(localRoster) > 0) {
      localStorage.setItem(ROSTER_KEY, JSON.stringify(normalizeRoster(localRoster)));
    }

    if (state.meta) {
      localStorage.setItem(
        META_KEY,
        JSON.stringify({
          comment: String(state.meta.comment || ""),
          commentDate: String(state.meta.commentDate || "")
        })
      );
    }
    if (state.streaks) {
      localStorage.setItem(STREAK_KEY, JSON.stringify(state.streaks));
    }
    if (state.daySync) {
      localStorage.setItem(DAY_SYNC_KEY, JSON.stringify(state.daySync));
    }
    if (state.dayHistory && typeof state.dayHistory === "object") {
      localStorage.setItem(DAY_HISTORY_KEY, JSON.stringify(state.dayHistory));
    }
    try {
      localStorage.setItem("pw-rennchallenge-ping", String(Date.now()));
    } catch (e) {}
  }

  function isSparseSnapshot(snap) {
    var driverIns = 0;
    var list = (snap && snap.drivers) || [];
    for (var i = 0; i < list.length; i++) driverIns += Number(list[i].ins) || 0;
    return (
      rosterNameCount(snap && snap.roster) === 0 &&
      rankingNameCount(snap && snap.ranking) === 0 &&
      driverIns === 0
    );
  }

  function pushRemote() {
    if (STATIC_HOST) return; // feste Online-Version: kein Schreiben
    clearTimeout(pushTimer);
    pushTimer = setTimeout(function () {
      var snap = snapshot();
      // Leeren Browser-Stand nicht auf den Server schreiben (sonst gehen Namen/INS verloren)
      if (isSparseSnapshot(snap)) {
        return;
      }
      var body = JSON.stringify(snap);
      try {
        fetch(API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: body
        })
          .then(function (r) {
            remoteReady = r.ok;
          })
          .catch(function () {
            remoteReady = false;
          });
      } catch (e) {
        remoteReady = false;
      }
    }, 120);
  }

  function pullRemote() {
    var url = STATIC_HOST ? STATIC_STATE : API;
    return fetch(url, { method: "GET", cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error("api");
        return r.json();
      })
      .then(function (state) {
        remoteReady = true;
        applySnapshot(state);
        return state;
      })
      .catch(function () {
        // Fallback: wenn /api/state fehlt, live.json versuchen
        if (!STATIC_HOST) {
          return fetch(STATIC_STATE, { method: "GET", cache: "no-store" })
            .then(function (r) {
              if (!r.ok) throw new Error("static");
              return r.json();
            })
            .then(function (state) {
              remoteReady = true;
              applySnapshot(state);
              return state;
            })
            .catch(function () {
              remoteReady = false;
              return null;
            });
        }
        remoteReady = false;
        return null;
      });
  }

  // Erststart: Server-Stand laden (damit Mods denselben Stand sehen)
  try {
    pullRemote();
  } catch (e) {}

  function uid() {
    return "p_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 6);
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE);
      if (!raw) {
        save(DEMO);
        return DEMO.slice();
      }
      var list = JSON.parse(raw);
      return Array.isArray(list) ? list : DEMO.slice();
    } catch (e) {
      return DEMO.slice();
    }
  }

  function save(list) {
    localStorage.setItem(STORAGE, JSON.stringify(list));
    pushRemote();
  }

  function sorted(list) {
    return list.slice().sort(function (a, b) {
      return (b.ins - a.ins) || String(a.name).localeCompare(String(b.name));
    });
  }

  function byLiga(list, id) {
    return sorted(list.filter(function (d) { return d.league === id; }));
  }

  function maxIns(list) {
    var m = 0;
    for (var i = 0; i < list.length; i++) m = Math.max(m, Number(list[i].ins) || 0);
    return Math.max(100, m);
  }

  /** 0..1 Fortschritt auf der Ovalbahn */
  function lapProgress(ins, ceiling) {
    var v = Math.max(0, Number(ins) || 0);
    return Math.min(0.97, v / ceiling);
  }

  function checkPass(input) {
    var typed = String(input || "").trim();
    var stored = "";
    try {
      stored = String(localStorage.getItem(PASS_KEY) || "").trim();
    } catch (e) {}
    return typed === ADMIN_PASSWORD || (stored && typed === stored);
  }

  function getPass() {
    return ADMIN_PASSWORD;
  }

  function setPass(p) {
    var next = String(p || "").trim();
    if (next.length >= 4) {
      localStorage.setItem(PASS_KEY, next);
    }
  }

  function unlocked() {
    return sessionStorage.getItem(SESSION) === "1";
  }

  function unlock() {
    sessionStorage.setItem(SESSION, "1");
  }

  function lock() {
    sessionStorage.removeItem(SESSION);
  }

  function esc(s) {
    return String(s)
      .split("&").join("&amp;")
      .split("<").join("&lt;")
      .split(">").join("&gt;")
      .split('"').join("&quot;");
  }

  function vehicleSvg(type, color) {
    var c = color || "#ff4fd8";
    if (type === "bubble") {
      return (
        '<svg viewBox="0 0 90 50" aria-hidden="true">' +
        '<ellipse cx="48" cy="28" rx="34" ry="18" fill="#f4f7ff" stroke="#7ec8ff" stroke-width="3"/>' +
        '<path d="M28 40 L22 48 L36 42 Z" fill="#f4f7ff" stroke="#7ec8ff" stroke-width="2"/>' +
        '<circle cx="38" cy="26" r="3" fill="#222"/><circle cx="54" cy="26" r="3" fill="#222"/>' +
        '<path d="M42 32 Q48 36 54 32" stroke="#222" stroke-width="2" fill="none"/>' +
        '<rect x="14" y="30" width="12" height="6" rx="2" fill="' + c + '"/>' +
        "</svg>"
      );
    }
    if (type === "mug") {
      return (
        '<svg viewBox="0 0 90 50" aria-hidden="true">' +
        '<rect x="24" y="10" width="40" height="30" rx="6" fill="' + c + '" stroke="#222" stroke-width="2"/>' +
        '<path d="M64 16 h10 a8 8 0 0 1 0 18 h-10" fill="none" stroke="#222" stroke-width="3"/>' +
        '<rect x="20" y="36" width="48" height="8" rx="2" fill="#333"/>' +
        '<circle cx="30" cy="44" r="5" fill="#111"/><circle cx="58" cy="44" r="5" fill="#111"/>' +
        '<circle cx="36" cy="22" r="2.5" fill="#222"/><circle cx="50" cy="22" r="2.5" fill="#222"/>' +
        '<path d="M38 28 Q43 32 48 28" stroke="#222" fill="none" stroke-width="2"/>' +
        "</svg>"
      );
    }
    if (type === "chair") {
      return (
        '<svg viewBox="0 0 90 50" aria-hidden="true">' +
        '<rect x="34" y="6" width="28" height="22" rx="4" fill="' + c + '" stroke="#222" stroke-width="2"/>' +
        '<rect x="30" y="26" width="36" height="8" rx="2" fill="#444"/>' +
        '<circle cx="28" cy="40" r="9" fill="#222" stroke="#888" stroke-width="2"/>' +
        '<circle cx="66" cy="40" r="9" fill="#222" stroke="#888" stroke-width="2"/>' +
        '<circle cx="40" cy="16" r="2" fill="#111"/><circle cx="54" cy="16" r="2" fill="#111"/>' +
        "</svg>"
      );
    }
    return (
      '<svg viewBox="0 0 90 50" aria-hidden="true">' +
      '<path d="M12 30 L22 18 H58 L78 28 L78 36 H12 Z" fill="' + c + '" stroke="#1a0828" stroke-width="2"/>' +
      '<path d="M28 18 L34 10 H52 L58 18 Z" fill="rgba(255,255,255,0.35)"/>' +
      '<circle cx="28" cy="38" r="7" fill="#111"/><circle cx="66" cy="38" r="7" fill="#111"/>' +
      '<circle cx="28" cy="38" r="3" fill="#666"/><circle cx="66" cy="38" r="3" fill="#666"/>' +
      '<rect x="40" y="22" width="14" height="6" rx="2" fill="rgba(255,255,255,0.25)"/>' +
      '<path d="M8 28 L2 24 L4 28 L2 32 Z" fill="#ff7a3d"/>' +
      "</svg>"
    );
  }

  /**
   * Position auf Ovalbahn (Pferderennbahn-Layout).
   * t=0 Start unten Mitte, gegen den Uhrzeigersinn.
   * lane 0 = innere Bahn, höher = weiter außen.
   */
  function ovalPoint(t, lane, laneCount) {
    var cx = 50;
    var cy = 50;
    var lanes = Math.max(1, laneCount);
    var baseRx = 38;
    var baseRy = 28;
    var step = 2.2;
    var rx = baseRx - (lanes - 1 - lane) * step;
    var ry = baseRy - (lanes - 1 - lane) * step * 0.75;
    // Start unten (süden), dann gegen Uhrzeigersinn
    var angle = Math.PI / 2 + t * Math.PI * 2;
    var x = cx + rx * Math.cos(angle);
    var y = cy + ry * Math.sin(angle);
    // Tangente für Rotation der Autos
    var tx = -rx * Math.sin(angle);
    var ty = ry * Math.cos(angle);
    var deg = (Math.atan2(ty, tx) * 180) / Math.PI;
    return { x: x, y: y, rot: deg };
  }

  function emptyRanking() {
    return {
      high: [],
      rising: [],
      challengers: []
    };
  }

  function emptyRoster() {
    return { high: [], rising: [], challengers: [], locked: false };
  }

  function normalizeRoster(raw) {
    var base = emptyRoster();
    var keys = ["high", "rising", "challengers"];
    for (var k = 0; k < keys.length; k++) {
      var id = keys[k];
      var arr = raw && Array.isArray(raw[id]) ? raw[id] : [];
      var names = [];
      for (var i = 0; i < arr.length && names.length < MAX_PLACES; i++) {
        var name = typeof arr[i] === "string" ? arr[i] : String((arr[i] && arr[i].name) || "");
        name = name.trim();
        if (!name) continue;
        names.push(name);
      }
      base[id] = names;
    }
    base.locked = !!(raw && raw.locked) || rosterNameCount(base) > 0;
    return base;
  }

  function loadRoster() {
    try {
      var raw = localStorage.getItem(ROSTER_KEY);
      if (!raw) return emptyRoster();
      return normalizeRoster(JSON.parse(raw));
    } catch (e) {
      return emptyRoster();
    }
  }

  function saveRoster(roster) {
    var next = normalizeRoster(roster || emptyRoster());
    localStorage.setItem(ROSTER_KEY, JSON.stringify(next));
    pushRemote();
    return next;
  }

  function isRosterLocked() {
    var r = loadRoster();
    return !!(r.locked && rosterNameCount(r) > 0);
  }

  /** Aktuelle Namensliste aus Ranking übernehmen und festsetzen */
  function lockRosterFromRanking(ranking) {
    var src = ranking || loadRanking();
    var roster = emptyRoster();
    var keys = ["high", "rising", "challengers"];
    for (var k = 0; k < keys.length; k++) {
      var id = keys[k];
      var list = src[id] || [];
      for (var i = 0; i < list.length; i++) {
        var name = String(list[i].name || "").trim();
        if (name) roster[id].push(name);
      }
    }
    roster.locked = rosterNameCount(roster) > 0;
    return saveRoster(roster);
  }

  /** Anzeige: feste Namen + Tages-INS (sortiert nach INS) */
  function rankingForDisplay(ranking) {
    var roster = loadRoster();
    var src = ranking || loadRanking();
    if (!isRosterLocked()) return normalizeRanking(src);

    var out = emptyRanking();
    var keys = ["high", "rising", "challengers"];
    for (var k = 0; k < keys.length; k++) {
      var id = keys[k];
      var names = roster[id] || [];
      var byName = {};
      var list = src[id] || [];
      for (var i = 0; i < list.length; i++) {
        var nm = String(list[i].name || "").trim().toLowerCase();
        if (nm) byName[nm] = Math.max(0, Number(list[i].ins) || 0);
      }
      var rows = names.map(function (name) {
        return { name: name, ins: byName[String(name).toLowerCase()] || 0 };
      });
      rows.sort(function (a, b) {
        return b.ins - a.ins || a.name.localeCompare(b.name);
      });
      for (var p = 0; p < rows.length; p++) rows[p].place = p + 1;
      out[id] = rows;
    }
    return out;
  }

  function normalizeRanking(raw) {
    var base = emptyRanking();
    var keys = ["high", "rising", "challengers"];
    for (var k = 0; k < keys.length; k++) {
      var id = keys[k];
      var arr = raw && Array.isArray(raw[id]) ? raw[id] : [];
      var cleaned = [];
      for (var i = 0; i < arr.length && cleaned.length < MAX_PLACES; i++) {
        var name = String(arr[i].name || "").trim();
        var ins = Math.max(0, Number(arr[i].ins) || 0);
        if (!name && ins <= 0) continue;
        cleaned.push({
          place: cleaned.length + 1,
          name: name,
          ins: ins
        });
      }
      cleaned.sort(function (a, b) {
        return (b.ins - a.ins) || a.name.localeCompare(b.name);
      });
      for (var p = 0; p < cleaned.length; p++) cleaned[p].place = p + 1;
      base[id] = cleaned;
    }
    return base;
  }

  function loadRanking() {
    try {
      var raw = localStorage.getItem(RANKING_KEY);
      if (!raw) return emptyRanking();
      return normalizeRanking(JSON.parse(raw));
    } catch (e) {
      return emptyRanking();
    }
  }

  function saveRanking(data) {
    var normalized = normalizeRanking(data);
    // Bei festem Roster Namen aus Roster erzwingen
    if (isRosterLocked()) {
      var roster = loadRoster();
      var keys = ["high", "rising", "challengers"];
      var forced = emptyRanking();
      for (var k = 0; k < keys.length; k++) {
        var id = keys[k];
        var names = roster[id] || [];
        var byName = {};
        var list = (data && data[id]) || normalized[id] || [];
        for (var i = 0; i < list.length; i++) {
          var nm = String(list[i].name || "").trim().toLowerCase();
          if (nm) byName[nm] = Math.max(0, Number(list[i].ins) || 0);
        }
        for (var n = 0; n < names.length; n++) {
          var name = names[n];
          forced[id].push({
            place: n + 1,
            name: name,
            ins: byName[String(name).toLowerCase()] || 0
          });
        }
      }
      normalized = normalizeRanking(forced);
    }
    localStorage.setItem(RANKING_KEY, JSON.stringify(normalized));
    try {
      localStorage.setItem("pw-rennchallenge-ping", String(Date.now()));
    } catch (e) {}
    pushRemote();
    return normalized;
  }

  function rankingSum(list) {
    var s = 0;
    for (var i = 0; i < list.length; i++) s += Number(list[i].ins) || 0;
    return s;
  }

  function loadDaySync() {
    try {
      var raw = localStorage.getItem(DAY_SYNC_KEY);
      if (!raw) return { date: "", high: 0, rising: 0, challengers: 0 };
      var o = JSON.parse(raw);
      return {
        date: String(o.date || ""),
        high: Math.max(0, Number(o.high) || 0),
        rising: Math.max(0, Number(o.rising) || 0),
        challengers: Math.max(0, Number(o.challengers) || 0)
      };
    } catch (e) {
      return { date: "", high: 0, rising: 0, challengers: 0 };
    }
  }

  function saveDaySync(sync) {
    var next = {
      date: String((sync && sync.date) || ""),
      high: Math.max(0, Number(sync && sync.high) || 0),
      rising: Math.max(0, Number(sync && sync.rising) || 0),
      challengers: Math.max(0, Number(sync && sync.challengers) || 0)
    };
    localStorage.setItem(DAY_SYNC_KEY, JSON.stringify(next));
    pushRemote();
    return next;
  }

  /**
   * Tages-Summen auf Gesamt-INS der 3 Cars verrechnen.
   * Neuer Tag = voll draufaddieren. Gleicher Tag erneut speichern = nur Differenz (kein Doppelzählen).
   */
  function applyDaySumsToGesamt(ranking, dateKey) {
    var day = dateKey || todayKey();
    var sums = {
      high: rankingSum((ranking && ranking.high) || []),
      rising: rankingSum((ranking && ranking.rising) || []),
      challengers: rankingSum((ranking && ranking.challengers) || [])
    };
    var prev = loadDaySync();
    var delta = { high: 0, rising: 0, challengers: 0 };
    var mode = "new";

    if (prev.date === day) {
      mode = "adjust";
      delta.high = sums.high - prev.high;
      delta.rising = sums.rising - prev.rising;
      delta.challengers = sums.challengers - prev.challengers;
    } else {
      delta.high = sums.high;
      delta.rising = sums.rising;
      delta.challengers = sums.challengers;
    }

    var list = load();
    var byNum = { 1: "high", 2: "rising", 3: "challengers" };
    for (var i = 0; i < list.length; i++) {
      var key = byNum[Number(list[i].number)];
      if (!key) continue;
      list[i].ins = Math.max(0, (Number(list[i].ins) || 0) + delta[key]);
    }
    save(list);
    saveDaySync({ date: day, high: sums.high, rising: sums.rising, challengers: sums.challengers });
    try {
      localStorage.setItem("pw-rennchallenge-ping", String(Date.now()));
    } catch (e) {}

    var totals = { high: 0, rising: 0, challengers: 0 };
    for (var t = 0; t < list.length; t++) {
      var n = Number(list[t].number);
      var v = Math.round(Number(list[t].ins) || 0);
      if (n === 1) totals.high = v;
      if (n === 2) totals.rising = v;
      if (n === 3) totals.challengers = v;
    }

    return {
      day: day,
      mode: mode,
      sums: sums,
      delta: delta,
      totals: totals
    };
  }

  function loadMeta() {
    try {
      var raw = localStorage.getItem(META_KEY);
      if (!raw) return { comment: "", commentDate: "" };
      var m = JSON.parse(raw);
      return {
        comment: String(m.comment || ""),
        commentDate: String(m.commentDate || "")
      };
    } catch (e) {
      return { comment: "", commentDate: "" };
    }
  }

  function saveMeta(meta) {
    var next = {
      comment: String((meta && meta.comment) || "").trim(),
      commentDate: String((meta && meta.commentDate) || todayKey())
    };
    localStorage.setItem(META_KEY, JSON.stringify(next));
    try {
      localStorage.setItem("pw-rennchallenge-ping", String(Date.now()));
    } catch (e) {}
    pushRemote();
    return next;
  }

  function todayKey() {
    var d = new Date();
    var m = d.getMonth() + 1;
    var day = d.getDate();
    return d.getFullYear() + "-" + (m < 10 ? "0" : "") + m + "-" + (day < 10 ? "0" : "") + day;
  }

  function loadStreakLog() {
    try {
      var raw = localStorage.getItem(STREAK_KEY);
      if (!raw) return { high: [], rising: [], challengers: [] };
      var o = JSON.parse(raw);
      return {
        high: Array.isArray(o.high) ? o.high : [],
        rising: Array.isArray(o.rising) ? o.rising : [],
        challengers: Array.isArray(o.challengers) ? o.challengers : []
      };
    } catch (e) {
      return { high: [], rising: [], challengers: [] };
    }
  }

  function saveStreakLog(log) {
    localStorage.setItem(STREAK_KEY, JSON.stringify(log));
    pushRemote();
  }

  /** Speichert Tages-Sieger (Platz 1) je Liga und berechnet Streaks */
  function recordDayWinners(ranking, dateKey) {
    var day = dateKey || todayKey();
    var log = loadStreakLog();
    var keys = ["high", "rising", "challengers"];
    for (var i = 0; i < keys.length; i++) {
      var id = keys[i];
      var list = (ranking && ranking[id]) || [];
      var winner = list[0] && list[0].name ? String(list[0].name).trim() : "";
      if (!winner) continue;
      var arr = log[id].filter(function (e) {
        return e.date !== day;
      });
      arr.push({ date: day, name: winner });
      arr.sort(function (a, b) {
        return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
      });
      log[id] = arr;
    }
    saveStreakLog(log);
    return log;
  }

  function loadDayHistory() {
    try {
      return JSON.parse(localStorage.getItem(DAY_HISTORY_KEY) || "{}") || {};
    } catch (e) {
      return {};
    }
  }

  function saveDayHistory(hist) {
    localStorage.setItem(DAY_HISTORY_KEY, JSON.stringify(hist || {}));
    pushRemote();
  }

  /** Speichert die Tages-INS je Person für die 7-Tage-Seite */
  function recordDayHistory(ranking, dateKey) {
    var day = dateKey || todayKey();
    var hist = loadDayHistory();
    var pack = { high: {}, rising: {}, challengers: {} };
    var keys = ["high", "rising", "challengers"];
    for (var i = 0; i < keys.length; i++) {
      var id = keys[i];
      var list = (ranking && ranking[id]) || [];
      for (var j = 0; j < list.length; j++) {
        var nm = String(list[j].name || "").trim();
        if (!nm) continue;
        pack[id][nm] = Math.max(0, Math.round(Number(list[j].ins) || 0));
      }
    }
    hist[day] = pack;
    saveDayHistory(hist);
    return hist;
  }

  function getStreak(name, ligaId) {
    var n = String(name || "").trim().toLowerCase();
    if (!n) return 0;
    var log = loadStreakLog()[ligaId] || [];
    if (!log.length) return 0;
    var streak = 0;
    for (var i = log.length - 1; i >= 0; i--) {
      if (String(log[i].name || "").trim().toLowerCase() === n) streak++;
      else break;
    }
    return streak;
  }

  function initials(name) {
    var parts = String(name || "").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function avatarColor(name) {
    var s = String(name || "");
    var h = 0;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
    return "hsl(" + h + " 70% 42%)";
  }

  function isMuted() {
    try {
      return localStorage.getItem(MUTE_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  function setMuted(on) {
    try {
      localStorage.setItem(MUTE_KEY, on ? "1" : "0");
    } catch (e) {}
  }

  function getSoundPack() {
    try {
      var p = String(localStorage.getItem(PACK_KEY) || "stadion");
      return SOUND_PACKS.indexOf(p) >= 0 ? p : "stadion";
    } catch (e) {
      return "stadion";
    }
  }

  function setSoundPack(pack) {
    var p = String(pack || "stadion");
    if (SOUND_PACKS.indexOf(p) < 0) p = "stadion";
    try {
      localStorage.setItem(PACK_KEY, p);
    } catch (e) {}
    return p;
  }

  function challengeEnded() {
    return new Date() > END;
  }

  return {
    STORAGE: STORAGE,
    RANKING_KEY: RANKING_KEY,
    META_KEY: META_KEY,
    STREAK_KEY: STREAK_KEY,
    PACK_KEY: PACK_KEY,
    SOUND_PACKS: SOUND_PACKS,
    DAY_SYNC_KEY: DAY_SYNC_KEY,
    ROSTER_KEY: ROSTER_KEY,
    LIGAS: LIGAS,
    START: START,
    END: END,
    ADMIN_PASSWORD: ADMIN_PASSWORD,
    MAX_PLACES: MAX_PLACES,
    uid: uid,
    load: load,
    save: save,
    loadRanking: loadRanking,
    saveRanking: saveRanking,
    rankingSum: rankingSum,
    emptyRanking: emptyRanking,
    loadRoster: loadRoster,
    saveRoster: saveRoster,
    isRosterLocked: isRosterLocked,
    lockRosterFromRanking: lockRosterFromRanking,
    rankingForDisplay: rankingForDisplay,
    loadDaySync: loadDaySync,
    saveDaySync: saveDaySync,
    applyDaySumsToGesamt: applyDaySumsToGesamt,
    loadMeta: loadMeta,
    saveMeta: saveMeta,
    todayKey: todayKey,
    recordDayWinners: recordDayWinners,
    recordDayHistory: recordDayHistory,
    loadDayHistory: loadDayHistory,
    getStreak: getStreak,
    initials: initials,
    avatarColor: avatarColor,
    isMuted: isMuted,
    setMuted: setMuted,
    getSoundPack: getSoundPack,
    setSoundPack: setSoundPack,
    challengeEnded: challengeEnded,
    STATIC_HOST: STATIC_HOST,
    pullRemote: pullRemote,
    pushRemote: pushRemote,
    sorted: sorted,
    byLiga: byLiga,
    maxIns: maxIns,
    lapProgress: lapProgress,
    checkPass: checkPass,
    getPass: getPass,
    setPass: setPass,
    unlocked: unlocked,
    unlock: unlock,
    lock: lock,
    esc: esc,
    vehicleSvg: vehicleSvg,
    ovalPoint: ovalPoint
  };
})();
