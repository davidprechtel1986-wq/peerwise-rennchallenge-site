/* PEERWISE · 30-Tage Sackhüpfen
   Alles startet bei 0. Tageswerte später hier eintragen.
   wl = mit Watchlist, normal = ohne Watchlist. */
(function () {
  var DAYS = 30;
  var START = new Date(2026, 9, 1); // 01.10.2026

  var WL = [
    { name: "RebeccaKö", gender: "f", color: "#ff4fd8", hair: "#3a2418", mood: 0 },
    { name: "WolfgangKiu", gender: "m", color: "#5ce1ff", hair: "#2c2c2c", mood: 1 },
    { name: "DaveP", gender: "m", color: "#ffd24a", hair: "#5c3a1e", mood: 2, beard: true },
    { name: "PascalePät", gender: "f", color: "#7dffb3", hair: "#1c1c1c", mood: 0 },
    { name: "Jule", gender: "f", color: "#ff7a3c", hair: "#c45c26", mood: 1 },
    { name: "AntjeMat", gender: "f", color: "#c9a0ff", hair: "#4a2c1a", mood: 2 },
    { name: "LarissaGom", gender: "f", color: "#ff5a8a", hair: "#2c1810", mood: 0 },
    { name: "ClaudiaTro", gender: "f", color: "#6ecbff", hair: "#c9a227", mood: 1 }
  ];

  var NORMAL = [
    { name: "HeikoWi", gender: "m", color: "#fb7185", hair: "#333333", mood: 2, beard: true },
    { name: "BiancaP", gender: "f", color: "#fbbf24", hair: "#6b3a1f", mood: 0 },
    { name: "MarcKö", gender: "m", color: "#4ade80", hair: "#1a1a1a", mood: 1 },
    { name: "TimPet", gender: "m", color: "#38bdf8", hair: "#6b4423", mood: 0 },
    { name: "ErwinGr", gender: "m", color: "#a78bfa", hair: "#555555", mood: 2, beard: true },
    { name: "MelanieTr", gender: "f", color: "#f472b6", hair: "#3d2314", mood: 1 }
  ];

  function zeros() {
    var a = [];
    for (var i = 0; i < DAYS; i++) a.push(0);
    return a;
  }

  function withDays(list, league) {
    return list.map(function (p) {
      var daily = zeros();
      var total = 0;
      for (var i = 0; i < daily.length; i++) total += Number(daily[i]) || 0;
      return {
        name: p.name,
        gender: p.gender,
        color: p.color,
        hair: p.hair,
        mood: p.mood,
        beard: !!p.beard,
        league: league,
        daily: daily,
        total: total
      };
    });
  }

  function dateLabel(i) {
    var d = new Date(START.getTime());
    d.setDate(START.getDate() + i);
    var day = String(d.getDate()).padStart(2, "0");
    var month = String(d.getMonth() + 1).padStart(2, "0");
    return day + "." + month + ".";
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
    for (var i = 0; i < list.length; i++) n += list[i].total;
    return n;
  }

  function maxTotal(list) {
    var m = 0;
    for (var i = 0; i < list.length; i++) if (list[i].total > m) m = list[i].total;
    return m;
  }

  function minTotal(list) {
    if (!list.length) return 0;
    var m = list[0].total;
    for (var i = 1; i < list.length; i++) if (list[i].total < m) m = list[i].total;
    return m;
  }

  function isLast(person, list) {
    var min = minTotal(list);
    var max = maxTotal(list);
    return max > min && person.total === min;
  }

  function figureSvg(p, stumble) {
    var f = p.gender === "f";
    var skin = "#ffd7bd";
    var hair = p.hair || "#333";
    var shirt = p.color || "#ff4fd8";
    var sack = "#e2c27a";
    var mood = p.mood || 0;

    var hairPath = f
      ? '<path d="M30 50 C26 16 44 6 60 10 C82 4 98 24 92 50 C86 28 74 20 60 22 C44 20 34 30 30 50Z" fill="' + hair + '"/>' +
        '<path d="M88 36 C104 30 114 46 106 74 C98 58 94 46 88 36Z" fill="' + hair + '"/>' +
        '<path d="M84 30 L98 20 L97 34 Z" fill="' + shirt + '" stroke="#1a1020" stroke-width="1"/>' +
        '<path d="M84 30 L96 40 L74 36 Z" fill="' + shirt + '" stroke="#1a1020" stroke-width="1"/>'
      : '<path d="M32 48 C28 18 44 10 60 12 C80 8 96 24 90 48 C82 28 42 26 32 48Z" fill="' + hair + '"/>';

    var eyes = stumble
      ? '<path d="M44 48 Q50 40 56 48" fill="none" stroke="#241018" stroke-width="2.2" stroke-linecap="round"/>' +
        '<path d="M66 48 Q72 40 78 48" fill="none" stroke="#241018" stroke-width="2.2" stroke-linecap="round"/>'
      : '<ellipse cx="50" cy="48" rx="4.4" ry="5.2" fill="#fff" stroke="#241018" stroke-width="1.5"/>' +
        '<ellipse cx="74" cy="48" rx="4.4" ry="5.2" fill="#fff" stroke="#241018" stroke-width="1.5"/>' +
        '<circle cx="51" cy="49" r="2.2" fill="#241018"/><circle cx="75" cy="49" r="2.2" fill="#241018"/>' +
        '<circle cx="52.2" cy="47.6" r="0.8" fill="#fff"/><circle cx="76.2" cy="47.6" r="0.8" fill="#fff"/>' +
        (f
          ? '<path d="M44 42 Q50 39 56 43" fill="none" stroke="#241018" stroke-width="1.4"/>' +
            '<path d="M68 42 Q74 39 80 43" fill="none" stroke="#241018" stroke-width="1.4"/>'
          : "");

    var mouth = stumble
      ? '<ellipse cx="62" cy="62" rx="7" ry="5" fill="#6b2438"/>'
      : mood % 3 === 1
        ? '<path d="M48 58 Q62 74 76 58 Q62 66 48 58Z" fill="#6b2438"/>'
        : '<path d="M50 60 Q62 70 74 60" fill="none" stroke="#241018" stroke-width="2.3" stroke-linecap="round"/>';

    var beard = !f && p.beard
      ? '<path d="M46 60 Q62 78 78 60 Q72 68 62 70 Q52 68 46 60Z" fill="' + hair + '"/>'
      : "";

    var person =
      hairPath +
      '<circle cx="62" cy="50" r="22" fill="' + skin + '" stroke="#1a1020" stroke-width="2.2"/>' +
      eyes +
      mouth +
      '<ellipse cx="44" cy="56" rx="4" ry="2.4" fill="#ffb0b8" opacity="0.85"/>' +
      '<ellipse cx="80" cy="56" rx="4" ry="2.4" fill="#ffb0b8" opacity="0.85"/>' +
      beard +
      '<ellipse cx="62" cy="84" rx="24" ry="16" fill="' + shirt + '" stroke="#1a1020" stroke-width="2.2"/>' +
      '<path d="M40 80 Q24 62 30 48" fill="none" stroke="' + skin + '" stroke-width="8" stroke-linecap="round"/>' +
      '<path d="M84 80 Q104 60 94 46" fill="none" stroke="' + skin + '" stroke-width="8" stroke-linecap="round"/>' +
      '<circle cx="30" cy="47" r="5" fill="' + skin + '" stroke="#1a1020" stroke-width="1.4"/>' +
      '<circle cx="94" cy="45" r="5" fill="' + skin + '" stroke="#1a1020" stroke-width="1.4"/>';

    var sackShape =
      '<path d="M36 92 Q30 118 40 136 Q62 150 86 136 Q96 118 88 92 Q74 104 62 100 Q48 104 36 92Z" fill="' + sack + '" stroke="#6a4a16" stroke-width="2.2"/>' +
      '<path d="M44 112 Q62 120 82 110" fill="none" stroke="#6a4a16" stroke-width="1.5" stroke-dasharray="3 3"/>' +
      '<path d="M46 94 Q62 86 78 94" fill="none" stroke="#5a3a10" stroke-width="3.2" stroke-linecap="round"/>' +
      '<circle cx="54" cy="122" r="3.2" fill="#fff4c8" stroke="#6a4a16" stroke-width="1"/>' +
      '<circle cx="70" cy="126" r="2.6" fill="#fff4c8" stroke="#6a4a16" stroke-width="1"/>';

    var stars =
      '<text x="8" y="28" font-size="16" fill="#ffd24a">✦</text>' +
      '<text x="96" y="22" font-size="13" fill="#fff">✦</text>';

    var inner = stumble
      ? '<g transform="rotate(-24 78 120)">' + person + "</g>" +
        '<g transform="translate(-26 6) rotate(-36 62 120)">' + sackShape + "</g>" +
        stars
      : person + sackShape;

    return '<svg viewBox="0 0 120 156" aria-hidden="true">' + inner + "</svg>";
  }

  function talerSvg() {
    var coins = "";
    var spots = [
      [62, 150], [160, 148],
      [54, 178], [168, 176],
      [78, 200], [146, 198],
      [112, 208]
    ];
    for (var i = 0; i < spots.length; i++) {
      coins +=
        '<circle cx="' + spots[i][0] + '" cy="' + spots[i][1] + '" r="11" fill="none" stroke="#8a6a2a" stroke-width="2" opacity="0.55"/>' +
        '<text x="' + spots[i][0] + '" y="' + (spots[i][1] + 4) + '" text-anchor="middle" font-size="9" fill="#8a6a2a" font-family="Arial, sans-serif" opacity="0.7">I</text>';
    }
    return (
      '<svg viewBox="0 0 220 250" aria-hidden="true">' +
      '<ellipse cx="112" cy="232" rx="70" ry="10" fill="rgba(0,0,0,0.35)"/>' +
      '<path d="M48 92 C28 120 24 180 48 214 C70 236 156 238 178 210 C204 176 198 118 176 92 C150 112 78 112 48 92Z" fill="#c9954a" stroke="#5c3b12" stroke-width="3"/>' +
      '<path d="M64 150 Q112 176 164 146" fill="none" stroke="#7a5420" stroke-width="2" stroke-dasharray="4 4"/>' +
      '<path d="M58 78 C78 108 146 108 168 76 C150 96 78 98 58 78Z" fill="#e7c27a" stroke="#5c3b12" stroke-width="3"/>' +
      '<path d="M86 70 Q112 96 140 68" fill="none" stroke="#5c3b12" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M70 64 Q90 40 112 62" fill="none" stroke="#e7c27a" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M112 62 Q136 38 156 66" fill="none" stroke="#e7c27a" stroke-width="6" stroke-linecap="round"/>' +
      coins +
      "</svg>"
    );
  }

  function renderSack(total) {
    var el = document.getElementById("talerSack");
    if (!el) return;
    el.innerHTML =
      '<div class="taler-sack">' +
      talerSvg() +
      '<div class="taler-count"><strong>' + total + '</strong><span>TALER · INS</span></div>' +
      "</div>";
  }

  function renderLegend() {
    var run = document.getElementById("legendRun");
    var trip = document.getElementById("legendTrip");
    var sample = { gender: "f", color: "#ff4fd8", hair: "#3a2418", mood: 1 };
    var sampleM = { gender: "m", color: "#5ce1ff", hair: "#2c2c2c", mood: 0 };
    if (run) {
      run.innerHTML =
        '<div class="mini"><div class="bob">' + figureSvg(sample, false) + "</div></div>" +
        "<div><em>IM SACK</em>Alle hüpfen los. Stand jetzt: Start, alles 0.</div>";
    }
    if (trip) {
      trip.innerHTML =
        '<div class="mini"><div class="trip">' + figureSvg(sampleM, true) + "</div></div>" +
        "<div><em>HINTEN</em>Der Letzte stolpert und verliert den Sack.</div>";
    }
  }

  function renderTeams(wlSum, normalSum) {
    var el = document.getElementById("teamTotals");
    if (!el) return;
    el.innerHTML =
      '<div class="sack-team wl"><strong>MIT WATCHLIST</strong><span>' + wlSum + " INS Gesamt</span></div>" +
      '<div class="sack-team normal"><strong>OHNE WATCHLIST</strong><span>' + normalSum + " INS Gesamt</span></div>";
  }

  function trackBlock(title, list, kind) {
    var max = maxTotal(list);
    var rows = list.map(function (p, i) {
      var last = isLast(p, list);
      var pct = max ? Math.round((p.total / max) * 78) : 0;
      return (
        '<div class="runner' + (last ? " is-last" : "") + '">' +
        '<div class="runner-name">' + esc(p.name) + "</div>" +
        '<div class="runner-track"><div class="runner-mover ' + (last ? "trip" : "bob") + '" style="left:' + pct + '%;animation-delay:' + (i * 0.12) + 's">' +
        figureSvg(p, last) +
        "</div></div>" +
        '<div class="runner-meta"><span>' + p.total + " INS</span></div>" +
        "</div>"
      );
    }).join("");
    return (
      '<section class="track-block">' +
      '<h2 class="track-label ' + kind + '">' + esc(title) + "</h2>" +
      '<div class="lane">' + rows + "</div></section>"
    );
  }

  function renderTable(wl, normal) {
    var head = document.getElementById("sackHead");
    var body = document.getElementById("sackBody");
    var labels = [];
    for (var i = 0; i < DAYS; i++) labels.push(dateLabel(i));
    if (head) {
      head.innerHTML =
        "<tr><th>Name</th>" +
        labels.map(function (l) { return "<th>" + esc(l) + "</th>"; }).join("") +
        '<th class="total">Endergebnis</th></tr>';
    }
    function rowsFor(list, title, kind) {
      var html =
        '<tr class="league-head ' + kind + '"><td colspan="' + (DAYS + 2) + '">' + esc(title) + "</td></tr>";
      list.forEach(function (p) {
        html +=
          "<tr><td>" + esc(p.name) + "</td>" +
          p.daily.map(function (v) {
            return '<td><span class="zero">' + (Number(v) || 0) + "</span></td>";
          }).join("") +
          '<td class="total">' + p.total + "</td></tr>";
      });
      return html;
    }
    if (body) {
      body.innerHTML = rowsFor(wl, "MIT WATCHLIST", "wl") + rowsFor(normal, "OHNE WATCHLIST", "normal");
    }
  }

  var wl = withDays(WL, "wl");
  var normal = withDays(NORMAL, "normal");
  var total = sum(wl) + sum(normal);

  renderSack(total);
  renderLegend();
  renderTeams(sum(wl), sum(normal));
  var tracks = document.getElementById("tracks");
  if (tracks) {
    tracks.innerHTML =
      trackBlock("MIT WATCHLIST", wl, "wl") +
      trackBlock("OHNE WATCHLIST", normal, "normal");
  }
  var note = document.getElementById("sackNote");
  if (note) {
    note.textContent =
      "Alle Tage 01.10.–30.10. sind auf 0. Endergebnis = Summe der Tageswerte. Der Sack oben rechts sammelt alle INS als Taler.";
  }
  renderTable(wl, normal);
})();
