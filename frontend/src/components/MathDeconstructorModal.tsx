"use client";

import React, { useState } from "react";
import { X, Sparkles, BookOpen, Layers, CheckCircle, ArrowRight, Compass } from "lucide-react";
import "katex/dist/katex.min.css";
import dynamic from "next/dynamic";

const Latex = dynamic(() => import("react-latex-next"), { ssr: false });

export default function MathDeconstructorModal({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [selectedFormulaIndex, setSelectedFormulaIndex] = useState(0);

  const FORMULAS = [
    {
      name: "Vector-Jacobian Product (Backpropagation)",
      latex: "\\frac{\\partial L}{\\partial \\mathbf{x}} = \\left( \\frac{\\partial \\mathbf{y}}{\\partial \\mathbf{x}} \\right)^T \\frac{\\partial L}{\\partial \\mathbf{y}} = \\mathbf{J}^T \\mathbf{v}",
      context: "Deep Learning & Reverse-Mode Automatic Differentiation",
      breakdown: [
        { term: "\\mathbf{J} = \\frac{\\partial \\mathbf{y}}{\\partial \\mathbf{x}}", explanation: "The Jacobian matrix of partial derivatives of output vector y with respect to input vector x." },
        { term: "\\mathbf{v} = \\frac{\\partial L}{\\partial \\mathbf{y}}", explanation: "Upstream gradient vector flowing back from the scalar objective loss L." },
        { term: "\\mathbf{J}^T \\mathbf{v}", explanation: "Vector-Jacobian product computes total gradient in O(N) operations without ever instantiating the N×N Jacobian in memory!" }
      ],
      examTakeaway: "In backpropagation, evaluating from output backwards requires only matrix-vector products (O(N)), whereas forward evaluation would require full matrix-matrix multiplication (O(N^3))."
    },
    {
      name: "Transformer Scaled Dot-Product Attention",
      latex: "\\text{Attention}(Q, K, V) = \\text{softmax}\\left( \\frac{Q K^T}{\\sqrt{d_k}} \\right) V",
      context: "Attention Mechanisms & Large Language Models",
      breakdown: [
        { term: "Q K^T", explanation: "Computes similarity score (dot-product) between query token and every key token in sequence." },
        { term: "\\frac{1}{\\sqrt{d_k}}", explanation: "Scaling factor prevents dot products from growing excessively large, keeping softmax gradients out of vanishing regions." },
        { term: "\\text{softmax}(\\cdot)", explanation: "Normalizes raw compatibility logits into a true probability distribution summing to 1 across all tokens." },
        { term: "(\\cdot) V", explanation: "Computes the expected value across all value vectors weighted by attention probabilities." }
      ],
      examTakeaway: "Self-attention has quadratic O(N^2) memory complexity with respect to sequence length N due to the N×N attention matrix."
    },
    {
      name: "Cardiac Output Formula",
      latex: "\\text{CO} = \\text{SV} \\times \\text{HR} = 70\\text{ mL} \\times 72\\text{ bpm} \\approx 5040\\text{ mL/min} = 5.04\\text{ L/min}",
      context: "NEET Human Physiology • Body Fluids & Circulation",
      breakdown: [
        { term: "\\text{CO}", explanation: "Cardiac Output: Volume of blood pumped out by each ventricle per minute." },
        { term: "\\text{SV}", explanation: "Stroke Volume: Volume of blood pumped out of one ventricle with each beat (~70 mL)." },
        { term: "\\text{HR}", explanation: "Heart Rate: Number of beats per minute controlled by SAN pacemaker (~72 bpm)." }
      ],
      examTakeaway: "Athletes have higher stroke volume, allowing lower resting heart rate while maintaining the same 5 L/min cardiac output."
    }
  ];

  if (!isOpen) return null;

  const current = FORMULAS[selectedFormulaIndex];

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl flex flex-col shadow-2xl overflow-hidden max-h-[90vh]">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-none">Mathematical Formula Deconstructor</h2>
              <p className="text-xs text-slate-500 mt-0.5">Step-by-Step Term Breakdown</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </header>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Formula Selector Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {FORMULAS.map((f, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedFormulaIndex(idx)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedFormulaIndex === idx
                    ? "bg-purple-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f.name.split(' (')[0]}
              </button>
            ))}
          </div>

          {/* Formula Display Box */}
          <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-6 text-center shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 bg-purple-100/70 px-2.5 py-0.5 rounded-full">
              {current.context}
            </span>
            <div className="text-xl sm:text-3xl text-purple-950 py-5 overflow-x-auto">
              <Latex>{`$$${current.latex}$$`}</Latex>
            </div>
            <h3 className="text-base font-bold text-slate-800">{current.name}</h3>
          </div>

          {/* Socratic Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Term-by-Term Semantic Breakdown
            </h4>
            {current.breakdown.map((b, bIdx) => (
              <div key={bIdx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="font-mono text-sm font-bold text-purple-700 bg-white px-3 py-1.5 rounded-lg border border-purple-100 shrink-0">
                  <Latex>{`$${b.term}$`}</Latex>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                  {b.explanation}
                </p>
              </div>
            ))}
          </div>

          {/* Exam Takeaway */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 text-xs sm:text-sm text-blue-900 leading-relaxed font-medium flex items-start gap-2.5">
            <CheckCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Examiner Takeaway: </span>
              <span>{current.examTakeaway}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
