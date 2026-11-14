/* PEERWISE · Schneckenrennen
   Ein Tag: Sonntag, 15.11.2026.
   Eine gemeinsame Starterliste, ein Rennen, eine Rangliste.

   Namen später eintragen: unten in PEOPLE eine Zeile pro Person
   in die eckigen Klammern setzen.
   Vorlage (einfach kopieren, Namen und Farbe anpassen):
     { name: 'NameHier', gender: 'f', look: 'bun', color: '#ffd24a', hair: '#3a2418', mood: 1, ins: 0 },
   gender: f oder m. look: pigtails, bun, ponytail, bob, cap, short, beard.
   glasses: true setzt eine Rennbrille. color ist die Hausfarbe. ins startet bei 0.
   Die Eintragen-Seite liest diese Liste automatisch. */
(function () {
  var EVENT = new Date(2026, 10, 15);

  var PEOPLE = [
    { name: "Anni", gender: "f", look: "pigtails", glasses: true, color: "#ff6b9d", hair: "#5c3a1e", mood: 1, ins: 0 }
  ];

  function withPerson(list) {
    return list.map(function (p) {
      return {
        name: p.name,
        gender: p.gender,
        look: p.look,
        glasses: !!p.glasses,
        beard: !!p.beard || p.look === "beard",
        color: p.color,
        hair: p.hair,
        mood: p.mood,
        ins: Number(p.ins) || 0
      };
    });
  }

  function eventDay() {
    var d = new Date(EVENT.getTime());
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function dayStatus() {
    var now = new Date();
    now.setHours(0, 0, 0, 0);
    var day = eventDay();
    if (now.getTime() < day.getTime()) return "soon";
    if (now.getTime() > day.getTime()) return "done";
    return "today";
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
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
      cap + crownSvg +
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

  function renderDay() {
    var el = document.getElementById("dayBar");
    if (!el) return;
    var status = dayStatus();
    var label =
      status === "soon" ? "Startet am Sonntag, 15.11.2026" :
      status === "today" ? "Heute ist Renntag · Sonntag, 15.11." :
      "Rennen beendet · 15.11.2026";
    var pct = status === "soon" ? 8 : status === "today" ? 55 : 100;
    el.innerHTML =
      "<p>" + label + "</p>" +
      '<div class="month-track"><div class="month-fill" style="width:' + pct + '%"></div></div>';
  }

  function renderLegend() {
    var run = document.getElementById("legendRun");
    var lead = document.getElementById("legendLead");
    var trail = document.getElementById("legendTrail");
    var sample = { color: "#ff4fd8", glasses: true };
    var sampleLead = { color: "#ffd24a", glasses: false, mood: 2 };
    var sampleTrail = { color: "#5ce1ff", glasses: true };
    if (run) {
      run.innerHTML =
        '<div class="mini"><div class="crawl">' + snailSvg(sample, {}) + "</div></div>" +
        "<div><em>UNTERWEGS</em>Mit jedem In kriecht die Schnecke weiter Richtung Ziel.</div>";
    }
    if (lead) {
      lead.innerHTML =
        '<div class="mini"><div class="crawl">' + snailSvg(sampleLead, { crown: true }) + "</div></div>" +
        "<div><em>VORNE</em>Wer die meisten Ins hat, trägt die Krone und gewinnt.</div>";
    }
    if (trail) {
      trail.innerHTML =
        '<div class="mini"><div class="crawl">' + snailSvg(sampleTrail, {}) + "</div></div>" +
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
      var gap = max > 0 && p.ins < max ? "−" + (max - p.ins) + " auf Platz 1" : (first ? "führt" : "gleichauf");
      html +=
        '<div class="rank-row' + (first ? " is-first" : "") + '">' +
        '<span class="place">' + row.place + ".</span>" +
        '<span class="who"><i class="dot" style="background:' + esc(p.color) + '"></i>' + esc(p.name) + "</span>" +
        '<span class="pts">' + p.ins + ' INS<span class="gap">' + gap + "</span></span>" +
        "</div>";
    });
    el.innerHTML = html + "</article>";
  }

  function trackBlock(list) {
    var max = maxIns(list);
    var rows = list.map(function (p, i) {
      var first = isFirst(p, list);
      var pct = max ? Math.round((p.ins / max) * 68) : 2;
      var trail = Math.max(8, pct + 6);
      var cls = first ? " is-first" : "";
      return (
        '<div class="runner' + cls + '">' +
        '<div class="runner-name"><i class="dot" style="background:' + esc(p.color) + '"></i>' + esc(p.name) + "</div>" +
        '<div class="runner-track" style="--snail-color:' + esc(p.color) + ";--trail:" + trail + '%">' +
        '<span class="slime-trail" aria-hidden="true"></span>' +
        '<span class="goal-flag" aria-hidden="true"></span>' +
        '<div class="runner-mover crawl" style="left:' + pct + "%;animation-delay:" + (i * 0.12) + 's">' +
        snailSvg(p, { crown: first, delay: i * 0.12 }) +
        "</div></div>" +
        '<div class="runner-meta"><b>' + p.ins + "</b><span>INS</span></div>" +
        "</div>"
      );
    }).join("");
    return (
      '<section class="track-block">' +
      '<h2 class="track-label">RENNSTRECKE</h2>' +
      '<div class="lane-ruler" aria-hidden="true"><span class="flag">START</span><span class="ruler-coins"></span><span class="goal">ZIEL</span></div>' +
      '<div class="lane">' + (rows || '<p class="sack-note">Noch keine Schnecke am Start.</p>') + "</div></section>"
    );
  }

  function renderTable(list) {
    var head = document.getElementById("rankHead");
    var body = document.getElementById("rankBody");
    if (head) {
      head.innerHTML = "<tr><th>Platz</th><th>Name</th><th class=\"total\">Ins</th><th>Abstand</th></tr>";
    }
    if (!body) return;
    var rows = ranked(list);
    var max = maxIns(list);
    var html = "";
    if (!rows.length) {
      html += '<tr><td colspan="4">Noch keine Starter.</td></tr>';
    }
    rows.forEach(function (row) {
      var p = row.person;
      var first = isFirst(p, list);
      var gap = max > 0 && p.ins < max ? (max - p.ins) : (p.ins === 0 ? "—" : (max > minIns(list) ? "führt" : "gleichauf"));
      var insCell = p.ins === 0 ? '<span class="zero">0</span>' : String(p.ins);
      html +=
        '<tr class="' + (first ? "is-first" : "") + '"><td>' + row.place + ".</td>" +
        '<td><span class="who"><i class="dot" style="background:' + esc(p.color) + '"></i>' + esc(p.name) + "</span></td>" +
        '<td class="total">' + insCell + "</td>" +
        "<td>" + gap + "</td></tr>";
    });
    body.innerHTML = html;
  }

  var people = withPerson(PEOPLE);
  var waiting = people.length === 0;

  if (document.body) {
    document.body.classList.toggle("is-waiting", waiting);
  }

  renderDay();
  renderLegend();
  show("emptyState", waiting);
  show("liveRank", !waiting);
  show("tracks", !waiting);
  show("rankWrap", !waiting);

  var note = document.getElementById("sackNote");
  if (note) {
    note.textContent = waiting
      ? ""
      : "Nur dieser eine Sonntag, der 15.11.2026. Wer die meisten Ins holt, liegt an der Ziellinie und gewinnt.";
  }

  if (!waiting) {
    renderLive(people);
    var tracks = document.getElementById("tracks");
    if (tracks) tracks.innerHTML = trackBlock(people);
    renderTable(people);
  }
})();
