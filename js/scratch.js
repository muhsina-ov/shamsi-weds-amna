/**
 * KAMRAN & DR. AMNA - SCRATCH & REVEAL ENGINE
 * Interactive HTML5 Canvas Gold Foil Scratch-off
 */

(function () {
  'use strict';

  var canvas = document.getElementById('scratchCanvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  var container = document.querySelector('.scratch-container');
  var revealBtn = document.getElementById('btnRevealInstant');
  var progressText = document.getElementById('scratchProgressText');
  var celebrationWrap = document.getElementById('scratchCelebration');

  var isDrawing = false;
  var isRevealed = false;
  var lastX = null;
  var lastY = null;
  var brushRadius = 26;

  // Load gold foil texture
  var foilImg = new Image();
  foilImg.src = 'images/gold_foil_texture.jpg';

  function initCanvas() {
    var rect = container.getBoundingClientRect();
    // Use device pixel ratio for crisp rendering on retina/mobile screens
    var dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.scale(dpr, dpr);

    drawFoilCover(rect.width, rect.height);
  }

  function drawFoilCover(w, h) {
    if (foilImg.complete && foilImg.naturalWidth !== 0) {
      // Draw pattern or scaled foil image
      ctx.save();
      ctx.drawImage(foilImg, 0, 0, w, h);
      
      // Add luxurious gold shimmer overlay
      var grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, 'rgba(255, 235, 170, 0.45)');
      grad.addColorStop(0.3, 'rgba(180, 130, 40, 0.2)');
      grad.addColorStop(0.6, 'rgba(255, 245, 200, 0.55)');
      grad.addColorStop(1, 'rgba(150, 100, 30, 0.35)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Gold ornate border inside
      ctx.strokeStyle = 'rgba(255, 240, 190, 0.85)';
      ctx.lineWidth = 3;
      ctx.strokeRect(12, 12, w - 24, h - 24);

      ctx.strokeStyle = 'rgba(160, 115, 30, 0.7)';
      ctx.lineWidth = 1;
      ctx.strokeRect(16, 16, w - 32, h - 32);

      // Embossed call to action text
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      ctx.font = '700 13px "Cinzel", Georgia, serif';
      ctx.fillStyle = 'rgba(50, 30, 10, 0.85)';
      ctx.shadowColor = 'rgba(255, 245, 200, 0.9)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.letterSpacing = '3px';
      ctx.fillText('✨ ROYAL RECEPTION DATE ✨', w / 2, h / 2 - 16);

      ctx.font = '600 11px "Outfit", sans-serif';
      ctx.fillStyle = 'rgba(70, 45, 15, 0.9)';
      ctx.shadowBlur = 2;
      ctx.fillText('SCRATCH WITH FINGER OR MOUSE TO REVEAL', w / 2, h / 2 + 14);

      ctx.restore();
    } else {
      // Fallback golden gradient
      var fallbackGrad = ctx.createLinearGradient(0, 0, w, h);
      fallbackGrad.addColorStop(0, '#D4AF37');
      fallbackGrad.addColorStop(0.5, '#FBF5B7');
      fallbackGrad.addColorStop(1, '#AA771C');
      ctx.fillStyle = fallbackGrad;
      ctx.fillRect(0, 0, w, h);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillStyle = '#3A200A';
      ctx.fillText('✨ SCRATCH TO REVEAL DATE ✨', w / 2, h / 2);
    }
  }

  foilImg.onload = function () {
    if (!isRevealed) {
      var rect = container.getBoundingClientRect();
      drawFoilCover(rect.width, rect.height);
    }
  };

  function getCoords(e) {
    var rect = canvas.getBoundingClientRect();
    var clientX = e.clientX;
    var clientY = e.clientY;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function scratch(x, y) {
    if (isRevealed) return;

    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, brushRadius, 0, Math.PI * 2);
    ctx.fill();

    // Smooth bridge between last point and current
    if (lastX !== null && lastY !== null) {
      ctx.lineWidth = brushRadius * 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    ctx.restore();

    lastX = x;
    lastY = y;

    createSparkle(x, y);
  }

  function createSparkle(x, y) {
    var rect = canvas.getBoundingClientRect();
    var sparkle = document.createElement('div');
    sparkle.className = 'scratch-sparkle';
    sparkle.style.cssText = [
      'position: absolute;',
      'left: ' + (x + (Math.random() * 20 - 10)) + 'px;',
      'top: ' + (y + (Math.random() * 20 - 10)) + 'px;',
      'width: ' + (Math.random() * 6 + 4) + 'px;',
      'height: ' + (Math.random() * 6 + 4) + 'px;',
      'background: radial-gradient(circle, #FFF, #FFD700);',
      'border-radius: 50%;',
      'pointer-events: none;',
      'z-index: 10;',
      'box-shadow: 0 0 8px #FFD700;',
      'animation: sparkleFade 0.7s ease-out forwards;'
    ].join('');

    container.appendChild(sparkle);
    setTimeout(function () {
      if (sparkle.parentNode) sparkle.parentNode.removeChild(sparkle);
    }, 700);
  }

  function checkProgress() {
    if (isRevealed) return;

    var rect = canvas.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    var w = Math.floor(rect.width * dpr);
    var h = Math.floor(rect.height * dpr);

    // Sample pixels across a 30x20 grid to be super fast on mobile
    var sampleCols = 30;
    var sampleRows = 20;
    var stepX = Math.floor(w / sampleCols);
    var stepY = Math.floor(h / sampleRows);
    var totalSamples = sampleCols * sampleRows;
    var clearedSamples = 0;

    try {
      var imgData = ctx.getImageData(0, 0, w, h);
      var data = imgData.data;

      for (var r = 0; r < sampleRows; r++) {
        for (var c = 0; c < sampleCols; c++) {
          var pixelX = c * stepX + Math.floor(stepX / 2);
          var pixelY = r * stepY + Math.floor(stepY / 2);
          var index = (pixelY * w + pixelX) * 4 + 3; // Alpha channel
          if (data[index] < 128) {
            clearedSamples++;
          }
        }
      }

      var percent = Math.round((clearedSamples / totalSamples) * 100);
      if (progressText) {
        progressText.textContent = percent + '% Uncovered';
      }

      // If more than 35% scratched, trigger full reveal
      if (percent >= 35) {
        revealFullDate();
      }
    } catch (err) {
      // In case of CORS or canvas security edge cases
      // fallback smoothly
    }
  }

  function revealFullDate() {
    if (isRevealed) return;
    isRevealed = true;

    canvas.style.opacity = '0';
    setTimeout(function () {
      canvas.style.display = 'none';
    }, 800);

    if (progressText) {
      progressText.textContent = '✨ Revealed with Love ✨';
      progressText.style.color = '#8C6D2D';
      progressText.style.fontWeight = '700';
    }

    if (revealBtn) {
      revealBtn.style.display = 'none';
    }

    triggerCelebrationConfetti();
  }

  function triggerCelebrationConfetti() {
    var colors = ['#D4AF37', '#FFDF73', '#FFFFFF', '#C5A059', '#E6CA65'];
    var count = 50;

    for (var i = 0; i < count; i++) {
      (function (index) {
        setTimeout(function () {
          var piece = document.createElement('div');
          var color = colors[Math.floor(Math.random() * colors.length)];
          var size = Math.random() * 8 + 6;
          var left = Math.random() * 100;
          var duration = Math.random() * 1.5 + 1.2;

          piece.style.cssText = [
            'position: absolute;',
            'left: ' + left + '%;',
            'top: 40%;',
            'width: ' + size + 'px;',
            'height: ' + (size * (Math.random() > 0.5 ? 1 : 1.6)) + 'px;',
            'background: ' + color + ';',
            'border-radius: ' + (Math.random() > 0.5 ? '50%' : '2px') + ';',
            'box-shadow: 0 0 6px ' + color + ';',
            'transform: rotate(' + (Math.random() * 360) + 'deg);',
            'pointer-events: none;',
            'z-index: 20;',
            'animation: confettiDrop ' + duration + 's ease-out forwards;'
          ].join('');

          celebrationWrap.appendChild(piece);
          setTimeout(function () {
            if (piece.parentNode) piece.parentNode.removeChild(piece);
          }, duration * 1000);
        }, index * 20);
      })(i);
    }
  }

  // Event Listeners for Scratch Interaction
  canvas.addEventListener('mousedown', function (e) {
    isDrawing = true;
    var c = getCoords(e);
    scratch(c.x, c.y);
  });

  window.addEventListener('mousemove', function (e) {
    if (!isDrawing) return;
    var c = getCoords(e);
    scratch(c.x, c.y);
  });

  window.addEventListener('mouseup', function () {
    if (isDrawing) {
      isDrawing = false;
      lastX = null;
      lastY = null;
      checkProgress();
    }
  });

  // Touch support with touch-action prevention
  canvas.addEventListener('touchstart', function (e) {
    e.preventDefault();
    isDrawing = true;
    var c = getCoords(e);
    scratch(c.x, c.y);
  }, { passive: false });

  canvas.addEventListener('touchmove', function (e) {
    e.preventDefault();
    if (!isDrawing) return;
    var c = getCoords(e);
    scratch(c.x, c.y);
  }, { passive: false });

  canvas.addEventListener('touchend', function () {
    isDrawing = false;
    lastX = null;
    lastY = null;
    checkProgress();
  });

  if (revealBtn) {
    revealBtn.addEventListener('click', function () {
      revealFullDate();
    });
  }

  // Setup on page load & resize
  window.addEventListener('DOMContentLoaded', initCanvas);
  window.addEventListener('resize', function () {
    if (!isRevealed) {
      initCanvas();
    }
  });

  // Inject sparkle & confetti animation keyframes
  var style = document.createElement('style');
  style.innerHTML = [
    '@keyframes sparkleFade {',
    '  0% { opacity: 1; transform: scale(1); }',
    '  100% { opacity: 0; transform: scale(2.2); }',
    '}',
    '@keyframes confettiDrop {',
    '  0% { opacity: 1; transform: translateY(0) rotate(0deg) scale(1); }',
    '  100% { opacity: 0; transform: translateY(' + (window.innerHeight > 600 ? 180 : 120) + 'px) rotate(420deg) scale(0.6); }',
    '}'
  ].join('\n');
  document.head.appendChild(style);

})();
