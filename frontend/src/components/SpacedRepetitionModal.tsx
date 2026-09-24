"use client";

import React, { useState } from "react";
import { X, RotateCcw, Check, Sparkles, Brain, ArrowRight } from "lucide-react";
import "katex/dist/katex.min.css";
import dynamic from "next/dynamic";

const Latex = dynamic(() => import("react-latex-next"), { ssr: false });

export default function SpacedRepetitionModal({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);

  const CARDS = [
    {
      cardId: "CARD 081",
      topic: "GRAPHS & BACKPROPAGATION",
      interval: "4 Days",
      question: "Why does an Addition Gate act as an unaltered distributor of upstream gradients during backpropagation?",
      formula: "\\frac{\\partial L}{\\partial W_1} = \\frac{\\partial L}{\\partial Z} \\times 1",
      answer: "Since Z = W_1 + W_2, the partial derivative ∂Z/∂W_1 = 1. By the multivariable chain rule, ∂L/∂W_1 = (∂L/∂Z) × 1. Thus, the addition node routes the incoming upstream gradient identically to all inputs without scaling.",
      intervalOptions: [
        { label: "Again (<10m)", color: "bg-red-50 text-red-700 border-red-200" },
        { label: "Hard (2d)", color: "bg-amber-50 text-amber-700 border-amber-200" },
        { label: "Good (4d)", color: "bg-blue-50 text-blue-700 border-blue-200" },
        { label: "Easy (7d)", color: "bg-emerald-50 text-emerald-700 border-emerald-200" }
      ]
    },
    {
      cardId: "CARD 082",
      topic: "DATA STRUCTURES",
      interval: "3 Days",
      question: "What is the worst-case time complexity of inserting into a Hash Table with open addressing, and what causes it?",
      formula: "T_{\\text{worst}}(N) = O(N)",
      answer: "O(N) worst-case occurs when primary clustering or severe hash collisions force the probing sequence to scan through all occupied slots before finding an empty bucket.",
      intervalOptions: [
        { label: "Again (<10m)", color: "bg-red-50 text-red-700 border-red-200" },
        { label: "Hard (2d)", color: "bg-amber-50 text-amber-700 border-amber-200" },
        { label: "Good (4d)", color: "bg-blue-50 text-blue-700 border-blue-200" },
        { label: "Easy (7d)", color: "bg-emerald-50 text-emerald-700 border-emerald-200" }
      ]
    }
  ];

  if (!isOpen) return null;

  const card = CARDS[currentIdx];

  const handleNext = () => {
    setRevealed(false);
    setCurrentIdx((prev) => (prev + 1) % CARDS.length);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Brain size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-none">Spaced Repetition Review</h2>
              <p className="text-xs text-slate-500 mt-0.5">Card {currentIdx + 1} of {CARDS.length} Due Today</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </header>

        {/* Card Body */}
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <span>{card.cardId} • {card.topic}</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">Interval: {card.interval}</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug mb-4">
              {card.question}
            </h3>

            {card.formula && (
              <div className="bg-white border border-slate-200 rounded-xl p-3 text-center my-3">
                <Latex>{`$$${card.formula}$$`}</Latex>
              </div>
            )}

            {revealed ? (
              <div className="mt-5 pt-5 border-t border-slate-200 animate-in fade-in">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 mb-1 block">Answer & Insight:</span>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {card.answer}
                </p>
              </div>
            ) : (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setRevealed(true)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95"
                >
                  Show Socratic Answer
                </button>
              </div>
            )}
          </div>

          {/* Rating Intervals */}
          {revealed && (
            <div className="space-y-2 animate-in fade-in">
              <span className="text-xs font-semibold text-slate-500 block text-center">Rate Recall Quality:</span>
              <div className="grid grid-cols-4 gap-2">
                {card.intervalOptions.map((opt, oIdx) => (
                  <button
                    key={oIdx}
                    onClick={handleNext}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all hover:scale-[1.02] active:scale-95 ${opt.color}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
