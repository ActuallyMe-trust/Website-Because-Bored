const messages = [

    {
        name: "Jane",
        message: "This website looks like it escaped from 2009.",
        date: "09/03/2026"
    },

    {
        name: "Unknown User",
        message: "I don't know what this place is, but I like it.",
        date: "09/03/2026"
    },

    {
        name: "SYSTEM",
        message: "Visitor detected. Please remain calm.",
        date: "09/02/2026"
    },

    {
        name: "404",
        message: "I was looking for a normal website. I found this instead.",
        date: "09/02/2026"
    },

    {
        name: "Ghost",
        message: "Someone left the lights on.",
        date: "09/01/2026"
    },

    {
        name: "Anonymous",
        message: "The green glow is probably harmless.",
        date: "09/01/2026"
    },

    {
        name: "Unknown Process",
        message: "ERROR: Visitor enjoyed website too much.",
        date: "08/31/2026"
    },

    {
        name: "Jane",
        message: "Why does every window look like it is about to crash?",
        date: "08/31/2026"
    },

    {
        name: "Guest_09",
        message: "Greetings from somewhere on the internet.",
        date: "08/30/2026"
    },

    {
        name: "ERROR",
        message: "Something happened. Nobody knows what.",
        date: "08/30/2026"
    },

    {
        name: "Visitor",
        message: "I have successfully entered the strange website.",
        date: "08/29/2026"
    },

    {
        name: "Anonymous",
        message: "Nice shrine. Slightly concerned about the guestbook.",
        date: "08/29/2026"
    },

    {
        name: "USER_001",
        message: "Hello.",
        date: "08/28/2026"
    },

    {
        name: "SYSTEM",
        message: "Message received. Processing...",
        date: "08/28/2026"
    },

    {
        name: "Lost Soul",
        message: "I clicked one link and somehow ended up here.",
        date: "08/27/2026"
    },

    {
        name: "Visitor",
        message: "The interface is completely unhinged.",
        date: "08/27/2026"
    },

    {
        name: "UNKNOWN",
        message: "Who authorized this website?",
        date: "08/26/2026"
    },

    {
        name: "Guest_17",
        message: "I approve of the radioactive aesthetic.",
        date: "08/26/2026"
    },

    {
        name: "SYSTEM ERROR",
        message: "Normal behavior has not been detected.",
        date: "08/25/2026"
    },

    {
        name: "Anonymous",
        message: "Leaving this here before the machine notices me.",
        date: "08/25/2026"
    },

    {
        name: "Visitor",
        message: "This is definitely a guestbook.",
        date: "08/24/2026"
    },

    {
        name: "USER_404",
        message: "Page not found. Message found.",
        date: "08/24/2026"
    },

    {
        name: "Unknown",
        message: "Good luck maintaining this thing.",
        date: "08/23/2026"
    }

];

const WINDOWS_PER_PAGE = 7;

let currentPage = 0;

let highestZIndex = 10;

const messageField =
    document.getElementById("message-field");

const nextButton =
    document.getElementById("next-messages");

const messageRange =
    document.getElementById("message-range");

const windowCount =
    document.getElementById("window-count");

function displayMessages() {

    messageField.innerHTML = "";

    const start =
        currentPage * WINDOWS_PER_PAGE;

    const end =
        start + WINDOWS_PER_PAGE;

    if (start >= messages.length) {

        currentPage = 0;

        displayMessages();

        return;

    }

    const currentMessages =
        messages.slice(start, end);

    currentMessages.forEach((message, index) => {

        const messageWindow =
            createMessageWindow(message, index);

        messageField.appendChild(messageWindow);

    });

    const visibleStart =
        start + 1;

    const visibleEnd =
        start + currentMessages.length;

    messageRange.textContent =
        `BUFFER: ${String(visibleStart).padStart(2, "0")}—${String(visibleEnd).padStart(2, "0")} / ${messages.length}`;

    windowCount.textContent =
        `WINDOWS: ${currentMessages.length} / ${WINDOWS_PER_PAGE}`;

}

function createMessageWindow(message, index) {

    const window =
        document.createElement("article");

    window.classList.add("message-window");

    const windowColors = [
        "window-cyan",
        "window-cherry",
        "window-green",
        "window-purple"
    ];

    window.classList.add(
        windowColors[index % windowColors.length]
    );

    const offsetX =
        Math.random() * 55;

    const offsetY =
        Math.random() * 45;

    window.style.left =
        `${15 + offsetX}%`;

    window.style.top =
        `${10 + offsetY}%`;

    const rotation =
        (Math.random() * 4) - 2;

    window.style.transform =
        `rotate(${rotation}deg)`;

    window.style.zIndex =
        highestZIndex++;

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

        window.style.zIndex =
            highestZIndex++;

    });

    const closeButton =
        window.querySelector(".window-close");

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
        "ERROR_0x0000.EXE"

    ];

    return titles[index % titles.length];

}

function makeDraggable(window) {

    const titlebar =
        window.querySelector(".window-titlebar");

    let dragging = false;

    let offsetX = 0;
    let offsetY = 0;

    let rotation = "";

    titlebar.addEventListener("mousedown", (event) => {

        if (event.target.closest(".window-close")) {
            return;
        }

        dragging = true;

        rotation =
            window.style.transform;

        window.style.transform =
            "none";

        const windowRect =
            window.getBoundingClientRect();

        const fieldRect =
            messageField.getBoundingClientRect();

        offsetX =
            event.clientX -
            windowRect.left;

        offsetY =
            event.clientY -
            windowRect.top;

        window.style.left =
            `${windowRect.left - fieldRect.left}px`;

        window.style.top =
            `${windowRect.top - fieldRect.top}px`;

        window.style.right =
            "auto";

        window.style.bottom =
            "auto";

        highestZIndex++;

        window.style.zIndex =
            highestZIndex;

        document.body.style.userSelect =
            "none";

        event.preventDefault();

    });

    document.addEventListener("mousemove", (event) => {

        if (!dragging) {
            return;
        }

        window.style.transform =
            "none";

        const fieldRect =
            messageField.getBoundingClientRect();

        const newLeft =
            event.clientX -
            fieldRect.left -
            offsetX;

        const newTop =
            event.clientY -
            fieldRect.top -
            offsetY;

        window.style.left =
            `${newLeft}px`;

        window.style.top =
            `${newTop}px`;

        window.style.transform =
            rotation;

        event.preventDefault();

    });

    document.addEventListener("mouseup", () => {

        if (!dragging) {
            return;
        }

        dragging = false;

        document.body.style.userSelect =
            "";

    });

}

function updateWindowCount() {

    const visibleWindows =
        messageField.querySelectorAll(".message-window").length;

    windowCount.textContent =
        `WINDOWS: ${visibleWindows} / ${WINDOWS_PER_PAGE}`;

}

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value;

    return div.innerHTML;

}

if (nextButton) {

    nextButton.addEventListener("click", () => {

        currentPage++;

        displayMessages();

    });

}

displayMessages();