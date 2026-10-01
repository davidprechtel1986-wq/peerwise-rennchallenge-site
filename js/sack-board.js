/* PEERWISE · 30-Tage Sackhüpfen
   Alles startet bei 0. Tageswerte später hier eintragen.
   wl = mit Watchlist, normal = ohne Watchlist. */
(function () {
  var DAYS = 30;
  var START = new Date(2026, 9, 1);

  var WL = [
    { name: "RebeccaKö", gender: "f", look: "ponytail", color: "#ff4fd8", hair: "#3a2418", mood: 0 },
    { name: "WolfgangKiu", gender: "m", look: "cap", color: "#5ce1ff", hair: "#2c2c2c", mood: 1 },
    { name: "DaveP", gender: "m", look: "beard", glasses: true, color: "#ffd24a", hair: "#5c3a1e", mood: 2 },
    { name: "PascalePät", gender: "f", look: "bob", glasses: true, color: "#7dffb3", hair: "#1c1c1c", mood: 0 },
    { name: "Jule", gender: "f", look: "pigtails", color: "#ff7a3c", hair: "#c45c26", mood: 1 },
    { name: "AntjeMat", gender: "f", look: "bun", color: "#c9a0ff", hair: "#4a2c1a", mood: 2 },
    { name: "LarissaGom", gender: "f", look: "ponytail", color: "#ff5a8a", hair: "#2c1810", mood: 0 },
    { name: "ClaudiaTro", gender: "f", look: "bob", color: "#6ecbff", hair: "#c9a227", mood: 1 }
  ];

  var NORMAL = [
    { name: "HeikoWi", gender: "m", look: "cap", beard: true, color: "#fb7185", hair: "#333333", mood: 2 },
    { name: "BiancaP", gender: "f", look: "pigtails", color: "#fbbf24", hair: "#6b3a1f", mood: 0 },
    { name: "MarcKö", gender: "m", look: "short", glasses: true, color: "#4ade80", hair: "#1a1a1a", mood: 1 },
    { name: "TimPet", gender: "m", look: "cap", color: "#38bdf8", hair: "#6b4423", mood: 0 },
    { name: "ErwinGr", gender: "m", look: "beard", glasses: true, color: "#a78bfa", hair: "#555555", mood: 2 },
    { name: "MelanieTr", gender: "f", look: "bun", color: "#f472b6", hair: "#3d2314", mood: 1 }
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
        look: p.look,
        glasses: !!p.glasses,
        beard: !!p.beard || p.look === "beard",
        color: p.color,
        hair: p.hair,
        mood: p.mood,
        league: league,
        daily: daily,
        total: total
      };
    });
  }

  function dayDate(i) {
    var d = new Date(START.getTime());
    d.setDate(START.getDate() + i);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function dateLabel(i) {
    var d = dayDate(i);
    var day = String(d.getDate()).padStart(2, "0");
    var month = String(d.getMonth() + 1).padStart(2, "0");
    return day + "." + month + ".";
  }

  function todayIndex() {
    var now = new Date();
    now.setHours(0, 0, 0, 0);
    var diff = Math.round((now.getTime() - dayDate(0).getTime()) / 86400000);
    if (diff < 0 || diff >= DAYS) return -1;
    return diff;
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

  function isFirst(person, list) {
    var min = minTotal(list);
    var max = maxTotal(list);
    return max > min && person.total === max;
  }

  function hairSvg(p) {
    var hair = p.hair || "#333";
    var shirt = p.color || "#ff4fd8";
    if (p.look === "cap") return "";
    if (p.look === "pigtails") {
      return (
        '<circle cx="22" cy="74" r="13" fill="' + hair + '"/>' +
        '<circle cx="102" cy="72" r="13" fill="' + hair + '"/>' +
        '<path d="M14 64 L24 50 L34 66 Z" fill="' + shirt + '" stroke="#1a1020" stroke-width="1"/>' +
        '<path d="M110 62 L98 48 L88 66 Z" fill="' + shirt + '" stroke="#1a1020" stroke-width="1"/>' +
        '<path d="M34 46 Q62 16 92 44 Q78 28 62 30 Q44 28 34 46Z" fill="' + hair + '"/>'
      );
    }
    if (p.look === "bun") {
      return (
        '<circle cx="88" cy="26" r="14" fill="' + hair + '" stroke="#1a1020" stroke-width="1.6"/>' +
        '<path d="M32 50 C26 20 46 8 62 12 C86 6 98 28 92 52 C82 30 42 28 32 50Z" fill="' + hair + '"/>'
      );
    }
    if (p.look === "ponytail") {
      return (
        '<path d="M32 50 C26 16 46 6 62 10 C84 4 98 24 92 50 C84 28 74 22 62 24 C44 22 34 32 32 50Z" fill="' + hair + '"/>' +
        '<path d="M88 38 C106 32 116 50 106 78 C98 60 94 48 88 38Z" fill="' + hair + '"/>' +
        '<path d="M82 30 L98 18 L96 34 Z" fill="' + shirt + '" stroke="#1a1020" stroke-width="1"/>' +
        '<path d="M82 30 L96 42 L70 36 Z" fill="' + shirt + '" stroke="#1a1020" stroke-width="1"/>'
      );
    }
    if (p.look === "bob") {
      return '<path d="M26 62 C22 22 44 6 62 10 C88 4 102 28 96 64 C90 42 34 38 26 62Z" fill="' + hair + '"/>';
    }
    return '<path d="M34 48 C30 20 48 10 62 14 C84 8 98 26 90 48 C80 30 44 28 34 48Z" fill="' + hair + '"/>';
  }

  function figureSvg(p, opt) {
    opt = opt || {};
    var stumble = !!opt.stumble;
    var crown = !!opt.crown && !stumble;
    var f = p.gender === "f";
    var skin = "#ffd7bd";
    var hair = p.hair || "#333";
    var shirt = p.color || "#ff4fd8";
    var sack = "#e2c27a";
    var mood = p.mood || 0;
    var beard = !f && (p.beard || p.look === "beard");

    var eyes = stumble
      ? '<path d="M44 50 Q50 42 56 50" fill="none" stroke="#241018" stroke-width="2.2" stroke-linecap="round"/>' +
        '<path d="M68 50 Q74 42 80 50" fill="none" stroke="#241018" stroke-width="2.2" stroke-linecap="round"/>'
      : '<ellipse cx="50" cy="50" rx="4.6" ry="5.4" fill="#fff" stroke="#241018" stroke-width="1.5"/>' +
        '<ellipse cx="76" cy="50" rx="4.6" ry="5.4" fill="#fff" stroke="#241018" stroke-width="1.5"/>' +
        '<circle cx="51" cy="51" r="2.3" fill="#241018"/><circle cx="77" cy="51" r="2.3" fill="#241018"/>' +
        '<circle cx="52.3" cy="49.4" r="0.9" fill="#fff"/><circle cx="78.3" cy="49.4" r="0.9" fill="#fff"/>' +
        (f
          ? '<path d="M44 44 Q50 40 56 45" fill="none" stroke="#241018" stroke-width="1.5"/>' +
            '<path d="M70 44 Q76 40 82 45" fill="none" stroke="#241018" stroke-width="1.5"/>'
          : "");

    var glasses = p.glasses
      ? '<circle cx="50" cy="50" r="7.2" fill="none" stroke="#241018" stroke-width="1.7"/>' +
        '<circle cx="76" cy="50" r="7.2" fill="none" stroke="#241018" stroke-width="1.7"/>' +
        '<path d="M57 50 H69" stroke="#241018" stroke-width="1.5"/>'
      : "";

    var mouth = stumble
      ? '<ellipse cx="63" cy="64" rx="7" ry="5" fill="#6b2438"/>'
      : mood % 3 === 1
        ? '<path d="M48 60 Q63 76 78 60 Q63 68 48 60Z" fill="#6b2438"/>'
        : '<path d="M50 62 Q63 72 76 62" fill="none" stroke="#241018" stroke-width="2.3" stroke-linecap="round"/>';

    var beardSvg = beard
      ? '<path d="M46 62 Q63 82 80 62 Q74 70 63 72 Q52 70 46 62Z" fill="' + hair + '"/>'
      : "";

    var cap = p.look === "cap"
      ? '<path d="M30 46 Q38 22 63 20 Q92 22 98 44 L104 50 L26 52 Z" fill="#2a2158" stroke="#1a1020" stroke-width="1.6"/>' +
        '<ellipse cx="64" cy="50" rx="40" ry="7" fill="#3a2d78" stroke="#1a1020" stroke-width="1.4"/>' +
        '<rect x="54" y="30" width="16" height="8" rx="2" fill="' + shirt + '" stroke="#1a1020" stroke-width="1"/>'
      : "";

    var crownSvg = crown
      ? '<path d="M36 30 L44 12 L56 26 L64 6 L72 26 L84 12 L92 30 Z" fill="#ffd24a" stroke="#8a5a10" stroke-width="1.5"/>' +
        '<rect x="36" y="28" width="56" height="8" rx="2" fill="#ffd24a" stroke="#8a5a10"/>' +
        '<circle cx="44" cy="16" r="2.4" fill="#ff4fd8"/>' +
        '<circle cx="64" cy="10" r="2.4" fill="#5ce1ff"/>' +
        '<circle cx="84" cy="16" r="2.4" fill="#ff4fd8"/>'
      : "";

    var person =
      hairSvg(p) +
      '<circle cx="63" cy="52" r="22" fill="' + skin + '" stroke="#1a1020" stroke-width="2.2"/>' +
      cap +
      eyes +
      glasses +
      mouth +
      '<ellipse cx="44" cy="58" rx="4" ry="2.4" fill="#ffb0b8" opacity="0.85"/>' +
      '<ellipse cx="82" cy="58" rx="4" ry="2.4" fill="#ffb0b8" opacity="0.85"/>' +
      beardSvg +
      '<ellipse cx="63" cy="86" rx="24" ry="16" fill="' + shirt + '" stroke="#1a1020" stroke-width="2.2"/>' +
      '<path d="M40 82 Q22 64 28 48" fill="none" stroke="' + skin + '" stroke-width="8" stroke-linecap="round"/>' +
      '<path d="M86 82 Q106 62 96 46" fill="none" stroke="' + skin + '" stroke-width="8" stroke-linecap="round"/>' +
      '<circle cx="28" cy="47" r="5" fill="' + skin + '" stroke="#1a1020" stroke-width="1.4"/>' +
      '<circle cx="96" cy="45" r="5" fill="' + skin + '" stroke="#1a1020" stroke-width="1.4"/>' +
      crownSvg;

    var sackShape =
      '<path d="M36 94 Q30 120 40 138 Q63 152 88 138 Q98 120 90 94 Q76 106 63 102 Q48 106 36 94Z" fill="' + sack + '" stroke="#6a4a16" stroke-width="2.2"/>' +
      '<path d="M44 114 Q63 122 84 112" fill="none" stroke="#6a4a16" stroke-width="1.5" stroke-dasharray="3 3"/>' +
      '<path d="M46 96 Q63 88 80 96" fill="none" stroke="#5a3a10" stroke-width="3.2" stroke-linecap="round"/>' +
      '<circle cx="54" cy="124" r="3.2" fill="#fff4c8" stroke="#6a4a16" stroke-width="1"/>' +
      '<circle cx="72" cy="128" r="2.6" fill="#fff4c8" stroke="#6a4a16" stroke-width="1"/>';

    var stars =
      '<text x="4" y="26" font-size="16" fill="#ffd24a">✦</text>' +
      '<text x="98" y="18" font-size="13" fill="#fff">✦</text>' +
      '<text x="16" y="48" font-size="11" fill="#ff4fd8">✦</text>' +
      '<path d="M8 90 Q20 80 14 70" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity="0.8"/>';

    var inner = stumble
      ? '<g transform="rotate(-26 78 124)">' + person + "</g>" +
        '<g transform="translate(-28 8) rotate(-40 63 124)">' + sackShape + "</g>" +
        stars
      : person + sackShape;

    return '<svg viewBox="0 0 124 164" aria-hidden="true">' + inner + "</svg>";
  }

  function talerSvg(total) {
    var spots = [
      [62, 150], [160, 148],
      [54, 178], [168, 176],
      [78, 200], [146, 198],
      [112, 208]
    ];
    var filled = total > 0 ? Math.max(1, Math.min(spots.length, Math.ceil(total / 80))) : 0;
    var coins = "";
    for (var i = 0; i < spots.length; i++) {
      var on = i < filled;
      coins +=
        '<circle cx="' + spots[i][0] + '" cy="' + spots[i][1] + '" r="11" fill="' + (on ? "#ffd24a" : "none") + '" stroke="' + (on ? "#8a5a10" : "#8a6a2a") + '" stroke-width="2" opacity="' + (on ? "1" : "0.55") + '"/>' +
        '<text x="' + spots[i][0] + '" y="' + (spots[i][1] + 4) + '" text-anchor="middle" font-size="9" fill="' + (on ? "#5c3b12" : "#8a6a2a") + '" font-family="Arial, sans-serif">I</text>';
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
    var rain = total > 0
      ? '<div class="coin-rain" aria-hidden="true"><i></i><i></i><i></i></div>'
      : "";
    el.innerHTML =
      '<div class="taler-sack' + (total > 0 ? " is-live" : "") + '">' +
      rain +
      talerSvg(total) +
      '<div class="taler-count"><strong>' + total + '</strong><span>TALER · INS</span></div>' +
      "</div>";
  }

  function renderMonth() {
    var el = document.getElementById("monthBar");
    if (!el) return;
    var idx = todayIndex();
    var day = idx < 0 ? (new Date() < dayDate(0) ? 0 : DAYS) : idx + 1;
    var label = day === 0 ? "Startet am 01.10." : "Tag " + day + " von " + DAYS;
    var pct = Math.round((day / DAYS) * 100);
    el.innerHTML =
      "<p>" + label + "</p>" +
      '<div class="month-track"><div class="month-fill" style="width:' + pct + '%"></div></div>';
  }

  function renderLegend() {
    var run = document.getElementById("legendRun");
    var lead = document.getElementById("legendLead");
    var trip = document.getElementById("legendTrip");
    var sample = { gender: "f", look: "ponytail", color: "#ff4fd8", hair: "#3a2418", mood: 1 };
    var sampleM = { gender: "m", look: "cap", color: "#5ce1ff", hair: "#2c2c2c", mood: 0 };
    if (run) {
      run.innerHTML =
        '<div class="mini"><div class="bob">' + figureSvg(sample, {}) + "</div></div>" +
        "<div><em>IM SACK</em>Alle hüpfen los. Stand jetzt: Start, alles 0.</div>";
    }
    if (lead) {
      lead.innerHTML =
        '<div class="mini"><div class="bob">' + figureSvg(sample, { crown: true }) + "</div></div>" +
        "<div><em>VORNE</em>Der höchste Stand in der Liste bekommt die Krone.</div>";
    }
    if (trip) {
      trip.innerHTML =
        '<div class="mini"><div class="trip">' + figureSvg(sampleM, { stumble: true }) + "</div></div>" +
        "<div><em>HINTEN</em>Der Letzte stolpert, der Sack fliegt weg.</div>";
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
      var first = isFirst(p, list);
      var pct = max ? Math.round((p.total / max) * 68) : 2;
      var cls = (first ? " is-first" : "") + (last ? " is-last" : "");
      return (
        '<div class="runner' + cls + '">' +
        '<div class="runner-name"><i class="dot" style="background:' + esc(p.color) + '"></i>' + esc(p.name) + "</div>" +
        '<div class="runner-track">' +
        '<span class="lane-coin a"></span><span class="lane-coin b"></span><span class="lane-coin c"></span>' +
        '<span class="goal-sack" aria-hidden="true"></span>' +
        '<div class="runner-mover ' + (last ? "trip" : "bob") + '" style="left:' + pct + '%;animation-delay:' + (i * 0.12) + 's">' +
        figureSvg(p, { stumble: last, crown: first }) +
        "</div></div>" +
        '<div class="runner-meta"><span>' + p.total + " INS</span></div>" +
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
    var head = document.getElementById("sackHead");
    var body = document.getElementById("sackBody");
    var today = todayIndex();
    var labels = [];
    for (var i = 0; i < DAYS; i++) labels.push(dateLabel(i));
    if (head) {
      head.innerHTML =
        "<tr><th>Name</th>" +
        labels.map(function (l, idx) {
          var cls = idx === today ? ' class="is-today"' : "";
          var text = idx === today ? esc(l) + '<span class="heute">HEUTE</span>' : esc(l);
          return "<th" + cls + ">" + text + "</th>";
        }).join("") +
        '<th class="total">Endergebnis</th></tr>';
    }
    function rowsFor(list, title, kind) {
      var html =
        '<tr class="league-head ' + kind + '"><td colspan="' + (DAYS + 2) + '">' + esc(title) + "</td></tr>";
      list.forEach(function (p) {
        html +=
          '<tr><td><span class="who"><i class="dot" style="background:' + esc(p.color) + '"></i>' + esc(p.name) + "</span></td>" +
          p.daily.map(function (v, idx) {
            var n = Number(v) || 0;
            var cls = idx === today ? ' class="is-today"' : "";
            var inner = n === 0 ? '<span class="zero">0</span>' : String(n);
            return "<td" + cls + ">" + inner + "</td>";
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
  renderMonth();
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
      "Alle Tage 01.10.–30.10. sind auf 0. Endergebnis = Summe der Tageswerte. Der goldene Tag ist heute. Der Sack oben rechts sammelt alle INS als Taler.";
  }
  renderTable(wl, normal);
})();
