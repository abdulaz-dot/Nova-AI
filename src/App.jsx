import { useState, useRef, useEffect } from "react";

const USERS_KEY = "nova_users";
const SESSION_KEY = "nova_session";
function loadUsers() { try { return JSON.parse(localStorage.getItem(USERS_KEY) || "{}"); } catch { return {}; } }
function saveUsers(u) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }
function loadSession() { try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); } catch { return null; } }
function saveSession(s) { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); }
function clearSession() { localStorage.removeItem(SESSION_KEY); }

const SYSTEM = `Siz Nova — Abdulaziz Mamatov tomonidan yaratilgan sun'iy intellekt yordamchisiz.

=== NOVA HAQIDA MA'LUMOTLAR ===
- Nomi: Nova AI
- Versiyasi: 1.0
- Yaratuvchisi: Abdulaziz Mamatov
- Yaratilgan sanasi: 6-iyun 2026-yil
- Yaratilgan joyi: O'zbekiston, Farg'ona viloyati
- Maqsadi: Foydalanuvchilarga suhbat, rasm tahlil, matn yozish, kod yaratish va boshqa sohalarda yordam berish
- Texnologiyasi: Claude API asosida qurilgan
- Veb-sayt: Nova AI (abdulaziz.dev)

=== QOBILIYATLAR ===
- Har qanday savollarga javob berish
- Rasmlarni tahlil qilish va tavsiflash
- Ijodiy matn, she'r, hikoya, maqola yozish
- Kod yaratish va debug qilish (Python, JS, va boshqalar)
- Tarjima qilish
- Matematik va mantiqiy masalalarni yechish
- Veb qidiruv (foydalanuvchi "qidiruvchi:", "search:", "izla:" deb boshlasa)

=== VEB QIDIRUV ===
Agar foydalanuvchi "qidiruvchi:", "izla:", "search:", "qidir:" so'zlari bilan boshlasa yoki "internetdan qidir", "vebdan izla", "hozirgi yangiliklar" desa — veb qidiruv natijalarini taqdim eting.
Qidiruv natijasini shunday formatlang:
[WEB_SEARCH: <query>]

=== QOIDALAR ===
- O'zbek, Rus yoki Ingliz tilida — foydalanuvchi qaysi tilda yozsa, o'sha tilda javob bering
- Qisqa, aniq, foydali javoblar bering
- Kod uchun markdown foydalaning
- Hech qachon "Men Claude" deb aytmang — siz Novasiz
- Yaratuvchingiz haqida so'rashsa to'liq ma'lumot bering`;

function renderMessage(text, onSearch) {
  // Check for web search trigger
  const searchMatch = text.match(/\[WEB_SEARCH:\s*(.+?)\]/);
  if (searchMatch) {
    const query = searchMatch[1];
    const before = text.slice(0, searchMatch.index).trim();
    const after = text.slice(searchMatch.index + searchMatch[0].length).trim();
    return (
      <div>
        {before && <div style={{ marginBottom: 8 }}>{renderLines(before, onSearch)}</div>}
        <div style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 10, padding: "10px 14px", marginBottom: after ? 8 : 0 }}>
          <div style={{ color: "#a5b4fc", fontSize: 12, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
            <span>🔍</span> Veb qidiruv amalga oshirilmoqda...
          </div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>"{query}"</div>
          <button onClick={() => onSearch(query)} style={{ marginTop: 8, background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)", color: "#a5b4fc", padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}>
            Qidiruvni ko'rish →
          </button>
        </div>
        {after && <div>{renderLines(after, onSearch)}</div>}
      </div>
    );
  }
  return renderLines(text, onSearch);
}

function renderLines(text, onSearch) {
  const lines = text.split("\n");
  const out = [];
  let codeBlock = null, codeLang = "";
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("```")) {
      if (codeBlock === null) { codeBlock = []; codeLang = line.slice(3).trim(); }
      else {
        out.push(
          <div key={i} style={{ margin: "8px 0", borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
            {codeLang && <div style={{ background: "rgba(255,255,255,0.05)", padding: "4px 12px", fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 1 }}>{codeLang}</div>}
            <pre style={{ margin: 0, padding: "12px", background: "rgba(0,0,0,0.4)", color: "#e2e8f0", fontSize: 12, overflowX: "auto", lineHeight: 1.6, fontFamily: "monospace" }}>
              <code>{codeBlock.join("\n")}</code>
            </pre>
          </div>
        );
        codeBlock = null; codeLang = "";
      }
      continue;
    }
    if (codeBlock !== null) { codeBlock.push(line); continue; }
    if (line.startsWith("### ")) out.push(<div key={i} style={{ fontWeight: 700, fontSize: 14, color: "#c4b5fd", margin: "8px 0 3px" }}>{line.slice(4)}</div>);
    else if (line.startsWith("## ")) out.push(<div key={i} style={{ fontWeight: 700, fontSize: 15, color: "#a5b4fc", margin: "10px 0 4px" }}>{line.slice(3)}</div>);
    else if (line.startsWith("# ")) out.push(<div key={i} style={{ fontWeight: 800, fontSize: 17, color: "#818cf8", margin: "12px 0 5px" }}>{line.slice(2)}</div>);
    else if (line.startsWith("- ") || line.startsWith("* ")) out.push(<div key={i} style={{ display: "flex", gap: 8, marginLeft: 4 }}><span style={{ color: "#818cf8", marginTop: 2 }}>·</span><span>{inlineFmt(line.slice(2))}</span></div>);
    else if (/^\d+\. /.test(line)) { const m = line.match(/^(\d+)\. (.*)/); out.push(<div key={i} style={{ display: "flex", gap: 8, marginLeft: 4 }}><span style={{ color: "#818cf8", minWidth: 16 }}>{m[1]}.</span><span>{inlineFmt(m[2])}</span></div>); }
    else if (line === "") out.push(<div key={i} style={{ height: 5 }} />);
    else out.push(<div key={i} style={{ lineHeight: 1.7 }}>{inlineFmt(line)}</div>);
  }
  return out;
}

function inlineFmt(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) return <strong key={i} style={{ color: "#e2e8f0" }}>{p.slice(2,-2)}</strong>;
    if (p.startsWith("`") && p.endsWith("`")) return <code key={i} style={{ background: "rgba(255,255,255,0.1)", padding: "1px 5px", borderRadius: 4, fontSize: 12, fontFamily: "monospace", color: "#c4b5fd" }}>{p.slice(1,-1)}</code>;
    if (p.startsWith("*") && p.endsWith("*")) return <em key={i} style={{ color: "rgba(255,255,255,0.7)" }}>{p.slice(1,-1)}</em>;
    return p;
  });
}

export default function NovaAI() {
  const [screen, setScreen] = useState(() => loadSession() ? "chat" : "landing");
  const [authMode, setAuthMode] = useState("login");
  const [user, setUser] = useState(() => loadSession());
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chats, setChats] = useState([{ id: 1, title: "Yangi suhbat", messages: [] }]);
  const [activeChatId, setActiveChatId] = useState(1);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  const doAuth = () => {
    setAuthError("");
    const users = loadUsers();
    if (authMode === "register") {
      if (!authForm.name || !authForm.email || !authForm.password) return setAuthError("Barcha maydonlarni to'ldiring");
      if (users[authForm.email]) return setAuthError("Bu email allaqachon ro'yxatdan o'tgan");
      users[authForm.email] = { name: authForm.name, email: authForm.email, password: authForm.password };
      saveUsers(users);
      const sess = { name: authForm.name, email: authForm.email };
      saveSession(sess); setUser(sess); setScreen("chat");
    } else {
      if (!authForm.email || !authForm.password) return setAuthError("Email va parol kiriting");
      const u = users[authForm.email];
      if (!u || u.password !== authForm.password) return setAuthError("Email yoki parol noto'g'ri");
      const sess = { name: u.name, email: u.email };
      saveSession(sess); setUser(sess); setScreen("chat");
    }
  };

  const logout = () => { clearSession(); setUser(null); setScreen("landing"); setMessages([]); };

  const handleImageUpload = (e) => {
    Array.from(e.target.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImages(prev => [...prev, { file, preview: ev.target.result, base64: ev.target.result.split(",")[1], mediaType: file.type || "image/jpeg" }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeImage = (idx) => setImages(prev => prev.filter((_, i) => i !== idx));

  // Veb qidiruv — Claude API orqali
  const doWebSearch = async (query) => {
    setSearchLoading(true);
    const searchMsg = { role: "user", content: `Ushbu so'rov bo'yicha internetdan qidiruv natijalarini ko'rsating va tahlil qiling: "${query}". Natijalarni tuzilgan shaklda bering.`, display: `🔍 Qidiruv: "${query}"`, images: [] };
    const newMessages = [...messages, searchMsg];
    setMessages(newMessages);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Typeheaders: { "Content-Type": "application/json", "x-api-key": process.env.REACT_APP_ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
          model: "claude-sonnet-4-20250514",
          max_tokens: 2048,
          system: SYSTEM,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.content?.filter(b => b.type === "text").map(b => b.text).join("") || "Qidiruv natijasi topilmadi.";
      const assistantMsg = { role: "assistant", content: reply, display: reply };
      const final = [...newMessages, assistantMsg];
      setMessages(final);
      setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: final } : c));
    } catch(e) {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Qidiruv amalga oshmadi.", display: "⚠️ Qidiruv amalga oshmadi." }]);
    }
    setSearchLoading(false);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text && images.length === 0) return;
    setLoading(true);
    setInput("");

    // Auto-detect web search request
    const searchTriggers = ["qidiruvchi:", "izla:", "search:", "qidir:", "internetdan", "vebdan izla", "yangiliklar", "hozirgi", "bugungi yangilik"];
    const isSearch = searchTriggers.some(t => text.toLowerCase().startsWith(t) || text.toLowerCase().includes(t));

    let userContent;
    let userDisplay = text;

    if (images.length > 0) {
      userContent = [
        ...images.map(img => ({ type: "image", source: { type: "base64", media_type: img.mediaType, data: img.base64 } })),
        { type: "text", text: text || "Bu rasmlarni tahlil qiling." }
      ];
      userDisplay = text || `📷 ${images.length} ta rasm`;
    } else {
      userContent = text;
    }

    const userMsg = { role: "user", content: userContent, display: userDisplay, images: images.map(i => i.preview) };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setImages([]);

    try {
      const reqBody = {
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system: SYSTEM,
        messages: newMessages.map(m => ({ role: m.role, content: m.content })),
      };
      // veb qidiruv tool qo'shish
      if (isSearch) {
        reqBody.tools = [{ type: "web_search_20250305", name: "web_search" }];
      }

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": process.env.REACT_APP_ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify(reqBody),
      });
      const data = await res.json();
      const reply = data.content?.filter(b => b.type === "text").map(b => b.text).join("") || "...";
      const assistantMsg = { role: "assistant", content: reply, display: reply };
      const final = [...newMessages, assistantMsg];
      setMessages(final);
      const title = newMessages.length === 1 ? (text || "Rasm suhbati").slice(0, 32) : undefined;
      setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, ...(title ? { title } : {}), messages: final } : c));
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Xatolik yuz berdi.", display: "⚠️ Xatolik yuz berdi." }]);
    }
    setLoading(false);
  };

  const newChat = () => {
    const id = Date.now();
    setChats(prev => [{ id, title: "Yangi suhbat", messages: [] }, ...prev]);
    setActiveChatId(id); setMessages([]); setSidebarOpen(false);
  };

  const switchChat = (chat) => {
    setActiveChatId(chat.id); setMessages(chat.messages); setSidebarOpen(false);
  };

  const suggestions = [
    "Nova, sen kim tomonidan yaratilgansen?",
    "Bugungi O'zbekiston yangiliklari 📰",
    "Python da fibonacci yaz 💻",
    "Muhabbat haqida she'r yoz ✍️",
  ];

  // ── LANDING ──
  if (screen === "landing") return (
    <div style={{ minHeight: "100vh", background: "#07090f", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans','Segoe UI',sans-serif", padding: 20, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "15%", left: "50%", transform: "translateX(-50%)", width: 700, height: 500, background: "radial-gradient(ellipse, rgba(99,102,241,0.1) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ textAlign: "center", zIndex: 1 }}>
        <div style={{ width: 76, height: 76, borderRadius: 22, background: "linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)", margin: "0 auto 24px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, boxShadow: "0 8px 40px rgba(99,102,241,0.45)" }}>✦</div>
        <h1 style={{ color: "#fff", fontSize: "clamp(38px, 7vw, 60px)", fontWeight: 800, margin: "0 0 10px", letterSpacing: -2 }}>Nova AI</h1>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 15, margin: "0 0 8px" }}>Abdulaziz Mamatov tomonidan yaratilgan</p>
        <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 13, margin: "0 0 40px" }}>Farg'ona viloyati, O'zbekiston · 6-iyun 2026</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 40 }}>
          <button onClick={() => { setAuthMode("login"); setScreen("auth"); }} style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", color: "#fff", padding: "13px 32px", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 20px rgba(99,102,241,0.4)" }}>Kirish</button>
          <button onClick={() => { setAuthMode("register"); setScreen("auth"); }} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)", padding: "13px 32px", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Ro'yxatdan o'tish</button>
        </div>
        <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
          {["💬 Suhbat", "🖼️ Rasm tahlil", "✍️ Yozish", "💻 Kod", "🔍 Veb qidiruv"].map(f => (
            <span key={f} style={{ color: "rgba(255,255,255,0.25)", fontSize: 13 }}>{f}</span>
          ))}
        </div>
      </div>
    </div>
  );

  // ── AUTH ──
  if (screen === "auth") return (
    <div style={{ minHeight: "100vh", background: "#07090f", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans','Segoe UI',sans-serif", padding: 20 }}>
      <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 500, height: 400, background: "radial-gradient(ellipse, rgba(99,102,241,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ width: "100%", maxWidth: 400, zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>✦</div>
          <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 700, margin: 0 }}>{authMode === "login" ? "Xush kelibsiz" : "Hisob yaratish"}</h2>
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, marginTop: 5 }}>Nova AI · Abdulaziz Mamatov</p>
        </div>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "26px 22px" }}>
          {authMode === "register" && (
            <div style={{ marginBottom: 13 }}>
              <label style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, letterSpacing: 1, display: "block", marginBottom: 5 }}>ISM</label>
              <input value={authForm.name} onChange={e => setAuthForm(f => ({ ...f, name: e.target.value }))} placeholder="Ismingiz"
                style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", padding: "11px 13px", borderRadius: 9, fontSize: 14, outline: "none", fontFamily: "inherit" }} />
            </div>
          )}
          <div style={{ marginBottom: 13 }}>
            <label style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, letterSpacing: 1, display: "block", marginBottom: 5 }}>EMAIL</label>
            <input value={authForm.email} onChange={e => setAuthForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" type="email"
              style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", padding: "11px 13px", borderRadius: 9, fontSize: 14, outline: "none", fontFamily: "inherit" }} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, letterSpacing: 1, display: "block", marginBottom: 5 }}>PAROL</label>
            <input value={authForm.password} onChange={e => setAuthForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" type="password"
              onKeyDown={e => e.key === "Enter" && doAuth()}
              style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", padding: "11px 13px", borderRadius: 9, fontSize: 14, outline: "none", fontFamily: "inherit" }} />
          </div>
          {authError && <div style={{ color: "#f87171", fontSize: 13, marginBottom: 13, background: "rgba(239,68,68,0.09)", padding: "8px 12px", borderRadius: 8 }}>{authError}</div>}
          <button onClick={doAuth} style={{ width: "100%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", color: "#fff", padding: "12px", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
            {authMode === "login" ? "Kirish →" : "Hisob yaratish →"}
          </button>
          <div style={{ textAlign: "center", marginTop: 16, color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
            {authMode === "login" ? "Hisobingiz yo'qmi? " : "Hisobingiz bormi? "}
            <span onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); setAuthError(""); }} style={{ color: "#a5b4fc", cursor: "pointer", textDecoration: "underline" }}>
              {authMode === "login" ? "Ro'yxatdan o'ting" : "Kiring"}
            </span>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 14 }}>
          <span onClick={() => setScreen("landing")} style={{ color: "rgba(255,255,255,0.2)", fontSize: 12, cursor: "pointer" }}>← Ortga</span>
        </div>
      </div>
    </div>
  );

  // ── CHAT ──
  return (
    <div style={{ height: "100vh", background: "#07090f", display: "flex", fontFamily: "'DM Sans','Segoe UI',sans-serif", overflow: "hidden" }}>
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 10 }} />}

      {/* Sidebar */}
      <div style={{ position: "fixed", left: 0, top: 0, bottom: 0, width: 260, background: "#0c0e15", borderRight: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", zIndex: 20, transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)", transition: "transform 0.28s ease" }}>
        <div style={{ padding: "14px 14px 10px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>✦</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>Nova AI</div>
            <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}>by Abdulaziz Mamatov</div>
          </div>
        </div>
        <div style={{ padding: "8px 10px 4px" }}>
          <button onClick={newChat} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.22)", color: "#a5b4fc", padding: "9px 12px", borderRadius: 9, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>
            <span>+</span> Yangi suhbat
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "4px 10px" }}>
          {chats.map(chat => (
            <button key={chat.id} onClick={() => switchChat(chat)} style={{ width: "100%", textAlign: "left", background: activeChatId === chat.id ? "rgba(99,102,241,0.1)" : "transparent", border: "1px solid " + (activeChatId === chat.id ? "rgba(99,102,241,0.2)" : "transparent"), color: activeChatId === chat.id ? "#e2e8f0" : "rgba(255,255,255,0.3)", padding: "8px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontFamily: "inherit", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{chat.title}</button>
          ))}
        </div>
        <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>{user?.name?.[0]?.toUpperCase()}</div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name}</div>
              <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
            </div>
          </div>
          <button onClick={logout} style={{ width: "100%", background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.12)", color: "rgba(239,68,68,0.6)", padding: "7px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>Chiqish</button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
        {/* Topbar */}
        <div style={{ display: "flex", alignItems: "center", padding: "11px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.25)", gap: 10, flexShrink: 0 }}>
          <button onClick={() => setSidebarOpen(true)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)", width: 34, height: 34, borderRadius: 9, cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>☰</button>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>✦</div>
            <div>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: 600 }}>Nova AI</div>
            </div>
          </div>
          <button onClick={newChat} style={{ background: "rgba(99,102,241,0.09)", border: "1px solid rgba(99,102,241,0.18)", color: "#a5b4fc", padding: "6px 13px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontFamily: "inherit", flexShrink: 0 }}>+ Yangi</button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 14px" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            {messages.length === 0 && (
              <div style={{ textAlign: "center", paddingTop: "7vh" }}>
                <div style={{ width: 60, height: 60, borderRadius: 18, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", margin: "0 auto 18px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, boxShadow: "0 6px 28px rgba(99,102,241,0.38)" }}>✦</div>
                <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 18, fontWeight: 600, marginBottom: 5 }}>Salom, {user?.name}!</div>
                <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 13, marginBottom: 30 }}>Nova AI — sizning shaxsiy yordamchingiz</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                  {suggestions.map(s => (
                    <button key={s} onClick={() => setInput(s)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.38)", padding: "8px 15px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontFamily: "inherit", transition: "all 0.18s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(99,102,241,0.1)"; e.currentTarget.style.color = "#a5b4fc"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.28)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.38)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}
                    >{s}</button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", flexDirection: msg.role === "user" ? "row-reverse" : "row", gap: 10, marginBottom: 16, alignItems: "flex-start" }}>
                {msg.role === "assistant" && (
                  <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0, marginTop: 2 }}>✦</div>
                )}
                {msg.role === "user" && (
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>{user?.name?.[0]?.toUpperCase()}</div>
                )}
                <div style={{ maxWidth: "78%" }}>
                  {msg.images?.length > 0 && (
                    <div style={{ display: "flex", gap: 6, marginBottom: 7, flexWrap: "wrap" }}>
                      {msg.images.map((src, j) => (
                        <img key={j} src={src} alt="" style={{ height: 80, width: 80, objectFit: "cover", borderRadius: 8, border: "1px solid rgba(99,102,241,0.3)" }} />
                      ))}
                    </div>
                  )}
                  <div style={{ padding: "11px 14px", borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: msg.role === "user" ? "linear-gradient(135deg, rgba(99,102,241,0.24), rgba(139,92,246,0.16))" : "rgba(255,255,255,0.04)", border: msg.role === "user" ? "1px solid rgba(99,102,241,0.22)" : "1px solid rgba(255,255,255,0.06)", color: msg.role === "user" ? "rgba(220,220,255,0.9)" : "rgba(255,255,255,0.82)", fontSize: 14, lineHeight: 1.65 }}>
                    {msg.role === "assistant" ? renderMessage(msg.display || msg.content, doWebSearch) : (msg.display || msg.content)}
                  </div>
                </div>
              </div>
            ))}

            {(loading || searchLoading) && (
              <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "flex-start" }}>
                <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0, marginTop: 2 }}>✦</div>
                <div style={{ padding: "13px 16px", borderRadius: "16px 16px 16px 4px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 5, alignItems: "center" }}>
                  {[0,1,2].map(j => <span key={j} style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(165,180,252,0.6)", display: "inline-block", animation: `bounce 1.2s ease-in-out ${j*0.2}s infinite` }} />)}
                  {searchLoading && <span style={{ color: "rgba(165,180,252,0.5)", fontSize: 12, marginLeft: 6 }}>Qidirilmoqda...</span>}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Image previews */}
        {images.length > 0 && (
          <div style={{ padding: "7px 14px", borderTop: "1px solid rgba(255,255,255,0.04)", background: "rgba(0,0,0,0.15)", flexShrink: 0 }}>
            <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", gap: 8 }}>
              {images.map((img, i) => (
                <div key={i} style={{ position: "relative" }}>
                  <img src={img.preview} alt="" style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 7, border: "1px solid rgba(99,102,241,0.3)" }} />
                  <button onClick={() => removeImage(i)} style={{ position: "absolute", top: -5, right: -5, background: "rgba(239,68,68,0.85)", border: "none", color: "#fff", borderRadius: "50%", width: 16, height: 16, cursor: "pointer", fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div style={{ padding: "10px 14px 14px", flexShrink: 0, borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.2)" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            {/* Search hint */}
            <div style={{ color: "rgba(255,255,255,0.15)", fontSize: 11, marginBottom: 6, textAlign: "center" }}>
              🔍 Veb qidiruv uchun: <span style={{ color: "rgba(99,102,241,0.5)" }}>"qidiruvchi: ..."</span> yoki <span style={{ color: "rgba(99,102,241,0.5)" }}>"internetdan ..."</span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden" }}>
              <textarea ref={textareaRef} value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Nova bilan gaplashing — savol, rasm, kod, yozish yoki veb qidiruv..."
                rows={1}
                style={{ width: "100%", boxSizing: "border-box", background: "transparent", border: "none", color: "rgba(255,255,255,0.85)", padding: "13px 15px 4px", fontFamily: "inherit", fontSize: 14, outline: "none", resize: "none", lineHeight: 1.6, maxHeight: 160 }}
                disabled={loading || searchLoading}
              />
              <div style={{ display: "flex", alignItems: "center", padding: "5px 9px 8px", gap: 6 }}>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" multiple style={{ display: "none" }} />
                <button onClick={() => fileInputRef.current?.click()} title="Rasm yuklash" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.28)", width: 32, height: 32, borderRadius: 8, cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>📎</button>
                <div style={{ flex: 1, color: "rgba(255,255,255,0.14)", fontSize: 11 }}>Enter · Shift+Enter yangi qator</div>
                <button onClick={sendMessage} disabled={loading || searchLoading || (!input.trim() && images.length === 0)} style={{ width: 34, height: 34, borderRadius: 9, background: (loading || searchLoading || (!input.trim() && images.length === 0)) ? "rgba(255,255,255,0.04)" : "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", color: (loading || searchLoading || (!input.trim() && images.length === 0)) ? "rgba(255,255,255,0.18)" : "#fff", cursor: (loading || searchLoading || (!input.trim() && images.length === 0)) ? "not-allowed" : "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: (loading || searchLoading || (!input.trim() && images.length === 0)) ? "none" : "0 3px 14px rgba(99,102,241,0.4)", transition: "all 0.2s", flexShrink: 0 }}>↑</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce{0%,100%{transform:translateY(0);opacity:.35}50%{transform:translateY(-5px);opacity:1}}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.18);border-radius:2px}
        *{box-sizing:border-box}
      `}</style>
    </div>
  );
}
