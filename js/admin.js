(function () {
  var PASS = "1986";
  var loginView = document.getElementById("loginView");
  var insView = document.getElementById("insView");
  var loginErr = document.getElementById("loginErr");
  var saveOk = document.getElementById("saveOk");
  var saveErr = document.getElementById("saveErr");
  var rankOk = document.getElementById("rankOk");
  var rankErr = document.getElementById("rankErr");
  var MAX = (window.PW && PW.MAX_PLACES) || 20;

  function hide(el) {
    if (el) el.classList.add("is-hidden");
  }
  function show(el) {
    if (el) el.classList.remove("is-hidden");
  }

  function goLogin() {
    show(loginView);
    hide(insView);
  }
  function goIns() {
    hide(loginView);
    show(insView);
    function fill() {
      // Namen aus lokalem Stand festsetzen, falls noch nicht gelockt
      try {
        if (window.PW && !PW.isRosterLocked()) {
          var r = PW.loadRanking();
          var has = false;
          ["high", "rising", "challengers"].forEach(function (id) {
            (r[id] || []).forEach(function (row) {
              if (String(row.name || "").trim()) has = true;
            });
          });
          if (has) PW.lockRosterFromRanking(r);
        }
      } catch (e) {}
      loadValues();
      initEntryDate();
      buildRankForm();
      loadRankForm();
      loadCommentForm();
    }
    if (window.PW && PW.pullRemote) {
      PW.pullRemote().then(fill).catch(fill);
    } else {
      fill();
    }
  }

  function loadCommentForm() {
    var input = document.getElementById("adminCommentInput");
    if (!input) return;
    var meta = window.PW && PW.loadMeta ? PW.loadMeta() : { comment: "" };
    input.value = meta.comment || "";
  }

  function saveComment() {
    var input = document.getElementById("adminCommentInput");
    var text = input ? String(input.value || "").trim().slice(0, 160) : "";
    if (window.PW && PW.saveMeta) {
      PW.saveMeta({ comment: text, commentDate: PW.todayKey() });
    } else {
      localStorage.setItem(
        "pw-rennchallenge-meta-v1",
        JSON.stringify({ comment: text, commentDate: new Date().toISOString().slice(0, 10) })
      );
      try {
        localStorage.setItem("pw-rennchallenge-ping", String(Date.now()));
      } catch (e) {}
    }
    if (input) input.value = text;
  }

  function defaultDrivers() {
    return [
      { id: "h1", name: "", league: "high", ins: 0, color: "#e30613", number: 1, vehicle: "bobby" },
      { id: "r1", name: "", league: "rising", ins: 0, color: "#1565c0", number: 2, vehicle: "bobby" },
      { id: "c1", name: "", league: "challengers", ins: 0, color: "#f9a825", number: 3, vehicle: "bobby" }
    ];
  }

  function readDrivers() {
    try {
      if (window.PW && typeof PW.load === "function") {
        var list = PW.load();
        if (Array.isArray(list) && list.length) return list;
      }
    } catch (e) {}
    try {
      var raw = localStorage.getItem("pw-rennchallenge-drivers-v8");
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch (e2) {}
    return defaultDrivers();
  }

  function writeDrivers(list) {
    if (window.PW && typeof PW.save === "function") PW.save(list);
    else localStorage.setItem("pw-rennchallenge-drivers-v8", JSON.stringify(list));
    try {
      localStorage.setItem("pw-rennchallenge-ping", String(Date.now()));
    } catch (e3) {}
  }

  function normalize() {
    var list = readDrivers();
    var byNum = {};
    for (var i = 0; i < list.length; i++) byNum[Number(list[i].number)] = list[i];
    var next = defaultDrivers().map(function (d) {
      var old = byNum[d.number];
      if (!old) return d;
      return {
        id: old.id || d.id,
        name: old.name || "",
        league: d.league,
        ins: Math.max(0, Number(old.ins) || 0),
        color: old.color || d.color,
        number: d.number,
        vehicle: "bobby"
      };
    });
    writeDrivers(next);
    return next;
  }

  function loadValues() {
    var list = normalize();
    var map = {};
    for (var i = 0; i < list.length; i++) map[Number(list[i].number)] = list[i];
    document.getElementById("ins1").value = map[1] ? Math.round(map[1].ins) : 0;
    document.getElementById("ins2").value = map[2] ? Math.round(map[2].ins) : 0;
    document.getElementById("ins3").value = map[3] ? Math.round(map[3].ins) : 0;
  }

  function saveValues() {
    var list = normalize();
    var values = {
      1: Math.max(0, Number(document.getElementById("ins1").value) || 0),
      2: Math.max(0, Number(document.getElementById("ins2").value) || 0),
      3: Math.max(0, Number(document.getElementById("ins3").value) || 0)
    };
    for (var i = 0; i < list.length; i++) {
      var n = Number(list[i].number);
      if (values[n] !== undefined) list[i].ins = values[n];
    }
    writeDrivers(list);
  }

  function cats() {
    return [
      { id: "high", title: "1. HIGH PERFORMERS", cls: "high" },
      { id: "rising", title: "2. RISING STARS", cls: "rising" },
      { id: "challengers", title: "3. CHALLENGERS", cls: "challengers" }
    ];
  }

  function buildRankForm() {
    var grid = document.getElementById("rankGrid");
    var locked = window.PW && PW.isRosterLocked && PW.isRosterLocked();
    var roster = window.PW && PW.loadRoster ? PW.loadRoster() : { high: [], rising: [], challengers: [] };

    grid.innerHTML = cats()
      .map(function (c) {
        var lines = "";
        if (locked) {
          var names = roster[c.id] || [];
          if (!names.length) {
            lines = '<p class="rank-empty">Keine festen Namen in dieser Liga.</p>';
          } else {
            for (var i = 0; i < names.length; i++) {
              lines +=
                '<div class="rank-line locked">' +
                "<span>" +
                (i + 1) +
                ".</span>" +
                '<span class="rank-fixed-name" title="Name fest">' +
                (window.PW ? PW.esc(names[i]) : names[i]) +
                "</span>" +
                '<input type="hidden" data-cat="' +
                c.id +
                '" data-place="' +
                (i + 1) +
                '" data-field="name" value="' +
                String(names[i]).replace(/"/g, "&quot;") +
                '" />' +
                '<input type="number" min="0" step="1" placeholder="INS heute" data-cat="' +
                c.id +
                '" data-place="' +
                (i + 1) +
                '" data-field="ins" />' +
                "</div>";
            }
          }
        } else {
          for (var p = 1; p <= MAX; p++) {
            lines +=
              '<div class="rank-line">' +
              "<span>" +
              p +
              ".</span>" +
              '<input type="text" maxlength="40" placeholder="Name" data-cat="' +
              c.id +
              '" data-place="' +
              p +
              '" data-field="name" />' +
              '<input type="number" min="0" step="1" placeholder="INS" data-cat="' +
              c.id +
              '" data-place="' +
              p +
              '" data-field="ins" />' +
              "</div>";
          }
        }
        return '<div class="rank-cat ' + c.cls + '"><h3>' + c.title + "</h3>" + lines + "</div>";
      })
      .join("");

    var status = document.getElementById("rosterStatus");
    var lockBtn = document.getElementById("lockNamesBtn");
    if (status) {
      if (locked) {
        var total =
          (roster.high || []).length + (roster.rising || []).length + (roster.challengers || []).length;
        status.textContent =
          "✓ " +
          total +
          " Namen fest (HP " +
          (roster.high || []).length +
          " · RS " +
          (roster.rising || []).length +
          " · CH " +
          (roster.challengers || []).length +
          ") — nur noch Tages-INS eintragen. Speichern aktualisiert die Hauptseite automatisch.";
        status.className = "msg-ok";
      } else {
        status.textContent =
          "Namen noch nicht fest. Eintragen & „Namen festsetzen“ klicken — danach nur noch INS.";
        status.className = "sub";
      }
    }
    if (lockBtn) lockBtn.hidden = !!locked;
  }

  function loadRankForm() {
    var ranking = window.PW && PW.loadRanking ? PW.loadRanking() : { high: [], rising: [], challengers: [] };
    var locked = window.PW && PW.isRosterLocked && PW.isRosterLocked();
    var roster = window.PW && PW.loadRoster ? PW.loadRoster() : null;

    cats().forEach(function (c) {
      if (locked && roster) {
        var names = roster[c.id] || [];
        var byName = {};
        (ranking[c.id] || []).forEach(function (r) {
          var nm = String(r.name || "").trim().toLowerCase();
          if (nm) byName[nm] = Math.round(Number(r.ins) || 0);
        });
        for (var i = 0; i < names.length; i++) {
          var insEl = document.querySelector(
            'input[data-cat="' + c.id + '"][data-place="' + (i + 1) + '"][data-field="ins"]'
          );
          if (insEl) {
            var v = byName[String(names[i]).toLowerCase()] || 0;
            insEl.value = v ? v : "";
          }
        }
      } else {
        var list = ranking[c.id] || [];
        for (var p = 1; p <= MAX; p++) {
          var row = list[p - 1] || { name: "", ins: "" };
          var nameEl = document.querySelector(
            'input[data-cat="' + c.id + '"][data-place="' + p + '"][data-field="name"]'
          );
          var insEl2 = document.querySelector(
            'input[data-cat="' + c.id + '"][data-place="' + p + '"][data-field="ins"]'
          );
          if (nameEl) nameEl.value = row.name || "";
          if (insEl2) insEl2.value = row.ins ? Math.round(row.ins) : "";
        }
      }
    });
  }

  function lockNamesNow() {
    var data = collectRanking();
    // Falls Formular schon locked: Namen aus Roster/Hidden
    if (window.PW && PW.lockRosterFromRanking) {
      var roster = PW.lockRosterFromRanking(data);
      var n =
        (roster.high || []).length + (roster.rising || []).length + (roster.challengers || []).length;
      if (n <= 0) {
        alert("Keine Namen gefunden. Bitte zuerst Namen eintragen und speichern.");
        return false;
      }
      // Ranking mit festen Namen speichern (INS behalten)
      if (PW.saveRanking) PW.saveRanking(data);
      buildRankForm();
      loadRankForm();
      return true;
    }
    return false;
  }

  function collectRanking() {
    var data = { high: [], rising: [], challengers: [] };
    cats().forEach(function (c) {
      for (var p = 1; p <= MAX; p++) {
        var nameEl = document.querySelector('input[data-cat="' + c.id + '"][data-place="' + p + '"][data-field="name"]');
        var insEl = document.querySelector('input[data-cat="' + c.id + '"][data-place="' + p + '"][data-field="ins"]');
        var name = nameEl ? String(nameEl.value || "").trim() : "";
        var ins = insEl ? Math.max(0, Number(insEl.value) || 0) : 0;
        if (name || ins > 0) data[c.id].push({ place: p, name: name, ins: ins });
      }
    });
    return data;
  }

  function entryDayKey() {
    var el = document.getElementById("entryDate");
    if (el && el.value) return String(el.value);
    if (window.PW && PW.loadDaySync) {
      var sync = PW.loadDaySync();
      if (sync && sync.date) return sync.date;
    }
    return window.PW && PW.todayKey ? PW.todayKey() : new Date().toISOString().slice(0, 10);
  }

  function initEntryDate() {
    var el = document.getElementById("entryDate");
    if (!el) return;
    var preferred = "2026-09-30";
    try {
      if (window.PW && PW.loadDaySync) {
        var sync = PW.loadDaySync();
        if (sync && sync.date) preferred = sync.date;
      }
    } catch (e) {}
    el.value = preferred;
  }

  function saveRanking() {
    var data = collectRanking();
    var dayKey = entryDayKey();
    var saved =
      window.PW && PW.saveRanking
        ? PW.saveRanking(data)
        : (function () {
            localStorage.setItem("pw-rennchallenge-day-ranking-v1", JSON.stringify(data));
            return data;
          })();
    if (window.PW && PW.recordDayWinners) PW.recordDayWinners(saved);

    // Tages-Summen automatisch auf Gesamt-INS der Challenges / Cars verrechnen
    var applied = null;
    if (window.PW && PW.applyDaySumsToGesamt) {
      applied = PW.applyDaySumsToGesamt(saved, dayKey);
      document.getElementById("ins1").value = applied.totals.high;
      document.getElementById("ins2").value = applied.totals.rising;
      document.getElementById("ins3").value = applied.totals.challengers;
    }

    try {
      localStorage.setItem("pw-rennchallenge-ping", String(Date.now()));
    } catch (e) {}
    loadRankForm();
    return applied;
  }

  function syncSumsToCars() {
    var data = collectRanking();
    var saved = window.PW && PW.saveRanking ? PW.saveRanking(data) : data;
    var add1 = PW.rankingSum(saved.high || []);
    var add2 = PW.rankingSum(saved.rising || []);
    var add3 = PW.rankingSum(saved.challengers || []);

    // Auf bestehende Gesamt-INS draufrechnen (nicht ersetzen)
    var cur1 = Math.max(0, Number(document.getElementById("ins1").value) || 0);
    var cur2 = Math.max(0, Number(document.getElementById("ins2").value) || 0);
    var cur3 = Math.max(0, Number(document.getElementById("ins3").value) || 0);
    document.getElementById("ins1").value = cur1 + add1;
    document.getElementById("ins2").value = cur2 + add2;
    document.getElementById("ins3").value = cur3 + add3;
    saveValues();
  }

  function isLoggedIn() {
    try {
      return sessionStorage.getItem("pw-admin-ok") === "1";
    } catch (e) {
      return false;
    }
  }
  function setLoggedIn(ok) {
    try {
      if (ok) sessionStorage.setItem("pw-admin-ok", "1");
      else sessionStorage.removeItem("pw-admin-ok");
    } catch (e) {}
  }

  if (isLoggedIn()) goIns();
  else goLogin();

  document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    hide(loginErr);
    var typed = String(document.getElementById("pw").value || "").trim();
    var ok = typed === PASS;
    try {
      if (window.PW && PW.checkPass) ok = ok || PW.checkPass(typed);
    } catch (err) {}
    if (ok) {
      setLoggedIn(true);
      try {
        if (window.PW && PW.unlock) PW.unlock();
      } catch (e2) {}
      document.getElementById("pw").value = "";
      goIns();
    } else {
      loginErr.textContent = "Falsches Passwort.";
      show(loginErr);
    }
  });

  document.getElementById("logoutBtn").addEventListener("click", function () {
    setLoggedIn(false);
    try {
      if (window.PW && PW.lock) PW.lock();
    } catch (e) {}
    goLogin();
  });

  document.getElementById("insForm").addEventListener("submit", function (e) {
    e.preventDefault();
    hide(saveOk);
    hide(saveErr);
    try {
      saveValues();
      show(saveOk);
      setTimeout(function () {
        hide(saveOk);
      }, 2500);
    } catch (err) {
      saveErr.textContent = "Fehler: " + (err && err.message ? err.message : err);
      show(saveErr);
    }
  });

  document.getElementById("zeroBtn").addEventListener("click", function () {
    if (!confirm("Gesamt-INS der 3 Cars auf 0?")) return;
    document.getElementById("ins1").value = "0";
    document.getElementById("ins2").value = "0";
    document.getElementById("ins3").value = "0";
    saveValues();
    show(saveOk);
  });

  document.getElementById("rankForm").addEventListener("submit", function (e) {
    e.preventDefault();
    hide(rankOk);
    hide(rankErr);
    try {
      var applied = saveRanking();
      if (applied) {
        var d = applied.delta;
        var sign = function (n) {
          return (n >= 0 ? "+" : "") + Math.round(n);
        };
        rankOk.textContent =
          "Gespeichert · Tages-Summen auf Gesamt verrechnet (" +
          applied.day +
          "): HP " +
          sign(d.high) +
          " · RS " +
          sign(d.rising) +
          " · CH " +
          sign(d.challengers) +
          " → Gesamt " +
          applied.totals.high +
          " / " +
          applied.totals.rising +
          " / " +
          applied.totals.challengers;
      } else {
        rankOk.textContent = "Bestenliste gespeichert.";
      }
      show(rankOk);
      setTimeout(function () {
        hide(rankOk);
      }, 5000);
    } catch (err) {
      rankErr.textContent = "Fehler: " + (err && err.message ? err.message : err);
      show(rankErr);
    }
  });

  document.getElementById("lockNamesBtn").addEventListener("click", function () {
    if (!confirm("Aktuelle Namen jetzt festsetzen?\nDanach kannst du nur noch die Tages-INS ändern.")) return;
    if (lockNamesNow()) {
      show(rankOk);
      rankOk.textContent = "Namen festgesetzt — ab jetzt nur noch INS eintragen.";
    }
  });

  document.getElementById("clearRankBtn").addEventListener("click", function () {
    if (window.PW && PW.isRosterLocked && PW.isRosterLocked()) {
      if (!confirm("Nur die Tages-INS auf 0 setzen?\nDie festen Namen bleiben erhalten.")) return;
      var roster = PW.loadRoster();
      var data = { high: [], rising: [], challengers: [] };
      ["high", "rising", "challengers"].forEach(function (id) {
        (roster[id] || []).forEach(function (name, i) {
          data[id].push({ place: i + 1, name: name, ins: 0 });
        });
      });
      if (PW.saveRanking) PW.saveRanking(data);
      try {
        localStorage.setItem("pw-rennchallenge-ping", String(Date.now()));
      } catch (e) {}
      loadRankForm();
      show(rankOk);
      rankOk.textContent = "Tages-INS geleert — Namen unverändert.";
      return;
    }
    if (!confirm("Tages-Bestenliste leeren?\n\nDie Gesamt-INS der Bobby Cars bleiben unverändert.")) return;
    if (window.PW && PW.saveRanking) PW.saveRanking(PW.emptyRanking());
    else
      localStorage.setItem(
        "pw-rennchallenge-day-ranking-v1",
        JSON.stringify({ high: [], rising: [], challengers: [] })
      );
    try {
      localStorage.setItem("pw-rennchallenge-ping", String(Date.now()));
    } catch (e) {}
    loadRankForm();
    show(rankOk);
    rankOk.textContent = "Liste geleert — Gesamt-INS der Autos unverändert.";
  });

  var commentOk = document.getElementById("commentOk");
  var commentErr = document.getElementById("commentErr");

  document.getElementById("commentForm").addEventListener("submit", function (e) {
    e.preventDefault();
    hide(commentOk);
    hide(commentErr);
    try {
      saveComment();
      commentOk.textContent = "Kommentar gespeichert — sichtbar auf der Rennstrecke.";
      show(commentOk);
      setTimeout(function () {
        hide(commentOk);
      }, 2500);
    } catch (err) {
      commentErr.textContent = "Fehler: " + (err && err.message ? err.message : err);
      show(commentErr);
    }
  });

  document.getElementById("clearCommentBtn").addEventListener("click", function () {
    document.getElementById("adminCommentInput").value = "";
    saveComment();
    commentOk.textContent = "Kommentar gelöscht.";
    show(commentOk);
  });
})();
