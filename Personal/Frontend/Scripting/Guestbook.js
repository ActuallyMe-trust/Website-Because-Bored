let messages = [];

const WINDOWS_PER_PAGE = 7;

let currentPage = 0;

let highestZIndex = 10;

const messageField = document.getElementById("message-field");

const nextButton = document.getElementById("next-messages");

const messageRange = document.getElementById("message-range");

const windowCount = document.getElementById("window-count");

const nameInput = document.getElementById("visitor-name");

const messageInput = document.getElementById("visitor-message");

const submitButton = document.getElementById("submit-message");

const submitStatus = document.getElementById("submit-status");

async function loadMessages() {
  try {
    const response = await fetch("/api/comments");

    if (!response.ok) {
      throw new Error("Failed to load messages.");
    }

    messages = await response.json();

    currentPage = 0;

    displayMessages();
  } catch (error) {
    console.error("Guestbook error:", error);

    messageField.innerHTML = `
            <p>
                Unable to connect to the message service.
            </p>
        `;
  }
}

function displayMessages() {
  messageField.innerHTML = "";

  if (messages.length === 0) {
    messageRange.textContent = "BUFFER: 00—00 / 0";

    windowCount.textContent = `WINDOWS: 0 / ${WINDOWS_PER_PAGE}`;

    if (nextButton) {
      nextButton.disabled = true;
    }

    return;
  }

  const totalPages = Math.ceil(messages.length / WINDOWS_PER_PAGE);

  if (currentPage >= totalPages) {
    currentPage = 0;
  }

  const start = currentPage * WINDOWS_PER_PAGE;

  const end = start + WINDOWS_PER_PAGE;

  const currentMessages = messages.slice(start, end);

  currentMessages.forEach((message, index) => {
    const messageWindow = createMessageWindow(message, index);

    messageField.appendChild(messageWindow);
  });

  const visibleStart = start + 1;

  const visibleEnd = start + currentMessages.length;

  messageRange.textContent = `BUFFER: ${String(visibleStart).padStart(2, "0")}—${String(visibleEnd).padStart(2, "0")} / ${messages.length}`;

  windowCount.textContent = `WINDOWS: ${currentMessages.length} / ${WINDOWS_PER_PAGE}`;

  if (nextButton) {
    nextButton.disabled = totalPages <= 1;
  }
}

function createMessageWindow(message, index) {
  const window = document.createElement("article");

  window.classList.add("message-window");

  const windowColors = [
    "window-cyan",
    "window-cherry",
    "window-green",
    "window-purple",
  ];

  window.classList.add(windowColors[index % windowColors.length]);

  const offsetX = Math.random() * 55;

  const offsetY = Math.random() * 45;

  window.style.left = `${15 + offsetX}%`;

  window.style.top = `${10 + offsetY}%`;

  const rotation = Math.random() * 4 - 2;

  window.style.transform = `rotate(${rotation}deg)`;

  window.style.zIndex = highestZIndex++;

  window.innerHTML = `

        <div class="window-titlebar">

            <span>
                ⚠ ${getWindowTitle(index)}
            </span>

            <button
                type="button"
                class="window-close"
                aria-label="Close message">

                ×

            </button>

        </div>

        <div class="window-content">

            <div class="message-user">
                ${escapeHTML(message.name)}
            </div>

            <div class="message-body">
                ${escapeHTML(message.message)}
            </div>

            <div class="message-date">
                ${escapeHTML(message.date)}
            </div>

        </div>

    `;

  window.addEventListener("mousedown", () => {
    window.style.zIndex = highestZIndex++;
  });

  const closeButton = window.querySelector(".window-close");

  closeButton.addEventListener("click", (event) => {
    event.stopPropagation();

    window.remove();

    updateWindowCount();
  });

  makeDraggable(window);

  return window;
}

function getWindowTitle(index) {
  const titles = [
    "GUESTBOOK.EXE",
    "MESSAGE.EXE",
    "VISITOR_LOG.EXE",
    "SYSTEM_WARNING.EXE",
    "USER_REPORT.EXE",
    "UNKNOWN_PROCESS.EXE",
    "ERROR_0x0000.EXE",
  ];

  return titles[index % titles.length];
}

function makeDraggable(window) {
  const titlebar = window.querySelector(".window-titlebar");

  let dragging = false;

  let offsetX = 0;
  let offsetY = 0;

  let rotation = "";

  titlebar.addEventListener("mousedown", (event) => {
    if (event.target.closest(".window-close")) {
      return;
    }

    dragging = true;

    rotation = window.style.transform;

    window.style.transform = "none";

    const windowRect = window.getBoundingClientRect();

    const fieldRect = messageField.getBoundingClientRect();

    offsetX = event.clientX - windowRect.left;

    offsetY = event.clientY - windowRect.top;

    window.style.left = `${windowRect.left - fieldRect.left}px`;

    window.style.top = `${windowRect.top - fieldRect.top}px`;

    window.style.right = "auto";

    window.style.bottom = "auto";

    highestZIndex++;

    window.style.zIndex = highestZIndex;

    document.body.style.userSelect = "none";

    event.preventDefault();
  });

  document.addEventListener("mousemove", (event) => {
    if (!dragging) {
      return;
    }

    window.style.transform = "none";

    const fieldRect = messageField.getBoundingClientRect();

    const newLeft = event.clientX - fieldRect.left - offsetX;

    const newTop = event.clientY - fieldRect.top - offsetY;

    window.style.left = `${newLeft}px`;

    window.style.top = `${newTop}px`;

    window.style.transform = rotation;

    event.preventDefault();
  });

  document.addEventListener("mouseup", () => {
    if (!dragging) {
      return;
    }

    dragging = false;

    document.body.style.userSelect = "";
  });
}

function updateWindowCount() {
  const visibleWindows =
    messageField.querySelectorAll(".message-window").length;

  windowCount.textContent = `WINDOWS: ${visibleWindows} / ${WINDOWS_PER_PAGE}`;
}

function escapeHTML(value) {
  const div = document.createElement("div");

  div.textContent = value;

  return div.innerHTML;
}

if (nextButton) {
  nextButton.addEventListener("click", () => {
    if (messages.length === 0) {
      return;
    }

    const totalPages = Math.ceil(messages.length / WINDOWS_PER_PAGE);

    currentPage++;

    if (currentPage >= totalPages) {
      currentPage = 0;
    }

    displayMessages();
  });
}

if (submitButton) {
  submitButton.addEventListener("click", async () => {
    const name = nameInput.value.trim();

    const message = messageInput.value.trim();

    if (!name || !message) {
      submitStatus.textContent = "ERROR: Name and message are required.";

      return;
    }

    submitButton.disabled = true;

    submitStatus.textContent = "TRANSMITTING MESSAGE...";

    try {
      const response = await fetch("/api/comments", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name,
          message,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit message.");
      }

      nameInput.value = "";

      messageInput.value = "";

      submitStatus.textContent = "MESSAGE ACCEPTED.";

      await loadMessages();
    } catch (error) {
      console.error("Guestbook submission error:", error);

      submitStatus.textContent = "ERROR: Unable to submit message.";
    } finally {
      submitButton.disabled = false;
    }
  });
}

loadMessages();
