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
    { name: "Anni", gender: "f", look: "pigtails", glasses: true, color: "#ff6b9d", hair: "#5c3a1e", mood: 1, ins: 71 },
    { name: "HeikoWi", gender: "m", look: "cap", beard: true, color: "#38bdf8", hair: "#333333", mood: 2, ins: 382 },
    { name: "Dave", gender: "m", look: "beard", glasses: true, color: "#facc15", hair: "#5c3a1e", mood: 1, ins: 380 },
    { name: "JoeSp", gender: "m", look: "short", glasses: true, color: "#34d399", hair: "#2a2a2a", mood: 0, ins: 398 },
    { name: "PascalePätz", gender: "f", look: "ponytail", glasses: true, color: "#a78bfa", hair: "#3b1f12", mood: 2, ins: 79 },
    { name: "FelixHau", gender: "m", look: "mohawk", glasses: false, color: "#fb923c", hair: "#1a1410", mood: 1, ins: 68 }
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
    var pill = document.getElementById("livePill");
    var clock = document.getElementById("eventClock");
    var board = document.getElementById("countdownBoard");
    var now = new Date();
    var time = pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds());

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
      clock.textContent =
        (status === "today" ? "RENNTAG \u00b7 " : status === "soon" ? "COUNTDOWN \u00b7 " : "15.11. \u00b7 ") + time;
    }

    if (!board) return;
    if (status === "done") {
      board.innerHTML = '<p class="status">RENNEN BEENDET</p><div class="digits">' +
        '<div class="cell"><b>15</b><span>NOV</span></div>' +
        '<div class="cell"><b>26</b><span>JAHR</span></div></div>';
      return;
    }
    var target = eventDay();
    var label = "START IN";
    if (status === "today") {
      target = new Date(eventDay().getTime() + 24 * 60 * 60 * 1000);
      label = "LIVE \u00b7 RENNTAG \u2013 NOCH";
    }
    var t = splitTime(target.getTime() - now.getTime());
    var digits = "";
    if (status === "soon" && t.d > 0) digits += cell(t.d, "TAGE");
    digits += cell(t.h, "STD") + cell(t.m, "MIN") + cell(t.s, "SEK");
    board.innerHTML = '<p class="status">' + label + "</p><div class=\"digits\">" + digits + "</div>";
  }

  function tickerLines(list) {
    var status = dayStatus();
    var lines = [
      "PEERWISE SCHNECKENRENNEN \u2014 NUR HEUTE, NUR SONNTAG, 15. NOVEMBER!",
      "Langsam war gestern \u2013 jetzt wird geschleimt!",
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
    if (status === "today") lines.unshift("LIVE aus dem PEERWISE-Schleimstadion \u2013 RENNTAG!");
    if (status === "soon") lines.unshift("Bald geht\u2019s los: Sonntag, 15. November 2026!");
    if (status === "done") lines.unshift("Das Schneckenrennen ist gelaufen \u2013 danke f\u00fcrs Schleimen!");
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
  show("emptyState", waiting);
  show("liveRank", !waiting);
  show("podiumWrap", !waiting);

  var note = document.getElementById("sackNote");
  if (note) {
    note.textContent = waiting
      ? ""
      : "Nur dieser eine Sonntag, der 15.11.2026. Wer die meisten Ins holt, liegt an der Ziellinie und gewinnt.";
  }

  if (!waiting) {
    renderLive(people);
    renderTracks(people);
    renderPodium(people);
  }
})();
