// ── Keys & State ─────────────────────────────────────────────────
const SESSIONS_KEY   = 'sc_sessions';
const ACTIVE_KEY     = 'sc_active_session';
let   activeSession  = null;

// ── Session Storage (MongoDB + localStorage) ─────────────────────

function getSessions() {
  try { return JSON.parse(localStorage.getItem(SESSIONS_KEY)) || {}; }
  catch { return {}; }
}

function saveSession(session) {
  const all = getSessions();
  all[session.id] = session;
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(all));
  // MongoDB is saved from backend on /chat — no frontend POST needed
}

function deleteSession(id) {
  const all = getSessions();
  delete all[id];
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(all));
  fetch(`/history/${id}`, { method: 'DELETE' }).catch(() => {});
}

function createSession() {
  const id = 'sess_' + Date.now();
  const session = { id, title: 'New Chat', ts: Date.now(), messages: [] };
  saveSession(session);
  localStorage.setItem(ACTIVE_KEY, id);
  return session;
}

async function loadActiveSession() {
  // Try to load sessions from MongoDB first
  try {
    const res = await fetch('/history');
    const sessions = await res.json();
    if (sessions.length > 0) {
      const all = {};
      sessions.forEach(s => { all[s.id] = s; });
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(all));
    }
  } catch {}

  const id  = localStorage.getItem(ACTIVE_KEY);
  const all = getSessions();
  if (id && all[id]) return all[id];
  return createSession();
}

// ── Helpers ───────────────────────────────────────────────────────

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(ts) {
  const d = new Date(ts);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Today';
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function scrollBottom() {
  const el = document.getElementById('chatMessages');
  if (el) el.scrollTop = el.scrollHeight;
}

// ── Render a single message bubble ───────────────────────────────

function renderMessage(role, text, ts) {
  const chatMessages = document.getElementById('chatMessages');
  const msg    = document.createElement('div');
  msg.className = `msg msg-${role}`;

  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.textContent = role === 'bot' ? '🤖' : '👤';

  const wrap   = document.createElement('div');
  wrap.className = 'msg-wrap';

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.textContent = text;

  const time   = document.createElement('div');
  time.className = 'msg-time';
  time.textContent = formatTime(ts || Date.now());

  wrap.appendChild(bubble);
  wrap.appendChild(time);
  msg.appendChild(avatar);
  msg.appendChild(wrap);
  chatMessages.appendChild(msg);
}

// ── Render sidebar history list ───────────────────────────────────

function renderSidebarHistory() {
  const list = document.getElementById('historyList');
  if (!list) return;
  list.innerHTML = '';

  const all = getSessions();
  const sorted = Object.values(all).sort((a, b) => b.ts - a.ts);

  if (sorted.length === 0) {
    list.innerHTML = '<div class="history-empty">No conversations yet</div>';
    return;
  }

  sorted.forEach(session => {
    const item = document.createElement('div');
    item.className = 'history-item' + (session.id === activeSession?.id ? ' history-active' : '');
    item.dataset.id = session.id;

    const info = document.createElement('div');
    info.className = 'history-info';
    info.onclick = () => switchSession(session.id);

    const title = document.createElement('div');
    title.className = 'history-title';
    title.textContent = session.title;

    const date = document.createElement('div');
    date.className = 'history-date';
    date.textContent = formatDate(session.ts);

    info.appendChild(title);
    info.appendChild(date);

    const del = document.createElement('button');
    del.className = 'history-del';
    del.innerHTML = '×';
    del.title = 'Delete';
    del.onclick = (e) => { e.stopPropagation(); removeSession(session.id); };

    item.appendChild(info);
    item.appendChild(del);
    list.appendChild(item);
  });
}

// ── Load a session into the chat panel ───────────────────────────

function loadSessionIntoChat(session) {
  const chatMessages = document.getElementById('chatMessages');
  chatMessages.innerHTML = '';

  if (session.messages.length === 0) {
    // Show welcome bubble for empty session
    const name = document.getElementById('welcomeText').dataset.name;
    chatMessages.innerHTML = `
      <div class="msg msg-bot">
        <div class="msg-avatar">🤖</div>
        <div class="msg-wrap">
          <div class="msg-bubble">Hi <strong>${name}</strong>! I'm your SmartCampus AI assistant. Ask me anything about your attendance — subjects, eligibility, or what you need to improve. 📊</div>
          <div class="msg-time">${formatTime(Date.now())}</div>
        </div>
      </div>`;
  } else {
    session.messages.forEach(({ role, text, ts }) => renderMessage(role, text, ts));
  }
  scrollBottom();
}

// ── Switch to a different session ────────────────────────────────

function switchSession(id) {
  const all = getSessions();
  if (!all[id]) return;
  activeSession = all[id];
  localStorage.setItem(ACTIVE_KEY, id);
  loadSessionIntoChat(activeSession);
  renderSidebarHistory();
  document.getElementById('chatInput').focus();
}

// ── Delete a session ─────────────────────────────────────────────

function removeSession(id) {
  deleteSession(id);
  if (activeSession?.id === id) {
    // Switch to most recent remaining or create new
    const remaining = Object.values(getSessions()).sort((a, b) => b.ts - a.ts);
    activeSession = remaining.length ? remaining[0] : createSession();
    localStorage.setItem(ACTIVE_KEY, activeSession.id);
    loadSessionIntoChat(activeSession);
  }
  renderSidebarHistory();
}

// ── New Chat ──────────────────────────────────────────────────────

window.newChat = function () {
  activeSession = createSession();
  loadSessionIntoChat(activeSession);
  renderSidebarHistory();
  document.getElementById('chatInput').focus();
};

// ── Typing indicator ──────────────────────────────────────────────

function showTyping() {
  const chatMessages = document.getElementById('chatMessages');
  const msg = document.createElement('div');
  msg.className = 'msg msg-bot';
  msg.id = 'typingIndicator';
  msg.innerHTML = `
    <div class="msg-avatar">🤖</div>
    <div class="msg-wrap">
      <div class="msg-bubble typing-dots"><span></span><span></span><span></span></div>
    </div>`;
  chatMessages.appendChild(msg);
  scrollBottom();
}

function removeTyping() {
  const el = document.getElementById('typingIndicator');
  if (el) el.remove();
}

// ── Send ──────────────────────────────────────────────────────────

window.sendMessage = async function () {
  const chatInput = document.getElementById('chatInput');
  const sendBtn   = document.getElementById('sendBtn');
  const text = chatInput.value.trim();
  if (!text) return;

  chatInput.value = '';
  sendBtn.disabled = true;

  const userTs = Date.now();
  renderMessage('user', text, userTs);

  // Save user message to active session
  activeSession.messages.push({ role: 'user', text, ts: userTs });
  // Use first user message as session title
  if (activeSession.messages.filter(m => m.role === 'user').length === 1) {
    activeSession.title = text.length > 36 ? text.slice(0, 36) + '…' : text;
  }
  activeSession.ts = userTs;
  saveSession(activeSession);
  renderSidebarHistory();
  showTyping();
  scrollBottom();

  try {
    const res  = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        session_id: activeSession.id,
        session_title: activeSession.title,
      }),
    });
    const data = await res.json();
    removeTyping();
    const reply = data.reply || data.error || 'Something went wrong.';
    const botTs = Date.now();
    renderMessage('bot', reply, botTs);
    activeSession.messages.push({ role: 'bot', text: reply, ts: botTs });
    saveSession(activeSession);
  } catch {
    removeTyping();
    const err = 'Network error. Please try again.';
    renderMessage('bot', err, Date.now());
    activeSession.messages.push({ role: 'bot', text: err, ts: Date.now() });
    saveSession(activeSession);
  } finally {
    sendBtn.disabled = false;
    chatInput.focus();
    scrollBottom();
  }
};

// ── Suggestion chips ──────────────────────────────────────────────

window.sendSuggestion = function (btn) {
  document.getElementById('chatInput').value = btn.textContent.trim();
  window.sendMessage();
};

// ── Init ──────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  activeSession = await loadActiveSession();
  loadSessionIntoChat(activeSession);
  renderSidebarHistory();

  document.getElementById('chatInput').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); window.sendMessage(); }
  });

  document.querySelectorAll('.nav-item[href]').forEach(link => {
    link.addEventListener('click', () => {
      document.querySelectorAll('.nav-item[href]').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
});
