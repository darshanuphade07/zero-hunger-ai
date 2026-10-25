"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquareText,
  Send,
  Sparkles,
  Bot,
  User,
  Info,
  CheckCircle2,
  HelpCircle,
  Leaf
} from "lucide-react";
import { sendChatMessage, fetchHealth } from "../../lib/api";
import { CROPS, MAHARASHTRA_LOCATIONS } from "../../lib/constants";
import DisclaimerBanner from "../../components/DisclaimerBanner";
import AgentBadge from "../../components/AgentBadge";

interface Message {
  sender: "user" | "bot";
  text: string;
  time: string;
  mode?: string;
  sourceNotes?: string;
  suggestedFollowups?: string[];
}

const DEFAULT_CHIPS = [
  "How to control pink bollworm in cotton?",
  "When should I irrigate my soybean crop?",
  "My soil pH is 8.2, what should I do?",
  "How to prepare Jeevamrut for 1 acre?",
  "Best fertilizer schedule for onion",
  "Soybean rust symptoms and organic remedies",
];

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Namaskar! I am **AgriMitra**, your AI precision farming advisor. How can I help you today with crop pest control, soil fertility, drip irrigation, or weather advisories in Maharashtra?",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      mode: "offline_demo",
      suggestedFollowups: DEFAULT_CHIPS.slice(0, 3),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState("Soybean");
  const [selectedLocation, setSelectedLocation] = useState("Pune, Maharashtra");
  const [isGeminiActive, setIsGeminiActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchHealth().then((d) => setIsGeminiActive(Boolean(d.gemini_configured)));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (messageText: string) => {
    if (!messageText.trim()) return;

    const userMsg: Message = {
      sender: "user",
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await sendChatMessage(messageText, selectedCrop, selectedLocation);
      const botMsg: Message = {
        sender: "bot",
        text: res.reply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        mode: res.mode,
        sourceNotes: res.source_notes,
        suggestedFollowups: res.suggested_followups,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const errorMsg: Message = {
        sender: "bot",
        text: "Sorry, I encountered an issue connecting to the AgriSmart server. Please verify your backend server on port 8000.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        mode: "offline_demo",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-emerald-100 text-emerald-800">
              <Bot className="w-4 h-4" />
            </span>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                isGeminiActive
                  ? "bg-purple-50 text-purple-700 border-purple-200"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200"
              }`}
            >
              {isGeminiActive
                ? "Active: Google Gemini 1.5 Flash"
                : "Offline Demo Fallback Mode (No API Key Needed)"}
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            AgriMitra · Farmer AI Assistant
          </h1>
          <p className="text-sm text-gray-500">
            Conversational agronomic extension officer for pest control, crop nutrition, and irrigation queries.
          </p>
        </div>

        {/* Farm Context */}
        <div className="flex items-center gap-2">
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-xs rounded-lg p-2 font-medium"
          >
            {CROPS.map((c) => (
              <option key={c.name} value={c.name}>
                Crop: {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-xs rounded-lg p-2 font-medium"
          >
            {MAHARASHTRA_LOCATIONS.map((l) => (
              <option key={l.name} value={l.name}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DisclaimerBanner customText="Advisory Notice: AgriMitra provides educational agronomic heuristics based on standard ICAR practices. Always follow agrochemical safety label guidelines and observe pre-harvest intervals." />

      {/* Chat Window */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[580px] overflow-hidden">
        {/* Messages Body */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${
                m.sender === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white shadow-sm ${
                  m.sender === "user"
                    ? "bg-slate-700"
                    : "bg-emerald-600"
                }`}
              >
                {m.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 text-xs md:text-sm leading-relaxed ${
                  m.sender === "user"
                    ? "bg-emerald-700 text-white rounded-tr-none shadow-sm"
                    : "bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none shadow-sm"
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>

                {/* Meta details for bot */}
                {m.sender === "bot" && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200/80 text-[10px] text-slate-400 flex flex-wrap items-center justify-between gap-1">
                    <span>{m.time}</span>
                    {m.sourceNotes && <span>{m.sourceNotes}</span>}
                  </div>
                )}

                {/* Follow-up question chips */}
                {m.suggestedFollowups && m.suggestedFollowups.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-200/60">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">
                      Suggested Inquiries:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {m.suggestedFollowups.map((f, fIdx) => (
                        <button
                          key={fIdx}
                          onClick={() => handleSend(f)}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-white border border-gray-300 text-emerald-800 hover:bg-emerald-50 hover:border-emerald-400 transition-colors"
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-none text-xs text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>AgriMitra is consulting agronomic knowledge base...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-gray-50 border-t border-gray-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask AgriMitra about pests, drip runtime, fertilizers, or diseases..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white rounded-xl transition-colors shadow-sm"
              title="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
