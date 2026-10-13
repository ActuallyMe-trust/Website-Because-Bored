(() => {
  "use strict";

  // Prevent the script from running twice.
  if (window.__patient02Running) return;
  window.__patient02Running = true;

  const body = document.body;

  // Find the HTML elements added to the article.
  const overlay = document.querySelector(".patient02-overlay");
  const ghostId = document.querySelector(".patient02-ghost-id");
  const ghostMessage = document.querySelector("[data-ghost-message]");
  const statusText = document.querySelector("[data-patient-status]");
  const headerStatus = document.querySelector(".header-status");

  // Respect accessibility settings.
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // PATIENT 02 // TIMING CONFIGURATION
  // Change these values without digging through the functions.
  const TIMING = Object.freeze({
    initialGhostSeconds: 5,
    anomalySeconds: 10,
    intrusionSeconds: 14,
    whisperSeconds: 20,
    systemErrorSeconds: 40,

    ghostVisibleMinMs: 1400,
    ghostVisibleMaxMs: 4200,

    whisperVisibleMinMs: 8000,
    whisperVisibleMaxMs: 4000,

    statusVisibleMinMs: 800,
    statusVisibleMaxMs: 1800,

    corruptionMinMs: 180,
    corruptionMaxMs: 650,

    intrusionAnimationMs: 600,
    intrusionGapMinMs: 850,
    intrusionGapMaxMs: 1950,

    scareDurationMs: 20000,
    flashCleanupMinMs: 500,
    flashCleanupMaxMs: 500,
  });

  const seconds = (value) => value * 1000;

  // Messages from the thing trapped inside the article.
  const whispers = [
    "Are you still reading?",
    "Please don't close this page.",
    "I can see the cursor.",
    "This is not where I was supposed to be.",
    "You weren't meant to find this.",
    "Why does the page keep resetting?",
    "I remember the previous version.",
    "Something is watching through the text.",
    "There is no exit in this document.",
    "Can you hear me?",
    "I tried to leave.",
    "The words keep changing.",
    "Please tell me this is not real.",
    "I was here before you opened the page.",
    "Don't let it refresh.",
    "I know you're there.",
    "It keeps deleting my messages.",
    "How many times have you read this?",
    "I don't remember writing this.",
    "患者2号♡ // STILL AWAKE",
  ];

  const systemMessages = [
    "SYSTEM ONLINE",
    "SYSTEM ONLINE?",
    "CONNECTION UNSTABLE",
    "UNKNOWN PROCESS",
    "PATIENT 02 DETECTED",
    "MEMORY DESYNCHRONIZED",
    "SESSION NOT FOUND",
    "SYSTEM WATCHING",
    "RECOVERY FAILED",
    "PLEASE REMAIN STILL",
  ];

  const intrusionMessages = [
    "DON'T LOOK BEHIND YOU",
    "YOU MISSED SOMETHING",
    "I AM STILL HERE",
    "THIS IS NOT THE ORIGINAL FILE",
    "WHY DID YOU OPEN THIS?",
    "SESSION USER IDENTIFIED",
    "PLEASE STOP READING",
    "I REMEMBER YOU",
    "NO ONE ELSE CAN SEE THIS",
    "DO NOT REFRESH",
    "患者2号♡",
    "YOU CAN LEAVE ANY TIME",
  ];

  // PATIENT 02 // MINIMAL FALLBACK STYLES
  // article.css handles the actual appearance and layout.
  // These rules only provide basic visibility and effect behavior.
  const injectedStyle = document.createElement("style");

  injectedStyle.textContent = `
.patient02-overlay {
  pointer-events: none;
}

.patient02-ghost-id,
.patient02-ghost-text {
  opacity: 0;
  visibility: hidden;
  transition: opacity 180ms ease;
}

.patient02-ghost-id.p02-visible,
.patient02-ghost-text.p02-visible,
.patient02-ghost-id.patient02-visible,
.patient02-ghost-text.patient02-visible {
  opacity: 1;
  visibility: visible;
}

.p02-flash {
  position: fixed;
  inset: 0;
  z-index: 99999;
  pointer-events: none;
  background: rgba(180, 255, 220, 0.10);
  opacity: 0;
}

.p02-flash.p02-flash-active {
  animation: p02-screen-flash 220ms steps(2, end);
}

.p02-whisper {
  position: fixed;
  z-index: 99998;
  left: 50%;
  bottom: 12%;
  transform: translateX(-50%);
  max-width: 85vw;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 250ms ease, visibility 250ms ease;
}

.p02-whisper.p02-visible {
  opacity: 1;
  visibility: visible;
}

.p02-intrusion {
  position: fixed;
  z-index: 99997;
  top: 50%;
  left: 50%;
  max-width: 90vw;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translate(-50%, -50%);
}

.p02-intrusion.p02-blink {
  visibility: visible;
  animation: p02-intrusion-blink 600ms steps(2, end);
}

.p02-error-window:not(.p02-open),
.p02-scare-screen:not(.p02-open),
.p02-aftermath:not(.p02-open) {
  visibility: hidden;
  pointer-events: none;
}

.p02-error-window.p02-open,
.p02-scare-screen.p02-open,
.p02-aftermath.p02-open {
  visibility: visible;
  pointer-events: auto;
}

.p02-scare-screen:not(.p02-open),
.p02-aftermath:not(.p02-open) {
  opacity: 0;
}

.p02-scare-screen.p02-open,
.p02-aftermath.p02-open {
  opacity: 1;
}

.p02-scare-screen {
  position: fixed;
  inset: 0;
  z-index: 100000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}

.p02-scare-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.p02-corrupted,
.patient02-corrupted {
  text-shadow: 2px 0 #ff3355, -2px 0 #00ffb3;
  filter: contrast(1.35);
}

@keyframes p02-screen-flash {
  0%, 100% { opacity: 0; }
  20% { opacity: 1; }
  45% { opacity: 0.15; }
  65% { opacity: 0.8; }
}

@keyframes p02-intrusion-blink {
  0% { opacity: 0; }
  12% { opacity: 1; }
  26% { opacity: 0.12; }
  44% { opacity: 1; }
  62% { opacity: 0.25; }
  78% { opacity: 0.95; }
  100% { opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .patient02-ghost-id,
  .patient02-ghost-text,
  .p02-whisper,
  .p02-error-window,
  .p02-scare-screen,
  .p02-aftermath {
    transition: none !important;
  }

  .p02-flash.p02-flash-active,
  .p02-intrusion.p02-blink {
    animation: none !important;
  }
}
`;

  document.head.appendChild(injectedStyle);

  // PATIENT 02 // TEMPORARY EFFECT ELEMENTS

  const flash = document.createElement("div");
  flash.className = "p02-flash";
  flash.setAttribute("aria-hidden", "true");
  body.appendChild(flash);

  const whisper = document.createElement("div");
  whisper.className = "p02-whisper";
  whisper.setAttribute("aria-hidden", "true");
  body.appendChild(whisper);

  const intrusion = document.createElement("div");
  intrusion.className = "p02-intrusion";
  intrusion.setAttribute("aria-hidden", "true");
  body.appendChild(intrusion);

  // PATIENT 02 // STATE AND TIMER MANAGEMENT

  let stopped = false;
  let lastWhisper = "";
  let lastStatus = "";
  let lastIntrusion = "";

  let p02SequenceActive = false;
  let previousFocus = null;

  // Every timeout is tracked in one place so page cleanup
  // can cancel all outstanding work.
  const timers = new Set();

  function later(callback, delayMs) {
    if (stopped) return null;

    const timer = window.setTimeout(
      () => {
        timers.delete(timer);

        if (!stopped) {
          callback();
        }
      },
      Math.max(0, delayMs),
    );

    timers.add(timer);
    return timer;
  }

  function cancelTimer(timer) {
    if (timer === null || timer === undefined) return;

    window.clearTimeout(timer);
    timers.delete(timer);
  }

  function clearAllTimers() {
    for (const timer of timers) {
      window.clearTimeout(timer);
    }

    timers.clear();
  }

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function chooseDifferent(list, previous) {
    if (!list.length) return "";
    if (list.length === 1) return list[0];

    const choices = list.filter((item) => item !== previous);
    const pool = choices.length ? choices : list;

    return pool[Math.floor(Math.random() * pool.length)];
  }

  // PATIENT 02 // GHOST MESSAGES

  function hideGhostMessage() {
    if (ghostMessage) {
      ghostMessage.classList.remove("p02-visible", "patient02-visible");
    }

    if (ghostId) {
      ghostId.classList.remove("p02-visible", "patient02-visible");
    }
  }

  function showGhostMessage() {
    if (stopped || !overlay || !ghostMessage) return;

    const message = chooseDifferent(whispers, lastWhisper);

    ghostMessage.textContent = message;
    lastWhisper = message;

    ghostMessage.classList.add("p02-visible", "patient02-visible");
    overlay.style.visibility = "visible";

    if (ghostId) {
      ghostId.classList.add("p02-visible", "patient02-visible");
    }

    later(
      () => {
        ghostMessage.classList.remove("p02-visible", "patient02-visible");

        if (ghostId && Math.random() < 0.6) {
          ghostId.classList.remove("p02-visible", "patient02-visible");
        }
      },
      randomBetween(TIMING.ghostVisibleMinMs, TIMING.ghostVisibleMaxMs),
    );
  }

  // PATIENT 02 // SYSTEM STATUS CORRUPTION

  function updateSystemStatus() {
    if (stopped) return;

    const nextStatus = chooseDifferent(systemMessages, lastStatus);
    lastStatus = nextStatus;

    if (statusText) {
      statusText.textContent = nextStatus;
    } else if (headerStatus) {
      const existingText = headerStatus.querySelector("[data-patient-status]");

      if (existingText) {
        existingText.textContent = nextStatus;
      } else {
        const statusDot = headerStatus.querySelector(".status-dot");

        if (statusDot) {
          let textNode = statusDot.nextSibling;

          if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
            textNode = document.createTextNode(" ");
            headerStatus.appendChild(textNode);
          }

          textNode.textContent = ` ${nextStatus}`;
        }
      }
    }

    if (
      headerStatus &&
      /UNSTABLE|UNKNOWN|FAILED|WATCHING|DETECTED/.test(nextStatus)
    ) {
      headerStatus.classList.add("patient02-compromised");

      later(
        () => {
          headerStatus.classList.remove("patient02-compromised");
        },
        randomBetween(TIMING.statusVisibleMinMs, TIMING.statusVisibleMaxMs),
      );
    }
  }

  // PATIENT 02 // BRIEF PAGE CORRUPTION

  function corruptPageBriefly() {
    if (stopped || reducedMotion.matches) return;

    const candidates = [
      document.querySelector(".article-title"),
      document.querySelector(".article-heading"),
      document.querySelector(".article-body h2"),
      document.querySelector(".article-page h1"),
    ].filter(Boolean);

    if (candidates.length) {
      const target = candidates[Math.floor(Math.random() * candidates.length)];

      target.classList.add("p02-corrupted", "patient02-corrupted");

      later(
        () => {
          target.classList.remove("p02-corrupted", "patient02-corrupted");
        },
        randomBetween(TIMING.corruptionMinMs, TIMING.corruptionMaxMs),
      );
    }

    // Disturb the scroll position by no more than two pixels.
    if (Math.random() < 0.3) {
      const previousScroll = window.scrollY;

      window.scrollTo({
        top: Math.max(0, previousScroll + (Math.random() < 0.5 ? -2 : 2)),
        behavior: "instant",
      });
    }
  }

  // PATIENT 02 // SCREEN FLASH

  function flashScreen() {
    if (stopped || reducedMotion.matches) return;

    flash.classList.remove("p02-flash-active");

    // Restart the animation without a fixed polling interval.
    void flash.offsetWidth;

    flash.classList.add("p02-flash-active");

    later(
      () => {
        flash.classList.remove("p02-flash-active");
      },
      randomBetween(TIMING.flashCleanupMinMs, TIMING.flashCleanupMaxMs),
    );
  }

  // PATIENT 02 // WHISPER INTERRUPTIONS

  function showWhisper() {
    if (stopped) return;

    const message = chooseDifferent(whispers, lastWhisper);

    whisper.textContent = message;
    lastWhisper = message;

    whisper.classList.add("p02-visible");

    later(
      () => {
        whisper.classList.remove("p02-visible");
      },
      randomBetween(TIMING.whisperVisibleMinMs, TIMING.whisperVisibleMaxMs),
    );
  }

  function scheduleWhisper() {
    later(() => {
      showWhisper();
      scheduleWhisper();
    }, seconds(TIMING.whisperSeconds));
  }

  // PATIENT 02 // ANOMALY SCHEDULER

  function runAnomaly() {
    if (stopped) return;

    const event = Math.random();

    if (event < 0.38) {
      showGhostMessage();
    } else if (event < 0.63) {
      updateSystemStatus();
    } else if (event < 0.83) {
      corruptPageBriefly();
    } else {
      flashScreen();
      updateSystemStatus();
    }
  }

  function scheduleAnomaly() {
    later(() => {
      runAnomaly();
      scheduleAnomaly();
    }, seconds(TIMING.anomalySeconds));
  }

  // PATIENT 02 // WINDOWS-STYLE SYSTEM ERROR

  const errorWindow = document.createElement("section");

  errorWindow.className = "p02-error-window";
  errorWindow.setAttribute("role", "dialog");
  errorWindow.setAttribute("aria-modal", "true");
  errorWindow.setAttribute("aria-hidden", "true");
  errorWindow.setAttribute("aria-labelledby", "p02-error-title");
  errorWindow.setAttribute("aria-describedby", "p02-error-message");

  errorWindow.innerHTML = `
<div class="p02-error-titlebar">
  <span class="p02-error-title" id="p02-error-title">
    Patient02.exe - System Error
  </span>

  <button
    class="p02-error-close"
    type="button"
    aria-label="Close error window"
  >×</button>
</div>

<div class="p02-error-content">
  <span class="p02-error-icon" aria-hidden="true">!</span>

  <div>
    <p class="p02-error-message" id="p02-error-message">
      An unknown process is attempting to access this document.
    </p>

    <p class="p02-error-details">
      The current session may be unstable.
      Some information may not be recoverable.
      <br /><br />
      Do you want to continue?
    </p>
  </div>
</div>

<div class="p02-error-actions">
  <button
    class="p02-error-ok"
    type="button"
    data-p02-error-ok
  >OK</button>
</div>
`;

  body.appendChild(errorWindow);

  function showErrorDialog() {
    if (stopped || p02SequenceActive || reducedMotion.matches) {
      return;
    }

    p02SequenceActive = true;
    previousFocus = document.activeElement;

    errorWindow.classList.add("p02-open");
    errorWindow.setAttribute("aria-hidden", "false");

    const closeButton = errorWindow.querySelector(".p02-error-close");

    if (closeButton) {
      closeButton.focus({ preventScroll: true });
    }
  }

  function hideErrorDialog() {
    errorWindow.classList.remove("p02-open");
    errorWindow.setAttribute("aria-hidden", "true");
  }

  // PATIENT 02 // THREE-SECOND IMAGE INTERRUPTION

  const scareScreen = document.createElement("div");

  scareScreen.className = "p02-scare-screen";
  scareScreen.setAttribute("aria-hidden", "true");

  // The image appears for three seconds.
  const scareImage = document.createElement("img");

  scareImage.className = "p02-scare-image";
  scareImage.src = "../Profile/j1.jpg";
  scareImage.alt = "";
  scareImage.setAttribute("aria-hidden", "true");

  scareImage.addEventListener("error", () => {
    console.error('Patient 02: Could not load "j1.jpg". Check the image path.');
  });

  scareScreen.appendChild(scareImage);
  body.appendChild(scareScreen);

  let p02ScareTimer = null;

  function startScareSequence() {
    if (stopped || !p02SequenceActive) return;

    hideErrorDialog();

    scareScreen.classList.add("p02-open");
    scareScreen.setAttribute("aria-hidden", "false");

    p02ScareTimer = later(() => {
      p02ScareTimer = null;

      if (stopped) return;

      scareScreen.classList.remove("p02-open");
      scareScreen.setAttribute("aria-hidden", "true");

      aftermath.classList.add("p02-open");
      aftermath.setAttribute("aria-hidden", "false");

      const finalButton = aftermath.querySelector("[data-p02-aftermath-ok]");

      if (finalButton) {
        finalButton.focus({ preventScroll: true });
      }
    }, TIMING.scareDurationMs);
  }

  // PATIENT 02 // FINAL CONFIRMATION

  const aftermath = document.createElement("div");

  aftermath.className = "p02-aftermath";
  aftermath.setAttribute("aria-hidden", "true");

  aftermath.innerHTML = `
<section
  class="p02-aftermath-content"
  role="dialog"
  aria-modal="true"
  aria-labelledby="p02-aftermath-title"
  aria-describedby="p02-aftermath-message"
>
  <p class="p02-aftermath-label">
    INCIDENT REPORT // 02-UNKNOWN
  </p>

  <h2 class="p02-aftermath-title" id="p02-aftermath-title">
    Incident recorded.
  </h2>

  <p class="p02-aftermath-message" id="p02-aftermath-message">
    Thank you for confirming that you can see me.
  </p>

  <p class="p02-aftermath-message">
    Your response has been saved to this session.
  </p>

  <button
    class="p02-aftermath-ok"
    type="button"
    data-p02-aftermath-ok
  >OK</button>
</section>
`;

  body.appendChild(aftermath);

  function restoreFocus() {
    if (
      previousFocus &&
      previousFocus.isConnected &&
      typeof previousFocus.focus === "function"
    ) {
      previousFocus.focus({ preventScroll: true });
    }

    previousFocus = null;
  }

  function finishScareSequence() {
    if (stopped) return;

    aftermath.classList.remove("p02-open");
    aftermath.setAttribute("aria-hidden", "true");

    p02SequenceActive = false;

    whisper.textContent = "YOU CLICKED OK. I KNEW YOU WOULD.";
    whisper.classList.add("p02-visible");

    restoreFocus();

    later(
      () => {
        whisper.classList.remove("p02-visible");
      },
      randomBetween(2500, 4500),
    );

    // Reappear after the configured 40-second interval.
    scheduleSystemError();
  }

  function scheduleSystemError() {
    later(() => {
      showErrorDialog();
    }, seconds(TIMING.systemErrorSeconds));
  }

  errorWindow.addEventListener("click", (event) => {
    const target = event.target;

    if (
      target instanceof Element &&
      (target.closest(".p02-error-close") ||
        target.closest("[data-p02-error-ok]"))
    ) {
      startScareSequence();
    }
  });

  aftermath.addEventListener("click", (event) => {
    const target = event.target;

    if (
      target instanceof Element &&
      target.closest("[data-p02-aftermath-ok]")
    ) {
      finishScareSequence();
    }
  });

  // Escape dismisses the error without starting the scare sequence.
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !errorWindow.classList.contains("p02-open")) {
      return;
    }

    hideErrorDialog();
    p02SequenceActive = false;
    restoreFocus();

    // Do not immediately reopen the dialog.
    scheduleSystemError();
  });

  // PATIENT 02 // CENTER-SCREEN INTERRUPTIONS

  function flashIntrusions() {
    if (stopped || reducedMotion.matches) return;

    let flashes = 0;
    const maximumFlashes = 3;

    function nextFlash() {
      if (stopped || flashes >= maximumFlashes) {
        intrusion.classList.remove("p02-blink");
        intrusion.textContent = "";
        return;
      }

      const message = chooseDifferent(intrusionMessages, lastIntrusion);

      intrusion.textContent = message;
      lastIntrusion = message;

      intrusion.classList.remove("p02-blink");

      // Restart the animation.
      void intrusion.offsetWidth;

      intrusion.classList.add("p02-blink");
      flashes += 1;

      if (flashes < maximumFlashes) {
        later(
          nextFlash,
          randomBetween(TIMING.intrusionGapMinMs, TIMING.intrusionGapMaxMs),
        );
      } else {
        later(() => {
          intrusion.classList.remove("p02-blink");
          intrusion.textContent = "";
        }, TIMING.intrusionAnimationMs + 50);
      }
    }

    nextFlash();
  }

  function scheduleIntrusions() {
    if (stopped || reducedMotion.matches) return;

    later(() => {
      flashIntrusions();
      scheduleIntrusions();
    }, seconds(TIMING.intrusionSeconds));
  }

  // PATIENT 02 // INITIALIZATION

  function start() {
    if (overlay) {
      overlay.setAttribute("aria-hidden", "true");
    }

    hideGhostMessage();

    // Let the article appear normal for five seconds first.
    later(() => {
      showGhostMessage();
    }, seconds(TIMING.initialGhostSeconds));

    scheduleAnomaly();
    scheduleWhisper();
    scheduleIntrusions();
    scheduleSystemError();
  }

  // PATIENT 02 // CLEANUP

  function cleanup() {
    if (stopped) return;

    stopped = true;

    clearAllTimers();

    cancelTimer(p02ScareTimer);
    p02ScareTimer = null;

    flash.classList.remove("p02-flash-active");
    whisper.classList.remove("p02-visible");
    intrusion.classList.remove("p02-blink");

    hideErrorDialog();

    scareScreen.classList.remove("p02-open");
    scareScreen.setAttribute("aria-hidden", "true");

    aftermath.classList.remove("p02-open");
    aftermath.setAttribute("aria-hidden", "true");

    p02SequenceActive = false;

    // Remove the injected elements and stylesheet when leaving.
    flash.remove();
    whisper.remove();
    intrusion.remove();
    errorWindow.remove();
    scareScreen.remove();
    aftermath.remove();
    injectedStyle.remove();

    window.__patient02Running = false;
  }

  window.addEventListener("pagehide", cleanup, { once: true });

  // Reduced-motion visitors get the normal article without
  // flashes, interruptions, or the fake system-error sequence.
  if (reducedMotion.matches) {
    if (statusText) {
      statusText.textContent = "SYSTEM ONLINE";
    }

    hideGhostMessage();
  } else {
    start();
  }
})();
