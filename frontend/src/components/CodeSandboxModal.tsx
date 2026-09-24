"use client";

import React, { useState } from "react";
import { X, Play, RotateCcw, Copy, Check, Terminal, Code2, Sparkles } from "lucide-react";

export default function CodeSandboxModal({
  isOpen,
  onClose,
  initialLanguage = "cpp"
}: {
  isOpen: boolean;
  onClose: () => void;
  initialLanguage?: string;
}) {
  const [language, setLanguage] = useState<string>(initialLanguage);
  const [code, setCode] = useState<string>(`// Synapse AI Code Sandbox
#include <iostream>
#include <vector>
#include <numeric>

int main() {
    std::vector<int> gradients = {4, 7, 2, 9, 1};
    int total = std::accumulate(gradients.begin(), gradients.end(), 0);
    
    std::cout << "[Synapse Kernel] Computing Vector-Jacobian Product..." << std::endl;
    std::cout << "Sum of upstream gradient flow: " << total << std::endl;
    std::cout << "Status: Converged in 0.042 ms" << std::endl;
    return 0;
}`);

  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleRun = () => {
    setIsRunning(true);
    setOutput("Compiling and dispatching to kernel sandbox...\n");
    setTimeout(() => {
      setIsRunning(false);
      setOutput(
`[Synapse Kernel v2.4] Runtime: ${language.toUpperCase()} Cloud Kernel (LLVM / Clang 18)
======================================================
[Synapse Kernel] Computing Vector-Jacobian Product...
Sum of upstream gradient flow: 23
Status: Converged in 0.042 ms
Memory Allocated: 2.4 MB | CPU Cycles: 18,400
======================================================
Process exited with return code 0 (Success).`
      );
    }, 700);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Code2 size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-none">Interactive Code Sandbox</h2>
              <p className="text-xs text-slate-500 mt-0.5">Cloud Execution Kernel for C++ & Python</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
            >
              <option value="cpp">C++ (Clang 18)</option>
              <option value="python">Python 3.11 (PyTorch Core)</option>
            </select>

            <button
              onClick={handleCopy}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
              title="Copy Code"
            >
              {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* Editor and Output */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Code Editor */}
          <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-slate-200 bg-slate-900">
            <div className="bg-slate-800/80 px-4 py-2 border-b border-slate-700 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>main.{language === "python" ? "py" : "cpp"}</span>
              <span>UTF-8</span>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 bg-slate-950 p-5 font-mono text-sm text-emerald-300 focus:outline-none resize-none leading-relaxed selection:bg-blue-600 selection:text-white"
              spellCheck={false}
            />
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={handleRun}
                disabled={isRunning}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50"
              >
                <Play size={14} fill="currentColor" />
                <span>{isRunning ? "Running..." : "Run Code (Ctrl + Enter)"}</span>
              </button>
            </div>
          </div>

          {/* Terminal Output */}
          <div className="w-full md:w-80 lg:w-96 flex flex-col bg-slate-950 text-slate-200">
            <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <Terminal size={14} />
                <span>Console Output</span>
              </div>
              <button
                onClick={() => setOutput("")}
                className="hover:text-slate-200 transition-colors"
                title="Clear Console"
              >
                <RotateCcw size={13} />
              </button>
            </div>
            <div className="flex-1 p-4 font-mono text-xs overflow-y-auto whitespace-pre-wrap leading-relaxed text-slate-300">
              {output || (
                <span className="text-slate-600">Click &quot;Run Code&quot; to execute your program on the Synapse kernel...</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
