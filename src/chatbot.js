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
          <button type="button" class="chat-clear" aria-label="Clear chat history" title="Clear Chat">🗑️</button>
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

// Default to closed state (respect user preference if set)
let isOpen = localStorage.getItem("chatOpen") === "true";
let isCollapsed = localStorage.getItem("chatCollapsed") === "true";

// Elements
const headEl = panel.querySelector(".chat-head");
const clearBtn = panel.querySelector(".chat-clear");
const minBtn = panel.querySelector(".chat-min");
const closeBtn = panel.querySelector(".chat-close");
const bodyEl = panel.querySelector("#chat-body");
const messagesEl = panel.querySelector("#chat-messages");
const inputEl = panel.querySelector("#chat-input");
const sendBtn = panel.querySelector("#send-btn");

// ---------- Helpers ----------
function setPanelState(state /* 'hidden' | 'open' | 'collapsed' */) {
  panel.classList.remove("is-hidden", "is-open", "is-collapsed");
  if (state === "open") {
    panel.classList.add("is-open");
    // Ensure body and input are visible when open
    if (bodyEl) bodyEl.style.display = "flex";
  } else if (state === "collapsed") {
    panel.classList.add("is-collapsed");
    // Hide body when collapsed
    if (bodyEl) bodyEl.style.display = "none";
  } else {
    panel.classList.add("is-hidden");
  }

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
  // Ensure input is visible when expanded
  if (bodyEl) bodyEl.style.display = "flex";
  inputEl.focus();
}
function toggleCollapse() { isCollapsed ? expandPanel() : collapsePanel(); }

// ---------- Clear Chat ----------
function clearChat() {
  // Clear localStorage
  localStorage.removeItem("chatHistory");
  localStorage.setItem("chatHistory", "[]"); // Set to empty array explicitly
  
  // Clear internal history
  history = [];
  
  // Clear DOM
  messagesEl.innerHTML = "";
  messagesEl.removeAttribute("data-rendered");
  
  // Show feedback
  const feedback = document.createElement("div");
  feedback.className = "chat-message bot";
  feedback.textContent = "Chat cleared. How can I help you?";
  feedback.style.opacity = "0.7";
  feedback.style.fontStyle = "italic";
  messagesEl.appendChild(feedback);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  
  // Remove feedback after 2 seconds
  setTimeout(() => {
    if (feedback.parentNode) {
      feedback.remove();
    }
  }, 2000);
}

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
    // Use absolute URL to ensure it works in production
    const apiUrl = window.location.origin + "/.netlify/functions/chat";
    console.log("Calling API:", apiUrl);
    
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system: SYSTEM_PROMPT, messages: history })
    });
    
    console.log("Response status:", res.status, res.statusText);
    
    if (!res.ok) {
      let errorMessage = "Network error";
      try {
        const errorData = await res.json();
        errorMessage = errorData.error || errorMessage;
        console.error("API Error:", errorData);
      } catch (e) {
        const errorText = await res.text();
        console.error("API Error (text):", errorText);
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    bot.innerHTML = "";
    
    // Handle streaming response if available, otherwise use text
    if (res.body && res.body.getReader) {
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
    } else {
      // Fallback for non-streaming responses
      const text = await res.text();
      bot.textContent = text;
      messagesEl.scrollTop = messagesEl.scrollHeight;
      history.push({ role: "assistant", content: text });
    }
    
    history = history.slice(-25);
    localStorage.setItem("chatHistory", JSON.stringify(history));
  } catch (err) {
    console.error("Chatbot error:", err);
    console.error("Error details:", {
      message: err.message,
      stack: err.stack,
      url: window.location.href
    });
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
clearBtn.addEventListener("click", clearChat);
closeBtn.addEventListener("click", hidePanel);
minBtn.addEventListener("click", toggleCollapse);
headEl.addEventListener("dblclick", toggleCollapse);
sendBtn.addEventListener("click", sendMessage);
inputEl.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});

// ---------- Restore on load ----------
(function restore() {
  // Only restore if user previously opened it (not auto-open)
  if (isOpen) {
    setPanelState(isCollapsed ? "collapsed" : "open");
    if (!messagesEl.dataset.rendered) renderMessages();
  } else {
    setPanelState("hidden");
  }
})();