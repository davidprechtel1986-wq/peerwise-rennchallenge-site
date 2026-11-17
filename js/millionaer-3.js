(function () {
  "use strict";

  var EVENT_START = new Date(2026, 10, 28);
  var EVENT_END = new Date(2026, 10, 30);
  var MILLION = 2000;
  var GAME_BEST_KEY = "millionaer-coin-catcher-best";
  var SOUND_KEY = "millionaer-city-sound";
  var INTRO_KEY = "millionaer-intro-done";
  var GOLD_KEY = "millionaer-gold-found";
  var STAGE_KEY = "millionaer-stages";

  var CHAPTERS = [
    { n: 1, title: "Ganz unten", date: "28.11." },
    { n: 2, title: "Der Aufstieg", date: "29.11." },
    { n: 3, title: "Die Millionärsgala", date: "30.11." }
  ];

  var STAGES = [
    { min: 0, id: "bettler", name: "Bettler", hint: "Ganz unten, mit dem Becher in der Hand." },
    { min: 100, id: "strasse", name: "Straßenkante", hint: "Der erste Schritt raus aus dem Rinnstein." },
    { min: 250, id: "dachkammer", name: "Dachkammer", hint: "Ein Dach über dem Kopf, noch ohne Aufzug." },
    { min: 500, id: "wohnung", name: "Stadtwohnung", hint: "Mitten in der Metropole, Licht an." },
    { min: 800, id: "penthouse", name: "Penthouse", hint: "Oben in den Wolken, Skyline inklusive." },
    { min: 1200, id: "villa", name: "Villa am Meer", hint: "Der Blick geht schon raus aufs Wasser." },
    { min: 2000, id: "yacht", name: "Millionär auf Yacht", hint: "Das große Finale: Champagner auf Deck." }
  ];

  var PALETTE = [
    { look: "short", gender: "m", glasses: true, color: "#38bdf8", hair: "#2a2a2a" },
    { look: "pigtails", gender: "f", glasses: true, color: "#ff6b9d", hair: "#5c3a1e" },
    { look: "beard", gender: "m", glasses: true, color: "#facc15", hair: "#5c3a1e" },
    { look: "ponytail", gender: "f", glasses: true, color: "#a78bfa", hair: "#3b1f12" },
    { look: "cap", gender: "m", glasses: false, color: "#34d399", hair: "#333333" },
    { look: "mohawk", gender: "m", glasses: false, color: "#fb923c", hair: "#1a1410" }
  ];

  /* Namen kommen spaeter. Jede Person so eintragen:
     { name: 'NameHier', gender: 'm', look: 'short', glasses: false, color: '#f5d76e', hair: '#2a1a10', mood: 0, ins: 0 }
  */
  var PEOPLE = [];

  function eventStart() { return new Date(EVENT_START.getFullYear(), EVENT_START.getMonth(), EVENT_START.getDate()); }
  function eventEndExclusive() { return new Date(EVENT_END.getFullYear(), EVENT_END.getMonth(), EVENT_END.getDate() + 1); }

  function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }

  function dayStatus(now) {
    now = now || new Date();
    if (now < eventStart()) return "soon";
    if (now >= eventEndExclusive()) return "done";
    return "today";
  }

  function currentChapter(now) {
    now = now || new Date();
    if (now < eventStart()) return -1;
    if (now >= eventEndExclusive()) return 3;
    var days = Math.floor((startOfDay(now) - eventStart()) / 86400000);
    return Math.max(0, Math.min(2, days));
  }

  function reducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function formatDeNumber(n) {
    var num = Number(n);
    if (!isFinite(num)) num = 0;
    try { return num.toLocaleString("de-DE"); } catch (err) { return String(num); }
  }

  function sum(list) {
    var t = 0;
    for (var i = 0; i < list.length; i++) t += Number(list[i].ins) || 0;
    return t;
  }

  function maxIns(list) {
    var m = 0;
    for (var i = 0; i < list.length; i++) if ((list[i].ins || 0) > m) m = list[i].ins;
    return m;
  }

  function decorate(raw) {
    var list = (raw || []).map(function (p, i) {
      var pal = PALETTE[i % PALETTE.length];
      return {
        name: p.name,
        gender: p.gender || pal.gender,
        look: p.look || pal.look,
        glasses: !!p.glasses,
        color: p.color || pal.color,
        hair: p.hair || pal.hair,
        mood: p.mood || 0,
        ins: Number(p.ins) || 0,
        bib: i + 1
      };
    });
    var rows = ranked(list);
    for (var i = 0; i < rows.length; i++) rows[i].person.place = rows[i].place;
    return list;
  }

  function ranked(list) {
    var rows = list.map(function (p) { return { person: p, ins: p.ins || 0 }; });
    rows.sort(function (a, b) { return b.ins - a.ins || a.person.name.localeCompare(b.person.name, "de"); });
    var last = null, place = 0;
    for (var i = 0; i < rows.length; i++) {
      if (last === null || rows[i].ins !== last) { place = i + 1; last = rows[i].ins; }
      rows[i].place = place;
    }
    return rows;
  }

  function isFirst(p, list) {
    if (!list.length) return false;
    var rows = ranked(list);
    return rows[0] && rows[0].person.name === p.name && (p.ins || 0) > 0;
  }

  function stageFor(ins) {
    var found = STAGES[0];
    for (var i = 0; i < STAGES.length; i++) if (ins >= STAGES[i].min) found = STAGES[i];
    return found;
  }

  function nextStage(ins) {
    for (var i = 0; i < STAGES.length; i++) if (ins < STAGES[i].min) return STAGES[i];
    return null;
  }

  function applyDayNight() {
    var h = new Date().getHours();
    var mode = h >= 21 || h < 6 ? "night" : h < 8 ? "dawn" : h < 17 ? "day" : "dusk";
    if (!document.body) return mode;
    document.body.classList.remove("is-night", "is-dawn", "is-day", "is-dusk");
    document.body.classList.add("is-" + mode);
    return mode;
  }

  function toast(msg) {
    var el = document.getElementById("cityToast");
    if (!el) return;
    el.hidden = false;
    el.textContent = msg;
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.hidden = true; }, 2800);
  }

  function pad(n) { return n < 10 ? "0" + n : String(n); }

  function renderChapters() {
    var status = dayStatus();
    var ch = currentChapter();
    var items = document.querySelectorAll("#chapterStrip li");
    for (var i = 0; i < items.length; i++) {
      items[i].classList.remove("is-soon", "is-live", "is-done");
      if (status === "soon") items[i].classList.add("is-soon");
      else if (status === "done") items[i].classList.add("is-done");
      else if (i === ch) items[i].classList.add("is-live");
      else if (i < ch) items[i].classList.add("is-done");
      else items[i].classList.add("is-soon");
    }
    var banner = document.getElementById("chapterBanner");
    if (banner) {
      if (status === "soon") banner.textContent = "Start am 28.11. · Drei Kapitel: Ganz unten · Der Aufstieg · Die Millionärsgala";
      else if (status === "done") banner.textContent = "Die Millionärsgala ist vorbei. Danke an alle Aufsteiger!";
      else banner.textContent = "Jetzt live: Tag " + (ch + 1) + " · " + CHAPTERS[ch].title;
    }
    document.body.classList.toggle("chapter-3", status === "today" && ch === 2);
  }

  function renderClock() {
    var board = document.getElementById("countdownBoard");
    var clock = document.getElementById("eventClock");
    var pill = document.getElementById("livePill");
    var now = new Date();
    var status = dayStatus(now);
    var ch = currentChapter(now);
    var target, label, pillText, pillClass = "";
    if (status === "soon") {
      target = eventStart();
      label = "START 28.11. IN";
      pillText = " SOON";
    } else if (status === "done") {
      target = null;
      label = "MILLIONÄRSGALA BEENDET";
      pillText = " ENDE";
      pillClass = "is-done";
    } else if (ch === 2) {
      target = eventEndExclusive();
      label = "LIVE · MILLIONÄRSGALA";
      pillText = " LIVE";
      pillClass = "is-live";
    } else {
      var dayEnd = new Date(eventStart().getTime() + (ch + 1) * 86400000);
      target = dayEnd;
      label = "LIVE · KAPITEL " + (ch + 1) + " · " + CHAPTERS[ch].title.toUpperCase();
      pillText = " LIVE";
      pillClass = "is-live";
    }
    if (pill) {
      pill.className = "live-pill" + (pillClass ? " " + pillClass : "");
      pill.innerHTML = "<i></i>" + pillText;
    }
    if (clock) {
      clock.textContent = (status === "soon" ? "COUNTDOWN" : status === "done" ? "ENDE" : "LIVE") + " · " + pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds());
    }
    if (!board) return;
    if (!target) {
      board.innerHTML = '<p class="status">' + esc(label) + "</p>";
      return;
    }
    var diff = Math.max(0, target - now);
    var sec = Math.floor(diff / 1000);
    var days = Math.floor(sec / 86400);
    var hrs = Math.floor((sec % 86400) / 3600);
    var mins = Math.floor((sec % 3600) / 60);
    var secs = sec % 60;
    board.innerHTML =
      '<p class="status">' + esc(label) + "</p>" +
      '<div class="cd-grid">' +
      '<div class="cd-cell"><b id="cdDays">' + pad(days) + "</b><span>TAGE</span></div>" +
      '<div class="cd-cell"><b>' + pad(hrs) + "</b><span>STD</span></div>" +
      '<div class="cd-cell"><b>' + pad(mins) + "</b><span>MIN</span></div>" +
      '<div class="cd-cell"><b>' + pad(secs) + "</b><span>SEK</span></div>" +
      "</div>";
  }

  function tickerLines(list) {
    var status = dayStatus();
    var ch = currentChapter();
    var bits = [
      "PEERWISE · DER WEG ZUM MILLIONÄR — 28. BIS 30. NOVEMBER 2026",
      "Drei Kapitel: 28.11. Ganz unten · 29.11. Der Aufstieg · 30.11. Die Millionärsgala"
    ];
    if (status === "soon") bits.push("Start am 28.11. — die Stadt wartet auf die ersten Aufsteiger.");
    else if (status === "done") bits.push("Die Millionärsgala ist beendet.");
    else bits.push("Jetzt live: " + CHAPTERS[ch].title + ".");
    if (!list.length) bits.push("Noch ist niemand in der Metropole. Die Namen kommen noch.");
    else {
      ranked(list).forEach(function (r) {
        bits.push(r.person.name + " " + r.person.ins + " Ins · " + stageFor(r.person.ins).name + " · Platz " + r.place);
      });
      bits.push("Tresor: " + sum(list) + " Ins");
    }
    return bits;
  }

  function renderTicker(list) {
    var el = document.getElementById("tickerTrack");
    if (!el) return;
    var line = tickerLines(list).join("  •  ") + "  •  ";
    el.innerHTML = "<span>" + esc(line) + "</span><span>" + esc(line) + "</span>";
  }

  function renderVault(list) {
    var el = document.getElementById("coinPotTotal");
    if (el) el.textContent = formatDeNumber(sum(list));
  }

  function renderLadder() {
    var el = document.getElementById("ladderList");
    if (!el) return;
    el.innerHTML = STAGES.map(function (s) {
      return "<li><b>" + esc(s.name) + "</b><span>ab " + formatDeNumber(s.min) + " Ins — " + esc(s.hint) + "</span></li>";
    }).join("");
  }


  var figureSeq = 0;

  function clothesFor(stageId, gender) {
    var female = gender === "f";
    var map = {
      bettler: { body: "#6b4a2a", body2: "#4a3018", pants: "#3a2a1c", shoes: "#2a1a10", accent: "#8a5a30", kind: "rags" },
      strasse: { body: "#3a3a48", body2: "#2a2a38", pants: "#1f1f2a", shoes: "#111118", accent: "#5a5a70", kind: "hoodie" },
      dachkammer: { body: "#f2efe8", body2: "#d4cfc4", pants: "#3a4a62", shoes: "#2a2a32", accent: "#4a5a7a", kind: "shirt" },
      wohnung: { body: "#3a6a8a", body2: "#2a4a6a", pants: "#1e2a3a", shoes: "#1a1a22", accent: "#c9a227", kind: "smart" },
      penthouse: { body: "#1a1a28", body2: "#0e0e16", pants: "#12121a", shoes: "#0a0a10", accent: "#f5d76e", kind: "suit" },
      villa: { body: "#16161f", body2: "#0b0b12", pants: "#101018", shoes: "#08080c", accent: "#f5d76e", kind: "designer" },
      yacht: female
        ? { body: "#d4a017", body2: "#7a4a10", pants: "#c9a227", shoes: "#f5d76e", accent: "#fff6c2", kind: "gown" }
        : { body: "#f5d76e", body2: "#b8860b", pants: "#c9a227", shoes: "#1a1020", accent: "#fff6c2", kind: "gold-suit" }
    };
    return map[stageId] || map.bettler;
  }

  function figureSvg(p, opts) {
    opts = opts || {};
    var stage = stageFor(p.ins);
    var sid = stage.id;
    var female = p.gender === "f";
    var uid = "fg" + (++figureSeq);
    var hair = p.hair || "#2a1a10";
    var accent = p.color || "#f5d76e";
    var fit = clothesFor(sid, p.gender);
    var shades = sid === "villa" || sid === "yacht";
    var glasses = !!p.glasses && !shades;
    var delay = (((p.bib || figureSeq) * 0.41) % 2.4).toFixed(2);
    var aura = sid === "penthouse" || sid === "villa" || sid === "yacht";
    var particles = sid === "villa" || sid === "yacht";
    var crown = !!opts.crown;
    var holdCup = sid === "bettler";
    var holdGlass = sid === "yacht";

    var defs =
      "<defs>" +
      '<radialGradient id="sk' + uid + '" cx="32%" cy="28%"><stop offset="0%" stop-color="#f7d7bc"/><stop offset="70%" stop-color="#e8c2a0"/><stop offset="100%" stop-color="#c38a62"/></radialGradient>' +
      '<linearGradient id="cl' + uid + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="' + fit.body + '"/><stop offset="55%" stop-color="' + fit.body2 + '"/><stop offset="100%" stop-color="' + fit.body2 + '"/></linearGradient>' +
      '<linearGradient id="hr' + uid + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="' + hair + '"/><stop offset="100%" stop-color="#111"/></linearGradient>' +
      '<linearGradient id="gd' + uid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff6c2"/><stop offset="45%" stop-color="#f5d76e"/><stop offset="100%" stop-color="#8a5a10"/></linearGradient>' +
      '<radialGradient id="au' + uid + '" cx="50%" cy="40%"><stop offset="0%" stop-color="' + accent + '" stop-opacity="0.55"/><stop offset="100%" stop-color="' + accent + '" stop-opacity="0"/></radialGradient>' +
      "</defs>";

    var shadow = '<ellipse class="fig-shadow" cx="40" cy="124" rx="18" ry="4.5" fill="rgba(0,0,0,0.4)"/>';
    var auraG = aura ? '<ellipse class="fig-aura" cx="40" cy="70" rx="28" ry="48" fill="url(#au' + uid + ')"/>' : "";
    var parts = "";
    if (particles) {
      parts = '<g class="fig-spark">' +
        '<circle cx="18" cy="40" r="1.4" fill="#fff6c2"/><circle cx="62" cy="52" r="1.2" fill="#f5d76e"/>' +
        '<circle cx="22" cy="86" r="1.1" fill="#fff"/><circle cx="58" cy="30" r="1.3" fill="#fff6c2"/>' +
        '<circle cx="48" cy="18" r="1" fill="#ffe08a"/>' +
        "</g>";
    }

    var hairBack = "";
    var hairFront = "";
    if (p.look === "pigtails") {
      hairBack = '<path d="M22 22 Q20 36 16 44" stroke="url(#hr' + uid + ')" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M58 22 Q60 36 64 44" stroke="url(#hr' + uid + ')" stroke-width="5" fill="none" stroke-linecap="round"/>';
      hairFront = '<path d="M26 16 Q40 8 54 16 Q56 26 40 26 Q24 26 26 16Z" fill="url(#hr' + uid + ')"/><circle cx="16" cy="44" r="4" fill="' + hair + '"/><circle cx="64" cy="44" r="4" fill="' + hair + '"/><circle cx="16" cy="44" r="1.6" fill="' + accent + '"/><circle cx="64" cy="44" r="1.6" fill="' + accent + '"/>';
    } else if (p.look === "ponytail") {
      hairBack = '<path d="M54 22 Q70 28 64 48 Q60 58 56 54" fill="url(#hr' + uid + ')"/>';
      hairFront = '<path d="M26 16 Q40 8 54 16 Q56 26 40 25 Q24 26 26 16Z" fill="url(#hr' + uid + ')"/><circle cx="54" cy="22" r="2.2" fill="' + accent + '"/>';
    } else if (p.look === "mohawk") {
      hairFront = '<path d="M36 6 L44 6 L46 22 L34 22 Z" fill="url(#hr' + uid + ')"/><path d="M28 16 Q40 12 52 16" fill="none" stroke="' + hair + '" stroke-width="2"/>';
    } else if (p.look === "cap") {
      hairFront = '<path d="M26 18 Q40 8 54 18 L54 22 H26Z" fill="' + accent + '" stroke="#1a1020" stroke-width="1"/><path d="M22 20 H36" stroke="' + accent + '" stroke-width="4" stroke-linecap="round"/>';
    } else {
      hairFront = '<path d="M26 16 Q40 7 54 16 Q57 24 40 24 Q23 24 26 16Z" fill="url(#hr' + uid + ')"/>';
      if (!female) hairFront += '<path d="M26 22 Q28 28 27 32" fill="none" stroke="' + hair + '" stroke-width="2"/>';
    }

    var beard = (p.look === "beard" || (p.look === "cap" && !female))
      ? '<path d="M31 36 Q40 46 49 36 Q47 42 40 43 Q33 42 31 36Z" fill="' + hair + '" opacity="0.92"/>'
      : "";

    var lashes = female ? '<path d="M31 27 L29 25 M34 26 L33 24" stroke="#1a1020" stroke-width="0.8" fill="none"/><path d="M49 27 L51 25 M46 26 L47 24" stroke="#1a1020" stroke-width="0.8" fill="none"/>' : "";
    var face =
      '<circle cx="40" cy="28" r="11.5" fill="url(#sk' + uid + ')" stroke="#1a1020" stroke-width="1.15"/>' +
      '<path d="M50 26 Q54 30 49 36" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="1.4" stroke-linecap="round"/>' +
      '<ellipse cx="35" cy="33" rx="2.4" ry="1.4" fill="#e8a090" opacity="0.45"/><ellipse cx="45" cy="33" rx="2.4" ry="1.4" fill="#e8a090" opacity="0.45"/>' +
      lashes +
      '<g class="fig-eye">' +
      '<ellipse cx="35" cy="27.5" rx="2.6" ry="2.8" fill="#fff"/><circle cx="35.4" cy="27.8" r="1.45" fill="#2a1a10"/><circle cx="36" cy="27.2" r="0.5" fill="#fff"/>' +
      '<ellipse cx="45" cy="27.5" rx="2.6" ry="2.8" fill="#fff"/><circle cx="45.4" cy="27.8" r="1.45" fill="#2a1a10"/><circle cx="46" cy="27.2" r="0.5" fill="#fff"/>' +
      '<rect class="fig-blink" x="32" y="24.6" width="6.2" height="5.4" rx="2" fill="url(#sk' + uid + ')" style="animation-delay:' + delay + 's"/>' +
      '<rect class="fig-blink" x="42" y="24.6" width="6.2" height="5.4" rx="2" fill="url(#sk' + uid + ')" style="animation-delay:' + delay + 's"/>' +
      "</g>" +
      '<path d="M32 25 Q35 23.5 37.5 25" fill="none" stroke="#1a1020" stroke-width="1"/><path d="M42.5 25 Q45 23.5 48 25" fill="none" stroke="#1a1020" stroke-width="1"/>' +
      '<path d="M40 29 L41 32 Q40 33 39 32Z" fill="#d4a07a" opacity="0.8"/>' +
      '<path d="M36 35 Q40 38 44 35" fill="none" stroke="#a05650" stroke-width="1.15" stroke-linecap="round"/>' +
      beard;

    var glass = "";
    if (shades) {
      glass = '<g fill="#1a1020" stroke="' + fit.accent + '" stroke-width="1"><rect x="29" y="25" width="9" height="6" rx="1.5"/><rect x="42" y="25" width="9" height="6" rx="1.5"/><path d="M38 28 H42"/></g>';
    } else if (glasses) {
      glass = '<g fill="none" stroke="#1a1020" stroke-width="1.15"><circle cx="35" cy="28" r="3.6"/><circle cx="45" cy="28" r="3.6"/><path d="M38.6 28 H41.4"/></g>';
    }
    var crownSvg = crown ? '<path d="M28 12 L32 18 L36 12 L40 18 L44 12 L48 18 L52 12 L50 20 H30 Z" fill="#f5d76e" stroke="#1a1020" stroke-width="1"/>' : "";

    var shoulder = female ? 13 : 15;
    var hip = female ? 13.5 : 12.5;
    var torso;
    if (fit.kind === "gown") {
      torso =
        '<path d="M27 52 Q29 46 32 44 L48 44 Q51 46 53 52 L62 118 Q40 126 18 118 Z" fill="url(#gd' + uid + ')" stroke="#1a1020" stroke-width="1.2"/>' +
        '<path d="M34 44 L46 44 48 52 32 52Z" fill="#fff6c2" opacity="0.35"/>' +
        '<circle cx="40" cy="48" r="1.6" fill="#fff"/>';
    } else if (fit.kind === "rags") {
      torso =
        '<path d="M26 48 Q28 44 32 43 H48 Q52 44 54 48 L58 86 L52 90 L48 82 L44 92 L40 84 L36 92 L32 82 L28 90 L22 84 Z" fill="url(#cl' + uid + ')" stroke="#1a1020" stroke-width="1.15"/>' +
        '<path d="M30 58 L36 62 L30 66Z" fill="' + fit.body2 + '" stroke="#1a1020" stroke-width="0.6"/>';
    } else if (fit.kind === "hoodie") {
      torso =
        '<path d="M25 47 Q32 42 40 42 Q48 42 55 47 L54 88 Q40 94 26 88 Z" fill="url(#cl' + uid + ')" stroke="#1a1020" stroke-width="1.15"/>' +
        '<path d="M34 42 Q40 36 46 42" fill="none" stroke="' + fit.body2 + '" stroke-width="3"/>' +
        '<path d="M38 52 H42" stroke="' + accent + '" stroke-width="1.4"/>';
    } else if (fit.kind === "shirt" || fit.kind === "smart") {
      torso =
        '<path d="M26 48 Q32 43 40 43 Q48 43 54 48 L52 86 Q40 92 28 86 Z" fill="url(#cl' + uid + ')" stroke="#1a1020" stroke-width="1.15"/>' +
        '<path d="M40 43 V84" stroke="rgba(255,255,255,0.35)" stroke-width="1"/>' +
        (fit.kind === "smart" ? '<path d="M28 48 L40 58 L52 48" fill="none" stroke="' + fit.accent + '" stroke-width="1.3"/>' : "");
    } else {
      /* suit, designer, gold-suit */
      torso =
        '<path d="M25 48 Q32 42 40 42 Q48 42 55 48 L53 86 Q40 92 27 86 Z" fill="url(#cl' + uid + ')" stroke="#1a1020" stroke-width="1.15"/>' +
        '<path d="M40 42 V84" stroke="rgba(255,255,255,0.25)" stroke-width="1"/>' +
        '<path d="M28 48 L40 58 L52 48" fill="#f4f0ea" stroke="#1a1020" stroke-width="0.8"/>' +
        '<path d="M40 42 L40 62" stroke="' + (fit.kind === "gold-suit" ? "#7a1020" : accent) + '" stroke-width="2.2"/>' +
        (fit.kind === "designer" || fit.kind === "gold-suit" ? '<circle cx="30" cy="56" r="1.1" fill="#f5d76e"/><circle cx="30" cy="64" r="1.1" fill="#f5d76e"/>' : "");
    }

    var pants = (fit.kind === "gown") ? "" : (
      '<g class="fig-leg-l" style="animation-delay:' + delay + 's"><path d="M32 86 L29 116" stroke="' + fit.pants + '" stroke-width="7" stroke-linecap="round"/><rect x="24" y="114" width="10" height="5" rx="1.2" fill="' + fit.shoes + '" stroke="#1a1020" stroke-width="0.6"/></g>' +
      '<g class="fig-leg-r" style="animation-delay:' + delay + 's"><path d="M48 86 L51 116" stroke="' + fit.pants + '" stroke-width="7" stroke-linecap="round"/><rect x="46" y="114" width="10" height="5" rx="1.2" fill="' + fit.shoes + '" stroke="#1a1020" stroke-width="0.6"/></g>'
    );
    if (fit.kind === "gown") {
      pants = '<g class="fig-leg-l"></g><rect x="28" y="116" width="9" height="4" rx="1" fill="' + fit.shoes + '"/><rect x="44" y="116" width="9" height="4" rx="1" fill="' + fit.shoes + '"/>';
    }

    var cup = holdCup
      ? '<g class="fig-cup"><ellipse cx="66" cy="78" rx="7" ry="3.2" fill="#5a3a10" stroke="#1a1020" stroke-width="0.9"/><ellipse cx="66" cy="77" rx="4.2" ry="1.6" fill="#1a1020"/><path d="M63 70 L69 70 L68 77 L64 77Z" fill="#c9a227"/></g>'
      : "";
    var flute = holdGlass
      ? '<g class="fig-glass"><path d="M63 44 L71 44 L69 54 L65 54 Z" fill="#9ce7ff" opacity="0.8" stroke="#1a1020" stroke-width="0.7"/><path d="M67 54 V66" stroke="#f5d76e" stroke-width="1.2"/><path d="M63 66 H71" stroke="#f5d76e" stroke-width="1.3" stroke-linecap="round"/><circle cx="67" cy="46" r="1.1" fill="#fff"/></g>'
      : "";

    var armL =
      '<g class="fig-arm-l"><path d="M26 52 Q16 64 20 78" fill="none" stroke="url(#cl' + uid + ')" stroke-width="5.2" stroke-linecap="round"/><circle cx="20" cy="78" r="2.4" fill="url(#sk' + uid + ')" stroke="#1a1020" stroke-width="0.6"/></g>';
    var armR;
    if (holdGlass) {
      armR = '<g class="fig-arm-r"><path d="M54 52 Q64 44 66 44" fill="none" stroke="url(#cl' + uid + ')" stroke-width="5.2" stroke-linecap="round"/><circle cx="66" cy="44" r="2.3" fill="url(#sk' + uid + ')"/>' + flute + "</g>";
    } else if (holdCup) {
      armR = '<g class="fig-arm-r"><path d="M54 54 Q64 66 66 76" fill="none" stroke="url(#cl' + uid + ')" stroke-width="5.2" stroke-linecap="round"/>' + cup + "</g>";
    } else {
      armR = '<g class="fig-arm-wave" style="animation-delay:' + delay + 's"><path d="M54 52 Q66 48 68 36" fill="none" stroke="url(#cl' + uid + ')" stroke-width="5.2" stroke-linecap="round"/><circle cx="68" cy="35" r="2.4" fill="url(#sk' + uid + ')" stroke="#1a1020" stroke-width="0.6"/></g>';
    }

    var neck = '<path d="M36 38 L44 38 L43 44 L37 44 Z" fill="url(#sk' + uid + ')"/>';

    return (
      '<svg class="fig-svg" viewBox="0 0 80 130" aria-hidden="true">' + defs + shadow + auraG + parts +
      '<g class="fig-3d">' +
      '<g class="fig-breathe" style="animation-delay:' + delay + 's">' +
      pants + torso + armL + armR + neck +
      hairBack +
      '<g class="fig-head">' + face + hairFront + glass + crownSvg + "</g>" +
      "</g></g></svg>"
    );
  }


  function beggarSvg() {
    return (
      '<svg viewBox="0 0 80 90" aria-hidden="true">' +
      '<ellipse cx="40" cy="84" rx="22" ry="5" fill="rgba(0,0,0,0.3)"/>' +
      '<path d="M28 80 Q26 58 40 52 Q54 58 52 80 Z" fill="#4a3a2a" stroke="#1a1020" stroke-width="1.5"/>' +
      '<circle cx="40" cy="40" r="11" fill="#e8c2a0" stroke="#1a1020" stroke-width="1.4"/>' +
      '<path d="M30 36 Q40 28 50 36" fill="#3a2a20"/>' +
      '<ellipse cx="58" cy="78" rx="10" ry="5" fill="#5a3a10" stroke="#1a1020" stroke-width="1.3"/>' +
      '<ellipse cx="58" cy="77" rx="6" ry="3" fill="#1a1020"/>' +
      '<text x="58" y="73" text-anchor="middle" font-size="7" fill="#ffe44d">+</text>' +
      "</svg>"
    );
  }

  function renderCity(list) {
    var root = document.getElementById("cityParallax");
    if (!root) return;
    var max = maxIns(list) || 1;
    var mid, streetInner;
    if (!list.length) {
      mid = '<div class="city-empty-msg"><strong>Die Stadt wartet</strong>Noch ist niemand in der Metropole. Die ersten Aufsteiger ziehen bald ein – von der Straßenkante bis zur Yacht.</div>' +
        '<div class="empty-lots"><span class="empty-lot">FREI</span><span class="empty-lot">FREI</span><span class="empty-lot">FREI</span><span class="empty-lot">FREI</span></div>';
    } else {
      mid = '<div class="towers" id="cityTowers">' + list.map(function (p, i) {
        var h = 64 + Math.round((p.ins / max) * 150);
        var lead = isFirst(p, list);
        return (
          '<button type="button" class="tower' + (lead ? " is-lead" : "") + '" data-name="' + esc(p.name) + '" style="height:' + h + "px;background:linear-gradient(180deg," + esc(p.color) + " 0%,#1a1020 140%);animation-delay:" + (0.08 * i).toFixed(2) + 's" aria-label="' + esc(p.name) + ", " + p.ins + " Ins, " + esc(stageFor(p.ins).name) + '">' +
          (lead ? '<span class="antenna" aria-hidden="true"></span>' : "") +
          '<span class="tag">#' + (p.place || p.bib) + " " + esc(p.name) + "</span>" +
          '<span class="windows"></span>' +
          '<span class="fig">' + figureSvg(p, { crown: lead }) + "</span>" +
          "</button>"
        );
      }).join("") + "</div>";
    }
    root.innerHTML =
      '<div class="city-layer far" data-depth="6"><div class="city-skyline"></div></div>' +
      '<div class="city-layer mid" data-depth="12"><div class="city-haze"></div></div>' +
      '<div class="city-layer street" data-depth="22">' + mid +
      '<span class="lamp l1"></span><span class="lamp l2"></span><span class="lamp l3"></span>' +
      '<div class="street-base"></div>' +
      '<button type="button" class="beggar" id="beggar" aria-label="Becher des Bettlers – Münze werfen">' + beggarSvg() + "</button>" +
      '<div class="city-traffic" id="cityTraffic" aria-hidden="true"></div>' +
      '<span class="pigeon p1" aria-hidden="true"></span><span class="pigeon p2" aria-hidden="true"></span>' +
      '<button type="button" class="gold-coin" id="goldCoin" aria-label="Versteckte Goldmünze"></button>' +
      '<div class="fireworks" id="cityFx"></div>' +
      "</div>";
    placeGoldCoin();
  }

  function placeGoldCoin() {
    var coin = document.getElementById("goldCoin");
    if (!coin) return;
    var found = false;
    try { found = localStorage.getItem(GOLD_KEY) === "1"; } catch (e) {}
    if (found) { coin.classList.add("is-found"); return; }
    coin.style.left = (12 + Math.round(Math.random() * 70)) + "%";
    coin.style.bottom = (50 + Math.round(Math.random() * 90)) + "px";
  }

  function renderStock(list) {
    var el = document.getElementById("stockTicker");
    if (!el) return;
    var bits = ["INS-BÖRSE LIVE · PEERWISE METROPOLE · Drei Kapitel 28.–30.11."];
    if (!list.length) bits.push("Die Börse wartet auf die ersten Namen · Ziel: Millionär auf Yacht (2000 Ins)");
    else {
      ranked(list).forEach(function (r) {
        bits.push(r.person.name + " " + r.person.ins + " INS · Platz " + r.place + " · " + stageFor(r.person.ins).name);
      });
      bits.push("Tresor " + sum(list) + " INS");
    }
    var line = bits.join("   ·   ");
    el.innerHTML = "<span>" + esc(line) + "   ·   </span><span>" + esc(line) + "   ·   </span>";
  }

  function renderPrognose(list) {
    var el = document.getElementById("prognose");
    if (!el) return;
    if (!list.length) {
      el.innerHTML = "<h3>PROGNOSE</h3><p>Sobald die ersten Moderatoren einziehen, zeigen wir, wer zuerst Millionär auf Yacht wird. Das Ziel sind " + formatDeNumber(MILLION) + " Ins. Das Finale fällt bei der Millionärsgala am 30. November.</p>";
      return;
    }
    var rows = ranked(list);
    var first = rows[0].person;
    var second = rows[1] ? rows[1].person : null;
    var need = Math.max(0, MILLION - first.ins);
    var pct = Math.min(100, Math.round((first.ins / MILLION) * 100));
    var msg;
    if (first.ins >= MILLION) {
      msg = "<b>" + esc(first.name) + "</b> ist bereits Millionär auf Yacht. Die Skyline und das Deck gehören " + esc(first.name) + "!";
    } else {
      msg = "Beim aktuellen Stand wird <b>" + esc(first.name) + "</b> zuerst Millionär auf Yacht. Das Ziel sind " + formatDeNumber(MILLION) + " Ins. Es fehlen noch " + formatDeNumber(need) + " Ins. Das Finale fällt bei der Millionärsgala am 30. November.";
      if (second) msg += " Der Vorsprung vor " + esc(second.name) + " beträgt " + formatDeNumber(first.ins - second.ins) + " Ins.";
    }
    el.innerHTML = "<h3>PROGNOSE</h3><p>" + msg + "</p><div class=\"bar\"><i style=\"width:" + pct + "%\"></i></div><p>" + esc(first.name) + " steht bei " + formatDeNumber(first.ins) + " von " + formatDeNumber(MILLION) + " Ins (" + pct + " %).</p>";
  }

  function badgesFor(p, list) {
    var out = [];
    var st = stageFor(p.ins);
    if (p.ins >= 1) out.push("Erste Münze");
    if (p.ins >= 100) out.push("Raus aus dem Rinnstein");
    if (p.ins >= 250) out.push("Dach überm Kopf");
    if (p.ins >= 500) out.push("Stadtschlüssel");
    if (p.ins >= 800) out.push("Skyline");
    if (p.ins >= 1200) out.push("Meerblick");
    if (p.ins >= MILLION) out.push("Yacht-Kapitän");
    if (p.place && p.place <= 3 && p.ins > 0) out.push("Podium");
    if (isFirst(p, list)) out.push("Spitzenreiter");
    out.push(st.name);
    return out;
  }

  function renderBadges(list) {
    var el = document.getElementById("badgeBoard");
    if (!el) return;
    if (!list.length) {
      el.innerHTML = "<h2>ABZEICHEN</h2><p>Abzeichen erscheinen, sobald jemand in die Metropole einzieht. Jede Stufe von Bettler bis Millionär auf Yacht bringt einen neuen Orden.</p>";
      return;
    }
    el.innerHTML = "<h2>ABZEICHEN</h2>" + list.map(function (p) {
      return "<p><b>" + esc(p.name) + "</b></p><div class=\"badge-row\">" + badgesFor(p, list).map(function (b) {
        return '<span class="badge">' + esc(b) + "</span>";
      }).join("") + "</div>";
    }).join("");
  }


  function yachtSvg() {
    return (
      '<svg class="gala-yacht-svg" viewBox="0 0 460 200" aria-hidden="true">' +
      '<defs><linearGradient id="hullGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f7e7b0"/><stop offset="100%" stop-color="#b8860b"/></linearGradient>' +
      '<linearGradient id="hullWhite" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffffff"/><stop offset="100%" stop-color="#d8d2c6"/></linearGradient></defs>' +
      '<path d="M28 132 C70 116, 150 110, 240 110 L372 110 C410 110, 438 118, 452 130 L438 152 C400 164, 300 170, 200 170 C108 170, 58 162, 24 150 Z" fill="url(#hullWhite)" stroke="#1a1020" stroke-width="2"/>' +
      '<path d="M28 132 L452 132 L438 146 L24 146 Z" fill="url(#hullGold)"/>' +
      '<path d="M24 146 C58 160, 108 168, 200 168 C300 168, 400 162, 438 152 L438 146 L24 146 Z" fill="#1c2630"/>' +
      '<path d="M118 92 H330 L338 110 H110 Z" fill="#f4efe6" stroke="#1a1020" stroke-width="1.6"/>' +
      '<path d="M198 66 H300 L308 92 H190 Z" fill="#fbf8f2" stroke="#1a1020" stroke-width="1.5"/>' +
      '<path d="M224 48 H276 L282 66 H218 Z" fill="#efe8dc" stroke="#1a1020" stroke-width="1.4"/>' +
      '<g fill="#ffe08a" stroke="#1a1020" stroke-width="0.7">' +
      '<rect x="128" y="98" width="16" height="10" rx="2"/><rect x="150" y="98" width="16" height="10" rx="2"/>' +
      '<rect x="172" y="98" width="16" height="10" rx="2"/><rect x="194" y="98" width="16" height="10" rx="2"/>' +
      '<rect x="216" y="98" width="16" height="10" rx="2"/><rect x="238" y="98" width="16" height="10" rx="2"/>' +
      '<rect x="260" y="98" width="16" height="10" rx="2"/><rect x="282" y="98" width="16" height="10" rx="2"/>' +
      '<rect x="208" y="74" width="14" height="10" rx="2"/><rect x="228" y="74" width="14" height="10" rx="2"/>' +
      '<rect x="248" y="74" width="14" height="10" rx="2"/><rect x="268" y="74" width="14" height="10" rx="2"/>' +
      '<rect x="232" y="52" width="12" height="8" rx="1.5"/><rect x="250" y="52" width="12" height="8" rx="1.5"/>' +
      '</g>' +
      '<path d="M246 48 L246 26" stroke="#1a1020" stroke-width="2"/>' +
      '<circle cx="246" cy="24" r="8" fill="none" stroke="#f5d76e" stroke-width="2"/>' +
      '<path d="M236 24 H256" stroke="#f5d76e" stroke-width="1.6"/>' +
      '<circle cx="246" cy="24" r="2" fill="#fff6c2"/>' +
      '<path d="M400 110 L400 72 L424 82 L400 90" fill="#c41e3a" stroke="#1a1020" stroke-width="1.2"/>' +
      '<path d="M118 92 L118 86 L330 86 L330 92" fill="none" stroke="#c9a227" stroke-width="1.4"/>' +
      '<g fill="#fff6c2">' +
      '<circle cx="90" cy="126" r="2.2"/><circle cx="150" cy="122" r="2.2"/><circle cx="240" cy="120" r="2.2"/>' +
      '<circle cx="320" cy="122" r="2.2"/><circle cx="390" cy="126" r="2.2"/>' +
      '</g>' +
      '<text x="230" y="140" text-anchor="middle" font-size="12" font-family="Impact, Arial Black, sans-serif" fill="#5a4010">PEERWISE</text>' +
      "</svg>"
    );
  }

  function entranceSvg() {
    return (
      '<svg class="gala-entrance-svg" viewBox="0 0 280 170" aria-hidden="true">' +
      '<defs><linearGradient id="entGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff1b0"/><stop offset="100%" stop-color="#b8860b"/></linearGradient>' +
      '<linearGradient id="doorGlow" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffe9a0"/><stop offset="100%" stop-color="#c41e3a"/></linearGradient></defs>' +
      '<path d="M40 170 L70 128 H210 L240 170 Z" fill="#3a2a22" stroke="#1a1020" stroke-width="1.4"/>' +
      '<path d="M70 128 H210 L200 118 H80 Z" fill="#2a1a16"/>' +
      '<rect x="78" y="52" width="124" height="76" fill="#1a1020" stroke="#f5d76e" stroke-width="2"/>' +
      '<path d="M96 128 V70 Q140 48 184 70 V128 Z" fill="url(#doorGlow)" stroke="#1a1020" stroke-width="1.4"/>' +
      '<rect x="64" y="44" width="18" height="90" fill="url(#entGold)" stroke="#1a1020" stroke-width="1.3"/>' +
      '<rect x="198" y="44" width="18" height="90" fill="url(#entGold)" stroke="#1a1020" stroke-width="1.3"/>' +
      '<circle cx="73" cy="48" r="5" fill="#fff6c2" stroke="#b8860b"/><circle cx="207" cy="48" r="5" fill="#fff6c2" stroke="#b8860b"/>' +
      '<path d="M58 44 H222 L210 28 H70 Z" fill="url(#entGold)" stroke="#1a1020" stroke-width="1.5"/>' +
      '<rect x="74" y="4" width="132" height="28" rx="3" fill="#1a1020" stroke="#f5d76e" stroke-width="1.8"/>' +
      '<g fill="#f5d76e">' +
      '<circle cx="96" cy="19" r="2"/><circle cx="112" cy="19" r="2"/><circle cx="128" cy="19" r="2"/>' +
      '<circle cx="144" cy="19" r="2"/><circle cx="160" cy="19" r="2"/><circle cx="176" cy="19" r="2"/>' +
      '</g>' +
      '<text x="140" y="24" text-anchor="middle" font-size="14" font-family="Impact, Arial Black, sans-serif" fill="#fff4c8">GALA</text>' +
      '<path d="M64 128 H216" stroke="#f5d76e" stroke-width="3"/>' +
      "</svg>"
    );
  }

  function stanchionSvg() {
    return (
      '<svg viewBox="0 0 20 46" class="stanchion-svg" aria-hidden="true">' +
      '<ellipse cx="10" cy="44" rx="7" ry="2" fill="rgba(0,0,0,.4)"/>' +
      '<rect x="8" y="12" width="4" height="30" rx="1" fill="#c9a227" stroke="#1a1020" stroke-width="0.8"/>' +
      '<circle cx="10" cy="11" r="5.2" fill="#f5d76e" stroke="#1a1020" stroke-width="1"/>' +
      '<circle cx="10" cy="11" r="2" fill="#fff6c2"/>' +
      "</svg>"
    );
  }

  function papSvg() {
    return (
      '<svg viewBox="0 0 70 90" aria-hidden="true">' +
      '<ellipse cx="32" cy="86" rx="16" ry="4" fill="rgba(0,0,0,.35)"/>' +
      '<path d="M20 84 L18 52 H44 L46 84 Z" fill="#1a1a22" stroke="#0a0a10" stroke-width="1.2"/>' +
      '<path d="M22 54 L16 40 H48 L44 54 Z" fill="#2a2a36" stroke="#0a0a10" stroke-width="1.2"/>' +
      '<circle cx="32" cy="30" r="9" fill="#e8c2a0" stroke="#1a1020" stroke-width="1.2"/>' +
      '<path d="M23 28 Q32 22 41 28" fill="#1a1410"/>' +
      '<rect x="40" y="36" width="22" height="14" rx="2" fill="#111" stroke="#f5d76e" stroke-width="1.2"/>' +
      '<circle cx="58" cy="43" r="6" fill="#222" stroke="#c9a227" stroke-width="1.4"/>' +
      '<circle cx="58" cy="43" r="3" fill="#5ce1ff"/>' +
      '<rect x="44" y="32" width="8" height="5" rx="1" fill="#f5d76e"/>' +
      '<path d="M14 44 L6 38" stroke="#1a1020" stroke-width="3" stroke-linecap="round"/>' +
      "</svg>"
    );
  }

  var galaTimers = [];

  function clearGalaEffects() {
    for (var i = 0; i < galaTimers.length; i++) clearTimeout(galaTimers[i]);
    galaTimers = [];
  }

  function glitterDots() {
    var html = "";
    for (var i = 0; i < 28; i++) {
      var left = Math.round(Math.random() * 100);
      var top = Math.round(Math.random() * 55);
      var delay = (Math.random() * 3).toFixed(2);
      var size = 2 + Math.round(Math.random() * 3);
      html += '<i class="gala-glitter" style="left:' + left + "%;top:" + top + "%;width:" + size + "px;height:" + size + "px;animation-delay:" + delay + 's"></i>';
    }
    return html;
  }

  function ropeRow(side) {
    var html = "";
    var steps = 5;
    for (var i = 0; i < steps; i++) {
      var t = i / (steps - 1);
      var scale = (1 - t * 0.55).toFixed(2);
      var y = (82 - t * 40).toFixed(1);
      var x = side === "left" ? (6 + t * 24) : (94 - t * 24);
      html += '<span class="stanchion" style="left:' + x + "%;top:" + y + "%;transform:translate(-50%,-100%) scale(" + scale + ')">' + stanchionSvg() + "</span>";
    }
    return html;
  }

  function bindGalaEffects() {
    clearGalaEffects();
    var paps = document.querySelectorAll("#galaStage .pap");
    var world = document.querySelector("#galaStage .gala-world");
    function flashOne() {
      if (reducedMotion() || !paps.length) return;
      var el = paps[Math.floor(Math.random() * paps.length)];
      el.classList.remove("is-flash");
      void el.offsetWidth;
      el.classList.add("is-flash");
      if (world) {
        world.classList.add("flash-wash");
        setTimeout(function () { world.classList.remove("flash-wash"); }, 90);
      }
      cityAudio.flash();
    }
    if (reducedMotion()) return;
    galaTimers.push(setTimeout(flashOne, 900));
    galaTimers.push(setInterval(function () {
      flashOne();
      if (Math.random() > 0.45) setTimeout(flashOne, 160 + Math.round(Math.random() * 180));
    }, 2400));
    galaTimers.push(setTimeout(function () { fireworks(12, "galaFx"); }, 600));
    galaTimers.push(setInterval(function () {
      fireworks(currentChapter() === 2 ? 18 : 11, "galaFx");
    }, 3800));
  }

  function renderGala(list) {
    var copy = document.getElementById("galaCopy");
    var stage = document.getElementById("galaStage");
    var status = dayStatus();
    var ch = currentChapter();
    if (copy) {
      if (status === "today" && ch === 2) copy.textContent = "Die Millionärsgala läuft! Der rote Teppich ist voll, die Kameras blitzen, und über der Yacht steigt das Feuerwerk.";
      else if (status === "done") copy.textContent = "Die Gala ist vorbei, aber der rote Teppich und die Yacht bleiben als Erinnerung liegen.";
      else copy.textContent = "Am 30. November führt der rote Teppich zur Millionärsgala. Paparazzi, Rampenlicht und die Yacht warten schon auf das große Finale.";
    }
    if (!stage) return;
    var people = "";
    if (list.length) {
      people = '<div class="gala-people">' + ranked(list).slice(0, 3).map(function (r) {
        return '<span class="fig" title="' + esc(r.person.name) + '">' + figureSvg(r.person, { crown: r.place === 1 }) + "</span>";
      }).join("") + "</div>";
    }
    stage.innerHTML =
      '<div class="gala-world">' +
      '<div class="gala-sky" aria-hidden="true">' +
      '<div class="gala-fw" id="galaFx"></div>' +
      '<span class="gala-spot-beam s1"></span><span class="gala-spot-beam s2"></span>' +
      glitterDots() +
      "</div>" +
      '<div class="gala-water" aria-hidden="true">' +
      '<div class="gala-yacht">' + yachtSvg() + "</div>" +
      '<div class="gala-yacht-refl">' + yachtSvg() + "</div>" +
      '<span class="gala-wave"></span>' +
      "</div>" +
      '<div class="gala-venue">' +
      '<div class="gala-entrance" aria-label="Eingang zur Gala">' + entranceSvg() + "</div>" +
      '<div class="gala-carpet" aria-label="Roter Teppich"><span class="gala-carpet-run"></span></div>' +
      '<div class="gala-rope left" aria-hidden="true">' + ropeRow("left") + '<svg class="rope-line" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M8,80 Q18,70 26,62 Q34,52 42,46" fill="none" stroke="#d4a017" stroke-width="1.6" stroke-linecap="round"/></svg></div>' +
      '<div class="gala-rope right" aria-hidden="true">' + ropeRow("right") + '<svg class="rope-line" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M92,80 Q82,70 74,62 Q66,52 58,46" fill="none" stroke="#d4a017" stroke-width="1.6" stroke-linecap="round"/></svg></div>' +
      '<div class="gala-paps left" aria-label="Paparazzi">' +
      '<button type="button" class="pap" aria-label="Paparazzo">' + papSvg() + '<i class="flash-burst"></i></button>' +
      '<button type="button" class="pap pap-b" aria-label="Paparazzo">' + papSvg() + '<i class="flash-burst"></i></button>' +
      "</div>" +
      '<div class="gala-paps right" aria-label="Paparazzi">' +
      '<button type="button" class="pap" aria-label="Paparazzo">' + papSvg() + '<i class="flash-burst"></i></button>' +
      '<button type="button" class="pap pap-b" aria-label="Paparazzo">' + papSvg() + '<i class="flash-burst"></i></button>' +
      "</div>" +
      people +
      "</div></div>";
    bindGalaEffects();
  }


  function renderNote() {
    var el = document.getElementById("sackNote");
    if (!el) return;
    el.textContent = "Drei Tage, 28. bis 30.11.2026: Ganz unten, Der Aufstieg, Die Millionärsgala. Neue Ins ersetzen die alten Zahlen. Das Coin-Catcher-Spiel ist nur zum Spaß und zählt nicht für den Tresor.";
  }

  var cityAudio = {
    ctx: null,
    gain: null,
    sfx: null,
    timer: null,
    on: false,
    ensure: function () {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      if (!this.ctx) this.ctx = new AC();
      if (this.ctx.state === "suspended") this.ctx.resume();
      if (!this.gain) {
        this.gain = this.ctx.createGain();
        this.gain.gain.value = 0.04;
        this.gain.connect(this.ctx.destination);
        this.sfx = this.ctx.createGain();
        this.sfx.gain.value = 0.2;
        this.sfx.connect(this.ctx.destination);
      }
      return this.ctx;
    },
    tone: function (freq, dur, type, dest, vol) {
      if (!this.ensure()) return;
      var ctx = this.ctx;
      var osc = ctx.createOscillator();
      var g = ctx.createGain();
      osc.type = type || "triangle";
      osc.frequency.value = freq;
      g.gain.value = 0.0001;
      osc.connect(g);
      g.connect(dest || this.sfx || this.gain);
      var now = ctx.currentTime;
      g.gain.exponentialRampToValueAtTime(vol || 0.7, now + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, now + (dur || 0.3));
      osc.start(now);
      osc.stop(now + (dur || 0.35) + 0.05);
    },
    drone: function () {
      if (!this.on || !this.ctx) return;
      this.tone(78 + Math.random() * 18, 3.1, "sine", this.gain, 0.45);
    },
    ping: function (freq) { this.tone(freq || 520, 0.28, "triangle", this.sfx, 0.8); },
    coin: function () { this.tone(880, 0.12, "square", this.sfx, 0.5); this.tone(1320, 0.18, "triangle", this.sfx, 0.4); },
    whoosh: function () { this.tone(220, 0.5, "sawtooth", this.sfx, 0.25); },
    sting: function () { this.tone(392, 0.25, "triangle", this.sfx, 0.7); this.tone(587, 0.4, "triangle", this.sfx, 0.6); },
    flash: function () {
      if (!this.ctx && !this.on) return;
      if (!this.ensure()) return;
      var ctx = this.ctx;
      var now = ctx.currentTime;
      var dest = this.sfx || this.gain;
      var osc = ctx.createOscillator();
      var g = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = 1750;
      g.gain.value = 0.0001;
      osc.connect(g);
      g.connect(dest);
      g.gain.exponentialRampToValueAtTime(0.28, now + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
      osc.start(now);
      osc.stop(now + 0.08);
      var o2 = ctx.createOscillator();
      var g2 = ctx.createGain();
      o2.type = "triangle";
      o2.frequency.value = 880;
      g2.gain.value = 0.0001;
      o2.connect(g2);
      g2.connect(dest);
      g2.gain.exponentialRampToValueAtTime(0.2, now + 0.01);
      g2.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
      o2.start(now);
      o2.stop(now + 0.11);
    },
    engine: function () {
      if (!this.on) return;
      if (!this.ensure()) return;
      this.whoosh();
      this.tone(88, 0.7, "sawtooth", this.sfx, 0.16);
      this.tone(132, 0.45, "triangle", this.sfx, 0.12);
    },
    start: function () {
      this.on = true;
      if (!this.ensure()) return;
      var self = this;
      this.drone();
      this.timer = setInterval(function () { if (self.on) self.drone(); }, 2800);
    },
    stop: function () {
      this.on = false;
      if (this.timer) clearInterval(this.timer);
      this.timer = null;
    }
  };


  var narrator = {
    voice: null,
    voicesReady: false,
    readyCallbacks: [],
    queue: [],
    speaking: false,
    init: function () {
      var self = this;
      var apply = function () {
        var voices = (window.speechSynthesis && window.speechSynthesis.getVoices()) || [];
        if (voices.length) {
          self.voice = self.pickVoice();
          self.voicesReady = true;
        }
        if (!self.voicesReady) return;
        var cbs = self.readyCallbacks.slice();
        self.readyCallbacks = [];
        for (var i = 0; i < cbs.length; i++) {
          try { cbs[i](); } catch (err) {}
        }
      };
      if (window.speechSynthesis) {
        window.speechSynthesis.getVoices();
        window.speechSynthesis.addEventListener("voiceschanged", apply);
      }
      apply();
      setTimeout(apply, 600);
      setTimeout(function () {
        self.voicesReady = true;
        apply();
      }, 1600);
    },
    whenReady: function (cb) {
      if (this.voicesReady) cb();
      else this.readyCallbacks.push(cb);
    },
    scoreVoice: function (voice) {
      var name = (voice && voice.name) || "";
      var lang = (voice && voice.lang) || "";
      var isDe = /de(-|_|$)/i.test(lang) || /^de$/i.test(lang) || /deutsch|german/i.test(name);
      if (!isDe) return 0;
      var n = name.toLowerCase();
      var score = 10;
      if (/de-de/i.test(lang)) score += 8;
      if (/google deutsch/.test(n)) score += 100;
      else if (/microsoft/.test(n) && /(katja|conrad|amala)/.test(n) && /natural/.test(n)) score += 90;
      else if (/microsoft/.test(n) && /(katja|conrad|amala)/.test(n)) score += 85;
      else if (/\banna\b/.test(n)) score += 70;
      else if (/\bpetra\b/.test(n)) score += 60;
      else if (/google/.test(n)) score += 50;
      return score;
    },
    pickVoice: function () {
      if (!window.speechSynthesis) return null;
      var voices = window.speechSynthesis.getVoices() || [];
      var best = null;
      var bestScore = 0;
      for (var i = 0; i < voices.length; i++) {
        var score = this.scoreVoice(voices[i]);
        if (score > bestScore) {
          bestScore = score;
          best = voices[i];
        }
      }
      return best;
    },
    clean: function (text) {
      var s = String(text || "");
      s = s.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "");
      s = s.replace(/[\u2600-\u27BF\uFE0F\u200D\u2300-\u23FF\u2B00-\u2BFF]/g, "");
      s = s.replace(/[•·]/g, ", ");
      s = s.replace(/\s+/g, " ").trim();
      return s;
    },
    chunk: function (text) {
      var s = this.clean(text);
      if (!s) return [];
      var out = [];
      var buf = "";
      for (var i = 0; i < s.length; i++) {
        buf += s.charAt(i);
        var ch = s.charAt(i);
        var next = s.charAt(i + 1);
        if ((ch === "." || ch === "!" || ch === "?") && (!next || /\s/.test(next))) {
          var piece = buf.trim();
          if (piece) out.push(piece);
          buf = "";
        }
      }
      if (buf.trim()) out.push(buf.trim());
      return out.length ? out : [s];
    },
    speak: function (text, interrupt) {
      if (!window.speechSynthesis) return;
      if (interrupt) this.stop();
      var chunks = this.chunk(text);
      for (var i = 0; i < chunks.length; i++) this.queue.push(chunks[i]);
      this.pump();
    },
    stop: function () {
      this.queue = [];
      this.speaking = false;
      try { window.speechSynthesis.cancel(); } catch (err) {}
    },
    pump: function () {
      var self = this;
      if (self.speaking) return;
      self.whenReady(function () {
        if (self.speaking || !self.queue.length) return;
        if (self.voice == null) self.voice = self.pickVoice();
        var text = self.queue.shift();
        var u = new SpeechSynthesisUtterance(text);
        u.lang = "de-DE";
        u.rate = 0.97;
        u.pitch = 1.0;
        if (self.voice) u.voice = self.voice;
        var done = function () {
          self.speaking = false;
          setTimeout(function () { self.pump(); }, 50);
        };
        u.onend = done;
        u.onerror = done;
        self.speaking = true;
        try { window.speechSynthesis.speak(u); } catch (err) { done(); }
      });
    }
  };

  function speakLine(text, interrupt) {
    narrator.speak(text, !!interrupt);
  }

  function voiceFor(p, list) {
    var st = stageFor(p.ins);
    var lead = isFirst(p, list);
    var line = "Hier ist " + p.name + ". " + p.name + " steht gerade auf der Stufe " + st.name + " und hat " + formatDeNumber(p.ins) + " Ins.";
    if (lead) line += " Damit führt " + p.name + " im Moment das Feld an.";
    else line += " Der Weg zur Yacht geht also weiter.";
    return line;
  }

  function storyFor(p, list) {
    var st = stageFor(p.ins);
    var nxt = nextStage(p.ins);
    var base = p.name + " ist in der Ins-Metropole unterwegs und steht derzeit auf der Stufe " + st.name + ". " + st.hint;
    if (nxt) base += " Bis zur nächsten Stufe, " + nxt.name + ", fehlen noch " + formatDeNumber(nxt.min - p.ins) + " Ins.";
    else base += " Das Deck der Yacht ist erreicht.";
    if (isFirst(p, list)) base += " Im Moment führt " + p.name + " das Feld an.";
    return base;
  }

  function openProfile(p, list) {
    var layer = document.getElementById("profileLayer");
    var card = document.getElementById("profileCard");
    if (!layer || !card) return;
    var st = stageFor(p.ins);
    card.innerHTML =
      "<header><div><h2 id=\"profileName\">" + esc(p.name) + "</h2><p class=\"stage-line\">" + esc(st.name) + " · " + p.ins + " Ins · Platz " + (p.place || "–") + "</p></div>" +
      '<button type="button" class="profile-close" id="profileClose">Schließen</button></header>' +
      '<div class="fig">' + figureSvg(p, { crown: isFirst(p, list) }) + "</div>" +
      "<p>" + esc(storyFor(p, list)) + "</p>" +
      '<div class="badge-row">' + badgesFor(p, list).map(function (b) { return '<span class="badge">' + esc(b) + "</span>"; }).join("") + "</div>";
    layer.hidden = false;
    var close = document.getElementById("profileClose");
    if (close) close.addEventListener("click", function () { layer.hidden = true; });
    layer.onclick = function (e) { if (e.target === layer) layer.hidden = true; };
    cityAudio.ping(660);
    speakLine(voiceFor(p, list), true);
  }

  function showBreaking(text) {
    var box = document.getElementById("breaking");
    var p = document.getElementById("breakingText");
    if (!box || !p) return;
    p.textContent = text;
    box.hidden = false;
    cityAudio.sting();
    clearTimeout(showBreaking._t);
    showBreaking._t = setTimeout(function () { box.hidden = true; }, 6800);
  }

  function showAscend(name, stage) {
    var box = document.getElementById("ascend");
    var p = document.getElementById("ascendText");
    if (!box || !p) return;
    p.textContent = name + " steigt auf und erreicht die Stufe " + stage + "!";
    box.hidden = false;
    cityAudio.sting();
    speakLine(name + " ist aufgestiegen und hat jetzt die Stufe " + stage + " erreicht.", true);
    clearTimeout(showAscend._t);
    showAscend._t = setTimeout(function () { box.hidden = true; }, 7000);
  }

  function checkAscensions(list) {
    var prev = {};
    try { prev = JSON.parse(localStorage.getItem(STAGE_KEY) || "{}"); } catch (e) { prev = {}; }
    var next = {};
    var shown = false;
    list.forEach(function (p) {
      var st = stageFor(p.ins);
      next[p.name] = st.id;
      if (prev[p.name] && prev[p.name] !== st.id && !shown) {
        showAscend(p.name, st.name);
        shown = true;
      }
    });
    try { localStorage.setItem(STAGE_KEY, JSON.stringify(next)); } catch (e) {}
  }

  function moneyRain() {
    var layer = document.getElementById("moneyRain");
    if (!layer || reducedMotion()) return;
    layer.hidden = false;
    layer.innerHTML = "";
    for (var i = 0; i < 42; i++) {
      var c = document.createElement("i");
      c.style.left = Math.round(Math.random() * 100) + "%";
      c.style.animationDelay = (Math.random() * 0.8).toFixed(2) + "s";
      layer.appendChild(c);
    }
    cityAudio.coin();
    clearTimeout(moneyRain._t);
    moneyRain._t = setTimeout(function () { layer.hidden = true; layer.innerHTML = ""; }, 2800);
  }

  function fireworks(count, targetId) {
    var fx = document.getElementById(targetId || "cityFx");
    if (!fx || reducedMotion()) return;
    for (var i = 0; i < (count || 12); i++) {
      var b = document.createElement("span");
      b.className = "burst";
      b.style.left = (20 + Math.random() * 60) + "%";
      b.style.top = (10 + Math.random() * 40) + "%";
      b.style.background = Math.random() > 0.5 ? "#f5d76e" : "#ff6b9d";
      b.style.setProperty("--dx", (Math.random() * 80 - 40) + "px");
      b.style.setProperty("--dy", (Math.random() * 80 - 40) + "px");
      fx.appendChild(b);
      (function (el) { setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 900); })(b);
    }
  }


  function carSvg(type) {
    var uid = "cr" + Math.floor(Math.random() * 1e6);
    var vb = type === "limo" ? "0 0 230 70" : "0 0 170 70";
    var beam = '<polygon class="headlight-beam" points="' + (type === "limo" ? "218,36 280,24 280,52 218,44" : "158,36 220,24 220,52 158,44") + '" fill="url(#bm' + uid + ')" />';
    var defs = '<defs><linearGradient id="bm' + uid + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#fff6c2" stop-opacity="0.7"/><stop offset="100%" stop-color="#fff6c2" stop-opacity="0"/></linearGradient></defs>';
    function wheel(cx) {
      return '<g class="car-wheel" transform="translate(' + cx + ',54)">' +
        '<circle r="12" fill="#1a1a1a" stroke="#3a3a3a" stroke-width="1.4"/>' +
        '<circle r="7.5" fill="#2c2c2c"/>' +
        '<g class="car-hub"><path d="M0,-6.5 L0,6.5 M-6.5,0 L6.5,0 M-4.6,-4.6 L4.6,4.6 M-4.6,4.6 L4.6,-4.6" stroke="#cfcfcf" stroke-width="1.3"/>' +
        '<circle r="2.4" fill="#8a8a8a"/></g>' +
        '<circle r="12" fill="none" stroke="#555" stroke-width="1.6"/></g>';
    }
    var body = "";
    if (type === "taxi") {
      body = '<path d="M18 44 L28 28 H70 L82 18 H118 L132 28 H150 L158 44 156 50 H18Z" fill="#f5d76e" stroke="#1a1020" stroke-width="1.6"/>' +
        '<path d="M40 28 L50 18 H114 L124 28Z" fill="#7ec8e8" stroke="#1a1020" stroke-width="1.2"/>' +
        '<path d="M18 44 H158" stroke="#1a1020" stroke-width="1"/>' +
        '<rect x="18" y="40" width="140" height="5" fill="#111"/>' +
        '<g fill="#111"><rect x="30" y="41" width="6" height="4"/><rect x="38" y="41" width="6" height="4"/><rect x="128" y="41" width="6" height="4"/><rect x="136" y="41" width="6" height="4"/></g>' +
        '<rect x="78" y="8" width="28" height="10" rx="1.5" fill="#1a1020" stroke="#f5d76e" stroke-width="1.2"/>' +
        '<text x="92" y="16" text-anchor="middle" font-size="7" font-family="Impact, Arial Black, sans-serif" fill="#f5d76e">TAXI</text>' +
        '<circle cx="20" cy="38" r="3" fill="#ff3b3b"/><circle cx="156" cy="38" r="3.4" fill="#fff3b0" stroke="#f5d76e"/>' +
        wheel(40) + wheel(128);
    } else if (type === "sport") {
      body = '<path d="M16 46 L30 40 L48 24 H100 L140 32 L162 44 160 50 H18Z" fill="#c41e3a" stroke="#1a1020" stroke-width="1.6"/>' +
        '<path d="M50 24 L62 16 H96 L128 30 L100 24Z" fill="#89d4f0" stroke="#1a1020" stroke-width="1.2"/>' +
        '<path d="M16 46 H162" stroke="#1a1020" stroke-width="1"/>' +
        '<circle cx="18" cy="40" r="2.6" fill="#ff2a2a"/><circle cx="158" cy="38" r="3.6" fill="#fff3b0"/>' +
        '<path d="M20 48 H154" stroke="#1a1020" stroke-width="2"/>' +
        wheel(44) + wheel(126);
    } else if (type === "limo") {
      body = '<path d="M14 46 L24 32 H46 L56 22 H196 L210 32 H222 L226 46 224 52 H16Z" fill="#141418" stroke="#f5d76e" stroke-width="1.5"/>' +
        '<g fill="#7ec8e8" stroke="#1a1020" stroke-width="0.9"><rect x="60" y="24" width="22" height="12" rx="1.5"/><rect x="86" y="24" width="22" height="12" rx="1.5"/><rect x="112" y="24" width="22" height="12" rx="1.5"/><rect x="138" y="24" width="22" height="12" rx="1.5"/><rect x="164" y="24" width="22" height="12" rx="1.5"/></g>' +
        '<path d="M14 46 H226" stroke="#c9a227" stroke-width="1.4"/>' +
        '<circle cx="16" cy="40" r="2.8" fill="#ff2a2a"/><circle cx="224" cy="38" r="3.4" fill="#fff3b0"/>' +
        '<rect x="48" y="18" width="8" height="6" fill="#c41e3a"/>' +
        wheel(40) + wheel(86) + wheel(150) + wheel(200);
    } else {
      body = '<path d="M18 44 L30 28 H70 L84 18 H120 L136 28 H154 L160 44 158 50 H18Z" fill="#eef2f6" stroke="#1a1020" stroke-width="1.6"/>' +
        '<path d="M40 28 L52 18 H116 L128 28Z" fill="#7ec8e8" stroke="#1a1020" stroke-width="1.2"/>' +
        '<rect x="18" y="36" width="140" height="7" fill="#1d4e89"/>' +
        '<text x="88" y="42" text-anchor="middle" font-size="6.5" font-family="Impact, Arial Black, sans-serif" fill="#fff">POLIZEI</text>' +
        '<rect x="74" y="8" width="36" height="9" rx="1" fill="#222"/>' +
        '<rect class="cop-light" x="78" y="9" width="12" height="7" rx="1" fill="#3b82f6"/>' +
        '<rect class="cop-light b" x="94" y="9" width="12" height="7" rx="1" fill="#ef4444"/>' +
        '<circle cx="20" cy="38" r="3" fill="#ff2a2a"/><circle cx="158" cy="38" r="3.4" fill="#fff3b0"/>' +
        wheel(42) + wheel(128);
    }
    return '<svg class="car-svg" viewBox="' + vb + '" aria-hidden="true">' + defs + beam + body + "</svg>";
  }

  function driveRandomCar() {
    var host = document.getElementById("cityTraffic");
    if (!host || reducedMotion()) return null;
    if (host.querySelectorAll(".city-car").length >= 2) return null;
    var types = ["taxi", "sport", "limo", "police"];
    var type = types[Math.floor(Math.random() * types.length)];
    var el = document.createElement("div");
    el.className = "city-car car-" + type;
    el.setAttribute("aria-hidden", "true");
    el.innerHTML = carSvg(type);
    var dur = type === "sport" ? 4.2 : type === "limo" ? 8.2 : 6.4;
    el.style.animationDuration = dur + "s";
    host.appendChild(el);
    void el.offsetWidth;
    el.classList.add("is-run");
    if (cityAudio.on) cityAudio.engine();
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, dur * 1000 + 80);
    return type;
  }

  var carNews = {
    taxi: "Ein Taxi rauscht durch die Ins-Meile.",
    sport: "Ein Sportwagen zieht an der Straßenkante vorbei.",
    limo: "Eine Stretch-Limousine gleitet durch die Metropole.",
    police: "Ein Streifenwagen streift mit Blaulicht die Ins-Meile."
  };

  function liveEvents() {
    var p1 = document.querySelector(".pigeon.p1");
    var p2 = document.querySelector(".pigeon.p2");
    var roll = Math.random();
    var ch = currentChapter();
    if (ch === 2 || roll > 0.72) fireworks(ch === 2 ? 20 : 10);
    var driven = null;
    if (roll > 0.22) driven = driveRandomCar();
    if (roll > 0.4 && p1) { p1.classList.remove("is-fly"); void p1.offsetWidth; p1.classList.add("is-fly"); }
    if (roll > 0.55 && p2) { p2.classList.remove("is-fly"); void p2.offsetWidth; p2.classList.add("is-fly"); }
    var flashes = [
      "Tauben heben über dem Pflaster ab.",
      "Am Horizont knistert es – vielleicht schon ein Vorschein der Gala.",
      "Die Börse flüstert: Bald ziehen die ersten Aufsteiger ein.",
      "Jemand hat eine Münze in den Becher des Bettlers geworfen."
    ];
    if (driven && carNews[driven]) flashes.unshift(carNews[driven]);
    if (Math.random() > 0.5) showBreaking(flashes[Math.floor(Math.random() * flashes.length)]);
  }

  function bindCity(list) {
    var beggar = document.getElementById("beggar");
    if (beggar) {
      beggar.addEventListener("click", function () {
        cityAudio.coin();
        toast("Klingeling! Eine Münze landet im Becher – nur zum Spaß.");
      });
    }
    var gold = document.getElementById("goldCoin");
    if (gold) {
      gold.addEventListener("click", function () {
        gold.classList.add("is-found");
        try { localStorage.setItem(GOLD_KEY, "1"); } catch (e) {}
        cityAudio.sting();
        moneyRain();
        toast("Die versteckte Goldmünze! Geldregen über der Stadt.");
      });
    }
    var towers = document.getElementById("cityTowers");
    if (towers) {
      towers.addEventListener("click", function (e) {
        var btn = e.target.closest(".tower");
        if (!btn) return;
        var name = btn.getAttribute("data-name");
        var p = null;
        for (var i = 0; i < list.length; i++) if (list[i].name === name) p = list[i];
        if (p) openProfile(p, list);
      });
    }
  }

  function bindParallax() {
    var frame = document.querySelector(".city-frame");
    if (!frame || reducedMotion()) return;
    function setTilt(x, y) {
      document.documentElement.style.setProperty("--tilt-x", (x * 8).toFixed(1) + "px");
      document.documentElement.style.setProperty("--tilt-y", (y * 6).toFixed(1) + "px");
      document.documentElement.style.setProperty("--fig-ry", (x * 18).toFixed(1) + "deg");
      document.documentElement.style.setProperty("--fig-rx", (-y * 10).toFixed(1) + "deg");
    }
    document.addEventListener("mousemove", function (e) {
      if (reducedMotion()) return;
      var fx = (e.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
      var fy = (e.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
      document.documentElement.style.setProperty("--fig-ry", (fx * 16).toFixed(1) + "deg");
      document.documentElement.style.setProperty("--fig-rx", (-fy * 8).toFixed(1) + "deg");
    });
    frame.addEventListener("mousemove", function (e) {
      var r = frame.getBoundingClientRect();
      setTilt(((e.clientX - r.left) / r.width - 0.5) * 2, ((e.clientY - r.top) / r.height - 0.5) * 2);
    });
    var tiltBtn = document.getElementById("tiltBtn");
    function onOrient(ev) {
      var x = (ev.gamma || 0) / 30;
      var y = (ev.beta || 0) / 40;
      setTilt(Math.max(-1, Math.min(1, x)), Math.max(-1, Math.min(1, y)));
    }
    if (tiltBtn) {
      tiltBtn.addEventListener("click", function () {
        var req = window.DeviceOrientationEvent && DeviceOrientationEvent.requestPermission;
        var start = function () {
          window.addEventListener("deviceorientation", onOrient);
          tiltBtn.setAttribute("aria-pressed", "true");
          tiltBtn.textContent = "Neigung aktiv";
          toast("Neigung ist an – kipp das Gerät und die Stadt bewegt sich.");
        };
        if (typeof req === "function") {
          req.call(DeviceOrientationEvent).then(function (state) { if (state === "granted") start(); }).catch(function () {});
        } else start();
      });
    }
  }

  function bindKonami() {
    var seq = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
    var tap = 0, keys = [];
    window.addEventListener("keydown", function (e) {
      keys.push(e.key);
      if (keys.length > seq.length) keys.shift();
      if (keys.join() === seq.join()) { moneyRain(); showBreaking("KONAMI! Geldregen über der Ins-Metropole."); }
    });
    var beggarTaps = 0;
    document.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest("#beggar")) {
        beggarTaps += 1;
        if (beggarTaps >= 5) { beggarTaps = 0; moneyRain(); showBreaking("Fünf Münzen im Becher – und die Stadt tanzt im Gold!"); }
      }
    });
  }

  var game = {
    running: false,
    score: 0,
    time: 30,
    timer: null,
    spawn: null,
    best: 0,
    load: function () {
      try { this.best = Number(localStorage.getItem(GAME_BEST_KEY) || 0) || 0; } catch (e) { this.best = 0; }
      var el = document.getElementById("gameBest");
      if (el) el.textContent = String(this.best);
    },
    open: function () {
      var layer = document.getElementById("gameLayer");
      if (layer) layer.hidden = false;
      this.load();
      this.resetBoard();
    },
    close: function () {
      this.stop();
      var layer = document.getElementById("gameLayer");
      if (layer) layer.hidden = true;
    },
    resetBoard: function () {
      this.score = 0;
      this.time = 30;
      var s = document.getElementById("gameScore");
      var t = document.getElementById("gameTime");
      var a = document.getElementById("gameArena");
      if (s) s.textContent = "0";
      if (t) t.textContent = "30";
      if (a) a.innerHTML = "";
    },
    start: function () {
      if (this.running) return;
      this.resetBoard();
      this.running = true;
      var self = this;
      this.timer = setInterval(function () {
        self.time -= 1;
        var t = document.getElementById("gameTime");
        if (t) t.textContent = String(self.time);
        if (self.time <= 0) self.finish();
      }, 1000);
      this.spawn = setInterval(function () { self.drop(); }, reducedMotion() ? 700 : 420);
    },
    drop: function () {
      var arena = document.getElementById("gameArena");
      if (!arena || !this.running) return;
      var coin = document.createElement("button");
      coin.type = "button";
      coin.className = "game-coin";
      coin.setAttribute("aria-label", "Münze fangen");
      coin.style.left = Math.round(Math.random() * (arena.clientWidth - 28)) + "px";
      coin.style.top = "-30px";
      var self = this;
      var y = -30;
      var speed = 2.2 + Math.random() * 2.4;
      var move = function () {
        if (!self.running || !coin.parentNode) return;
        y += speed;
        coin.style.top = y + "px";
        if (y > arena.clientHeight) { if (coin.parentNode) coin.parentNode.removeChild(coin); return; }
        requestAnimationFrame(move);
      };
      coin.addEventListener("click", function (e) {
        e.preventDefault();
        self.score += 1;
        var s = document.getElementById("gameScore");
        if (s) s.textContent = String(self.score);
        cityAudio.coin();
        if (coin.parentNode) coin.parentNode.removeChild(coin);
      });
      arena.appendChild(coin);
      requestAnimationFrame(move);
    },
    finish: function () {
      this.stop();
      if (this.score > this.best) {
        this.best = this.score;
        try { localStorage.setItem(GAME_BEST_KEY, String(this.best)); } catch (e) {}
        this.load();
        toast("Neuer Coin-Catcher-Bestwert: " + formatDeNumber(this.best) + "! Die Punkte zählen nicht für die Ins.");
      } else {
        toast("Die Zeit ist um! Du hast " + formatDeNumber(this.score) + " Münzen gefangen – nur zum Spaß.");
      }
    },
    stop: function () {
      this.running = false;
      if (this.timer) clearInterval(this.timer);
      if (this.spawn) clearInterval(this.spawn);
      this.timer = this.spawn = null;
    }
  };

  function bindGame() {
    var open = document.getElementById("gameOpen");
    var close = document.getElementById("gameClose");
    var start = document.getElementById("gameStart");
    var layer = document.getElementById("gameLayer");
    game.load();
    if (open) open.addEventListener("click", function () { game.open(); });
    if (close) close.addEventListener("click", function () { game.close(); });
    if (start) start.addEventListener("click", function () { game.start(); });
    if (layer) layer.addEventListener("click", function (e) { if (e.target === layer) game.close(); });
  }

  function bindSound() {
    var soundBtn = document.getElementById("soundToggle");
    var want = false;
    try { want = localStorage.getItem(SOUND_KEY) === "on"; } catch (e) {}
    function setSound(on) {
      if (on) { cityAudio.start(); if (soundBtn) { soundBtn.setAttribute("aria-pressed", "true"); soundBtn.textContent = "Ton aus"; } }
      else { cityAudio.stop(); if (soundBtn) { soundBtn.setAttribute("aria-pressed", "false"); soundBtn.textContent = "Ton an"; } }
      try { localStorage.setItem(SOUND_KEY, on ? "on" : "off"); } catch (e) {}
    }
    if (soundBtn) {
      soundBtn.addEventListener("click", function () { setSound(!cityAudio.on); });
      if (want) soundBtn.textContent = "Ton bereit";
    }
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        if (cityAudio.on) { cityAudio.stop(); cityAudio._resume = true; }
        narrator.stop();
      } else if (cityAudio._resume) {
        cityAudio._resume = false;
        cityAudio.start();
      }
    });
    return setSound;
  }

  function runIntro(setSound) {
    var intro = document.getElementById("intro");
    var stage = document.getElementById("introStage");
    var start = document.getElementById("introStart");
    var skip = document.getElementById("introSkip");
    if (!intro || !stage) return;
    var force = /(?:\?|&)intro=1(?:&|$)/.test(location.search);
    var done = false;
    try { done = sessionStorage.getItem(INTRO_KEY) === "1"; } catch (e) {}
    if (done && !force) { intro.classList.add("is-done"); intro.hidden = true; return; }

    var cards = [
      { kicker: "PEERWISE PRÄSENTIERT", title: "", sub: "" },
      { kicker: "DREI TAGE. DREI KAPITEL.", title: "28. — 30. NOVEMBER", sub: "Der Weg von der Straße auf die Yacht." },
      { kicker: "TAG 1 · 28.11.", title: "GANZ UNTEN", sub: "Am Pflaster beginnt die Geschichte." },
      { kicker: "TAG 2 · 29.11.", title: "DER AUFSTIEG", sub: "Jede Münze ist eine Etage höher." },
      { kicker: "TAG 3 · 30.11.", title: "DIE MILLIONÄRSGALA", sub: "Roter Teppich. Feuerwerk. Finale." },
      { kicker: "PEERWISE", title: "DER WEG ZUM MILLIONÄR", sub: "Wer schafft es auf die Yacht?", titleCard: true }
    ];
    var narr = "Peerwise präsentiert den Weg zum Millionär. In drei Tagen erzählen wir drei Kapitel, vom achtundzwanzigsten bis zum dreißigsten November. Am ersten Tag beginnt die Geschichte ganz unten. Am zweiten Tag folgt der Aufstieg. Und am dritten Tag, bei der Millionärsgala, fällt das große Finale. Wer schafft es von der Straße bis auf die Yacht?";
    var timers = [];
    var closed = false;

    function finish() {
      if (closed) return;
      closed = true;
      timers.forEach(function (t) { clearTimeout(t); });
      narrator.stop();
      intro.classList.add("is-done");
      setTimeout(function () { intro.hidden = true; }, reducedMotion() ? 0 : 600);
      try { sessionStorage.setItem(INTRO_KEY, "1"); } catch (e) {}
    }

    function play() {
      cityAudio.ensure();
      cityAudio.whoosh();
      cityAudio.sting();
      if (setSound) setSound(true);
      speakLine(narr);
      var i = 0;
      function show() {
        if (closed) return;
        var c = cards[i];
        stage.innerHTML = '<div class="intro-card' + (c.titleCard ? " is-title" : "") + '"><span class="intro-kicker">' + esc(c.kicker) + "</span>" +
          (c.title ? "<strong>" + esc(c.title) + "</strong>" : "") +
          (c.sub ? "<em>" + esc(c.sub) + "</em>" : "") + "</div>";
        cityAudio.whoosh();
        i += 1;
        if (i < cards.length) timers.push(setTimeout(show, reducedMotion() ? 500 : (i === 1 ? 3600 : 4200)));
        else timers.push(setTimeout(finish, reducedMotion() ? 700 : 5200));
      }
      show();
    }

    if (start) start.addEventListener("click", play);
    if (skip) skip.addEventListener("click", finish);
  }


  function renderFigureShowcase() {
    if (!/(?:\?|&)figures=1(?:&|$)/.test(location.search)) return;
    var host = document.getElementById("figureShowcase");
    if (!host) {
      host = document.createElement("section");
      host.id = "figureShowcase";
      host.className = "figure-showcase";
      host.setAttribute("aria-label", "Figuren-Vorschau");
      var main = document.querySelector("main.stage");
      if (main) main.appendChild(host);
      else document.body.appendChild(host);
    }
    var stages = STAGES;
    var looksM = ["short", "cap", "beard", "mohawk", "short", "beard", "short"];
    var looksF = ["pigtails", "ponytail", "short", "ponytail", "pigtails", "ponytail", "ponytail"];
    var colors = ["#38bdf8", "#34d399", "#facc15", "#fb923c", "#a78bfa", "#ff6b9d", "#f5d76e"];
    var hairsM = ["#2a2a2a", "#333333", "#5c3a1e", "#1a1410", "#2a2a2a", "#3a2a20", "#1a1410"];
    var hairsF = ["#5c3a1e", "#3b1f12", "#2a1a10", "#3b1f12", "#5c3a1e", "#1a1410", "#3b1f12"];
    function card(gender, stage, i) {
      var female = gender === "f";
      var p = {
        name: "",
        gender: gender,
        look: female ? looksF[i] : looksM[i],
        glasses: !female && (i === 2 || i === 4),
        color: colors[i],
        hair: female ? hairsF[i] : hairsM[i],
        ins: stage.min,
        bib: i + (female ? 10 : 1)
      };
      return '<article class="figure-card"><div class="fig">' + figureSvg(p, { crown: stage.id === "yacht" }) +
        "</div><span>" + esc(stage.name) + "</span><em>" + (female ? "weiblich" : "männlich") + "</em></article>";
    }
    var rowM = stages.map(function (s, i) { return card("m", s, i); }).join("");
    var rowF = stages.map(function (s, i) { return card("f", s, i); }).join("");
    host.hidden = false;
    host.innerHTML = "<h2>FIGUREN-VORSCHAU</h2><p>Alle Stufen, männlich und weiblich – ohne Namen, nur zur Ansicht der Outfits.</p>" +
      '<div class="figure-grid" id="figureGridM">' + rowM + "</div>" +
      '<div class="figure-grid" id="figureGridF">' + rowF + "</div>";
  }

  function boot() {
    narrator.init();
    var list = decorate(PEOPLE);
    applyDayNight();
    renderChapters();
    renderClock();
    renderTicker(list);
    renderVault(list);
    renderLadder();
    renderCity(list);
    renderStock(list);
    renderPrognose(list);
    renderBadges(list);
    renderGala(list);
    renderNote();
    renderFigureShowcase();
    checkAscensions(list);
    bindCity(list);
    bindParallax();
    bindKonami();
    bindGame();
    var setSound = bindSound();
    runIntro(setSound);
    setInterval(renderClock, 1000);
    setInterval(applyDayNight, 60000);
    setTimeout(liveEvents, 4000);
    setInterval(liveEvents, 18000);
    setTimeout(function () { driveRandomCar(); }, 2200);
    setInterval(function () { driveRandomCar(); }, 11000);
    if (dayStatus() === "today" && currentChapter() === 2) setInterval(function () { fireworks(16); }, 9000);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
