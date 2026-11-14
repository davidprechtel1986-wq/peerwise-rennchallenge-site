/* PEERWISE · Schneckenrennen
   Ein Tag: Sonntag, 15.11.2026. Jede Person startet bei 0 Ins.
   wl = mit Watchlist, normal = ohne Watchlist. */
(function () {
  var EVENT = new Date(2026, 10, 15);

  var WL = [
    { name: "BiancaP", gender: "f", look: "pigtails", color: "#fbbf24", hair: "#6b3a1f", mood: 0, ins: 0 },
    { name: "MelanieTr", gender: "f", look: "bun", color: "#f472b6", hair: "#3d2314", mood: 1, ins: 0 },
    { name: "HeikoWi", gender: "m", look: "cap", beard: true, color: "#fb7185", hair: "#333333", mood: 2, ins: 0 },
    { name: "MatthiasKre", gender: "m", look: "short", color: "#38bdf8", hair: "#4a3728", mood: 0, ins: 0 },
    { name: "MarkusGru", gender: "m", look: "cap", color: "#a78bfa", hair: "#2a2a2a", mood: 1, ins: 0 },
    { name: "MarcKö", gender: "m", look: "short", glasses: true, color: "#4ade80", hair: "#1a1a1a", mood: 2, ins: 0 },
    { name: "ManuelaSpe", gender: "f", look: "ponytail", color: "#ff4fd8", hair: "#3a2418", mood: 0, ins: 0 },
    { name: "SimoneSch", gender: "f", look: "bun", color: "#ff7a3c", hair: "#2c1810", mood: 2, ins: 0 },
    { name: "JuliaBar", gender: "f", look: "pigtails", color: "#c9a0ff", hair: "#4a2c1a", mood: 0, ins: 0 },
    { name: "NinaBra", gender: "f", look: "ponytail", color: "#ff5a8a", hair: "#1c1c1c", mood: 1, ins: 0 },
    { name: "ErwinGrä", gender: "m", look: "beard", glasses: true, color: "#ffd24a", hair: "#555555", mood: 2, ins: 0 },
    { name: "DeniseKi", gender: "f", look: "bob", color: "#7dffb3", hair: "#6b4423", mood: 0, ins: 0 },
    { name: "Martin", gender: "m", look: "cap", color: "#6ecbff", hair: "#3a2418", mood: 1, ins: 0 },
    { name: "TimPet", gender: "m", look: "short", color: "#fb923c", hair: "#5c3a1e", mood: 2, ins: 0 },
    { name: "SabrinaKlie", gender: "f", look: "pigtails", color: "#e879f9", hair: "#2c1810", mood: 0, ins: 0 },
    { name: "MarkusWeg", gender: "m", look: "short", color: "#14b8a6", hair: "#3a2a1a", mood: 0, ins: 0 },
    { name: "AnettePal", gender: "f", look: "bun", color: "#f97316", hair: "#4a2c1a", mood: 1, ins: 0 }
  ];

  var NORMAL = [
    { name: "DaveP", gender: "m", look: "beard", glasses: true, color: "#facc15", hair: "#5c3a1e", mood: 1, ins: 0 },
    { name: "WolfgangKie", gender: "m", look: "cap", color: "#22d3ee", hair: "#2c2c2c", mood: 0, ins: 0 },
    { name: "AntjeMat", gender: "f", look: "bun", color: "#d8b4fe", hair: "#4a2c1a", mood: 1, ins: 0 },
    { name: "RebeccaKö", gender: "f", look: "ponytail", color: "#f43f5e", hair: "#3a2418", mood: 2, ins: 0 },
    { name: "MonikaKos", gender: "f", look: "bob", color: "#5ce1ff", hair: "#5c3a1e", mood: 1, ins: 0 },
    { name: "HeikeErl", gender: "f", look: "bun", color: "#f9a8d4", hair: "#4a2c1a", mood: 1, ins: 0 }
  ];

  function withLeague(list, league) {
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
        league: league,
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

  function snailSvg(p, opt) {
    opt = opt || {};
    var crown = !!opt.crown;
    var color = p.color || "#ff4fd8";
    var foot = "#f6e7b8";
    var belly = "#fff6d8";
    var stroke = "#1a1020";
    var delay = opt.delay != null ? opt.delay : 0;

    var glasses = p.glasses
      ? '<circle cx="128" cy="30" r="6.2" fill="none" stroke="' + stroke + '" stroke-width="1.5"/>' +
        '<circle cx="146" cy="28" r="6.2" fill="none" stroke="' + stroke + '" stroke-width="1.5"/>' +
        '<path d="M134 30 H140" stroke="' + stroke + '" stroke-width="1.3"/>'
      : "";

    var cap = p.look === "cap"
      ? '<path d="M68 18 Q86 2 108 16 L112 22 L66 24 Z" fill="#2a2158" stroke="' + stroke + '" stroke-width="1.5"/>' +
        '<ellipse cx="90" cy="22" rx="24" ry="4.5" fill="#3a2d78" stroke="' + stroke + '" stroke-width="1.2"/>'
      : "";

    var crownSvg = crown
      ? '<g class="snail-crown">' +
        '<path d="M74 10 L80 -6 L88 8 L96 -10 L104 8 L112 -6 L118 10 Z" fill="#ffd24a" stroke="#8a5a10" stroke-width="1.4"/>' +
        '<rect x="74" y="8" width="44" height="6" rx="1.5" fill="#ffd24a" stroke="#8a5a10"/>' +
        '<circle cx="80" cy="-2" r="2.1" fill="#ff4fd8"/>' +
        '<circle cx="96" cy="-6" r="2.1" fill="#5ce1ff"/>' +
        '<circle cx="112" cy="-2" r="2.1" fill="#ff4fd8"/>' +
        "</g>"
      : "";

    return (
      '<svg viewBox="-8 -16 170 120" aria-hidden="true">' +
      '<ellipse cx="70" cy="96" rx="48" ry="7" fill="rgba(0,0,0,0.28)"/>' +
      '<g class="snail-body" style="animation-delay:' + delay + 's">' +
      '<path d="M10 86 Q6 68 28 66 Q58 62 86 66 Q112 70 128 62 Q138 56 142 66 Q146 82 126 90 Q78 102 28 94 Q14 90 10 86Z" fill="' + foot + '" stroke="' + stroke + '" stroke-width="2.2"/>' +
      '<path d="M28 78 Q70 70 118 78 Q90 86 70 86 Q48 86 28 78Z" fill="' + belly + '" opacity="0.9"/>' +
      "</g>" +
      '<g class="snail-shell" style="animation-delay:' + delay + 's">' +
      '<ellipse cx="86" cy="48" rx="38" ry="36" fill="' + color + '" stroke="' + stroke + '" stroke-width="2.4"/>' +
      '<path d="M86 70 C70 68 60 56 62 44 C66 28 86 24 96 32 C104 40 100 54 86 54 C76 54 72 46 76 40 C80 34 90 36 92 42" fill="none" stroke="rgba(0,0,0,0.32)" stroke-width="5" stroke-linecap="round"/>' +
      '<path d="M72 30 Q86 18 104 28" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="3" stroke-linecap="round"/>' +
      cap +
      crownSvg +
      "</g>" +
      '<g class="snail-stalk" style="animation-delay:' + delay + 's">' +
      '<path d="M128 62 Q124 40 128 24" fill="none" stroke="' + foot + '" stroke-width="5.5" stroke-linecap="round"/>' +
      '<circle cx="128" cy="20" r="7.2" fill="' + foot + '" stroke="' + stroke + '" stroke-width="1.7"/>' +
      '<circle cx="128" cy="20" r="2.4" fill="' + stroke + '"/>' +
      '<circle cx="130" cy="18.2" r="1" fill="#fff"/>' +
      "</g>" +
      '<g class="snail-stalk alt" style="animation-delay:' + (delay + 0.18) + 's">' +
      '<path d="M136 64 Q144 42 148 24" fill="none" stroke="' + foot + '" stroke-width="5.5" stroke-linecap="round"/>' +
      '<circle cx="148" cy="20" r="7.2" fill="' + foot + '" stroke="' + stroke + '" stroke-width="1.7"/>' +
      '<circle cx="148" cy="20" r="2.4" fill="' + stroke + '"/>' +
      '<circle cx="150" cy="18.2" r="1" fill="#fff"/>' +
      "</g>" +
      glasses +
      '<path d="M132 72 Q138 78 146 72" fill="none" stroke="' + stroke + '" stroke-width="1.8" stroke-linecap="round"/>' +
      "</svg>"
    );
  }

  function heroSvg() {
    return (
      '<svg viewBox="0 0 220 230" aria-hidden="true">' +
      '<ellipse cx="110" cy="214" rx="64" ry="10" fill="rgba(0,0,0,0.35)"/>' +
      '<path d="M28 180 Q24 150 58 148 Q100 144 140 150 Q180 156 196 148 Q208 142 210 158 Q212 180 184 192 Q110 210 52 196 Q32 190 28 180Z" fill="#f6e7b8" stroke="#1a1020" stroke-width="3"/>' +
      '<g class="hero-shell">' +
      '<ellipse cx="108" cy="108" rx="72" ry="70" fill="#ffd24a" stroke="#1a1020" stroke-width="3.2"/>' +
      '<path d="M108 154 C76 150 58 126 62 100 C70 68 108 60 126 76 C142 92 134 122 108 122 C88 122 82 104 90 92 C98 80 118 84 122 96" fill="none" stroke="rgba(0,0,0,0.28)" stroke-width="8" stroke-linecap="round"/>' +
      '<path d="M80 74 Q108 50 140 72" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="5" stroke-linecap="round"/>' +
      "</g>" +
      '<path d="M168 150 Q176 112 186 84" fill="none" stroke="#f6e7b8" stroke-width="9" stroke-linecap="round"/>' +
      '<circle cx="186" cy="76" r="11" fill="#f6e7b8" stroke="#1a1020" stroke-width="2"/>' +
      '<circle cx="186" cy="76" r="3.4" fill="#1a1020"/>' +
      '<path d="M176 154 Q188 118 204 86" fill="none" stroke="#f6e7b8" stroke-width="9" stroke-linecap="round"/>' +
      '<circle cx="204" cy="78" r="11" fill="#f6e7b8" stroke="#1a1020" stroke-width="2"/>' +
      '<circle cx="204" cy="78" r="3.4" fill="#1a1020"/>' +
      "</svg>"
    );
  }

  function renderHero(total) {
    var el = document.getElementById("insHero");
    if (!el) return;
    el.innerHTML =
      '<div class="ins-hero' + (total > 0 ? " is-live" : "") + '">' +
      heroSvg() +
      '<div class="taler-count"><strong>' + total + '</strong><span>INS GESAMT</span></div>' +
      "</div>";
  }

  function renderDay() {
    var el = document.getElementById("dayBar");
    if (!el) return;
    var status = dayStatus();
    var label =
      status === "soon" ? "Startet am Sonntag, 15.11.2026" :
      status === "today" ? "Heute ist Renntag · Sonntag, 15.11." :
      "Rennen beendet · 15.11.2026";
    var pct = status === "soon" ? 4 : status === "today" ? 55 : 100;
    el.innerHTML =
      "<p>" + label + "</p>" +
      '<div class="month-track"><div class="month-fill" style="width:' + pct + '%"></div></div>';
  }

  function renderLegend() {
    var run = document.getElementById("legendRun");
    var lead = document.getElementById("legendLead");
    var trail = document.getElementById("legendTrail");
    var sample = { gender: "f", color: "#ff4fd8", glasses: false, look: "ponytail" };
    var sampleLead = { gender: "m", color: "#ffd24a", glasses: true, look: "beard" };
    var sampleTrail = { gender: "f", color: "#7dffb3", look: "bun" };
    if (run) {
      run.innerHTML =
        '<div class="mini"><div class="crawl">' + snailSvg(sample, {}) + "</div></div>" +
        "<div><em>UNTERWEGS</em>Mit jedem In kriecht die Schnecke weiter Richtung Ziel.</div>";
    }
    if (lead) {
      lead.innerHTML =
        '<div class="mini"><div class="crawl">' + snailSvg(sampleLead, { crown: true }) + "</div></div>" +
        "<div><em>VORNE</em>Wer in der Gruppe die meisten Ins hat, trägt die Krone.</div>";
    }
    if (trail) {
      trail.innerHTML =
        '<div class="mini"><div class="crawl">' + snailSvg(sampleTrail, {}) + "</div></div>" +
        "<div><em>SCHLEIMSPUR</em>Hinter jeder Schnecke bleibt eine Spur in ihrer Farbe.</div>";
    }
  }

  function renderTeams(wlSum, normalSum) {
    var el = document.getElementById("teamTotals");
    if (!el) return;
    el.innerHTML =
      '<div class="sack-team wl"><strong>MIT WATCHLIST</strong><span>' + wlSum + " INS</span></div>" +
      '<div class="sack-team normal"><strong>OHNE WATCHLIST</strong><span>' + normalSum + " INS</span></div>";
  }

  function renderLive(wl, normal) {
    var el = document.getElementById("liveRank");
    if (!el) return;

    function card(title, list, kind) {
      var rows = ranked(list);
      var max = maxIns(list);
      var html = '<article class="rank-card ' + kind + '"><h2>LIVE · ' + esc(title) + "</h2>";
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
      return html + "</article>";
    }

    el.innerHTML = card("MIT WATCHLIST", wl, "wl") + card("OHNE WATCHLIST", normal, "normal");
  }

  function trackBlock(title, list, kind) {
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
        '<span class="lane-leaf a"></span><span class="lane-leaf b"></span><span class="lane-leaf c"></span>' +
        '<span class="goal-leaf" aria-hidden="true"></span>' +
        '<div class="runner-mover crawl" style="left:' + pct + "%;animation-delay:" + (i * 0.12) + 's">' +
        snailSvg(p, { crown: first, delay: i * 0.12 }) +
        "</div></div>" +
        '<div class="runner-meta"><b>' + p.ins + "</b><span>INS</span></div>" +
        "</div>"
      );
    }).join("");
    return (
      '<section class="track-block">' +
      '<h2 class="track-label ' + kind + '">' + esc(title) + "</h2>" +
      '<div class="lane-ruler" aria-hidden="true"><span class="flag">START</span><span class="ruler-coins"><i></i><i></i><i></i><i></i><i></i></span><span class="goal">ZIEL</span></div>' +
      '<div class="lane">' + rows + "</div></section>"
    );
  }

  function renderTable(wl, normal) {
    var head = document.getElementById("rankHead");
    var body = document.getElementById("rankBody");
    if (head) {
      head.innerHTML = "<tr><th>Platz</th><th>Name</th><th class=\"total\">Ins</th><th>Abstand</th></tr>";
    }
    function rowsFor(list, title, kind) {
      var rows = ranked(list);
      var max = maxIns(list);
      var html = '<tr class="league-head ' + kind + '"><td colspan="4">' + esc(title) + "</td></tr>";
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
      return html;
    }
    if (body) {
      body.innerHTML = rowsFor(wl, "MIT WATCHLIST", "wl") + rowsFor(normal, "OHNE WATCHLIST", "normal");
    }
  }

  var wl = withLeague(WL, "wl");
  var normal = withLeague(NORMAL, "normal");
  var total = sum(wl) + sum(normal);

  renderHero(total);
  renderDay();
  renderLegend();
  renderTeams(sum(wl), sum(normal));
  renderLive(wl, normal);
  var tracks = document.getElementById("tracks");
  if (tracks) {
    tracks.innerHTML =
      trackBlock("MIT WATCHLIST", wl, "wl") +
      trackBlock("OHNE WATCHLIST", normal, "normal");
  }
  var note = document.getElementById("sackNote");
  if (note) {
    note.textContent =
      "Nur dieser eine Sonntag, der 15.11.2026. Die Strecke richtet sich nach der Führung: Wer die meisten Ins hat, liegt an der Ziellinie. Die anderen kriechen im Verhältnis hinterher.";
  }
  renderTable(wl, normal);
})();
