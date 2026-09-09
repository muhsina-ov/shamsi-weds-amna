/**
 * KAMRAN & DR. AMNA - MAIN APPLICATION CONTROLLER
 * Royal Envelope Opening, Audio Controller, Countdown, Ambient Effects & Scroll Animations
 */

(function () {
  'use strict';

  // Elements
  var envelopeOverlay = document.getElementById('envelopeOverlay');
  var envelopeCard = document.getElementById('envelopeCard');
  var audio = document.getElementById('weddingAudio');
  var musicBtn = document.getElementById('musicBtn');
  var ambientCanvas = document.getElementById('ambientCanvas');

  var isAudioPlaying = false;
  var envelopeOpened = false;

  /* --------------------------------------------------------------------------
     1. ENVELOPE TAP-TO-OPEN & AUDIO START
     -------------------------------------------------------------------------- */
  function openEnvelope() {
    if (envelopeOpened) return;
    envelopeOpened = true;

    // Start background music (user interaction satisfies mobile browser audio policy)
    if (audio) {
      audio.volume = 0.85;
      var playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(function () {
          isAudioPlaying = true;
          updateMusicButtonState(true);
        }).catch(function (error) {
          console.log('Audio autoplay prevented:', error);
          isAudioPlaying = false;
          updateMusicButtonState(false);
        });
      }
    }

    // Unseal animation
    if (envelopeOverlay) {
      envelopeOverlay.classList.add('opened');
      setTimeout(function () {
        envelopeOverlay.style.display = 'none';
      }, 1200);
    }

    // Reveal music button
    if (musicBtn) {
      musicBtn.style.display = 'flex';
    }
  }

  if (envelopeCard) {
    envelopeCard.addEventListener('click', openEnvelope);
    envelopeCard.addEventListener('touchend', function (e) {
      e.preventDefault();
      openEnvelope();
    });
  }

  /* --------------------------------------------------------------------------
     2. FLOATING AUDIO TOGGLE
     -------------------------------------------------------------------------- */
  function updateMusicButtonState(playing) {
    if (!musicBtn) return;
    if (playing) {
      musicBtn.classList.remove('paused');
      musicBtn.classList.add('playing');
      musicBtn.setAttribute('title', 'Pause Music');
    } else {
      musicBtn.classList.remove('playing');
      musicBtn.classList.add('paused');
      musicBtn.setAttribute('title', 'Play Music');
    }
  }

  if (musicBtn && audio) {
    musicBtn.addEventListener('click', function () {
      if (audio.paused) {
        audio.play().then(function () {
          isAudioPlaying = true;
          updateMusicButtonState(true);
        });
      } else {
        audio.pause();
        isAudioPlaying = false;
        updateMusicButtonState(false);
      }
    });
  }

  /* --------------------------------------------------------------------------
     3. LIVE COUNTDOWN TIMER TO 29 OCTOBER 2026, 7:30 PM IST
     -------------------------------------------------------------------------- */
  var daysEl = document.getElementById('countdownDays');
  var hoursEl = document.getElementById('countdownHours');
  var minsEl = document.getElementById('countdownMins');
  var secsEl = document.getElementById('countdownSecs');

  // Reception Date: October 29, 2026 19:30:00 IST (UTC+5:30)
  var targetDate = new Date('2026-10-29T19:30:00+05:30').getTime();

  function updateCountdown() {
    var now = new Date().getTime();
    var distance = targetDate - now;

    if (distance <= 0) {
      if (daysEl) daysEl.textContent = '00';
      if (hoursEl) hoursEl.textContent = '00';
      if (minsEl) minsEl.textContent = '00';
      if (secsEl) secsEl.textContent = '00';
      return;
    }

    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (daysEl) daysEl.textContent = days < 10 ? '0' + days : days;
    if (hoursEl) hoursEl.textContent = hours < 10 ? '0' + hours : hours;
    if (minsEl) minsEl.textContent = minutes < 10 ? '0' + minutes : minutes;
    if (secsEl) secsEl.textContent = seconds < 10 ? '0' + seconds : seconds;
  }

  setInterval(updateCountdown, 1000);
  updateCountdown();

  /* --------------------------------------------------------------------------
     4. ADD TO CALENDAR (GOOGLE CALENDAR & iCAL)
     -------------------------------------------------------------------------- */
  var googleCalBtn = document.getElementById('btnGoogleCal');
  var iCalBtn = document.getElementById('btnICal');

  var eventTitle = 'Wedding Reception of Kamran Shamsi & Dr. Amna Ubaid';
  var eventLocation = 'Ranchi Club, Main Road, Ranchi, Jharkhand';
  var eventDescription = 'Reception ceremony of Kamran Shamsi & Dr. Amna Ubaid. Commences at 7:30 PM followed by Dinner at Ranchi Club.';
  var startTimeUTC = '20261029T140000Z'; // 19:30 IST = 14:00 UTC
  var endTimeUTC = '20261029T180000Z';   // 23:30 IST = 18:00 UTC

  if (googleCalBtn) {
    var googleUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
      '&text=' + encodeURIComponent(eventTitle) +
      '&dates=' + startTimeUTC + '/' + endTimeUTC +
      '&details=' + encodeURIComponent(eventDescription) +
      '&location=' + encodeURIComponent(eventLocation);
    googleCalBtn.setAttribute('href', googleUrl);
    googleCalBtn.setAttribute('target', '_blank');
  }

  if (iCalBtn) {
    iCalBtn.addEventListener('click', function (e) {
      e.preventDefault();
      var icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//InviteStory//Kamran and Amna Wedding//EN',
        'BEGIN:VEVENT',
        'UID:' + new Date().getTime() + '@invitestory.in',
        'DTSTAMP:' + startTimeUTC,
        'DTSTART:' + startTimeUTC,
        'DTEND:' + endTimeUTC,
        'SUMMARY:' + eventTitle,
        'DESCRIPTION:' + eventDescription,
        'LOCATION:' + eventLocation,
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      var blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      var link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', 'Kamran-Amna-Wedding-Reception.ics');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  /* --------------------------------------------------------------------------
     5. AMBIENT FALLING ROSE PETALS & GOLD DUST EFFECT
     -------------------------------------------------------------------------- */
  function initAmbientPetals() {
    if (!ambientCanvas) return;
    var ctx = ambientCanvas.getContext('2d');
    var petals = [];
    var petalCount = 20;

    function resize() {
      ambientCanvas.width = window.innerWidth;
      ambientCanvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (var i = 0; i < petalCount; i++) {
      petals.push({
        x: Math.random() * ambientCanvas.width,
        y: Math.random() * ambientCanvas.height,
        size: Math.random() * 8 + 6,
        speedX: Math.random() * 0.8 - 0.2,
        speedY: Math.random() * 0.7 + 0.5,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 1.5,
        opacity: Math.random() * 0.45 + 0.25,
        isGold: Math.random() > 0.65
      });
    }

    function renderPetals() {
      ctx.clearRect(0, 0, ambientCanvas.width, ambientCanvas.height);

      for (var i = 0; i < petals.length; i++) {
        var p = petals[i];
        p.y += p.speedY;
        p.x += Math.sin(p.y * 0.01) * 0.6 + p.speedX;
        p.rotation += p.rotSpeed;

        if (p.y > ambientCanvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * ambientCanvas.width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;

        if (p.isGold) {
          // Gold dust sparkle particle
          ctx.fillStyle = '#E8C676';
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.35, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Soft ivory/cream rose petal shape
          ctx.fillStyle = '#FFF8EE';
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.quadraticCurveTo(p.size * 0.8, -p.size * 0.5, p.size * 0.6, p.size * 0.6);
          ctx.quadraticCurveTo(0, p.size, -p.size * 0.6, p.size * 0.6);
          ctx.quadraticCurveTo(-p.size * 0.8, -p.size * 0.5, 0, -p.size);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = 'rgba(212, 175, 55, 0.2)';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        ctx.restore();
      }

      requestAnimationFrame(renderPetals);
    }

    renderPetals();
  }

  /* --------------------------------------------------------------------------
     6. SCROLL REVEAL ANIMATIONS
     -------------------------------------------------------------------------- */
  function initScrollAnimations() {
    var elements = document.querySelectorAll('.fade-in-up');
    if (!('IntersectionObserver' in window)) {
      elements.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    elements.forEach(function (el) {
      observer.observe(el);
    });
  }

  // Setup on page load
  window.addEventListener('DOMContentLoaded', function () {
    initAmbientPetals();
    initScrollAnimations();
  });

})();
