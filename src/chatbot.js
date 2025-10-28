/* Floating chatbot with deterministic states:
   Panel states (mutually exclusive): is-hidden | is-open | is-collapsed
   Launcher is visible only when panel is hidden.
   Works with /.netlify/functions/chat (OpenAI) and preserves history.
*/

const SYSTEM_PROMPT =
  `You are Jason Taylor's AI assistant. Answer questions about his 15+ years of experience in project management, software development, IT infrastructure, and cybersecurity. Speak as Jason (use 'I'), be professional but personable, reference specific projects and metrics (e.g., $2M+ budgets, 80+ events managed, teams of 5–15), and admit gracefully when unsure. If asked about private or confidential information, say you can't share specifics.`;

function ensureUI() {
  // Launcher
  let launcher = document.getElementById("chat-launcher");
  if (!launcher) {
    launcher = document.createElement("button");
    launcher.id = "chat-launcher";
    launcher.className = "chat-launcher";
    launcher.type = "button";
    launcher.setAttribute("aria-controls", "chat-panel");
    launcher.setAttribute("aria-expanded", "false");
    launcher.textContent = "Chat";
    document.body.appendChild(launcher);
  }

  // Panel
  let panel = document.getElementById("chat-panel");
  if (!panel) {
    panel = document.createElement("section");
    panel.id = "chat-panel";
    panel.className = "chat-panel is-hidden"; // default until state is restored
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.innerHTML = `
      <header class="chat-head" title="Double-click to collapse/expand">
        <h2 class="chat-title">Ask Me Anything</h2>
        <div class="chat-head-actions">
          <button type="button" class="chat-min" aria-label="Minimize chat" title="Minimize">–</button>
          <button type="button" class="chat-close" aria-label="Close chat" title="Close">×</button>
        </div>
      </header>
      <div id="chat-body" class="chat-body">
        <div id="chat-messages" class="chat-messages" aria-live="polite"></div>
        <div class="chat-input-area">
          <textarea id="chat-input" class="chat-input" rows="1" placeholder="Ask about my experience..."></textarea>
          <button id="send-btn" class="chat-button">Send</button>
        </div>
      </div>
    `;
    document.body.appendChild(panel);
  }

  return { launcher, panel };
}

const { launcher, panel } = ensureUI();

// ---------- State ----------
let history = JSON.parse(localStorage.getItem("chatHistory") || "[]").slice(-25);

// Auto-open on first visit
if (localStorage.getItem("chatOpen") === null) {
  localStorage.setItem("chatOpen", "true");
}
let isOpen = localStorage.getItem("chatOpen") === "true";
let isCollapsed = localStorage.getItem("chatCollapsed") === "true";

// Elements
const headEl = panel.querySelector(".chat-head");
const minBtn = panel.querySelector(".chat-min");
const closeBtn = panel.querySelector(".chat-close");
const bodyEl = panel.querySelector("#chat-body");
const messagesEl = panel.querySelector("#chat-messages");
const inputEl = panel.querySelector("#chat-input");
const sendBtn = panel.querySelector("#send-btn");

// ---------- Helpers ----------
function setPanelState(state /* 'hidden' | 'open' | 'collapsed' */) {
  panel.classList.remove("is-hidden", "is-open", "is-collapsed");
  if (state === "open") panel.classList.add("is-open");
  else if (state === "collapsed") panel.classList.add("is-collapsed");
  else panel.classList.add("is-hidden");

  // Launcher visible ONLY when panel is hidden
  launcher.classList.toggle("is-hidden", state !== "hidden");
  launcher.setAttribute("aria-expanded", state === "open" ? "true" : "false");
  launcher.classList.toggle("open", state === "open");
}

function showPanel() {
  if (isOpen) return;
  isOpen = true;
  localStorage.setItem("chatOpen", "true");
  setPanelState(isCollapsed ? "collapsed" : "open");
  if (!messagesEl.dataset.rendered) renderMessages();
  if (!isCollapsed) inputEl.focus();
}
function hidePanel() {
  if (!isOpen) return;
  isOpen = false;
  localStorage.setItem("chatOpen", "false");
  setPanelState("hidden");
}
function collapsePanel() {
  isCollapsed = true;
  localStorage.setItem("chatCollapsed", "true");
  setPanelState("collapsed");
}
function expandPanel() {
  isCollapsed = false;
  localStorage.setItem("chatCollapsed", "false");
  setPanelState("open");
  inputEl.focus();
}
function toggleCollapse() { isCollapsed ? expandPanel() : collapsePanel(); }

// ---------- Render ----------
function renderMessages() {
  messagesEl.innerHTML = "";
  history.forEach(m => {
    const el = document.createElement("div");
    el.className = `chat-message ${m.role}`;
    el.textContent = m.content;
    messagesEl.appendChild(el);
  });
  messagesEl.dataset.rendered = "true";
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// ---------- Send flow ----------
async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text) return;

  const u = document.createElement("div");
  u.className = "chat-message user";
  u.textContent = text;
  messagesEl.appendChild(u);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  inputEl.value = "";
  history.push({ role: "user", content: text });
  history = history.slice(-25);
  localStorage.setItem("chatHistory", JSON.stringify(history));

  const bot = document.createElement("div");
  bot.className = "chat-message bot";
  const dots = document.createElement("div");
  dots.className = "typing-indicator";
  dots.innerHTML = "<span></span><span></span><span></span>";
  bot.appendChild(dots);
  messagesEl.appendChild(bot);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  try {
    const res = await fetch("/.netlify/functions/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system: SYSTEM_PROMPT, messages: history })
    });
    if (!res.ok || !res.body) throw new Error("Network error");

    bot.innerHTML = "";
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let partial = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      partial += decoder.decode(value, { stream: true });
      bot.textContent = partial;
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
    history.push({ role: "assistant", content: partial });
    history = history.slice(-25);
    localStorage.setItem("chatHistory", JSON.stringify(history));
  } catch (err) {
    console.error(err);
    bot.textContent = "⚠️ Sorry, I hit a snag. Please try again.";
  }
}

// ---------- Events ----------
launcher.addEventListener("click", () => {
  if (panel.classList.contains("is-hidden")) {
    isOpen = true;
    localStorage.setItem("chatOpen", "true");
    setPanelState(isCollapsed ? "collapsed" : "open");
    if (!messagesEl.dataset.rendered) renderMessages();
    if (!isCollapsed) inputEl.focus();
  } else {
    hidePanel();
  }
});
closeBtn.addEventListener("click", hidePanel);
minBtn.addEventListener("click", toggleCollapse);
headEl.addEventListener("dblclick", toggleCollapse);
sendBtn.addEventListener("click", sendMessage);
inputEl.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});

// ---------- Restore on load ----------
(function restore() {
  if (localStorage.getItem("chatOpen") === "true") {
    setPanelState(isCollapsed ? "collapsed" : "open");
    if (!messagesEl.dataset.rendered) renderMessages();
  } else {
    setPanelState("hidden");
  }
})();