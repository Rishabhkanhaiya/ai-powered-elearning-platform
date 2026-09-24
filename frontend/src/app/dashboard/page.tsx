"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Sparkles, Search, Bell, Settings, Flame, ArrowRight, BookOpen, 
  Code2, BarChart3, GraduationCap, ChevronRight, CheckCircle2, 
  RotateCcw, Compass, HelpCircle, FileText, Terminal, Layers, 
  Zap, Clock, Award, ShieldCheck, ArrowUpRight, TrendingUp, MessageSquare,
  Puzzle, History, Mic
} from "lucide-react";
import "katex/dist/katex.min.css";
import dynamic from "next/dynamic";

import BooksReaderModal, { LIBRARY_BOOKS } from "@/components/BooksReaderModal";
import CodeSandboxModal from "@/components/CodeSandboxModal";
import MathDeconstructorModal from "@/components/MathDeconstructorModal";
import SpacedRepetitionModal from "@/components/SpacedRepetitionModal";
import ExtensionsModal, { ExtensionConfig, DEFAULT_EXTENSIONS } from "@/components/ExtensionsModal";
import OralVivaModal from "@/components/OralVivaModal";
import UniversalAskAIModal from "@/components/UniversalAskAIModal";

const Latex = dynamic(() => import("react-latex-next"), { ssr: false });

export default function Level5Dashboard() {
  const [isBooksModalOpen, setIsBooksModalOpen] = useState(false);
  const [isSandboxModalOpen, setIsSandboxModalOpen] = useState(false);
  const [isMathModalOpen, setIsMathModalOpen] = useState(false);
  const [isSpacedModalOpen, setIsSpacedModalOpen] = useState(false);
  const [isExtensionsModalOpen, setIsExtensionsModalOpen] = useState(false);
  const [isVivaModalOpen, setIsVivaModalOpen] = useState(false);
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [extensions, setExtensions] = useState<ExtensionConfig>(DEFAULT_EXTENSIONS);
  const [recentQuizzes, setRecentQuizzes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userName, setUserName] = useState("Rishabh");

  useEffect(() => {
    const storedName = localStorage.getItem("student_name") || "Rishabh";
    setUserName(storedName);

    const loadConfigAndHistory = () => {
      try {
        const saved = localStorage.getItem("synapse_extensions");
        if (saved) setExtensions({ ...DEFAULT_EXTENSIONS, ...JSON.parse(saved) });
        const savedHistory = localStorage.getItem("quiz_history");
        if (savedHistory) setRecentQuizzes(JSON.parse(savedHistory).slice(0, 3));
      } catch (e) {
        console.warn("Failed to load extensions/history", e);
      }
    };

    loadConfigAndHistory();
    window.addEventListener("synapse-extensions-updated", loadConfigAndHistory);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsAskModalOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("synapse-extensions-updated", loadConfigAndHistory);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-slate-200/90 px-6 py-3 sticky top-0 z-30 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3 w-64 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs">
            <Sparkles size={16} />
          </div>
          <div>
            <span className="font-extrabold text-base text-slate-900 tracking-tight">Synapse AI</span>
            <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-bold ml-1.5 border border-blue-200">
              LMS
            </span>
          </div>
        </div>

        {/* Center Search Bar / Ask AI Trigger */}
        <div className="flex-1 max-w-xl px-4 hidden md:block">
          <div 
            onClick={() => setIsAskModalOpen(true)}
            className="relative cursor-pointer group"
          >
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-600 transition-colors" />
            <input
              type="text"
              readOnly
              value={searchQuery}
              placeholder="Ask AI any question, paste screenshot (Ctrl+V), or upload document..."
              className="w-full pl-9 pr-14 py-2 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold bg-white text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs group-hover:border-blue-300 group-hover:text-blue-600 transition-colors">
              ⌘K
            </span>
          </div>
        </div>

        {/* Right Badges & Actions */}
        <div className="flex items-center gap-2.5">
          {/* Ask AI Doubt Button */}
          <button
            onClick={() => setIsAskModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 rounded-full text-xs font-bold text-blue-700 shadow-2xs transition-all cursor-pointer"
            title="Ask AI Doubt / Upload Photo & Document"
          >
            <Sparkles size={13} className="text-blue-600" />
            <span>Ask AI Doubt</span>
          </button>

          {/* Extensions Button */}
          <button
            onClick={() => setIsExtensionsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-full text-xs font-bold text-amber-800 shadow-2xs transition-all cursor-pointer"
            title="Workspace Extensions"
          >
            <Puzzle size={13} className="text-amber-600" />
            <span>Extensions</span>
          </button>

          {/* 14 Day Streak Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200/80 rounded-full text-xs font-bold text-amber-800 shadow-2xs">
            <Flame size={14} className="text-amber-500 fill-amber-500" />
            <span>14 Day Streak</span>
          </div>

          <button 
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors relative"
            title="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full" />
          </button>

          {/* User Profile Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {userName.substring(0, 2).toUpperCase()}
            </div>
            <span className="text-xs font-bold text-slate-700 hidden lg:inline">{userName}</span>
          </div>
        </div>
      </header>

      {/* Main Layout Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between shrink-0 p-4 shadow-2xs overflow-y-auto">
          <div className="space-y-6">
            {/* Workspace Brand Subtitle */}
            <div className="px-2 pt-1">
              <h3 className="text-sm font-bold text-slate-900 leading-none">Workspace</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">v2.4 Cognitive Core</p>
            </div>

            {/* Section 1: Learning Core */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-2">
                Learning Core
              </span>
              <nav className="space-y-1">
                <Link
                  href="/board"
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors group"
                >
                  <GraduationCap size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                  <span>AI Tutor</span>
                </Link>

                <button
                  onClick={() => setIsBooksModalOpen(true)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors group text-left cursor-pointer"
                >
                  <BookOpen size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                  <span className="flex-1">Books Library</span>
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.2 rounded border border-blue-200">
                    6
                  </span>
                </button>

                {extensions.oral_viva_defense && (
                  <button
                    onClick={() => setIsVivaModalOpen(true)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-violet-50 hover:text-violet-700 transition-colors group text-left cursor-pointer"
                  >
                    <Mic size={16} className="text-slate-400 group-hover:text-violet-600 transition-colors" />
                    <span className="flex-1">Oral Viva Defense</span>
                    <span className="text-[9px] font-bold bg-violet-50 text-violet-700 px-1.5 py-0.2 rounded border border-violet-200">
                      Voice AI
                    </span>
                  </button>
                )}

                <button
                  onClick={() => setIsAskModalOpen(true)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors group text-left cursor-pointer"
                >
                  <Sparkles size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                  <span className="flex-1">AI Doubt Solver</span>
                  <span className="text-[9px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded border border-blue-200">
                    Vision/Doc
                  </span>
                </button>
              </nav>
            </div>

            {/* Section 2: Workspace & Tools */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-2">
                Workspace & Tools
              </span>
              <nav className="space-y-1">
                <Link
                  href="/"
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50/80 border border-blue-200/60 shadow-2xs"
                >
                  <Layers size={16} className="text-blue-600" />
                  <span>Course Modules</span>
                </Link>

                {extensions.code_sandbox && (
                  <Link
                    href="/sandbox"
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors group"
                  >
                    <Code2 size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                    <span>Code Sandbox</span>
                  </Link>
                )}

                <Link
                  href="/quiz"
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors group"
                >
                  <BarChart3 size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                  <span>Mastery Analytics</span>
                </Link>
              </nav>
            </div>
          </div>

          {/* Bottom Card: Pro Status */}
          <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 border border-blue-200/70 rounded-2xl p-4 mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold tracking-wider uppercase text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full">
                SYNAPSE PRO
              </span>
              <span className="text-[10px] text-slate-400 font-mono">GPT-4o / Gemini</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed font-medium mb-3">
              Active neural reasoning and infinite sandbox generation.
            </p>
            <div className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs text-center transition-all cursor-pointer">
              Core Active
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
          {/* Hero Welcome Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  <span>Neural Engine v1.2 Active</span>
                  <span className="text-slate-300">•</span>
                  <span className="font-mono text-[11px] text-slate-400">Session Token: #SYN-0921</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Good morning, {userName}!
                </h1>
                <p className="text-sm text-slate-600 font-medium max-w-2xl leading-relaxed">
                  Ready to master <strong className="text-slate-900">Computational Graphs & Reverse-Mode AutoDiff</strong>? Your cognitive retention is peaking at <strong className="text-blue-600">87%</strong>.
                </p>

                {/* Stat Chips */}
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-semibold">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700">
                    <span className="text-slate-400">DAILY GOAL</span>
                    <span className="text-blue-600 font-bold">32 / 45 mins (71%)</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700">
                    <span className="text-slate-400">SUGGESTED SPRINT</span>
                    <span className="text-slate-800 font-bold">Backprop Chain Rule (15m)</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
                <Link
                  href="/board"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/25 transition-all active:scale-95"
                >
                  <span>Jump into AI Tutor</span>
                  <ArrowRight size={14} />
                </Link>

                <button
                  onClick={() => setIsBooksModalOpen(true)}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-semibold text-xs transition-colors"
                >
                  <BookOpen size={14} className="text-blue-600" />
                  <span>Resume Deep Learning (Ch. 6 / p. 187)</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4 Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Study Streak</span>
                <span className="text-amber-500">🏆</span>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-extrabold text-slate-900">14</span>
                <span className="text-xs text-slate-500 font-medium">days in a row</span>
              </div>
              <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <span>🥇 Personal All-Time Best</span>
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Aggregate Mastery</span>
                <span className="text-blue-500">📈</span>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-extrabold text-slate-900">84%</span>
                <span className="text-xs text-slate-500 font-medium">across 4 tracks</span>
              </div>
              <p className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                <TrendingUp size={13} />
                <span>+4.2% velocity this week</span>
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span>AI Tutor Chats</span>
                <span className="text-purple-500">💬</span>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-extrabold text-slate-900">42</span>
                <span className="text-xs text-slate-500 font-medium">doubts cleared</span>
              </div>
              <p className="text-xs font-semibold text-purple-600">
                <span>🔹 18 practice problems solved</span>
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Comprehension Pace</span>
                <span className="text-emerald-500">⚡</span>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-extrabold text-slate-900">1.8x</span>
                <span className="text-xs text-slate-500 font-medium">reading speed</span>
              </div>
              <p className="text-xs font-semibold text-slate-600">
                <span>📖 6 textbooks parsed & indexed</span>
              </p>
            </div>
          </div>

          {/* Main 2-Column Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Tracks, Socratic Dialogues, Books */}
            <div className="lg:col-span-2 space-y-6">
              {/* Section 1: Active Learning Tracks */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                  <h2 className="text-base font-bold text-slate-900">Active Learning Tracks</h2>
                  <Link href="/" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    <span>View all modules</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>

                <div className="space-y-4">
                  {/* Track 1 */}
                  <div className="p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-blue-200 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                          <Compass size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                              NEURAL CORE
                            </span>
                            <span className="text-xs text-slate-400 font-medium">Next: Branching Gradient Sum</span>
                          </div>
                          <h3 className="font-bold text-sm sm:text-base text-slate-900">
                            Computational Graphs & Reverse-Mode AutoDiff
                          </h3>
                        </div>
                      </div>

                      <Link
                        href="/board"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all shrink-0"
                      >
                        Continue →
                      </Link>
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full w-[88%]" />
                      </div>
                      <span className="text-xs font-bold text-slate-700">88% Complete</span>
                    </div>
                  </div>

                  {/* Track 2 */}
                  <div className="p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0 border border-slate-200">
                          <ShieldCheck size={20} className="text-slate-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                              REINFORCEMENT LEARNING
                            </span>
                            <span className="text-xs text-slate-400 font-medium">Next: Actor-Critic Architectures</span>
                          </div>
                          <h3 className="font-bold text-sm sm:text-base text-slate-800">
                            Policy Gradients, Trust Region & Proximal Optimization
                          </h3>
                        </div>
                      </div>

                      <Link
                        href="/board"
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all shrink-0"
                      >
                        Resume →
                      </Link>
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full rounded-full w-[45%]" />
                      </div>
                      <span className="text-xs font-bold text-slate-700">45% Complete</span>
                    </div>
                  </div>

                  {/* Track 3 */}
                  <div className="p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0 border border-slate-200">
                          <Sparkles size={20} className="text-slate-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                              FOUNDATION MODELS
                            </span>
                            <span className="text-xs text-slate-400 font-medium">Next: Scaled Dot-Product Mathematics</span>
                          </div>
                          <h3 className="font-bold text-sm sm:text-base text-slate-800">
                            Transformer Attention Mechanisms & Positional Encoding
                          </h3>
                        </div>
                      </div>

                      <Link
                        href="/board"
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all shrink-0"
                      >
                        Resume →
                      </Link>
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-purple-600 h-full rounded-full w-[16%]" />
                      </div>
                      <span className="text-xs font-bold text-slate-700">16% Complete</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Recent AI Tutor Discussions */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                  <h2 className="text-base font-bold text-slate-900">Recent AI Tutor Discussions</h2>
                  <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                    Saved Explanations
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Dialogue Card 1 */}
                  <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4 flex flex-col justify-between hover:border-blue-200 transition-all">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                        <span>2 hours ago</span>
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded text-[10px]">
                          GATE Quiz Pass
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 mb-1.5 leading-snug">
                        Jacobian Decomposition in Reverse-Mode AutoDiff
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        &quot;Explained how scalar loss allows vector-Jacobian products to bypass explicit matrix inversion...&quot;
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-200/60 mt-3 flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2 text-slate-500">
                        <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-[10px]">3 Formulas</span>
                        <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-[10px]">1 Code Block</span>
                      </div>
                      <Link href="/board" className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
                        <span>Replay</span>
                        <RotateCcw size={12} />
                      </Link>
                    </div>
                  </div>

                  {/* Dialogue Card 2 */}
                  <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4 flex flex-col justify-between hover:border-blue-200 transition-all">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                        <span>Yesterday, 18:40</span>
                        <span className="bg-blue-50 text-blue-700 border border-blue-200 font-bold px-2 py-0.5 rounded text-[10px]">
                          Concept Solidified
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 mb-1.5 leading-snug">
                        Raft Consensus: Split Vote Resolution
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        &quot;Ran counter-factual simulations on randomized election timeouts to demonstrate quorum preservation...&quot;
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-200/60 mt-3 flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2 text-slate-500">
                        <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-[10px]">State Diagram</span>
                        <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-[10px]">Log Invariants</span>
                      </div>
                      <Link href="/board" className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
                        <span>Replay</span>
                        <RotateCcw size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Active Reading & AI Annotations (THE BOOKS SECTION) */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                  <h2 className="text-base font-bold text-slate-900">Active Reading & AI Annotations</h2>
                  <button 
                    onClick={() => setIsBooksModalOpen(true)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <span>Library (6 books)</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                {/* Featured Textbook Card */}
                <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-5 hover:border-blue-200 transition-all flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div className="w-24 h-32 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-800 text-white p-3 flex flex-col justify-between shrink-0 shadow-sm">
                    <span className="text-[9px] font-bold uppercase opacity-75">MIT Press</span>
                    <span className="font-extrabold text-xs leading-tight">Deep Learning</span>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <span>DEEP LEARNING (GOODFELLOW, BENGIO, COURVILLE)</span>
                      <span>•</span>
                      <span className="text-blue-600">32 AI Margin Notes</span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 leading-snug">
                      Chapter 6: Deep Feedforward Networks & Cost Functions
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Current position on <strong className="text-slate-800">Page 187</strong>. AI has summarized 3 complex matrix calculus derivations into expandable marginal callouts for today&apos;s session.
                    </p>

                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <div className="flex -space-x-1.5">
                          <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-[9px] font-bold flex items-center justify-center">IG</span>
                          <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-[9px] font-bold flex items-center justify-center">YB</span>
                          <span className="w-5 h-5 rounded-full bg-purple-500 text-white text-[9px] font-bold flex items-center justify-center">AC</span>
                        </div>
                        <span className="text-[11px]">Collaborative Highlights</span>
                      </div>

                      <button
                        onClick={() => setIsBooksModalOpen(true)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
                      >
                        <BookOpen size={13} />
                        <span>Open in AI Reader</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Quiz History & Performance Tracker */}
              {extensions.quiz_history && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                    <div className="flex items-center gap-2">
                      <Award size={18} className="text-blue-600" />
                      <h2 className="text-base font-bold text-slate-900">Recent Quiz History & Accuracy</h2>
                    </div>
                    <Link href="/quiz" className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                      <span>View All History ({recentQuizzes.length})</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>

                  {recentQuizzes.length === 0 ? (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                      <p className="text-xs text-slate-600">No quizzes logged yet. Test your knowledge to build history.</p>
                      <Link href="/quiz" className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs">
                        Take Quiz Now
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {recentQuizzes.map((quiz, qIdx) => (
                        <div key={qIdx} className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold mb-1">
                              <span>{quiz.date}</span>
                              <span className="text-blue-600 font-bold">{quiz.difficulty}</span>
                            </div>
                            <h4 className="font-bold text-xs text-slate-800 line-clamp-1 mb-2">
                              {quiz.topic}
                            </h4>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-slate-200/70">
                            <span className="text-[11px] font-bold text-slate-500">Score</span>
                            <span className={`text-xs font-black px-2 py-0.5 rounded-lg border ${
                              quiz.percentage >= 70 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {quiz.score}/{quiz.total} ({quiz.percentage}%)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Spaced Repetition, Checkpoint, Velocity, Launchers */}
            <div className="space-y-6">
              {/* Interactive Code Sandbox Card (Conditional on Extensions) */}
              {extensions.code_sandbox && (
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600 font-bold">💻</span>
                      <h3 className="text-sm font-bold text-slate-900">Interactive Code Sandbox</h3>
                    </div>
                    <span className="text-[11px] font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">
                      C++ & Python
                    </span>
                  </div>

                  <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>main.cpp (Clang 18)</span>
                      <span className="text-emerald-400">● Ready</span>
                    </div>

                    <p className="text-emerald-400 text-[11px] leading-relaxed select-none">
                      <span className="text-purple-400">int</span> total = std::accumulate(grad.begin(), grad.end(), <span className="text-amber-400">0</span>);<br/>
                      std::cout &lt;&lt; <span className="text-slate-200">&quot;Sum: &quot;</span> &lt;&lt; total &lt;&lt; std::endl;
                    </p>

                    <Link
                      href="/sandbox"
                      className="block w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold font-sans shadow-xs transition-all text-center"
                    >
                      Open Full Dedicated Code Screen →
                    </Link>
                  </div>
                </div>
              )}

              {/* Mastery Checkpoint Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-purple-600 font-bold">🎯</span>
                    <h3 className="text-sm font-bold text-slate-900">Mastery Checkpoint</h3>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">Tomorrow</span>
                </div>

                <div className="bg-purple-50/50 border border-purple-200/80 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-950">Module 04 Defense</span>
                    <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                      Oral Recruits
                    </span>
                  </div>
                  <p className="text-xs text-purple-900/80 leading-relaxed font-medium">
                    The AI will stress-test your knowledge of edge cases in backward passes and vanishing node accumulations.
                  </p>
                  <button 
                    onClick={() => alert("Simulation scheduled! Your AI tutor will launch this oral checkpoint tomorrow during your scheduled study hour.")}
                    className="w-full py-2 bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition-colors"
                  >
                    Run Simulation
                  </button>
                </div>
              </div>

              {/* Cognitive Focus Velocity */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 size={15} className="text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-900">Cognitive Focus Velocity</h3>
                  </div>
                  <span className="text-[10px] font-bold text-blue-600">Optimal Trend</span>
                </div>

                {/* Velocity Bar Chart */}
                <div className="flex items-end justify-between h-28 pt-4 px-2">
                  {[
                    { day: "M", val: 40 },
                    { day: "T", val: 65 },
                    { day: "W", val: 50 },
                    { day: "T", val: 78 },
                    { day: "F", val: 55 },
                    { day: "S", val: 70 },
                    { day: "S", val: 92, active: true },
                  ].map((bar, bIdx) => (
                    <div key={bIdx} className="flex flex-col items-center gap-1.5 flex-1">
                      <div className="w-full max-w-[20px] bg-slate-100 rounded-t-md h-20 flex items-end">
                        <div 
                          className={`w-full rounded-t-md transition-all duration-500 ${
                            bar.active ? 'bg-blue-600' : 'bg-slate-200'
                          }`}
                          style={{ height: `${bar.val}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">{bar.day}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Peak Retention Window:</span>
                  <span className="font-bold text-slate-800">08:00 AM - 10:30 AM</span>
                </div>
              </div>

              {/* Quick Launchers Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
                  Quick Launchers
                </span>

                <div className="space-y-2">
                  <button
                    onClick={() => setIsMathModalOpen(true)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-700 transition-colors group text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-purple-600 font-mono font-bold text-sm">∑</span>
                      <div>
                        <div className="font-bold text-slate-800">Deconstruct Math Formula</div>
                        <div className="text-[10px] text-slate-400 font-normal">Step-by-step formula breakdown</div>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-800 transition-colors" />
                  </button>

                  <button
                    onClick={() => setIsBooksModalOpen(true)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-700 transition-colors group text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText size={16} className="text-amber-500" />
                      <div>
                        <div className="font-bold text-slate-800">Ingest Textbook / PDF</div>
                        <div className="text-[10px] text-slate-400 font-normal">Indexed chapters with AI margin notes</div>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-800 transition-colors" />
                  </button>

                  {extensions.oral_viva_defense && (
                    <button
                      onClick={() => setIsVivaModalOpen(true)}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-violet-50/60 hover:bg-violet-100/60 border border-violet-200/80 text-xs font-semibold text-violet-800 transition-colors group text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Mic size={16} className="text-violet-600" />
                        <div>
                          <div className="font-bold text-violet-950">Oral Viva Voice Defense</div>
                          <div className="text-[10px] text-violet-600 font-normal">Real-time voice examiner & syllabus defense</div>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-violet-400 group-hover:text-violet-800 transition-colors" />
                    </button>
                  )}

                  <button
                    onClick={() => setIsAskModalOpen(true)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-blue-50/60 hover:bg-blue-100/60 border border-blue-200/80 text-xs font-semibold text-blue-800 transition-colors group text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Sparkles size={16} className="text-blue-600" />
                      <div>
                        <div className="font-bold text-blue-950">Ask AI Doubt Solver</div>
                        <div className="text-[10px] text-blue-600 font-normal">Visual photo & doc math/code analysis</div>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-blue-400 group-hover:text-blue-800 transition-colors" />
                  </button>

                  {extensions.code_sandbox && (
                    <Link
                      href="/sandbox"
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-700 transition-colors group text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <Terminal size={16} className="text-emerald-500" />
                        <div>
                          <div className="font-bold text-slate-800">Dedicated Code Sandbox</div>
                          <div className="text-[10px] text-slate-400 font-normal">Full-screen C++ & Python compiler</div>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-800 transition-colors" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Interactive Feature Modals */}
      <ExtensionsModal
        isOpen={isExtensionsModalOpen}
        onClose={() => setIsExtensionsModalOpen(false)}
      />

      <BooksReaderModal
        isOpen={isBooksModalOpen}
        onClose={() => setIsBooksModalOpen(false)}
      />

      <CodeSandboxModal
        isOpen={isSandboxModalOpen}
        onClose={() => setIsSandboxModalOpen(false)}
      />

      <MathDeconstructorModal
        isOpen={isMathModalOpen}
        onClose={() => setIsMathModalOpen(false)}
      />

      <SpacedRepetitionModal
        isOpen={isSpacedModalOpen}
        onClose={() => setIsSpacedModalOpen(false)}
      />

      <OralVivaModal
        isOpen={isVivaModalOpen}
        onClose={() => setIsVivaModalOpen(false)}
      />

      <UniversalAskAIModal
        isOpen={isAskModalOpen}
        onClose={() => setIsAskModalOpen(false)}
      />
    </div>
  );
}
