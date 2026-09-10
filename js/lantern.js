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
    updateCounter(getStoredCount());
    if (!wallList) return;
    wallList.innerHTML = '';
    var list = getStoredBlessings();
    list.forEach(function (b) {
      renderBlessingItem(b, false);
    });
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

  function spawnUserLantern() {
    var rect = canvas.getBoundingClientRect();
    var w = rect.width;
    var h = rect.height;

    // Launch from below the bottom edge (comes from bottom to top)
    var startX = Math.random() * (w * 0.7) + (w * 0.15);
    var startY = h + 60;

    var lanternSize = Math.random() * 10 + 48; // ~48px to 58px

    lanterns.push({
      x: startX,
      y: startY,
      width: lanternSize,
      height: lanternSize * 1.36,
      speedY: Math.random() * 0.4 + 2.1, // Smooth ascending speed from bottom to top
      swayOffset: Math.random() * Math.PI * 2,
      swaySpeed: Math.random() * 0.02 + 0.02,
      swayAmount: Math.random() * 18 + 14,
      opacity: 1,
      isUserLantern: true,
      text: 'K & A'
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

    // Shadow underneath for definition against light background
    ctx.shadowColor = 'rgba(90, 45, 10, 0.28)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;

    // Body Gradient - Warm luminous amber/gold
    var bodyGrad = ctx.createLinearGradient(currentX, currentY - halfH, currentX, currentY + halfH);
    bodyGrad.addColorStop(0, '#FFE082');
    bodyGrad.addColorStop(0.5, '#FFA000');
    bodyGrad.addColorStop(1, '#E65100');
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Delicate warm bronze ribbing
    ctx.strokeStyle = 'rgba(140, 60, 0, 0.65)';
    ctx.lineWidth = l.isUserLantern ? 1.6 : 1.1;
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

      ctx.fillStyle = 'rgba(184, 134, 11, ' + (s.alpha * 0.38) + ')';
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

      ctx.fillStyle = 'rgba(215, 120, 20, ' + pt.alpha + ')';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Draw & Update Lanterns
    for (var l = lanterns.length - 1; l >= 0; l--) {
      var lantern = lanterns[l];
      lantern.y -= lantern.speedY;

      // User lantern glides smoothly from bottom to top of the sky
      if (lantern.isUserLantern && lantern.y < h * 0.2) {
        lantern.opacity = Math.max(0.15, lantern.y / (h * 0.2));
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

    // Handle Lantern Button Click (1-click to release lantern coming from bottom to top)
  var releaseBtn = document.getElementById('btnReleaseLantern') || document.querySelector('.btn-release-lantern-glow') || document.querySelector('.btn-release-lantern');
  if (releaseBtn) {
    releaseBtn.addEventListener('click', function (e) {
      e.preventDefault();

      // 1. Play celestial harmonic chime
      playCelestialChime();

      // 2. Spawn glowing sky lantern rising from bottom to top
      spawnUserLantern();

      // 3. Increment counter
      var newCount = getStoredCount() + 1;
      localStorage.setItem(STORAGE_KEY_COUNT, newCount.toString());
      updateCounter(newCount);

      // 4. Instant visual confirmation on button
      var btnText = releaseBtn.querySelector('.btn-lantern-text');
      if (btnText) {
        var originalText = btnText.textContent;
        btnText.textContent = '✨ Lantern Ascending! 🕊️';
        releaseBtn.style.transform = 'scale(0.96)';
        setTimeout(function () {
          btnText.textContent = originalText;
          releaseBtn.style.transform = '';
        }, 1800);
      }
    });
  }

  // Also tap anywhere on sky canvas to launch extra lanterns
  if (canvas) {
    canvas.style.pointerEvents = 'auto';
    canvas.style.cursor = 'pointer';
    canvas.addEventListener('click', function (e) {
      playCelestialChime();
      spawnUserLantern();
      var newCount = getStoredCount() + 1;
      localStorage.setItem(STORAGE_KEY_COUNT, newCount.toString());
      updateCounter(newCount);
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
