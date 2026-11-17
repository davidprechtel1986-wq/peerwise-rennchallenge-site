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
    if (el) el.textContent = String(sum(list));
  }

  function renderLadder() {
    var el = document.getElementById("ladderList");
    if (!el) return;
    el.innerHTML = STAGES.map(function (s) {
      return "<li><b>" + esc(s.name) + "</b><span>ab " + s.min + " Ins — " + esc(s.hint) + "</span></li>";
    }).join("");
  }

  function clothesFor(stageId) {
    var map = {
      bettler: "#6b4a2a",
      strasse: "#3a3a48",
      dachkammer: "#4a5a7a",
      wohnung: "#2a4a6a",
      penthouse: "#1a1a28",
      villa: "#e8e0d0",
      yacht: "#111111"
    };
    return map[stageId] || map.bettler;
  }

  function figureSvg(p, opts) {
    opts = opts || {};
    var stage = stageFor(p.ins);
    var cloth = clothesFor(stage.id);
    var skin = "#e8c2a0";
    var hair = p.hair || "#2a1a10";
    var accent = p.color || "#f5d76e";
    var crown = opts.crown ? '<path d="M16 10 L20 16 L24 10 L28 16 L32 10 L31 18 H17 Z" fill="#f5d76e" stroke="#1a1020" stroke-width="1"/>' : "";
    var glasses = p.glasses
      ? '<g fill="none" stroke="#1a1020" stroke-width="1.2"><circle cx="21" cy="22" r="3.2"/><circle cx="29" cy="22" r="3.2"/><path d="M24.2 22 H25.8"/></g>'
      : "";
    var beard = (p.look === "beard" || p.look === "cap")
      ? '<path d="M20 26 Q25 32 30 26 Q28 30 25 30 Q22 30 20 26 Z" fill="' + hair + '"/>'
      : "";
    var hairCut = "";
    if (p.look === "pigtails") {
      hairCut = '<path d="M17 14 Q25 8 33 14 Q33 20 25 20 Q17 20 17 14Z" fill="' + hair + '"/><circle cx="16" cy="22" r="3.2" fill="' + hair + '"/><circle cx="34" cy="22" r="3.2" fill="' + hair + '"/>';
    } else if (p.look === "ponytail") {
      hairCut = '<path d="M17 14 Q25 8 33 14 Q33 20 25 20 Q17 20 17 14Z" fill="' + hair + '"/><path d="M31 18 Q38 24 33 32" fill="none" stroke="' + hair + '" stroke-width="3"/><circle cx="31" cy="18" r="2.2" fill="' + accent + '"/>';
    } else if (p.look === "mohawk") {
      hairCut = '<path d="M24 6 L26 6 L27 18 L23 18 Z" fill="' + hair + '"/><path d="M18 16 Q25 12 32 16" fill="' + skin + '"/>';
    } else if (p.look === "cap") {
      hairCut = '<path d="M16 16 Q25 8 34 16 L34 18 H16Z" fill="' + accent + '"/><path d="M14 17 H22" stroke="' + accent + '" stroke-width="3"/>';
    } else {
      hairCut = '<path d="M17 14 Q25 8 33 14 Q33 19 25 19 Q17 19 17 14Z" fill="' + hair + '"/>';
    }
    var bow = stage.id === "yacht" ? '<rect x="23.2" y="32.5" width="4" height="2.4" fill="#c41e3a"/>' : "";
    var glass = stage.id === "yacht" ? '<path d="M34 34 L38 34 L37 40 L35 40 Z" fill="#5ce1ff" stroke="#1a1020" stroke-width="0.8"/>' : "";
    return (
      '<svg viewBox="0 0 50 72" aria-hidden="true">' +
      '<ellipse cx="25" cy="68" rx="12" ry="3" fill="rgba(0,0,0,0.35)"/>' +
      crown + hairCut +
      '<circle cx="25" cy="22" r="8" fill="' + skin + '" stroke="#1a1020" stroke-width="1.2"/>' +
      glasses + beard +
      '<path d="M16 34 Q25 30 34 34 L32 52 Q25 56 18 52 Z" fill="' + cloth + '" stroke="#1a1020" stroke-width="1.3"/>' +
      '<path d="M16 36 L10 48" stroke="' + cloth + '" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M34 36 L40 48" stroke="' + cloth + '" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M20 52 L18 66" stroke="#1a1020" stroke-width="3.4" stroke-linecap="round"/>' +
      '<path d="M30 52 L32 66" stroke="#1a1020" stroke-width="3.4" stroke-linecap="round"/>' +
      '<rect x="16" y="64" width="6" height="3" rx="1" fill="' + accent + '"/><rect x="28" y="64" width="6" height="3" rx="1" fill="' + accent + '"/>' +
      bow + glass +
      "</svg>"
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
      '<div class="taxi" id="cityTaxi" aria-hidden="true"></div>' +
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
      el.innerHTML = "<h3>PROGNOSE</h3><p>Sobald die ersten Moderatoren einziehen, zeigen wir, wer zuerst Millionär auf Yacht wird. Ziel: " + MILLION + " Ins. Finale bei der Millionärsgala am 30.11.</p>";
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
      msg = "Bei aktuellem Stand wird <b>" + esc(first.name) + "</b> zuerst Millionär auf Yacht (Ziel: " + MILLION + " Ins). Noch " + need + " Ins — Finale bei der Millionärsgala am 30.11.";
      if (second) msg += " Vorsprung vor " + esc(second.name) + ": " + (first.ins - second.ins) + " Ins.";
    }
    el.innerHTML = "<h3>PROGNOSE</h3><p>" + msg + "</p><div class=\"bar\"><i style=\"width:" + pct + "%\"></i></div><p>" + esc(first.name) + " steht bei " + first.ins + " von " + MILLION + " Ins (" + pct + "%).</p>";
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

  function renderGala(list) {
    var copy = document.getElementById("galaCopy");
    var stage = document.getElementById("galaStage");
    var status = dayStatus();
    var ch = currentChapter();
    if (copy) {
      if (status === "today" && ch === 2) copy.textContent = "Die Millionärsgala läuft! Roter Teppich, Feuerwerk über der Yacht, Champagner auf Deck.";
      else if (status === "done") copy.textContent = "Die Gala ist vorbei. Der Teppich bleibt als Erinnerung liegen.";
      else copy.textContent = "Der rote Teppich ist schon ausgerollt. Am 30. November steigt die Gala – mit Feuerwerk über der Yacht und dem großen Finale.";
    }
    if (!stage) return;
    var people = "";
    if (list.length) {
      people = '<div class="gala-people">' + ranked(list).slice(0, 3).map(function (r) {
        return '<span class="fig" title="' + esc(r.person.name) + '">' + figureSvg(r.person, { crown: r.place === 1 }) + "</span>";
      }).join("") + "</div>";
    }
    stage.innerHTML = '<div class="spot s1"></div><div class="spot s2"></div><div class="yacht" aria-hidden="true"></div>' + people + '<div class="carpet"></div>';
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

  function speakLine(text) {
    if (!window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = "de-DE";
      u.rate = 1.02;
      u.pitch = 1.05;
      var voices = window.speechSynthesis.getVoices() || [];
      var de = null;
      for (var i = 0; i < voices.length; i++) if (/de(-|_)DE/i.test(voices[i].lang) || voices[i].lang === "de") { de = voices[i]; break; }
      if (de) u.voice = de;
      window.speechSynthesis.speak(u);
    } catch (err) {}
  }

  function voiceFor(p, list) {
    var st = stageFor(p.ins);
    var lead = isFirst(p, list);
    return p.name + " steht auf der Stufe " + st.name + " mit " + p.ins + " Ins." + (lead ? " " + p.name + " führt gerade das Feld an." : " Der Weg zur Yacht geht weiter.");
  }

  function storyFor(p, list) {
    var st = stageFor(p.ins);
    var nxt = nextStage(p.ins);
    var base = p.name + " ist in der Ins-Metropole unterwegs. Aktuelle Stufe: " + st.name + " – " + st.hint;
    if (nxt) base += " Noch " + (nxt.min - p.ins) + " Ins bis " + nxt.name + ".";
    else base += " Das Deck der Yacht ist erreicht.";
    if (isFirst(p, list)) base += " Gerade führt " + p.name + " das Feld an.";
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
    speakLine(voiceFor(p, list));
  }

  function showBreaking(text) {
    var box = document.getElementById("breaking");
    var p = document.getElementById("breakingText");
    if (!box || !p) return;
    p.textContent = text;
    box.hidden = false;
    cityAudio.sting();
    clearTimeout(showBreaking._t);
    showBreaking._t = setTimeout(function () { box.hidden = true; }, 4200);
  }

  function showAscend(name, stage) {
    var box = document.getElementById("ascend");
    var p = document.getElementById("ascendText");
    if (!box || !p) return;
    p.textContent = name + " steigt auf: " + stage + "!";
    box.hidden = false;
    cityAudio.sting();
    speakLine(name + " ist aufgestiegen auf die Stufe " + stage + "!");
    clearTimeout(showAscend._t);
    showAscend._t = setTimeout(function () { box.hidden = true; }, 4500);
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

  function fireworks(count) {
    var fx = document.getElementById("cityFx");
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

  function liveEvents() {
    var taxi = document.getElementById("cityTaxi");
    var p1 = document.querySelector(".pigeon.p1");
    var p2 = document.querySelector(".pigeon.p2");
    var roll = Math.random();
    var ch = currentChapter();
    if (ch === 2 || roll > 0.72) fireworks(ch === 2 ? 20 : 10);
    if (taxi) {
      taxi.classList.remove("is-run");
      void taxi.offsetWidth;
      taxi.classList.add("is-run");
    }
    if (roll > 0.4 && p1) { p1.classList.remove("is-fly"); void p1.offsetWidth; p1.classList.add("is-fly"); }
    if (roll > 0.55 && p2) { p2.classList.remove("is-fly"); void p2.offsetWidth; p2.classList.add("is-fly"); }
    var flashes = [
      "Ein Taxi rauscht durch die Ins-Meile.",
      "Tauben heben über dem Pflaster ab.",
      "Am Horizont knistert es – vielleicht schon ein Vorschein der Gala.",
      "Die Börse flüstert: Bald ziehen die ersten Aufsteiger ein.",
      "Jemand hat eine Münze in den Becher des Bettlers geworfen."
    ];
    if (Math.random() > 0.55) showBreaking(flashes[Math.floor(Math.random() * flashes.length)]);
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
    }
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
        toast("Neuer Coin-Catcher-Bestwert: " + this.best + "! (zählt nicht für die Ins)");
      } else {
        toast("Zeit um! " + this.score + " Münzen – nur zum Spaß.");
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
        if (window.speechSynthesis) try { window.speechSynthesis.cancel(); } catch (e) {}
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
    var narr = "Peerwise präsentiert: Der Weg zum Millionär. Drei Tage, drei Kapitel. Am 28. November: Ganz unten. Am 29.: Der Aufstieg. Am 30.: Die Millionärsgala. Wer schafft es von der Straße auf die Yacht?";
    var timers = [];
    var closed = false;

    function finish() {
      if (closed) return;
      closed = true;
      timers.forEach(function (t) { clearTimeout(t); });
      if (window.speechSynthesis) try { window.speechSynthesis.cancel(); } catch (e) {}
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
        if (i < cards.length) timers.push(setTimeout(show, reducedMotion() ? 400 : 2200));
        else timers.push(setTimeout(finish, reducedMotion() ? 600 : 2600));
      }
      show();
    }

    if (start) start.addEventListener("click", play);
    if (skip) skip.addEventListener("click", finish);
  }

  function boot() {
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
    if (dayStatus() === "today" && currentChapter() === 2) setInterval(function () { fireworks(16); }, 9000);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
