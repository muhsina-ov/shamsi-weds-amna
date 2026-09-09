/**
 * KAMRAN & DR. AMNA - SKY LANTERN & CANDLE BLESSING ENGINE
 * Interactive Floating Sky Lanterns & Blessings System
 */

(function () {
  'use strict';

  var canvas = document.getElementById('lanternCanvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  var form = document.getElementById('blessingForm');
  var nameInput = document.getElementById('guestName');
  var messageInput = document.getElementById('guestBlessing');
  var counterEl = document.getElementById('blessingsCount');
  var wallList = document.getElementById('blessingsWallList');
  var duaChips = document.querySelectorAll('.dua-chip');

  var lanterns = [];
  var stars = [];
  var particles = [];
  var animationFrameId = null;

  // LocalStorage keys
  var STORAGE_KEY_BLESSINGS = 'kamran_amna_blessings_v1';
  var STORAGE_KEY_COUNT = 'kamran_amna_blessings_count_v1';

  // Preset default blessings to warm up the feed
  var defaultBlessings = [
    {
      name: 'Farhan & Family',
      text: 'Barakallahu lakuma wa baraka alaikuma wa jama\'a bainakuma fee khair. Wishing Kamran & Dr. Amna endless love! 🤲✨',
      time: 'Just now'
    },
    {
      name: 'Zeeshan Shamsi',
      text: 'Heartiest congratulations to my dearest brother Kamran and bhabhi Dr. Amna! May your journey together be blessed. 🏮💫',
      time: '15 mins ago'
    },
    {
      name: 'Uncle Tariq & Aunt Yasmin',
      text: 'May Allah SWT bestow infinite happiness, peace, and mutual respect upon your beautiful marriage.',
      time: '1 hour ago'
    }
  ];

  function getStoredBlessings() {
    try {
      var data = localStorage.getItem(STORAGE_KEY_BLESSINGS);
      return data ? JSON.parse(data) : defaultBlessings;
    } catch (e) {
      return defaultBlessings;
    }
  }

  function getStoredCount() {
    try {
      var c = localStorage.getItem(STORAGE_KEY_COUNT);
      return c ? parseInt(c, 10) : 158;
    } catch (e) {
      return 158;
    }
  }

  function updateCounter(count) {
    if (counterEl) {
      counterEl.textContent = count;
    }
  }

  function renderBlessingItem(blessing, prepend) {
    if (!wallList) return;
    var item = document.createElement('div');
    item.className = 'blessing-card-item';
    item.innerHTML = [
      '<div class="blessing-author">',
      '  <span class="blessing-author-name">' + escapeHtml(blessing.name) + '</span>',
      '  <span class="blessing-time">' + escapeHtml(blessing.time) + '</span>',
      '</div>',
      '<p class="blessing-text">"' + escapeHtml(blessing.text) + '"</p>'
    ].join('');

    if (prepend && wallList.firstChild) {
      wallList.insertBefore(item, wallList.firstChild);
    } else {
      wallList.appendChild(item);
    }
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function initBlessingsWall() {
    if (!wallList) return;
    wallList.innerHTML = '';
    var list = getStoredBlessings();
    list.forEach(function (b) {
      renderBlessingItem(b, false);
    });
    updateCounter(getStoredCount());
  }

  // Handle Quick Dua pills click
  if (duaChips.length > 0) {
    duaChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        duaChips.forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
        if (messageInput) {
          messageInput.value = chip.getAttribute('data-text') || chip.textContent.trim();
        }
      });
    });
  }

  // Synthesize Gentle Spiritual Chime (Web Audio API)
  function playCelestialChime() {
    try {
      var AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      var ctx = new AudioContext();
      
      var now = ctx.currentTime;
      var freqs = [523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
      
      freqs.forEach(function (freq, i) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);

        gain.gain.setValueAtTime(0, now + i * 0.12);
        gain.gain.linearRampToValueAtTime(0.08, now + i * 0.12 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 1.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 1.7);
      });
    } catch (e) {
      // AudioContext policy fallback
    }
  }

  // Canvas Physics & Render Loop
  function resizeCanvas() {
    var rect = canvas.parentElement.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.scale(dpr, dpr);

    initStars(rect.width, rect.height);
  }

  function initStars(w, h) {
    stars = [];
    var count = Math.floor(w * 0.08);
    for (var i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * (h * 0.7),
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.03 + 0.01
      });
    }

    // Spawn 6 initial ambient background lanterns
    if (lanterns.length === 0) {
      for (var j = 0; j < 6; j++) {
        spawnAmbientLantern(w, h);
      }
    }
  }

  function spawnAmbientLantern(w, h) {
    lanterns.push({
      x: Math.random() * (w - 60) + 30,
      y: Math.random() * h,
      width: Math.random() * 14 + 16,
      height: Math.random() * 20 + 24,
      speedY: Math.random() * 0.35 + 0.2,
      swayOffset: Math.random() * Math.PI * 2,
      swaySpeed: Math.random() * 0.02 + 0.01,
      swayAmount: Math.random() * 18 + 10,
      opacity: Math.random() * 0.4 + 0.4,
      isUserLantern: false,
      text: ''
    });
  }

  function spawnUserLantern(authorName) {
    var rect = canvas.getBoundingClientRect();
    var w = rect.width;
    var h = rect.height;

    // Launch from near center bottom
    var startX = w / 2 + (Math.random() * 60 - 30);
    var startY = h - 60;

    lanterns.push({
      x: startX,
      y: startY,
      width: 44,
      height: 60,
      speedY: 1.1,
      swayOffset: 0,
      swaySpeed: 0.035,
      swayAmount: 22,
      opacity: 1,
      isUserLantern: true,
      text: authorName.substring(0, 16)
    });
  }

  function createSparks(x, y) {
    for (var i = 0; i < 3; i++) {
      particles.push({
        x: x + (Math.random() * 12 - 6),
        y: y + 20,
        vx: (Math.random() - 0.5) * 0.8,
        vy: Math.random() * 0.8 + 0.5,
        radius: Math.random() * 1.8 + 0.8,
        alpha: 1,
        life: 0
      });
    }
  }

  function drawLantern(l, time) {
    var currentX = l.x + Math.sin(time * l.swaySpeed + l.swayOffset) * l.swayAmount;
    var currentY = l.y;

    ctx.save();
    ctx.globalAlpha = l.opacity;

    // Outer warm light aura
    var glowRadius = l.width * (l.isUserLantern ? 2.5 : 1.6);
    var glowGrad = ctx.createRadialGradient(currentX, currentY, 2, currentX, currentY, glowRadius);
    glowGrad.addColorStop(0, 'rgba(255, 215, 100, 0.7)');
    glowGrad.addColorStop(0.4, 'rgba(255, 160, 40, 0.35)');
    glowGrad.addColorStop(1, 'rgba(255, 140, 20, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(currentX, currentY, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    // Lantern Paper Body (Trapezoid / rounded hot-air lantern)
    var halfW = l.width / 2;
    var halfH = l.height / 2;
    var topW = halfW * 0.82;
    var btmW = halfW * 0.65;

    ctx.beginPath();
    ctx.moveTo(currentX - topW, currentY - halfH);
    ctx.quadraticCurveTo(currentX - halfW * 1.15, currentY, currentX - btmW, currentY + halfH);
    ctx.lineTo(currentX + btmW, currentY + halfH);
    ctx.quadraticCurveTo(currentX + halfW * 1.15, currentY, currentX + topW, currentY - halfH);
    ctx.closePath();

    // Body Gradient
    var bodyGrad = ctx.createLinearGradient(currentX, currentY - halfH, currentX, currentY + halfH);
    bodyGrad.addColorStop(0, '#FFE899');
    bodyGrad.addColorStop(0.6, '#FFAA33');
    bodyGrad.addColorStop(1, '#FF7700');
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // Delicate golden ribbing
    ctx.strokeStyle = 'rgba(255, 240, 180, 0.65)';
    ctx.lineWidth = l.isUserLantern ? 1.5 : 1;
    ctx.stroke();

    // Inner Flame Core
    var flameFlicker = (Math.sin(time * 0.15 + l.swayOffset) * 0.2 + 0.8);
    var flameGrad = ctx.createRadialGradient(currentX, currentY + halfH * 0.5, 1, currentX, currentY + halfH * 0.5, halfW * 0.5 * flameFlicker);
    flameGrad.addColorStop(0, '#FFFFFF');
    flameGrad.addColorStop(0.5, '#FFEE77');
    flameGrad.addColorStop(1, 'rgba(255, 120, 0, 0)');
    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.arc(currentX, currentY + halfH * 0.5, halfW * 0.5 * flameFlicker, 0, Math.PI * 2);
    ctx.fill();

    // If User Lantern: Display Guest Name
    if (l.isUserLantern && l.text) {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '700 9px "Outfit", sans-serif';
      ctx.fillStyle = 'rgba(40, 20, 5, 0.9)';
      ctx.fillText(l.text, currentX, currentY - 2);
    }

    ctx.restore();

    // Emit trailing spark dust
    if (l.isUserLantern && Math.random() > 0.4) {
      createSparks(currentX, currentY + halfH);
    }
  }

  function loop(timestamp) {
    var rect = canvas.getBoundingClientRect();
    var w = rect.width;
    var h = rect.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Draw Twinkling Stars
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      s.alpha += Math.sin(timestamp * s.twinkleSpeed) * 0.02;
      s.alpha = Math.max(0.15, Math.min(0.9, s.alpha));

      ctx.fillStyle = 'rgba(255, 245, 210, ' + s.alpha + ')';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Draw & Update Particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.alpha -= 0.025;
      pt.life += 1;

      if (pt.alpha <= 0) {
        particles.splice(p, 1);
        continue;
      }

      ctx.fillStyle = 'rgba(255, 220, 120, ' + pt.alpha + ')';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Draw & Update Lanterns
    for (var l = lanterns.length - 1; l >= 0; l--) {
      var lantern = lanterns[l];
      lantern.y -= lantern.speedY;

      // Slow down user lantern as it ascends into the heavens
      if (lantern.isUserLantern && lantern.y < h * 0.4) {
        lantern.speedY = Math.max(0.4, lantern.speedY * 0.995);
        lantern.opacity = Math.max(0.2, lantern.y / (h * 0.4));
      }

      drawLantern(lantern, timestamp * 0.001);

      // Remove or recycle if off-screen top
      if (lantern.y < -80) {
        if (lantern.isUserLantern) {
          lanterns.splice(l, 1);
        } else {
          // Recycle ambient lantern
          lantern.y = h + 20;
          lantern.x = Math.random() * (w - 60) + 30;
        }
      }
    }

    animationFrameId = requestAnimationFrame(loop);
  }

  // Handle Form Submission
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = (nameInput && nameInput.value.trim()) || 'Well-wisher';
      var text = (messageInput && messageInput.value.trim()) || 'Barakallahu lakuma! Wishing you both a lifetime of happiness and blessings. 🤲✨';

      // 1. Play celestial chime
      playCelestialChime();

      // 2. Spawn personalized flying lantern
      spawnUserLantern(name);

      // 3. Increment counter
      var newCount = getStoredCount() + 1;
      localStorage.setItem(STORAGE_KEY_COUNT, newCount.toString());
      updateCounter(newCount);

      // 4. Save to list
      var newBlessing = {
        name: name,
        text: text,
        time: 'Just now'
      };

      var list = getStoredBlessings();
      list.unshift(newBlessing);
      if (list.length > 50) list.pop(); // Keep manageable
      try {
        localStorage.setItem(STORAGE_KEY_BLESSINGS, JSON.stringify(list));
      } catch (err) {}

      renderBlessingItem(newBlessing, true);

      // 5. Reset inputs & show brief success feedback
      var submitBtn = form.querySelector('.btn-release-lantern');
      var originalText = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.innerHTML = '✨ Lantern Released Into Heavens! ✨';
        submitBtn.style.background = 'linear-gradient(135deg, #FFE082, #FFD54F)';
        setTimeout(function () {
          submitBtn.innerHTML = originalText;
          submitBtn.style.background = '';
        }, 3000);
      }

      if (messageInput) messageInput.value = '';
    });
  }

  // Window Listeners
  window.addEventListener('DOMContentLoaded', function () {
    resizeCanvas();
    initBlessingsWall();
    animationFrameId = requestAnimationFrame(loop);
  });

  window.addEventListener('resize', function () {
    resizeCanvas();
  });

})();
