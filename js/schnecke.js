/* PEERWISE · Schneckenrennen
   Drei Kapitel, 28.11. bis 30.11.2026:
   Tag 1 Ganz unten, Tag 2 Der Aufstieg, Tag 3 Die Millionärsgala.
   Eine gemeinsame Starterliste, ein Rennen, eine Rangliste.

   Namen später eintragen: unten in PEOPLE eine Zeile pro Person
   in die eckigen Klammern setzen.
   Vorlage (einfach kopieren, Namen und Farbe anpassen):
     { name: 'NameHier', gender: 'f', look: 'bun', color: '#ffd24a', hair: '#3a2418', mood: 1, ins: 0 },
   gender: f oder m. look: pigtails, bun, ponytail, bob, cap, short, beard.
   glasses: true setzt eine Rennbrille. color ist die Hausfarbe. ins startet bei 0.
   Die Eintragen-Seite liest diese Liste automatisch. */
(function () {
  var EVENT_START = new Date(2026, 10, 28);
  var EVENT_END = new Date(2026, 10, 30);
  var CHAPTERS = [
    { n: 1, title: "Ganz unten", date: "28.11." },
    { n: 2, title: "Der Aufstieg", date: "29.11." },
    { n: 3, title: "Die Millionärsgala", date: "30.11." }
  ];

  var PEOPLE = [
    { name: "Anni", gender: "f", look: "pigtails", glasses: true, color: "#ff6b9d", hair: "#5c3a1e", mood: 1, ins: 87 },
    { name: "HeikoWi", gender: "m", look: "cap", beard: true, color: "#38bdf8", hair: "#333333", mood: 2, ins: 718 },
    { name: "Dave", gender: "m", look: "beard", glasses: true, color: "#facc15", hair: "#5c3a1e", mood: 1, ins: 386 },
    { name: "JoeSp", gender: "m", look: "short", glasses: true, color: "#34d399", hair: "#2a2a2a", mood: 0, ins: 398 },
    { name: "PascalePätz", gender: "f", look: "ponytail", glasses: true, color: "#a78bfa", hair: "#3b1f12", mood: 2, ins: 232 },
    { name: "FelixHau", gender: "m", look: "mohawk", glasses: false, color: "#fb923c", hair: "#1a1410", mood: 1, ins: 171 }
  ];

  var QUIPS = {
    Anni: ["Ich schleim voraus!", "Brille auf – los!", "Nicht so schnell … doch!"],
    HeikoWi: ["Kappe fest!", "Bart an, Tempo an!", "Ich kriech voraus!"],
    Dave: ["Mit Durchblick!", "Ruhe … und zack!", "Dave schleimt!"],
    JoeSp: ["JoeSp macht Druck!", "Kurz und schleimig!", "Die Spur ist grün!"],
    "PascalePätz": ["Pascale schleimt mit!", "Lila Spur voraus!", "Ich kriech auch!"],
    FelixHau: ["Felix haut rein!", "Orange voraus!", "Ich schleim mit!"]
  };

  function withPerson(list) {
    return list.map(function (p, i) {
      return {
        name: p.name,
        gender: p.gender,
        look: p.look,
        glasses: !!p.glasses,
        beard: !!p.beard || p.look === "beard",
        color: p.color,
        hair: p.hair,
        mood: p.mood,
        ins: Number(p.ins) || 0,
        bib: i + 1
      };
    });
  }

  function atMidnight(d) {
    var x = new Date(d.getTime());
    x.setHours(0, 0, 0, 0);
    return x;
  }

  function eventStart() {
    return atMidnight(EVENT_START);
  }

  function eventEndExclusive() {
    var d = atMidnight(EVENT_END);
    d.setDate(d.getDate() + 1);
    return d;
  }

  function eventDay() {
    return eventStart();
  }

  function dayStatus() {
    var now = atMidnight(new Date());
    if (now.getTime() < eventStart().getTime()) return "soon";
    if (now.getTime() >= eventEndExclusive().getTime()) return "done";
    return "today";
  }

  function currentChapter() {
    if (dayStatus() !== "today") return null;
    var now = atMidnight(new Date());
    var idx = Math.round((now.getTime() - eventStart().getTime()) / 86400000);
    if (idx < 0) idx = 0;
    if (idx > 2) idx = 2;
    return CHAPTERS[idx];
  }

  function renderChapters() {
    var ch = currentChapter();
    var status = dayStatus();
    var banner = document.getElementById("chapterBanner");
    if (banner) {
      if (status === "soon") banner.textContent = "Start am 28.11. · Drei Kapitel: Ganz unten · Der Aufstieg · Die Millionärsgala";
      else if (status === "done") banner.textContent = "Finale vorbei · Die Millionärsgala war am 30.11.";
      else if (ch) banner.textContent = "Jetzt: Kapitel " + ch.n + " · " + ch.date + " · " + ch.title;
    }
    var strip = document.getElementById("chapterStrip");
    if (strip) {
      var items = strip.querySelectorAll("li");
      for (var i = 0; i < items.length; i++) {
        var n = Number(items[i].getAttribute("data-n"));
        items[i].classList.remove("is-now", "is-done");
        if (status === "done" || (ch && n < ch.n)) items[i].classList.add("is-done");
        if (ch && n === ch.n) items[i].classList.add("is-now");
      }
    }
    if (document.body) {
      document.body.classList.remove("chapter-1", "chapter-2", "chapter-3");
      if (ch) document.body.classList.add("chapter-" + ch.n);
    }
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }

  function sum(list) {
    var n = 0;
    for (var i = 0; i < list.length; i++) n += list[i].ins;
    return n;
  }

  function maxIns(list) {
    var m = 0;
    for (var i = 0; i < list.length; i++) if (list[i].ins > m) m = list[i].ins;
    return m;
  }

  function minIns(list) {
    if (!list.length) return 0;
    var m = list[0].ins;
    for (var i = 1; i < list.length; i++) if (list[i].ins < m) m = list[i].ins;
    return m;
  }

  function isFirst(person, list) {
    var min = minIns(list);
    var max = maxIns(list);
    return max > min && person.ins === max;
  }

  function ranked(list) {
    var copy = list.slice().sort(function (a, b) {
      if (b.ins !== a.ins) return b.ins - a.ins;
      return a.name.localeCompare(b.name, "de");
    });
    var place = 0;
    var last = null;
    return copy.map(function (p, i) {
      if (last === null || p.ins !== last) place = i + 1;
      last = p.ins;
      return { person: p, place: place };
    });
  }

  function quipFor(p, list) {
    var lines = QUIPS[p.name] || ["Schleim voraus!"];
    var idx = isFirst(p, list) ? 0 : (p.bib - 1) % lines.length;
    if (maxIns(list) === minIns(list)) idx = (p.bib + p.mood) % lines.length;
    return lines[idx];
  }

  function eyewearSvg(p) {
    if (p.glasses) {
      return (
        '<g class="goggles">' +
        '<path d="M118 18 H156" stroke="#ffd24a" stroke-width="3.2" stroke-linecap="round"/>' +
        '<circle cx="126" cy="28" r="9.5" fill="#8af0ff" stroke="#1a1020" stroke-width="2.2"/>' +
        '<circle cx="148" cy="28" r="9.5" fill="#8af0ff" stroke="#1a1020" stroke-width="2.2"/>' +
        '<path d="M135.5 28 H138.5" stroke="#1a1020" stroke-width="2"/>' +
        '<circle cx="123.5" cy="25.5" r="2.2" fill="#fff" opacity="0.9"/>' +
        '<circle cx="145.5" cy="25.5" r="2.2" fill="#fff" opacity="0.9"/>' +
        "</g>"
      );
    }
    return (
      '<g class="shades">' +
      '<path d="M120 26 H154" stroke="#1a1020" stroke-width="3" stroke-linecap="round"/>' +
      '<rect x="116" y="22" width="16" height="11" rx="3" fill="#1a1020"/>' +
      '<rect x="136" y="21" width="16" height="11" rx="3" fill="#1a1020"/>' +
      '<rect x="118" y="24" width="12" height="6" rx="2" fill="#2a3350" opacity="0.85"/>' +
      '<rect x="138" y="23" width="12" height="6" rx="2" fill="#2a3350" opacity="0.85"/>' +
      "</g>"
    );
  }

  function lookExtras(p, stroke) {
    var hair = p.hair || "#3a2418";
    var bits = "";
    if (p.look === "pigtails") {
      bits +=
        '<g class="pigtails">' +
        '<circle cx="54" cy="42" r="9" fill="' + hair + '" stroke="' + stroke + '" stroke-width="1.6"/>' +
        '<circle cx="52" cy="54" r="6.5" fill="' + hair + '" stroke="' + stroke + '" stroke-width="1.4"/>' +
        '<circle cx="114" cy="40" r="9" fill="' + hair + '" stroke="' + stroke + '" stroke-width="1.6"/>' +
        '<circle cx="118" cy="52" r="6.5" fill="' + hair + '" stroke="' + stroke + '" stroke-width="1.4"/>' +
        '<circle cx="51" cy="40" r="2" fill="#ffd24a"/>' +
        '<circle cx="117" cy="38" r="2" fill="#ffd24a"/>' +
        "</g>";
    }
    if (p.look === "ponytail") {
      bits +=
        '<g class="ponytail">' +
        '<ellipse cx="52" cy="36" rx="11" ry="10" fill="' + hair + '" stroke="' + stroke + '" stroke-width="1.6"/>' +
        '<path d="M48 40 Q28 58 36 86 Q44 70 52 78 Q46 58 58 42Z" fill="' + hair + '" stroke="' + stroke + '" stroke-width="1.5" stroke-linejoin="round"/>' +
        '<path d="M46 38 L40 46 L52 46 Z" fill="#a78bfa" stroke="' + stroke + '" stroke-width="1.2"/>' +
        '<path d="M44 42 Q40 48 46 52" fill="none" stroke="#7c3aed" stroke-width="1.3" stroke-linecap="round"/>' +
        "</g>";
    }
    if (p.look === "mohawk") {
      bits +=
        '<g class="mohawk">' +
        '<path d="M74 20 L80 -8 L86 18 L92 -12 L98 18 L104 -7 L110 20 L100 22 L80 22 Z" fill="' + hair + '" stroke="' + stroke + '" stroke-width="1.5" stroke-linejoin="round"/>' +
        '<path d="M80 -8 L81 2" fill="none" stroke="#fb923c" stroke-width="2" stroke-linecap="round"/>' +
        '<path d="M92 -12 L93 0" fill="none" stroke="#fb923c" stroke-width="2" stroke-linecap="round"/>' +
        '<path d="M104 -7 L105 4" fill="none" stroke="#fb923c" stroke-width="2" stroke-linecap="round"/>' +
        "</g>";
    }
    if (p.beard) {
      bits +=
        '<g class="beard">' +
        '<path d="M128 78 Q136 92 150 80 Q142 94 128 90 Q122 84 128 78Z" fill="' + hair + '" stroke="' + stroke + '" stroke-width="1.3"/>' +
        "</g>";
    }
    return bits;
  }

  function bibSvg(n) {
    if (!n) return "";
    return (
      '<g class="snail-bib">' +
      '<rect x="72" y="50" width="24" height="18" rx="4" fill="#fff" stroke="#1a1020" stroke-width="1.7"/>' +
      '<text x="84" y="64" text-anchor="middle" font-size="13" font-weight="800" font-family="Impact, Arial Black, sans-serif" fill="#1a1020">' +
      esc(String(n)) +
      "</text></g>"
    );
  }

  function snailSvg(p, opt) {
    opt = opt || {};
    var crown = !!opt.crown;
    var color = p.color || "#ff4fd8";
    var foot = "#f6e7b8";
    var belly = "#fff6d8";
    var stroke = "#1a1020";
    var delay = opt.delay != null ? opt.delay : 0;
    var wear = eyewearSvg(p);
    var cap = p.look === "cap"
      ? '<path d="M66 16 Q86 0 110 16 L114 22 L64 24 Z" fill="#2a2158" stroke="' + stroke + '" stroke-width="1.5"/>'
      : "";
    var crownSvg = crown
      ? '<g class="snail-crown">' +
        '<path d="M72 8 L78 -8 L86 6 L94 -12 L102 6 L110 -8 L116 8 Z" fill="#ffd24a" stroke="#8a5a10" stroke-width="1.4"/>' +
        '<rect x="72" y="6" width="44" height="6" rx="1.5" fill="#ffd24a" stroke="#8a5a10"/>' +
        '<circle cx="78" cy="-4" r="2.1" fill="#ff4fd8"/>' +
        '<circle cx="94" cy="-8" r="2.1" fill="#5ce1ff"/>' +
        '<circle cx="110" cy="-4" r="2.1" fill="#ff4fd8"/>' +
        "</g>"
      : "";

    return (
      '<svg viewBox="-8 -18 180 125" aria-hidden="true">' +
      '<ellipse cx="70" cy="100" rx="50" ry="8" fill="rgba(0,0,0,0.25)"/>' +
      '<g class="snail-body" style="animation-delay:' + delay + 's">' +
      '<path d="M10 88 Q6 70 28 68 Q58 64 88 68 Q114 72 130 64 Q140 58 144 68 Q148 84 128 92 Q78 104 28 96 Q14 92 10 88Z" fill="' + foot + '" stroke="' + stroke + '" stroke-width="2.2"/>' +
      '<path d="M28 80 Q70 72 118 80 Q90 88 70 88 Q48 88 28 80Z" fill="' + belly + '" opacity="0.95"/>' +
      "</g>" +
      '<g class="snail-shell" style="animation-delay:' + delay + 's">' +
      '<ellipse cx="84" cy="48" rx="40" ry="38" fill="' + color + '" stroke="' + stroke + '" stroke-width="2.5"/>' +
      '<path d="M84 72 C66 70 56 56 58 44 C62 26 84 22 96 32 C106 42 102 56 84 56 C74 56 70 48 74 42 C78 36 90 38 92 44" fill="none" stroke="rgba(0,0,0,0.32)" stroke-width="5.5" stroke-linecap="round"/>' +
      '<path d="M68 28 Q86 16 106 28" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="3.2" stroke-linecap="round"/>' +
      cap + lookExtras(p, stroke) + crownSvg + bibSvg(opt.bib || p.bib) +
      "</g>" +
      '<g class="snail-stalk" style="animation-delay:' + delay + 's">' +
      '<path d="M128 64 Q124 40 126 24" fill="none" stroke="' + foot + '" stroke-width="6" stroke-linecap="round"/>' +
      '<circle cx="126" cy="20" r="8" fill="' + foot + '" stroke="' + stroke + '" stroke-width="1.7"/>' +
      '<circle cx="126" cy="20" r="2.6" fill="' + stroke + '"/>' +
      '<circle cx="128" cy="18" r="1" fill="#fff"/>' +
      "</g>" +
      '<g class="snail-stalk alt" style="animation-delay:' + (delay + 0.18) + 's">' +
      '<path d="M138 66 Q148 42 150 24" fill="none" stroke="' + foot + '" stroke-width="6" stroke-linecap="round"/>' +
      '<circle cx="150" cy="20" r="8" fill="' + foot + '" stroke="' + stroke + '" stroke-width="1.7"/>' +
      '<circle cx="150" cy="20" r="2.6" fill="' + stroke + '"/>' +
      '<circle cx="152" cy="18" r="1" fill="#fff"/>' +
      "</g>" +
      wear +
      '<path d="M132 74 Q140 82 150 74" fill="none" stroke="' + stroke + '" stroke-width="2" stroke-linecap="round"/>' +
      "</svg>"
    );
  }

  function splitTime(ms) {
    if (ms < 0) ms = 0;
    var s = Math.floor(ms / 1000);
    var d = Math.floor(s / 86400); s -= d * 86400;
    var h = Math.floor(s / 3600); s -= h * 3600;
    var m = Math.floor(s / 60); s -= m * 60;
    return { d: d, h: h, m: m, s: s };
  }

  function cell(n, label) {
    return '<div class="cell"><b>' + pad(n) + "</b><span>" + label + "</span></div>";
  }

  function renderClock() {
    var status = dayStatus();
    var ch = currentChapter();
    var pill = document.getElementById("livePill");
    var clock = document.getElementById("eventClock");
    var board = document.getElementById("countdownBoard");
    var now = new Date();
    var time = pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds());
    renderChapters();

    if (pill) {
      pill.classList.remove("is-soon", "is-done");
      if (status === "soon") {
        pill.classList.add("is-soon");
        pill.innerHTML = "<i></i> SOON";
      } else if (status === "today") {
        pill.innerHTML = "<i></i> LIVE";
      } else {
        pill.classList.add("is-done");
        pill.innerHTML = "<i></i> ENDE";
      }
    }

    if (clock) {
      var prefix = "28.–30.11. · ";
      if (status === "soon") prefix = "COUNTDOWN · ";
      else if (ch) prefix = "KAP " + ch.n + " · " + ch.title.toUpperCase() + " · ";
      else if (status === "done") prefix = "GALA ENDE · ";
      clock.textContent = prefix + time;
    }

    if (!board) return;
    if (status === "done") {
      board.innerHTML = '<p class="status">MILLIONÄRSGALA BEENDET</p><div class="digits">' +
        '<div class="cell"><b>28</b><span>START</span></div>' +
        '<div class="cell"><b>30</b><span>NOV</span></div>' +
        '<div class="cell"><b>26</b><span>JAHR</span></div></div>';
      return;
    }
    var target = eventStart();
    var label = "START 28.11. IN";
    if (status === "today") {
      if (ch && ch.n < 3) {
        target = new Date(atMidnight(new Date()).getTime() + 24 * 60 * 60 * 1000);
        label = "LIVE · KAPITEL " + ch.n + " · " + ch.title.toUpperCase() + " – NOCH";
      } else {
        target = eventEndExclusive();
        label = "LIVE · MILLIONÄRSGALA – NOCH";
      }
    }
    var t = splitTime(target.getTime() - now.getTime());
    var digits = "";
    if (status === "soon" && t.d > 0) digits += cell(t.d, "TAGE");
    digits += cell(t.h, "STD") + cell(t.m, "MIN") + cell(t.s, "SEK");
    board.innerHTML = '<p class="status">' + label + "</p><div class=\"digits\">" + digits + "</div>";
  }

  function tickerLines(list) {
    var status = dayStatus();
    var ch = currentChapter();
    var lines = [
      "PEERWISE SCHNECKENRENNEN — 28. BIS 30. NOVEMBER 2026!",
      "Drei Kapitel: 28.11. Ganz unten · 29.11. Der Aufstieg · 30.11. Die Millionärsgala!",
      "Langsam war gestern – jetzt wird geschleimt!",
      "Wer die meisten Ins holt, steht ganz vorn an der Ziellinie und gewinnt!"
    ];
    if (list && list.length) {
      lines.push("Am Start: " + list.map(function (p) { return p.name; }).join(", ") + "!");
      var max = maxIns(list);
      var min = minIns(list);
      if (max === 0) {
        lines.push("Noch alle bei 0 Ins \u2013 das Feld ist v\u00f6llig offen!");
      } else if (max === min) {
        lines.push("Alle gleichauf bei " + max + " Ins \u2013 Spannung pur im Schleimstadion!");
      } else {
        list.filter(function (p) { return isFirst(p, list); }).forEach(function (p) {
          lines.push(p.name + " f\u00fchrt mit " + p.ins + " Ins und tr\u00e4gt die Krone!");
        });
      }
    } else {
      lines.push("Die Starterliste kommt noch \u2013 die Bahn ist schon warm geschleimt!");
    }
    if (status === "today" && ch) lines.unshift("LIVE · Kapitel " + ch.n + " · " + ch.title + " · " + ch.date + "!");
    else if (status === "today") lines.unshift("LIVE aus der PEERWISE-Ins-Metropole!");
    if (status === "soon") lines.unshift("Bald geht’s los: 28. bis 30. November 2026 — drei Kapitel bis zur Millionärsgala!");
    if (status === "done") lines.unshift("Die Millionärsgala ist vorbei – danke fürs Schleimen!");
    return lines;
  }

  function renderTicker(list) {
    var el = document.getElementById("tickerTrack");
    if (!el) return;
    var bits = tickerLines(list).map(function (t, i) {
      return i % 2 ? "<b>" + esc(t) + "</b>" : esc(t);
    });
    var joined = bits.join("  \u00b7  ");
    el.innerHTML = "<span>" + joined + "  \u00b7  </span><span>" + joined + "  \u00b7  </span>";
  }

  function renderLegend() {
    var run = document.getElementById("legendRun");
    var lead = document.getElementById("legendLead");
    var trail = document.getElementById("legendTrail");
    var sample = { color: "#ff4fd8", glasses: true, bib: 1 };
    var sampleLead = { color: "#ffd24a", glasses: false, mood: 2, bib: 1 };
    var sampleTrail = { color: "#5ce1ff", glasses: true, bib: 2 };
    if (run) {
      run.innerHTML =
        '<div class="mini"><div class="crawl">' + snailSvg(sample, { bib: 1 }) + "</div></div>" +
        "<div><em>UNTERWEGS</em>Mit jedem In kriecht die Schnecke weiter Richtung Ziel.</div>";
    }
    if (lead) {
      lead.innerHTML =
        '<div class="mini"><div class="crawl">' + snailSvg(sampleLead, { crown: true, bib: 1 }) + "</div></div>" +
        "<div><em>VORNE</em>Wer die meisten Ins hat, tr\u00e4gt die Krone und gewinnt.</div>";
    }
    if (trail) {
      trail.innerHTML =
        '<div class="mini"><div class="crawl">' + snailSvg(sampleTrail, { bib: 2 }) + "</div></div>" +
        "<div><em>SCHLEIMSPUR</em>Hinter jeder Schnecke bleibt eine Spur in ihrer Farbe.</div>";
    }
  }

  function show(id, on) {
    var el = document.getElementById(id);
    if (el) el.hidden = !on;
  }

  function renderLive(list) {
    var el = document.getElementById("liveRank");
    if (!el) return;
    var rows = ranked(list);
    var max = maxIns(list);
    var html = '<article class="rank-card"><h2>LIVE-RANGLISTE</h2>';
    if (!rows.length) {
      html += '<p class="sack-note">Noch keine Starter.</p>';
    }
    rows.forEach(function (row) {
      var p = row.person;
      var first = isFirst(p, list);
      var gap = max > 0 && p.ins < max ? "\u2212" + (max - p.ins) + " auf Platz 1" : (first ? "f\u00fchrt" : "gleichauf");
      html +=
        '<div class="rank-row' + (first ? " is-first" : "") + '">' +
        '<span class="place">' + row.place + ".</span>" +
        '<span class="who"><i class="dot" style="background:' + esc(p.color) + '"></i>' +
        esc(p.name) + " <small>#" + p.bib + "</small></span>" +
        '<span class="pts">' + p.ins + ' INS<span class="gap">' + gap + "</span></span>" +
        "</div>";
    });
    el.innerHTML = html + "</article>";
  }

  function renderTracks(list) {
    var el = document.getElementById("tracks");
    if (!el) return;
    var max = maxIns(list);
    el.innerHTML = list.map(function (p, i) {
      var first = isFirst(p, list);
      var pct = max ? Math.round((p.ins / max) * 62) + 4 : 4;
      var trail = Math.min(86, Math.max(12, pct + 14));
      return (
        '<div class="lane' + (first ? " is-first" : "") + '" style="--snail-color:' + esc(p.color) + ";--trail:" + trail + '%">' +
        '<div class="lane-head">' +
        '<span class="who"><i class="dot" style="background:' + esc(p.color) + '"></i>#' + p.bib + " " + esc(p.name) + "</span>" +
        "<span class=\"pts\"><b>" + p.ins + "</b> INS</span></div>" +
        '<span class="start-stick" aria-hidden="true"></span>' +
        '<span class="slime-trail" aria-hidden="true"></span>' +
        '<div class="runner-mover crawl" style="left:' + pct + "%;animation-delay:" + (i * 0.12) + 's">' +
        '<span class="bubble">' + esc(quipFor(p, list)) + "</span>" +
        snailSvg(p, { crown: first, delay: i * 0.12, bib: p.bib }) +
        "</div></div>"
      );
    }).join("");
  }

  function peopleAtPlace(rows, place) {
    return rows.filter(function (r) { return r.place === place; }).map(function (r) { return r.person; });
  }

  function stepHtml(kind, label, people, list) {
    var faces = (people || []).map(function (p) {
      return (
        '<div class="racer">' +
        snailSvg(p, { crown: kind === "gold" && isFirst(p, list), bib: p.bib }) +
        '<div class="name">' + esc(p.name) + " #" + p.bib + "</div>" +
        '<div class="ins">' + p.ins + " INS</div></div>"
      );
    }).join("");
    if (!faces) {
      faces = '<div class="racer"><div class="name">???</div><div class="ins">noch offen</div></div>';
    }
    return (
      '<div class="step ' + kind + (people && people.length ? "" : " empty") + '">' +
      '<div class="face">' + faces + "</div>" +
      '<div class="block">' + label + "</div></div>"
    );
  }

  function renderPodium(list) {
    var wrap = document.getElementById("podiumWrap");
    var el = document.getElementById("podium");
    if (!wrap || !el) return;
    if (!list.length) {
      wrap.hidden = true;
      return;
    }
    wrap.hidden = false;
    var rows = ranked(list);
    var max = maxIns(list);
    var min = minIns(list);
    var title = wrap.querySelector("h2");
    if (max === min) {
      if (title) title.innerHTML = "<span>POKAL-PODIUM</span>";
      var racers = list.map(function (p) {
        return (
          '<div class="racer">' +
          snailSvg(p, { bib: p.bib }) +
          '<div class="name">' + esc(p.name) + " #" + p.bib + "</div>" +
          '<div class="ins">' + p.ins + " INS</div></div>"
        );
      }).join("");
      var msg = max === 0
        ? "Noch alle gleichauf bei 0 Ins \u2013 das Rennen ist v\u00f6llig offen!"
        : "Alle liegen gleichauf bei " + max + " Ins \u2013 Gold ist noch nicht vergeben!";
      el.innerHTML = '<p class="podium-open">' + msg + '</p><div class="podium-field">' + racers + "</div>";
      return;
    }
    if (title) title.innerHTML = "<span>POKAL-PODIUM</span>";
    var gold = peopleAtPlace(rows, 1);
    var silver = peopleAtPlace(rows, 2);
    var bronze = peopleAtPlace(rows, 3);
    el.innerHTML =
      stepHtml("silver", "2", silver, list) +
      stepHtml("gold", "1", gold, list) +
      stepHtml("bronze", "3", bronze, list);
  }


  function renderCoinPot(list) {
    var total = sum(list);
    var el = document.getElementById("coinPotTotal");
    if (el) el.textContent = String(total);
    var wrap = document.getElementById("coinPot");
    if (wrap) wrap.classList.toggle("is-hot", total > 0);
  }

  function reducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function renderConfetti() {
    var box = document.getElementById("confetti");
    if (!box || reducedMotion()) return;
    var colors = ["#ffe44d", "#ff4fd8", "#5ce1ff", "#34d399", "#ffffff", "#ff7a3c", "#c9a0ff"];
    var html = "";
    var n = 28;
    for (var i = 0; i < n; i++) {
      var left = (3 + (i * 97 / n) + (i % 3) * 2) % 100;
      var delay = (i * 0.22) % 7;
      var dur = 6.2 + (i % 5) * 0.7;
      var color = colors[i % colors.length];
      var cls = i % 3 === 0 ? " r" : "";
      html +=
        '<i class="' + cls + '" style="left:' + left.toFixed(1) + "%;background:" + color +
        ";animation-delay:" + delay.toFixed(2) + "s;animation-duration:" + dur.toFixed(2) + 's"></i>';
    }
    box.innerHTML = html;
  }


  var MILLION = 1000;
  var GAME_BEST_KEY = "schnecke-coin-catcher-best";
  var SOUND_KEY = "schnecke-city-sound";

  function stageFor(ins) {
    if (ins >= 1000) return "Ins-Millionär";
    if (ins >= 600) return "Penthouse";
    if (ins >= 400) return "Tower-Suite";
    if (ins >= 250) return "Stadtwohnung";
    if (ins >= 100) return "Dachkammer";
    return "Straßenkante";
  }

  function storyFor(p, list) {
    var stage = stageFor(p.ins);
    var lead = isFirst(p, list);
    var bits = {
      Anni: "Anni schleimt sich mit Brille und Zöpfen durch die Gassen. Jedes In ist ein Stein in ihrer Treppe nach oben.",
      HeikoWi: "HeikoWi hat die Kappe festgezogen und schaut vom hohen Turm über die ganze Meile. Die Krone ist zum Greifen nah.",
      Dave: "Dave nimmt die Skyline mit Bart und Durchblick. Cool bleiben, weiter schleimen, die Suite wartet.",
      JoeSp: "JoeSp macht Druck an der Silberlinie – kurz, knackig, und immer mit Blick aufs Penthouse.",
      "PascalePätz": "Pascale hat den Ponytail fest und eine lila Spur durchs Viertel gezogen. Die nächste Etage ist schon beleuchtet.",
      FelixHau: "Felix haut rein, Irokesenschnitt im Wind. Vom Bürgersteig bis zur Börse ist es nur ein kühner Satz."
    };
    var base = bits[p.name] || (p.name + " ist in der Ins-Metropole unterwegs.");
    return base + " Grade: " + stage + ", " + p.ins + " Ins." + (lead ? " Gerade führt " + p.name + " das Feld an." : "");
  }

  function badgesFor(p, list, place) {
    var out = [];
    if (p.ins >= 1) out.push("Erste Spur");
    if (p.ins >= 50) out.push("Schleimspur");
    if (p.ins >= 100) out.push("Dreistellig");
    if (p.ins >= 200) out.push("Aufsteiger");
    if (p.ins >= 400) out.push("Skyline");
    if (p.ins >= 600) out.push("Penthouse");
    if (p.ins >= MILLION) out.push("Ins-Millionär");
    if (place && place <= 3) out.push("Podium");
    if (isFirst(p, list)) out.push("Kronenträger");
    return out;
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
    toast._t = setTimeout(function () { el.hidden = true; }, 2600);
  }

  var cityAudio = {
    ctx: null,
    gain: null,
    timer: null,
    on: false,
    ensure: function () {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      if (!this.ctx) this.ctx = new AC();
      if (this.ctx.state === "suspended") this.ctx.resume();
      if (!this.gain) {
        this.gain = this.ctx.createGain();
        this.gain.gain.value = 0.035;
        this.gain.connect(this.ctx.destination);
      }
      return this.ctx;
    },
    drone: function () {
      if (!this.on || !this.ctx) return;
      var ctx = this.ctx;
      var osc = ctx.createOscillator();
      var g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 78 + Math.random() * 18;
      g.gain.value = 0.0001;
      osc.connect(g);
      g.connect(this.gain);
      var now = ctx.currentTime;
      g.gain.exponentialRampToValueAtTime(0.5, now + 0.4);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);
      osc.start(now);
      osc.stop(now + 3.3);
    },
    ping: function (freq) {
      if (!this.on || !this.ctx) return;
      var ctx = this.ctx;
      var osc = ctx.createOscillator();
      var g = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq || 520;
      g.gain.value = 0.0001;
      osc.connect(g);
      g.connect(this.gain);
      var now = ctx.currentTime;
      g.gain.exponentialRampToValueAtTime(0.8, now + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.4);
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

  function speakLine(text) {
    if (!window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = "de-DE";
      u.rate = 1.02;
      u.pitch = 1.05;
      window.speechSynthesis.speak(u);
    } catch (err) {}
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

  function renderCity(people, list) {
    var root = document.getElementById("cityParallax");
    if (!root) return;
    var max = maxIns(list) || 1;
    var towers = people.map(function (p, i) {
      var h = 56 + Math.round((p.ins / max) * 150);
      var lead = isFirst(p, list);
      var delay = (0.08 * i).toFixed(2);
      return (
        '<button type="button" class="tower' + (lead ? " is-lead" : "") + '" data-name="' + esc(p.name) + '" style="height:' + h + "px;background:linear-gradient(180deg," + esc(p.color) + " 0%,#1a1020 140%);animation-delay:" + delay + 's" aria-label="' + esc(p.name) + ", " + p.ins + ' Ins">' +
        (lead ? '<span class="antenna" aria-hidden="true"></span>' : "") +
        '<span class="tag">#' + p.bib + " " + esc(p.name) + "</span>" +
        '<span class="roof"></span><span class="windows"></span>' +
        '<span class="fig crawl">' + snailSvg(p, { crown: lead, bib: p.bib, delay: i * 0.1 }) + "</span>" +
        "</button>"
      );
    }).join("");

    root.innerHTML =
      '<div class="city-layer far" data-depth="6"><div class="city-skyline"></div></div>' +
      '<div class="city-layer mid" data-depth="12"><div class="city-haze"></div></div>' +
      '<div class="city-layer street" data-depth="22">' +
      '<div class="towers" id="cityTowers">' + towers + "</div>" +
      '<span class="lamp l1"></span><span class="lamp l2"></span><span class="lamp l3"></span>' +
      '<div class="street-base"></div>' +
      '<button type="button" class="beggar" id="beggar" aria-label="Becher des Bettlers – Münze werfen">' + beggarSvg() + "</button>" +
      '<div class="taxi" id="cityTaxi" aria-hidden="true"></div>' +
      '<span class="pigeon p1" aria-hidden="true"></span><span class="pigeon p2" aria-hidden="true"></span>' +
      '<button type="button" class="gold-coin" id="goldCoin" aria-label="Goldmünze"></button>' +
      "</div>" +
      '<div class="city-layer near" data-depth="32"></div>' +
      '<div id="cityFx"></div>';
  }

  function renderStock(list) {
    var el = document.getElementById("stockTicker");
    if (!el) return;
    var rows = ranked(list);
    var bits = ["INS-BÖRSE LIVE · PEERWISE METROPOLE"];
    rows.forEach(function (r) {
      bits.push(r.person.name + " " + r.person.ins + " INS · Platz " + r.place);
    });
    bits.push("Topf " + sum(list) + " INS");
    bits.push("Drei Kapitel: 28.11. Ganz unten · 29.11. Der Aufstieg · 30.11. Die Millionärsgala");
    bits.push("Wer wird zuerst Ins-Millionär?");
    var line = bits.join("   ·   ");
    el.innerHTML = "<span>" + esc(line) + "   ·   </span><span>" + esc(line) + "   ·   </span>";
  }

  function renderPrognose(list) {
    var el = document.getElementById("prognose");
    if (!el || !list.length) return;
    var rows = ranked(list);
    var first = rows[0].person;
    var second = rows[1] ? rows[1].person : null;
    var need = Math.max(0, MILLION - first.ins);
    var pct = Math.min(100, Math.round((first.ins / MILLION) * 100));
    var msg;
    if (first.ins >= MILLION) {
      msg = first.name + " ist bereits Ins-Millionär. Die Skyline gehört " + first.name + "!";
    } else {
      msg = "Bei aktuellem Stand wird <b>" + esc(first.name) + "</b> zuerst Ins-Millionär (Ziel: " + MILLION + " Ins). Noch " + need + " Ins — Finale bei der Millionärsgala am 30.11.";
      if (second) {
        msg += " Vorsprung vor " + esc(second.name) + ": " + (first.ins - second.ins) + " Ins.";
      }
    }
    el.innerHTML =
      "<h3>PROGNOSE</h3><p>" + msg + "</p>" +
      '<div class="prog-track"><div class="prog-fill" style="width:' + pct + '%"></div></div>' +
      '<p class="sub">' + esc(first.name) + " steht bei " + first.ins + " von " + MILLION + " Ins (" + pct + "%).</p>";
  }

  function closeProfile() {
    var layer = document.getElementById("profileLayer");
    if (layer) layer.hidden = true;
    if (window.speechSynthesis) try { window.speechSynthesis.cancel(); } catch (e) {}
  }

  function openProfile(p, list) {
    var layer = document.getElementById("profileLayer");
    var card = document.getElementById("profileCard");
    if (!layer || !card) return;
    var place = 0;
    ranked(list).some(function (r) {
      if (r.person.name === p.name) { place = r.place; return true; }
      return false;
    });
    var badges = badgesFor(p, list, place).map(function (b, i) {
      return '<span class="badge" style="animation-delay:' + (i * 0.06) + 's">' + esc(b) + "</span>";
    }).join("");
    var line = quipFor(p, list);
    card.innerHTML =
      '<div class="top"><div class="avatar crawl">' + snailSvg(p, { crown: isFirst(p, list), bib: p.bib }) + "</div>" +
      "<div><h3 id=\"profileName\">" + esc(p.name) + " #" + p.bib + "</h3>" +
      '<span class="stage">' + esc(stageFor(p.ins)) + " · " + p.ins + " INS</span></div></div>" +
      '<p class="story">' + esc(storyFor(p, list)) + "</p>" +
      (badges ? '<div class="badges">' + badges + "</div>" : "") +
      '<div class="profile-actions">' +
      '<button type="button" class="metro-btn game" id="voiceBtn">Stimme anhören</button>' +
      '<button type="button" class="metro-btn" id="profileClose">Schließen</button></div>';
    layer.hidden = false;
    var voice = document.getElementById("voiceBtn");
    if (voice) voice.addEventListener("click", function () { speakLine(p.name + ". " + line + " " + storyFor(p, list)); cityAudio.ping(660); });
    var close = document.getElementById("profileClose");
    if (close) close.addEventListener("click", closeProfile);
    layer.onclick = function (ev) { if (ev.target === layer) closeProfile(); };
  }

  function throwCoin(btn) {
    var coin = document.createElement("span");
    coin.className = "toss-coin";
    btn.appendChild(coin);
    setTimeout(function () { if (coin.parentNode) coin.parentNode.removeChild(coin); }, 750);
    cityAudio.ping(880);
    toast("Klingeling – eine Münze im Becher. (Nur Spaß, keine Ins!)");
  }

  function moneyRain() {
    var box = document.getElementById("moneyRain");
    if (!box || reducedMotion()) { toast("Münzregen!"); return; }
    var html = "";
    for (var i = 0; i < 36; i++) {
      var left = (3 + i * 2.7) % 100;
      html += '<i style="left:' + left.toFixed(1) + "%;animation-delay:" + (i * 0.05).toFixed(2) + 's"></i>';
    }
    box.innerHTML = html;
    toast("Münzregen über der Metropole!");
    cityAudio.ping(1200);
    setTimeout(function () { box.innerHTML = ""; }, 3200);
  }

  function fireworksOverLead() {
    var fx = document.getElementById("cityFx");
    var lead = document.querySelector(".tower.is-lead");
    if (!fx || !lead || reducedMotion()) return;
    var stage = document.getElementById("cityStage");
    var sr = stage.getBoundingClientRect();
    var lr = lead.getBoundingClientRect();
    var x = lr.left + lr.width / 2 - sr.left;
    var colors = ["#ffe44d", "#ff4fd8", "#5ce1ff", "#34d399", "#fff"];
    for (var i = 0; i < 5; i++) {
      var s = document.createElement("span");
      s.className = "fw";
      s.style.left = (x - 20 + i * 10) + "px";
      s.style.top = (12 + (i % 3) * 10) + "px";
      s.style.color = colors[i % colors.length];
      fx.appendChild(s);
      (function (el) { setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 1200); })(s);
    }
    toast("Feuerwerk über dem Penthouse!");
    cityAudio.ping(980);
  }

  function bindParallax() {
    var stage = document.getElementById("cityStage");
    var par = document.getElementById("cityParallax");
    if (!stage || !par || reducedMotion()) return;
    var cx = 0, cy = 0, tx = 0, ty = 0, raf = 0;
    function loop() {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      par.style.transform = "rotateY(" + (cx * 6) + "deg) rotateX(" + (-cy * 4) + "deg) translate(" + (cx * 8) + "px," + (cy * 6) + "px)";
      var layers = par.querySelectorAll("[data-depth]");
      for (var i = 0; i < layers.length; i++) {
        var d = Number(layers[i].getAttribute("data-depth")) || 10;
        layers[i].style.transform = "translate(" + (-cx * d) + "px," + (-cy * (d * 0.4)) + "px)";
      }
      raf = requestAnimationFrame(loop);
    }
    function setFromPoint(x, y) {
      var r = stage.getBoundingClientRect();
      tx = ((x - r.left) / r.width - 0.5) * 2;
      ty = ((y - r.top) / r.height - 0.5) * 2;
    }
    stage.addEventListener("mousemove", function (e) { setFromPoint(e.clientX, e.clientY); });
    stage.addEventListener("mouseleave", function () { tx = 0; ty = 0; });
    stage.addEventListener("touchmove", function (e) {
      if (e.touches[0]) setFromPoint(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    if (!window.__cityParallaxOn) {
      window.__cityParallaxOn = true;
      raf = requestAnimationFrame(loop);
    }
    var tiltBtn = document.getElementById("tiltBtn");
    if (tiltBtn && window.DeviceOrientationEvent) {
      tiltBtn.hidden = false;
      tiltBtn.onclick = function () {
        function hook() {
          window.addEventListener("deviceorientation", function (ev) {
            var g = ev.gamma || 0, b = ev.beta || 0;
            tx = Math.max(-1, Math.min(1, g / 25));
            ty = Math.max(-1, Math.min(1, (b - 45) / 35));
          });
          tiltBtn.textContent = "Neigung aktiv";
          toast("Neigung an – kipp das Handy, die Stadt kippt mit.");
        }
        if (typeof DeviceOrientationEvent.requestPermission === "function") {
          DeviceOrientationEvent.requestPermission().then(function (s) { if (s === "granted") hook(); });
        } else hook();
      };
    }
  }

  function bindEasterEggs() {
    var beggar = document.getElementById("beggar");
    if (beggar) beggar.addEventListener("click", function () { throwCoin(beggar); });
    var gold = document.getElementById("goldCoin");
    if (gold) gold.addEventListener("click", function () {
      gold.classList.add("found");
      toast("Goldmünze gefunden! Du kennst die Metropole.");
      cityAudio.ping(1320);
      moneyRain();
    });
    var seq = [];
    var konami = "ArrowUp,ArrowUp,ArrowDown,ArrowDown,ArrowLeft,ArrowRight,ArrowLeft,ArrowRight,b,a";
    document.addEventListener("keydown", function (e) {
      seq.push(e.key);
      if (seq.length > 10) seq.shift();
      if (seq.join(",") === konami) moneyRain();
    });
    var taps = 0, tapTimer;
    var title = document.getElementById("metroTitle");
    if (title) {
      title.style.cursor = "pointer";
      title.addEventListener("click", function () {
        taps += 1;
        clearTimeout(tapTimer);
        if (taps >= 5) { taps = 0; moneyRain(); }
        else tapTimer = setTimeout(function () { taps = 0; }, 1400);
      });
    }
  }

  function liveEvents() {
    if (reducedMotion()) return;
    var lines = [
      function () { toast("Ein Taxi rollt durch die Meile."); },
      function () { toast("Tauben streiten sich um eine Schleimspur."); },
      function () { fireworksOverLead(); },
      function () { toast("Der Börsenticker zuckt – Ins sind heiß!"); }
    ];
    setInterval(function () {
      if (document.hidden) return;
      var ch = currentChapter();
      if (ch && ch.n === 3 && Math.random() < 0.45) fireworksOverLead();
      else lines[Math.floor(Math.random() * lines.length)]();
    }, 11000);
  }

  function bootGame() {
    var layer = document.getElementById("gameLayer");
    var canvas = document.getElementById("gameCanvas");
    var startBtn = document.getElementById("gameStart");
    var closeBtn = document.getElementById("gameClose");
    var openBtn = document.getElementById("gameOpen");
    var status = document.getElementById("gameStatus");
    var bestEl = document.getElementById("gameBest");
    if (!layer || !canvas) return;
    var ctx = canvas.getContext("2d");
    var best = 0;
    try { best = Number(localStorage.getItem(GAME_BEST_KEY)) || 0; } catch (e) {}
    if (bestEl) bestEl.textContent = String(best);
    var running = false, score = 0, left = 20, potX = 0.5, coins = [], raf, tick;

    function resize() {
      var w = canvas.clientWidth || 360;
      var h = Math.round(w * 0.78);
      canvas.width = w;
      canvas.height = h;
    }
    function spawn() {
      coins.push({ x: 0.08 + Math.random() * 0.84, y: -0.05, s: 0.008 + Math.random() * 0.01, gold: Math.random() < 0.12 });
    }
    function draw() {
      var w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      var grd = ctx.createLinearGradient(0, 0, 0, h);
      grd.addColorStop(0, "#4ec7ff");
      grd.addColorStop(1, "#3d1a9c");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);
      var pw = w * 0.18, ph = h * 0.09;
      var px = potX * w - pw / 2, py = h - ph - 8;
      ctx.fillStyle = "#6b2d12";
      ctx.strokeStyle = "#1a1020";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + pw, py);
      ctx.lineTo(px + pw - 8, py + ph);
      ctx.lineTo(px + 8, py + ph);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "#ffd24a";
      ctx.beginPath();
      ctx.moveTo(px - 4, py);
      ctx.lineTo(px + pw + 4, py);
      ctx.stroke();
      coins.forEach(function (c) {
        ctx.beginPath();
        ctx.fillStyle = c.gold ? "#fff6c2" : "#ffd24a";
        ctx.arc(c.x * w, c.y * h, c.gold ? 9 : 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#8a5a10";
        ctx.stroke();
      });
      ctx.fillStyle = "#ffe44d";
      ctx.font = "700 16px Arial";
      ctx.fillText("Münzen: " + score, 10, 22);
    }
    function step() {
      if (!running) return;
      if (Math.random() < 0.08) spawn();
      var pw = 0.18;
      coins = coins.filter(function (c) {
        c.y += c.s;
        if (c.y > 0.88 && c.y < 0.98 && Math.abs(c.x - potX) < pw / 2 + 0.02) {
          score += c.gold ? 5 : 1;
          cityAudio.ping(c.gold ? 1200 : 800);
          return false;
        }
        return c.y < 1.1;
      });
      draw();
      raf = requestAnimationFrame(step);
    }
    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      if (tick) clearInterval(tick);
      if (score > best) {
        best = score;
        try { localStorage.setItem(GAME_BEST_KEY, String(best)); } catch (e) {}
        if (bestEl) bestEl.textContent = String(best);
        if (status) status.textContent = "Neue Bestleistung: " + best + "!";
      } else if (status) {
        status.textContent = "Zeit um! Diesmal " + score + " Münzen. Bestleistung: " + best + ".";
      }
      if (startBtn) startBtn.disabled = false;
    }
    function start() {
      score = 0; left = 20; coins = []; potX = 0.5; running = true;
      if (startBtn) startBtn.disabled = true;
      if (status) status.textContent = "Noch 20 Sekunden – nur zum Spaß!";
      resize();
      if (tick) clearInterval(tick);
      tick = setInterval(function () {
        left -= 1;
        if (status && running) status.textContent = "Noch " + left + " Sekunden – nur zum Spaß!";
        if (left <= 0) stop();
      }, 1000);
      step();
    }
    function move(clientX) {
      var r = canvas.getBoundingClientRect();
      potX = Math.max(0.1, Math.min(0.9, (clientX - r.left) / r.width));
    }
    canvas.addEventListener("mousemove", function (e) { move(e.clientX); });
    canvas.addEventListener("touchmove", function (e) {
      if (e.touches[0]) { move(e.touches[0].clientX); e.preventDefault(); }
    }, { passive: false });
    if (openBtn) openBtn.addEventListener("click", function () {
      layer.hidden = false;
      resize();
      draw();
      if (status) status.textContent = "20 Sekunden – fang die Münzen mit dem Topf!";
    });
    if (startBtn) startBtn.addEventListener("click", start);
    if (closeBtn) closeBtn.addEventListener("click", function () { stop(); layer.hidden = true; });
    layer.addEventListener("click", function (e) { if (e.target === layer) { stop(); layer.hidden = true; } });
  }

  function bootCity(list) {
    if (!document.getElementById("metropole")) return;
    applyDayNight();
    setInterval(applyDayNight, 60000);
    renderCity(list, list);
    renderStock(list);
    renderPrognose(list);
    bindParallax();
    bindEasterEggs();
    liveEvents();
    bootGame();

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
      if (want) {
        /* wait for a gesture before actually starting */
        var once = function () { setSound(true); document.removeEventListener("click", once); };
        document.addEventListener("click", once);
        soundBtn.textContent = "Ton bereit";
      }
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
  }

  var people = withPerson(PEOPLE);
  var waiting = people.length === 0;

  if (document.body) {
    document.body.classList.toggle("is-waiting", waiting);
  }

  renderClock();
  setInterval(renderClock, 1000);
  renderTicker(people);
  renderLegend();
  renderConfetti();
  renderCoinPot(people);
  bootCity(people);
  show("emptyState", waiting);
  show("liveRank", !waiting);
  show("podiumWrap", !waiting);

  var note = document.getElementById("sackNote");
  if (note) {
    note.textContent = waiting
      ? ""
      : "Drei Tage, 28. bis 30.11.2026: Ganz unten, Der Aufstieg, Die Millionärsgala. Wer die meisten Ins holt, liegt an der Ziellinie und gewinnt.";
  }

  if (!waiting) {
    renderLive(people);
    renderTracks(people);
    renderPodium(people);
  }
})();
