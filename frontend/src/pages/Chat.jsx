import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import { chat, auth as authApi } from "../api/api";
import { useAuth } from "../context/AuthContext";

const BASE = import.meta.env.VITE_API_URL || "";
const EMOJI_LIST = ["❤️", "😂", "😮", "😢", "👏", "🔥"];

function Avatar({ name, size = "h-8 w-8", textSize = "text-xs" }) {
  const colors = [
    "bg-orange-500/30 text-orange-300",
    "bg-blue-500/30 text-blue-300",
    "bg-violet-500/30 text-violet-300",
    "bg-emerald-500/30 text-emerald-300",
    "bg-pink-500/30 text-pink-300",
  ];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  return (
    <div className={`grid ${size} shrink-0 place-items-center rounded-full ${color} ${textSize} font-extrabold`}>
      {name?.[0]?.toUpperCase() || "?"}
    </div>
  );
}

function Message({ msg, isMe, onReact, onReply, showAvatar }) {
  const [showEmoji, setShowEmoji] = useState(false);
  const timerRef = useRef(null);

  const topReactions = msg.reactions
    ? Object.entries(
        Object.values(msg.reactions).reduce((acc, emoji) => {
          acc[emoji] = (acc[emoji] || 0) + 1;
          return acc;
        }, {})
      ).sort((a, b) => b[1] - a[1]).slice(0, 3)
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`flex items-end gap-2 group ${isMe ? "flex-row-reverse" : "flex-row"}`}
    >
      <div className="w-8 shrink-0">
        {!isMe && showAvatar && <Avatar name={msg.sender?.Fullname} />}
      </div>

      <div className={`relative max-w-[65%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
        {!isMe && showAvatar && (
          <span className="text-xs font-semibold mb-1 ml-1" style={{ color: "var(--text-3)" }}>
            {msg.sender?.Fullname}
          </span>
        )}

        <div
          className="relative"
          onMouseEnter={() => { timerRef.current = setTimeout(() => setShowEmoji(true), 300); }}
          onMouseLeave={() => { clearTimeout(timerRef.current); setShowEmoji(false); }}
        >
          {/* Emoji + Reply picker */}
          <AnimatePresence>
            {showEmoji && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 4 }}
                transition={{ duration: 0.15 }}
                className={`absolute z-10 bottom-full mb-1 flex items-center gap-1 rounded-full border border-white/10 bg-[#1e1e2e] px-2 py-1 shadow-xl ${isMe ? "right-0" : "left-0"}`}
              >
                {EMOJI_LIST.map((e) => (
                  <button key={e} onClick={() => { onReact(msg._id, e); setShowEmoji(false); }}
                    className="text-base hover:scale-125 transition-transform">{e}</button>
                ))}
                <div className="w-px h-4 bg-white/10 mx-1" />
                <button
                  onClick={() => { onReply(msg); setShowEmoji(false); }}
                  className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 transition"
                >
                  ↩ Reply
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reply preview inside bubble */}
          {msg.replyTo?.text && (
            <div className={`mb-1 rounded-xl px-3 py-1.5 text-xs border-l-2 border-orange-400 bg-white/5 max-w-full ${isMe ? "text-right" : "text-left"}`}>
              <p className="font-bold text-orange-400 truncate">{msg.replyTo.senderName}</p>
              <p className="truncate" style={{ color: "var(--text-3)" }}>{msg.replyTo.text}</p>
            </div>
          )}

          {/* Bubble */}
          <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed cursor-default select-text
            ${isMe
              ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-br-sm"
              : "bg-white/10 text-white rounded-bl-sm"}`}
          >
            {msg.text}
          </div>

          {/* Reactions */}
          {topReactions.length > 0 && (
            <div className={`absolute -bottom-3 flex gap-0.5 ${isMe ? "right-1" : "left-1"}`}>
              <div className="flex items-center gap-0.5 rounded-full bg-[#1e1e2e] border border-white/10 px-1.5 py-0.5 text-xs shadow">
                {topReactions.map(([emoji, count]) => (
                  <span key={emoji}>{emoji}{count > 1 ? <span className="text-[10px] text-white/50 ml-0.5">{count}</span> : null}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <span className={`text-[10px] mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? "mr-1" : "ml-1"}`}
          style={{ color: "var(--text-4)" }}>
          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </motion.div>
  );
}

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [connected, setConnected] = useState(false);
  const [typing, setTyping] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const typingTimerRef = useRef(null);
  const inputRef = useRef(null);
  const room = "global";

  useEffect(() => {
    let socket;
    async function init() {
      const history = await chat.getMessages(room).catch(() => ({ messages: [] }));
      setMessages(history.messages || []);
      const { token } = await authApi.getToken();
      socket = io(BASE || window.location.origin, { withCredentials: true, auth: { token } });
      socketRef.current = socket;
      socket.on("connect", () => { setConnected(true); socket.emit("join_room", room); });
      socket.on("disconnect", () => setConnected(false));
      socket.on("connect_error", () => setConnected(false));
      socket.on("new_message", (msg) => {
        setMessages((prev) => prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]);
      });
      socket.on("reaction_update", ({ messageId, reactions }) => {
        setMessages((prev) => prev.map((m) => m._id === messageId ? { ...m, reactions } : m));
      });
      socket.on("typing", ({ name }) => {
        setTyping((prev) => prev.includes(name) ? prev : [...prev, name]);
        setTimeout(() => setTyping((prev) => prev.filter((n) => n !== name)), 2500);
      });
    }
    init().catch(console.error);
    return () => socket?.disconnect();
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  function handleTyping(e) {
    setText(e.target.value);
    if (!socketRef.current?.connected) return;
    clearTimeout(typingTimerRef.current);
    socketRef.current.emit("typing", { room, name: user?.Fullname?.split(" ")[0] });
  }

  function handleReply(msg) {
    setReplyTo({ messageId: msg._id, senderName: msg.sender?.Fullname, text: msg.text });
    inputRef.current?.focus();
  }

  function cancelReply() { setReplyTo(null); }

  function sendMessage(e) {
    e.preventDefault();
    if (!text.trim() || !socketRef.current?.connected) return;
    socketRef.current.emit("send_message", { text, room, replyTo });
    setText("");
    setReplyTo(null);
  }

  function handleReact(messageId, emoji) {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit("react_message", { messageId, emoji, room });
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(e); }
    if (e.key === "Escape") cancelReply();
  }

  const grouped = messages.map((msg, i) => ({
    ...msg,
    showAvatar: messages[i + 1]?.sender?._id !== msg.sender?._id,
  }));

  const othersTyping = typing.filter((n) => n !== user?.Fullname?.split(" ")[0]);

  return (
    <div className="flex flex-col h-[calc(100dvh-5rem)] lg:h-[calc(100dvh-1.5rem)]">

      {/* Header */}
      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/8">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-orange-500 to-orange-700 text-base font-black text-white shadow shadow-orange-500/30">💬</div>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-extrabold text-white">Community Chat</h1>
          <p className="text-xs flex items-center gap-1" style={{ color: "var(--text-3)" }}>
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${connected ? "bg-emerald-400" : "bg-red-400"}`} />
            {connected ? "Live · all students" : "Connecting…"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-1 px-1 py-2">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="text-4xl">👋</div>
            <p className="text-sm font-semibold" style={{ color: "var(--text-3)" }}>No messages yet. Say hello!</p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {grouped.map((msg) => {
            const isMe = String(msg.sender?._id) === String(user?._id);
            return <Message key={msg._id} msg={msg} isMe={isMe} onReact={handleReact} onReply={handleReply} showAvatar={msg.showAvatar} />;
          })}
        </AnimatePresence>

        <AnimatePresence>
          {othersTyping.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="flex items-center gap-2 pl-10">
              <div className="flex items-center gap-1 rounded-2xl bg-white/10 px-3 py-2">
                <span className="text-xs" style={{ color: "var(--text-3)" }}>{othersTyping.join(", ")} {othersTyping.length === 1 ? "is" : "are"} typing</span>
                <span className="flex gap-0.5 ml-1">
                  {[0, 1, 2].map((i) => (
                    <motion.span key={i} className="inline-block h-1 w-1 rounded-full bg-white/40"
                      animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                  ))}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-2 pt-3 border-t border-white/8">
        {/* Reply preview bar */}
        <AnimatePresence>
          {replyTo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center justify-between gap-2 mb-2 rounded-xl border-l-2 border-orange-400 bg-white/5 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-xs font-bold text-orange-400">{replyTo.senderName}</p>
                <p className="text-xs truncate" style={{ color: "var(--text-3)" }}>{replyTo.text}</p>
              </div>
              <button onClick={cancelReply} className="shrink-0 text-white/40 hover:text-white transition text-lg leading-none">✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={sendMessage} className="flex items-center gap-2">
          <Avatar name={user?.Fullname} size="h-9 w-9 shrink-0" />
          <div className="flex-1 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-1.5">
            <textarea
              ref={inputRef}
              value={text}
              onChange={handleTyping}
              onKeyDown={handleKeyDown}
              placeholder={connected ? (replyTo ? `Replying to ${replyTo.senderName}…` : "Message…") : "Connecting…"}
              rows={1}
              className="flex-1 bg-transparent outline-none resize-none text-sm text-white placeholder:text-white/30 leading-relaxed py-1"
              style={{ minHeight: "28px", maxHeight: "100px" }}
              maxLength={1000}
            />
            <button type="submit" disabled={!text.trim() || !connected}
              className="shrink-0 rounded-xl p-2 transition disabled:opacity-30 hover:bg-orange-500/20"
              style={{ color: text.trim() ? "hsl(24,95%,56%)" : "var(--text-3)" }}>
              <svg className="h-5 w-5 rotate-45" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </form>
        <p className="text-center text-[10px] mt-1.5" style={{ color: "var(--text-4)" }}>
          Enter to send · Shift+Enter new line · Esc to cancel reply
        </p>
      </div>
    </div>
  );
}
