"use client";

import React, { useState, useEffect } from "react";
import { 
  X, Puzzle, Code2, BookOpen, BarChart3, 
  Sparkles, Volume2, Target, Check, RotateCcw,
  Mic
} from "lucide-react";

export interface ExtensionConfig {
  code_sandbox: boolean;
  oral_viva_defense: boolean;
  ai_teach_mode: boolean;
  quiz_history: boolean;
  math_deconstructor: boolean;
  voice_narration: boolean;
  milestone_predictor: boolean;
}

export const DEFAULT_EXTENSIONS: ExtensionConfig = {
  code_sandbox: true,
  oral_viva_defense: true,
  ai_teach_mode: true,
  quiz_history: true,
  math_deconstructor: true,
  voice_narration: true,
  milestone_predictor: true,
};

interface ExtensionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (config: ExtensionConfig) => void;
}

export default function ExtensionsModal({ isOpen, onClose, onUpdate }: ExtensionsModalProps) {
  const [config, setConfig] = useState<ExtensionConfig>(DEFAULT_EXTENSIONS);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("synapse_extensions");
      if (saved) {
        setConfig({ ...DEFAULT_EXTENSIONS, ...JSON.parse(saved) });
      }
    } catch (e) {
      console.warn("Failed to load extensions config", e);
    }
  }, [isOpen]);

  const toggleExtension = (key: keyof ExtensionConfig) => {
    const updated = { ...config, [key]: !config[key] };
    setConfig(updated);
    localStorage.setItem("synapse_extensions", JSON.stringify(updated));
    window.dispatchEvent(new Event("synapse-extensions-updated"));
    if (onUpdate) onUpdate(updated);
  };

  const resetDefaults = () => {
    setConfig(DEFAULT_EXTENSIONS);
    localStorage.setItem("synapse_extensions", JSON.stringify(DEFAULT_EXTENSIONS));
    window.dispatchEvent(new Event("synapse-extensions-updated"));
    if (onUpdate) onUpdate(DEFAULT_EXTENSIONS);
  };

  if (!isOpen) return null;

  const extensionsList = [
    {
      key: "code_sandbox" as const,
      title: "Interactive Code Sandbox",
      category: "Compiler & IDE",
      desc: "Displays the cloud C++ & Python compiler and runtime widget directly on your Dashboard.",
      icon: <Code2 size={18} className="text-blue-600" />,
      highlight: true
    },
    {
      key: "oral_viva_defense" as const,
      title: "Oral Viva Voice Defense",
      category: "Voice AI Examiner",
      desc: "Interactive viva defense room with speech recognition, AI examiner voice questions, optional syllabus document grounding, and defense report card.",
      icon: <Mic size={18} className="text-violet-600" />,
      highlight: true
    },
    {
      key: "ai_teach_mode" as const,
      title: "AI Teach Mode in Books",
      category: "Textbook Intelligence",
      desc: "Analyzes textbook pages in real-time, extracts core formulas, and generates custom Mermaid diagrams.",
      icon: <BookOpen size={18} className="text-indigo-600" />
    },
    {
      key: "quiz_history" as const,
      title: "Quiz History & Accuracy Tracker",
      category: "Assessment Analytics",
      desc: "Stores past quiz attempts, logs knowledge gaps, and charts question accuracy over time.",
      icon: <BarChart3 size={18} className="text-emerald-600" />
    },
    {
      key: "math_deconstructor" as const,
      title: "Math Formula Deconstructor",
      category: "Symbolic Reasoning",
      desc: "Breaks down complex LaTeX calculus and linear algebra equations into clear, plain-English steps.",
      icon: <Sparkles size={18} className="text-purple-600" />
    },
    {
      key: "voice_narration" as const,
      title: "Voice AI Speech Narration",
      category: "Multimodal Audio",
      desc: "Narrates board phases, textbook explanations, and quiz questions aloud using Web Speech.",
      icon: <Volume2 size={18} className="text-amber-600" />
    },
    {
      key: "milestone_predictor" as const,
      title: "Exam Readiness Predictor",
      category: "AI Cadence",
      desc: "Projects syllabus completion probability based on daily hours and quiz scores.",
      icon: <Target size={18} className="text-rose-600" />
    }
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[110] p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 w-full max-w-2xl shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold">
              <Puzzle size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">Workspace Extensions</h2>
                <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                  Custom Modular LMS
                </span>
              </div>
              <p className="text-xs text-slate-500">Enable or disable platform features. When toggled off, widgets are hidden from your dashboard.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Extensions List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
          {extensionsList.map((ext) => {
            const isEnabled = config[ext.key];
            return (
              <div 
                key={ext.key}
                onClick={() => toggleExtension(ext.key)}
                className={`p-4 rounded-2xl border-2 transition-all flex items-start justify-between gap-4 cursor-pointer select-none ${
                  isEnabled 
                    ? 'bg-white border-blue-500/40 shadow-xs' 
                    : 'bg-slate-50/70 border-slate-200/80 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 mt-0.5 ${
                    isEnabled ? 'bg-blue-50 border-blue-200' : 'bg-slate-100 border-slate-200'
                  }`}>
                    {ext.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="text-sm font-bold text-slate-900">{ext.title}</h4>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        {ext.category}
                      </span>
                      {ext.highlight && (
                        <span className="text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.2 rounded">
                          Dashboard Toggle
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-lg">
                      {ext.desc}
                    </p>
                  </div>
                </div>

                {/* Switch Toggle */}
                <div className={`w-12 h-6 rounded-full transition-colors relative shrink-0 mt-1.5 ${
                  isEnabled ? 'bg-blue-600' : 'bg-slate-300'
                }`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                    isEnabled ? 'right-0.5' : 'left-0.5'
                  }`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={resetDefaults}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-bold transition-colors cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>Reset to Defaults</span>
          </button>

          <button
            onClick={onClose}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Check size={14} />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
}
