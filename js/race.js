(function () {
  var active = "all";

  function renderCountdown() {
    var el = document.getElementById("countdown");
    if (!el) return;
    // Offizielles Challenge-Ende 30.09. — Timer bleibt auf 0 (Nachtrage-Frist ändert das nicht)
    var officialEnd = new Date("2026-09-30T23:59:59");
    var now = new Date();
    if (now > officialEnd) {
      el.innerHTML =
        '<div class="cd-pill">0<small>Tage</small></div>' +
        '<div class="cd-pill">0<small>Std</small></div>' +
        '<div class="cd-pill">0<small>Min</small></div>' +
        '<div class="cd-pill">0<small>Sek</small></div>' +
        '<div class="cd-pill">FERTIG<small>30.09.</small></div>';
      return;
    }
    var target;
    var label;
    if (now < PW.START) {
      target = PW.START;
      label = "Start in";
    } else {
      target = officialEnd;
      label = "Ende in";
    }
    var diff = Math.max(0, target - now);
    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff % 86400000) / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);
    el.innerHTML =
      '<div class="cd-pill">' + d + "<small>Tage</small></div>" +
      '<div class="cd-pill">' + h + "<small>Std</small></div>" +
      '<div class="cd-pill">' + m + "<small>Min</small></div>" +
      '<div class="cd-pill">' + s + "<small>Sek</small></div>" +
      '<div class="cd-pill">' + PW.esc(label) + "<small>Mi 23.09. – 30.09.</small></div>";
  }

  function leagueTitle(num) {
    if (num === 1) return "1. HIGH PERFORMERS";
    if (num === 2) return "2. RISING STARS";
    if (num === 3) return "3. CHALLENGERS";
    return "Nr. " + num;
  }

  /** Anzeige-Name ohne feste Liga-Nr. — Platz kommt aus der INS-Sortierung */
  function leagueStandName(num) {
    if (num === 1) return "HIGH PERFORMERS";
    if (num === 2) return "RISING STARS";
    if (num === 3) return "CHALLENGERS";
    return "Nr. " + num;
  }

  function renderChampion(drivers) {
    var line = document.getElementById("champLine");
    var box = document.getElementById("scoreBox");
    var bar = document.getElementById("resultBar");

    // Immer nach Gesamt-INS sortieren (Platz 1 = meiste INS)
    var ordered = PW.sorted(drivers || []).slice(0, 3);
    while (ordered.length < 3) {
      ordered.push({ ins: 0, number: ordered.length + 1 });
    }

    box.innerHTML = ordered
      .map(function (d, i) {
        var place = i + 1;
        var cls = place === 2 ? " second" : "";
        var label = leagueStandName(Number(d.number));
        var ins = Math.round(Number(d.ins) || 0);
        return (
          '<div class="score-row' +
          cls +
          '"><span>' +
          place +
          ". " +
          label +
          ": " +
          ins +
          " INS</span></div>"
        );
      })
      .join("");

    var scored = ordered.filter(function (d) {
      return (Number(d.ins) || 0) > 0;
    });
    if (!scored.length) {
      line.textContent = "Challenge startet Mittwoch 23.09. — alle Bahnen auf 0 INS";
      bar.textContent = "1. HIGH PERFORMERS · 2. RISING STARS · 3. CHALLENGERS";
      return;
    }
    var a = scored[0];
    var b = scored[1];
    var labelA = leagueTitle(Number(a.number)) || (a.name && a.name.trim() ? a.name : "Nr. " + (a.number || "?"));
    var labelB = b
      ? leagueTitle(Number(b.number)) || (b.name && b.name.trim() ? b.name : "Nr. " + (b.number || "?"))
      : "";
    line.innerHTML =
      PW.esc(labelA).toUpperCase() +
      " FÜHRT MIT " +
      Math.round(a.ins) +
      " INS" +
      (b ? " · Platz 2: " + PW.esc(labelB).toUpperCase() + " (" + Math.round(b.ins) + " INS)" : "");
    bar.textContent =
      "GESAMT: " +
      ordered
        .map(function (d, i) {
          return i + 1 + ") " + leagueStandName(Number(d.number)) + " " + Math.round(Number(d.ins) || 0);
        })
        .join(" · ") +
      " INS";
  }

  /** Feste Slot-Anzahl je Liga: 1 / 2 / 3 Bahnen */
  function lanesForLiga(liga, drivers, ceiling) {
    var list = PW.byLiga(drivers, liga.id);
    var slots = liga.slots || 1;
    var html = "";
    for (var s = 0; s < slots; s++) {
      var d = list[s] || {
        name: "",
        ins: 0,
        color: ["#ff7a3d", "#5ce1ff", "#ff4fd8", "#ffd24a", "#c9a0ff", "#3ddc97"][s % 6],
        number: s + 1
      };
      var num = Number(d.number) > 0 ? Math.round(d.number) : s + 1;
      var color = d.color || "#ff4fd8";
      var pct = Math.min(92, 4 + PW.lapProgress(d.ins, ceiling) * 84);
      var lead = s === 0 && (Number(d.ins) || 0) > 0 && list[0] === d ? " is-lead" : "";
      html +=
        '<div class="bar-row' +
        lead +
        '">' +
        '<div class="bar-track">' +
        '<div class="bar-fill" style="width:' +
        pct +
        "%;background:linear-gradient(90deg," +
        PW.esc(color) +
        "88," +
        PW.esc(color) +
        ')"></div>' +
        '<div class="bar-finish" aria-hidden="true"></div>' +
        '<div class="bar-car bobby" data-num="' +
        num +
        '" style="left:' +
        pct +
        "%;--car:" +
        PW.esc(color) +
        '" title="Bobby Car ' +
        num +
        '">' +
        bobbyCarSvg(num, color) +
        "</div></div></div>";
    }
    return html;
  }

  function bobbyCarSvg(num, color) {
    // BIG Bobby-Car Classic: Gesicht mit Augen, weißes Lenkrad + Hupe, BOBBY-CAR, dicke Räder
    var c = color || "#e30613";
    return (
      '<svg class="bobby-svg" viewBox="0 0 160 100" aria-hidden="true">' +
      '<ellipse cx="80" cy="92" rx="55" ry="7" fill="rgba(0,0,0,0.28)"/>' +
      // Räder
      '<circle cx="38" cy="78" r="18" fill="#1f1f1f"/><circle cx="38" cy="78" r="10" fill="#4a4a4a"/><circle cx="38" cy="78" r="3.5" fill="#aaa"/>' +
      '<circle cx="58" cy="80" r="15" fill="#151515"/><circle cx="58" cy="80" r="8" fill="#3a3a3a"/>' +
      '<circle cx="122" cy="78" r="18" fill="#1f1f1f"/><circle cx="122" cy="78" r="10" fill="#4a4a4a"/><circle cx="122" cy="78" r="3.5" fill="#aaa"/>' +
      '<circle cx="104" cy="80" r="15" fill="#151515"/><circle cx="104" cy="80" r="8" fill="#3a3a3a"/>' +
      // Körper
      '<path d="M22 70 C20 42 28 28 48 24 L70 20 L88 18 C108 16 124 24 134 38 L146 52 L148 68 L140 74 L30 74 Z" fill="' +
      c +
      '" stroke="#120505" stroke-width="2.5"/>' +
      // Kniemulde
      '<path d="M28 40 C36 30 48 28 58 32 L52 48 C42 46 32 50 28 58 Z" fill="rgba(0,0,0,0.25)"/>' +
      // Sitz
      '<ellipse cx="68" cy="40" rx="20" ry="11" fill="rgba(0,0,0,0.22)"/>' +
      // Frontplatte hell
      '<path d="M128 36 L146 52 L146 66 L128 58 Z" fill="rgba(255,255,255,0.15)"/>' +
      // GROSSE Augen (Markenzeichen)
      '<ellipse cx="136" cy="48" rx="11" ry="13" fill="#fff" stroke="#111" stroke-width="2"/>' +
      '<ellipse cx="148" cy="50" rx="9" ry="11" fill="#fff" stroke="#111" stroke-width="2"/>' +
      '<circle cx="138" cy="50" r="5.5" fill="#111"/><circle cx="149.5" cy="52" r="4.5" fill="#111"/>' +
      '<circle cx="140" cy="47.5" r="1.8" fill="#fff"/><circle cx="151" cy="49.5" r="1.4" fill="#fff"/>' +
      // Lächeln
      '<path d="M132 64 Q144 72 154 64" fill="none" stroke="#111" stroke-width="2.4" stroke-linecap="round"/>' +
      // Lenkrad weiß + rote Hupe
      '<ellipse cx="92" cy="26" rx="14" ry="6.5" fill="#f2f2f2" stroke="#222" stroke-width="2" transform="rotate(-20 92 26)"/>' +
      '<circle cx="92" cy="24" r="6" fill="' +
      c +
      '" stroke="#111" stroke-width="1.5"/>' +
      '<circle cx="92" cy="24" r="2.5" fill="#fff"/>' +
      // Schriftzug
      '<text x="70" y="62" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-size="9" fill="#fff" letter-spacing="1">BOBBY-CAR</text>' +
      // Nummer
      '<rect x="48" y="42" width="26" height="16" rx="3" fill="#fff" stroke="#111" stroke-width="2"/>' +
      '<text x="61" y="55" text-anchor="middle" font-family="Impact, Arial Black, sans-serif" font-size="14" fill="#111">' +
      num +
      "</text>" +
      // Kupplungen
      '<rect x="14" y="62" width="10" height="6" rx="2" fill="#e8e8e8" stroke="#333" stroke-width="1.2"/>' +
      '<rect x="140" y="62" width="10" height="6" rx="2" fill="#e8e8e8" stroke="#333" stroke-width="1.2"/>' +
      "</svg>"
    );
  }

  function ligaPanel(liga, drivers, ceiling) {
    var hide = active !== "all" && active !== liga.id ? " hidden" : "";
    return (
      '<section class="liga-panel ' +
      liga.id +
      '"' +
      hide +
      ' data-liga="' +
      liga.id +
      '">' +
      '<div class="liga-title">' +
      "<h2>" +
      liga.n +
      ". " +
      liga.title +
      "</h2>" +
      '<span class="meta">' +
      liga.slots +
      " Bahn" +
      (liga.slots > 1 ? "en" : "") +
      "</span>" +
      "</div>" +
      '<div class="bar-board">' +
      '<div class="bar-labels"><span>START · Mi 23.09.</span><span class="ziel">ZIEL · 30.09.</span></div>' +
      '<div class="bar-lanes">' +
      lanesForLiga(liga, drivers, ceiling) +
      "</div></div></section>"
    );
  }

  var lastLeaderKey = "";
  var lastInsSignature = "";
  var lastOrder = [];
  var pendingBoost = [];
  var trophyShownThisSession = false;

  function showToast(msg, kind) {
    var t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.remove("is-hidden", "toast-overtake", "toast-lead");
    if (kind) t.classList.add(kind);
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(function () {
      t.classList.add("is-hidden");
      t.classList.remove("toast-overtake", "toast-lead");
    }, kind === "toast-overtake" ? 4200 : 3200);
  }

  function renderComment() {
    var el = document.getElementById("adminComment");
    if (!el) return;
    var meta = PW.loadMeta();
    if (meta.comment) {
      el.hidden = false;
      el.innerHTML =
        '<span class="comment-label">Admin</span> ' +
        PW.esc(meta.comment) +
        (meta.commentDate ? ' <small>(' + PW.esc(meta.commentDate) + ")</small>" : "");
    } else {
      el.hidden = true;
      el.innerHTML = "";
    }
  }

  function syncMuteBtn() {
    var btn = document.getElementById("muteBtn");
    if (!btn) return;
    var on = !PW.isMuted();
    btn.textContent = on ? "🔊 Sound an" : "🔇 Sound aus";
    btn.setAttribute("aria-pressed", on ? "false" : "true");
  }

  function syncPackSelect() {
    var sel = document.getElementById("soundPack");
    if (!sel) return;
    sel.value = PW.getSoundPack();
  }

  function leagueLabel(num) {
    if (num === 1) return "HIGH PERFORMERS";
    if (num === 2) return "RISING STARS";
    if (num === 3) return "CHALLENGERS";
    return "Team";
  }

  function currentOrder(drivers) {
    return PW.sorted(drivers).map(function (d) {
      return Number(d.number);
    });
  }

  /** Wer ist in der Gesamtwertung nach vorne gesprungen? */
  function findOvertakes(drivers) {
    var order = currentOrder(drivers);
    var events = [];
    if (!lastOrder.length) {
      lastOrder = order.slice();
      return events;
    }
    for (var i = 0; i < order.length; i++) {
      var num = order[i];
      var oldIdx = lastOrder.indexOf(num);
      if (oldIdx < 0 || oldIdx <= i) continue;
      // nach vorne: den bisher vor ihm stehenden überholt
      var passed = lastOrder[i];
      if (passed && passed !== num) {
        events.push({
          winner: num,
          passed: passed,
          gain: oldIdx - i
        });
      }
    }
    lastOrder = order.slice();
    // stärkster Sprung zuerst
    events.sort(function (a, b) {
      return b.gain - a.gain;
    });
    return events;
  }

  function flashBoost(nums) {
    nums.forEach(function (n) {
      var car = document.querySelector('.bar-car[data-num="' + n + '"]');
      if (!car) return;
      car.classList.remove("is-boost");
      void car.offsetWidth;
      car.classList.add("is-boost");
      var row = car.closest(".bar-row");
      if (row) {
        row.classList.remove("is-overtake");
        void row.offsetWidth;
        row.classList.add("is-overtake");
      }
    });
    clearTimeout(flashBoost._timer);
    flashBoost._timer = setTimeout(function () {
      var boosted = document.querySelectorAll(".bar-car.is-boost");
      for (var i = 0; i < boosted.length; i++) boosted[i].classList.remove("is-boost");
      var rows = document.querySelectorAll(".bar-row.is-overtake");
      for (var j = 0; j < rows.length; j++) rows[j].classList.remove("is-overtake");
    }, 1800);
  }

  function detectJubel(drivers) {
    var scored = PW.sorted(drivers).filter(function (d) {
      return (Number(d.ins) || 0) > 0;
    });
    var sig = drivers
      .map(function (d) {
        return d.number + ":" + d.ins;
      })
      .join("|");
    var leaderKey = scored.length ? scored[0].number + ":" + Math.round(scored[0].ins) : "";
    var overtakes = findOvertakes(drivers);
    var changed = lastInsSignature && sig !== lastInsSignature;

    if (changed && overtakes.length) {
      var top = overtakes[0];
      showToast(
        "⚡ " +
          leagueLabel(top.winner) +
          " überholt " +
          leagueLabel(top.passed) +
          "!",
        "toast-overtake"
      );
      if (window.PWFX) PWFX.overtake();
      pendingBoost = overtakes.map(function (o) {
        return o.winner;
      });
    } else if (changed) {
      if (window.PWFX) PWFX.horn();
      if (leaderKey && leaderKey !== lastLeaderKey && scored.length) {
        var label = leagueLabel(Number(scored[0].number));
        showToast("🎉 " + label + " führt mit " + Math.round(scored[0].ins) + " INS!", "toast-lead");
        if (window.PWFX) setTimeout(function () { PWFX.cheer(); }, 120);
      }
    }

    lastInsSignature = sig;
    lastLeaderKey = leaderKey;
  }

  function openTrophy(force) {
    if (!PW.challengeEnded() && !force) return;
    var drivers = PW.sorted(PW.load()).filter(function (d) {
      return (Number(d.ins) || 0) > 0;
    });
    var overlay = document.getElementById("trophyOverlay");
    var nameEl = document.getElementById("trophyName");
    var scoreEl = document.getElementById("trophyScore");
    var subEl = document.getElementById("trophySub");
    var trophyBtn = document.getElementById("trophyBtn");
    if (trophyBtn) trophyBtn.hidden = false;

    if (!drivers.length) {
      nameEl.textContent = "Noch kein Champion";
      scoreEl.textContent = "";
      subEl.textContent = "Sobald INS eingetragen sind, steht der Pokal-Gewinner fest.";
    } else {
      var a = drivers[0];
      var b = drivers[1];
      nameEl.textContent = leagueLabel(Number(a.number));
      scoreEl.textContent = Math.round(a.ins) + " INS · Bobby Car " + a.number;
      subEl.textContent = b
        ? "Platz 2: " + leagueLabel(Number(b.number)) + " mit " + Math.round(b.ins) + " INS"
        : "Unglaubliche Leistung!";
    }
    overlay.classList.remove("is-hidden");
    if (window.PWFX) {
      PWFX.fanfare();
      PWFX.confetti(document.getElementById("confettiCanvas"), 5500);
    }
  }

  function closeTrophy() {
    document.getElementById("trophyOverlay").classList.add("is-hidden");
  }

  function rankingBoard(liga, ranking) {
    var list = (ranking && ranking[liga.id]) || [];
    var rows;
    if (!list.length) {
      rows = '<li class="empty-rank">Noch keine Einträge heute</li>';
    } else {
      rows = list
        .map(function (r) {
          var streak = PW.getStreak(r.name, liga.id);
          var streakHtml =
            streak >= 2
              ? '<span class="streak-badge" title="Tage in Folge Platz 1">🔥 ' + streak + "er</span>"
              : "";
          return (
            '<li class="rank-row place-' +
            r.place +
            '">' +
            '<span class="rank-place">' +
            r.place +
            ".</span>" +
            '<span class="avatar" style="background:' +
            PW.avatarColor(r.name) +
            '">' +
            PW.esc(PW.initials(r.name)) +
            "</span>" +
            '<span class="rank-main">' +
            '<span class="rank-name">' +
            PW.esc(r.name || "—") +
            "</span>" +
            streakHtml +
            "</span>" +
            '<span class="rank-ins">' +
            Math.round(r.ins) +
            " INS</span></li>"
          );
        })
        .join("");
    }
    return (
      '<div class="day-board ' +
      liga.id +
      '">' +
      "<h3>" +
      liga.n +
      ". " +
      liga.title +
      "</h3>" +
      '<p class="day-sub">' +
      (PW.isRosterLocked && PW.isRosterLocked() ? "Teilnehmer · INS heute" : "Beste INS heute") +
      "</p>" +
      "<ol>" +
      rows +
      "</ol></div>"
    );
  }

  function paint() {
    var drivers = PW.load();
    var ranking = PW.rankingForDisplay ? PW.rankingForDisplay(PW.loadRanking()) : PW.loadRanking();
    var ceiling = PW.maxIns(drivers);
    renderChampion(drivers);
    renderComment();
    detectJubel(drivers);

    document.getElementById("boardLeft").innerHTML = rankingBoard(PW.LIGAS.challengers, ranking);
    document.getElementById("boardRight").innerHTML =
      rankingBoard(PW.LIGAS.rising, ranking) + rankingBoard(PW.LIGAS.high, ranking);

    document.getElementById("arena").innerHTML = [PW.LIGAS.high, PW.LIGAS.rising, PW.LIGAS.challengers]
      .map(function (l) {
        return ligaPanel(l, drivers, ceiling);
      })
      .join("");

    // Boost-Animation nach DOM-Rebuild
    if (pendingBoost.length) {
      var nums = pendingBoost.slice();
      pendingBoost = [];
      requestAnimationFrame(function () {
        flashBoost(nums);
      });
    }

    var trophyBtn = document.getElementById("trophyBtn");
    if (trophyBtn) trophyBtn.hidden = !PW.challengeEnded();
    if (PW.challengeEnded() && !trophyShownThisSession) {
      trophyShownThisSession = true;
      setTimeout(function () {
        openTrophy(false);
      }, 600);
    }
  }

  document.getElementById("ligaNav").addEventListener("click", function (e) {
    var btn = e.target.closest(".liga-btn");
    if (!btn) return;
    active = btn.getAttribute("data-liga");
    var buttons = document.querySelectorAll(".liga-btn");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].classList.toggle("active", buttons[i] === btn);
    }
    paint();
  });

  document.getElementById("muteBtn").addEventListener("click", function () {
    PW.setMuted(!PW.isMuted());
    syncMuteBtn();
    if (!PW.isMuted() && window.PWFX) {
      PWFX.audio();
      PWFX.horn();
    }
  });

  document.getElementById("soundPack").addEventListener("change", function (e) {
    PW.setSoundPack(e.target.value);
    syncPackSelect();
    if (!PW.isMuted() && window.PWFX) {
      PWFX.audio();
      PWFX.horn();
    }
  });

  document.getElementById("trophyBtn").addEventListener("click", function () {
    openTrophy(true);
  });
  document.getElementById("trophyClose").addEventListener("click", closeTrophy);

  syncMuteBtn();
  syncPackSelect();
  renderCountdown();
  setInterval(renderCountdown, 1000);
  paint();
  if (PW.pullRemote) {
    PW.pullRemote().then(function () {
      paint();
    });
  }
  window.addEventListener("storage", function (e) {
    if (
      e.key === PW.STORAGE ||
      e.key === PW.RANKING_KEY ||
      e.key === PW.META_KEY ||
      e.key === "pw-rennchallenge-ping"
    ) {
      paint();
    }
  });
  window.addEventListener("focus", paint);
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) paint();
  });
  // Live-Polling alle 4s (Server-Stand + Admin-Änderungen)
  setInterval(function () {
    if (PW.pullRemote) {
      PW.pullRemote().then(function () {
        paint();
      });
    } else {
      paint();
    }
  }, 4000);
})();
