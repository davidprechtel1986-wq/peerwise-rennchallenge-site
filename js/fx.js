/* Sound + Konfetti für PEERWISE Challenge */
window.PWFX = (function () {
  var ctx = null;

  function audio() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function beep(freq, dur, type, gain, when) {
    var a = audio();
    if (!a) return;
    var o = a.createOscillator();
    var g = a.createGain();
    o.type = type || "square";
    o.frequency.value = freq;
    g.gain.value = gain || 0.08;
    o.connect(g);
    g.connect(a.destination);
    var t = a.currentTime + (when || 0);
    g.gain.setValueAtTime(gain || 0.08, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  function muted() {
    return window.PW && PW.isMuted && PW.isMuted();
  }

  function pack() {
    return (window.PW && PW.getSoundPack && PW.getSoundPack()) || "stadion";
  }

  function horn() {
    if (muted()) return;
    var p = pack();
    if (p === "quiet") {
      beep(392, 0.07, "sine", 0.018, 0);
      return;
    }
    if (p === "arcade") {
      beep(660, 0.07, "square", 0.055, 0);
      beep(880, 0.09, "square", 0.05, 0.07);
      beep(1175, 0.11, "square", 0.045, 0.15);
      return;
    }
    // Stadion
    beep(420, 0.12, "square", 0.07, 0);
    beep(520, 0.14, "square", 0.06, 0.1);
    beep(640, 0.18, "triangle", 0.05, 0.2);
  }

  function cheer() {
    if (muted()) return;
    var p = pack();
    if (p === "quiet") {
      beep(523, 0.1, "sine", 0.02, 0);
      beep(659, 0.12, "sine", 0.018, 0.1);
      return;
    }
    if (p === "arcade") {
      var notes = [523, 659, 784, 988, 784, 988, 1175];
      for (var n = 0; n < notes.length; n++) {
        beep(notes[n], 0.07, "square", 0.04, n * 0.055);
      }
      return;
    }
    horn();
    for (var i = 0; i < 8; i++) {
      beep(300 + Math.random() * 500, 0.08 + Math.random() * 0.1, "sawtooth", 0.025, 0.15 + i * 0.05);
    }
  }

  function fanfare() {
    if (muted()) return;
    var p = pack();
    if (p === "quiet") {
      beep(523, 0.18, "sine", 0.025, 0);
      beep(659, 0.2, "sine", 0.022, 0.18);
      beep(784, 0.28, "sine", 0.02, 0.36);
      return;
    }
    if (p === "arcade") {
      var arc = [392, 523, 659, 784, 1046, 784, 1046];
      for (var i = 0; i < arc.length; i++) {
        beep(arc[i], 0.1, "square", 0.06, i * 0.09);
      }
      setTimeout(cheer, 650);
      return;
    }
    var notes = [523, 659, 784, 1046];
    for (var j = 0; j < notes.length; j++) {
      beep(notes[j], 0.22, "triangle", 0.09, j * 0.16);
    }
    setTimeout(cheer, 700);
  }

  /** Überhol-Moment — kraftvoller als normale Hupe */
  function overtake() {
    if (muted()) return;
    var p = pack();
    if (p === "quiet") {
      beep(587, 0.09, "sine", 0.022, 0);
      beep(740, 0.12, "sine", 0.02, 0.1);
      return;
    }
    if (p === "arcade") {
      beep(200, 0.05, "sawtooth", 0.04, 0);
      beep(800, 0.06, "square", 0.055, 0.05);
      beep(1200, 0.08, "square", 0.05, 0.11);
      beep(1600, 0.1, "square", 0.04, 0.18);
      beep(2000, 0.05, "square", 0.03, 0.28);
      return;
    }
    // Stadion: Anlauf + Jubel
    beep(180, 0.1, "sawtooth", 0.045, 0);
    beep(280, 0.1, "sawtooth", 0.04, 0.08);
    beep(480, 0.12, "square", 0.07, 0.16);
    beep(620, 0.14, "square", 0.06, 0.26);
    beep(780, 0.16, "triangle", 0.055, 0.38);
    for (var i = 0; i < 6; i++) {
      beep(400 + Math.random() * 450, 0.07, "sawtooth", 0.03, 0.5 + i * 0.04);
    }
  }

  function confetti(canvas, ms) {
    if (!canvas) return;
    var c = canvas.getContext("2d");
    var w = (canvas.width = window.innerWidth);
    var h = (canvas.height = window.innerHeight);
    var colors = ["#ff4fd8", "#ffd24a", "#5ce1ff", "#c9a0ff", "#3ddc97", "#ff7a3d"];
    var parts = [];
    for (var i = 0; i < 140; i++) {
      parts.push({
        x: Math.random() * w,
        y: Math.random() * -h,
        r: 4 + Math.random() * 6,
        c: colors[(Math.random() * colors.length) | 0],
        vy: 2 + Math.random() * 5,
        vx: -2 + Math.random() * 4,
        rot: Math.random() * 360
      });
    }
    var start = Date.now();
    function frame() {
      var elapsed = Date.now() - start;
      c.clearRect(0, 0, w, h);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.x += p.vx;
        p.y += p.vy;
        p.rot += 4;
        if (p.y > h + 20) p.y = -10;
        c.save();
        c.translate(p.x, p.y);
        c.rotate((p.rot * Math.PI) / 180);
        c.fillStyle = p.c;
        c.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
        c.restore();
      }
      if (elapsed < (ms || 5000)) requestAnimationFrame(frame);
      else c.clearRect(0, 0, w, h);
    }
    requestAnimationFrame(frame);
  }

  return {
    horn: horn,
    cheer: cheer,
    fanfare: fanfare,
    overtake: overtake,
    confetti: confetti,
    audio: audio
  };
})();
