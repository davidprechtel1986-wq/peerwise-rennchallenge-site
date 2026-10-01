(function () {
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function fmt(v) {
    if (v == null || v === "") return '<span class="miss">–</span>';
    var n = Math.round(Number(v) || 0);
    if (n === 0) return '<span class="zero">0</span>';
    return String(n);
  }

  function render(data) {
    var note = document.getElementById("wochenNote");
    var head = document.getElementById("wochenHead");
    var body = document.getElementById("wochenBody");
    var teams = document.getElementById("teamTotals");
    if (!data) {
      if (note) note.textContent = "Keine History-Daten gefunden.";
      return;
    }

    if (note) note.textContent = data.note || "";

    var tt = data.teamTotals || {};
    if (teams) {
      teams.innerHTML =
        '<div class="wochen-team high"><strong>1. HIGH PERFORMERS</strong><span>' +
        Math.round(tt.high || 0) +
        " INS Gesamt</span></div>" +
        '<div class="wochen-team rising"><strong>2. RISING STARS</strong><span>' +
        Math.round(tt.rising || 0) +
        " INS Gesamt</span></div>" +
        '<div class="wochen-team challengers"><strong>3. CHALLENGERS</strong><span>' +
        Math.round(tt.challengers || 0) +
        " INS Gesamt</span></div>";
    }

    var labels = data.dateLabels || data.dates || [];
    var th =
      "<tr><th>Name</th>" +
      labels
        .map(function (l) {
          return "<th>" + esc(l) + "</th>";
        })
        .join("") +
      '<th class="total">Endergebnis</th></tr>';
    head.innerHTML = th;

    var rows = "";
    var lastLeague = null;
    (data.people || []).forEach(function (p) {
      if (p.league !== lastLeague) {
        lastLeague = p.league;
        rows +=
          '<tr class="league-head"><td colspan="' +
          (labels.length + 2) +
          '">' +
          esc(p.leagueTitle || p.league) +
          "</td></tr>";
      }
      rows +=
        "<tr><td>" +
        esc(p.name) +
        "</td>" +
        (p.daily || [])
          .map(function (v) {
            return "<td>" + fmt(v) + "</td>";
          })
          .join("") +
        '<td class="total">' +
        Math.round(p.total || 0) +
        "</td></tr>";
    });
    body.innerHTML = rows;
  }

  fetch("data/history.json?v=" + Date.now(), { cache: "no-store" })
    .then(function (r) {
      if (!r.ok) throw new Error("load");
      return r.json();
    })
    .then(render)
    .catch(function () {
      render(null);
    });
})();
