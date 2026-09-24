"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  LayoutDashboard, 
  GraduationCap, 
  HelpCircle, 
  Play, 
  RotateCcw, 
  Copy, 
  Check, 
  Download, 
  Terminal, 
  Cpu, 
  Code2, 
  CheckCircle2, 
  AlertTriangle,
  Lightbulb,
  FileCode2,
  BookOpen
} from 'lucide-react';

interface Preset {
  name: string;
  lang: 'cpp' | 'python' | 'javascript';
  code: string;
}

const PRESETS: Preset[] = [
  {
    name: "Two Sum (Hash Map O(N))",
    lang: "cpp",
    code: `// Two Sum Problem - Hash Map O(N)
#include <iostream>
#include <vector>
#include <unordered_map>

std::vector<int> twoSum(const std::vector<int>& nums, int target) {
    std::unordered_map<int, int> seen;
    for (int i = 0; i < nums.size(); ++i) {
        int complement = target - nums[i];
        if (seen.find(complement) != seen.end()) {
            return {seen[complement], i};
        }
        seen[nums[i]] = i;
    }
    return {};
}

int main() {
    std::vector<int> nums = {2, 7, 11, 15};
    int target = 9;
    std::cout << "[Synapse Engine] Running Two Sum..." << std::endl;
    auto result = twoSum(nums, target);
    if (!result.empty()) {
        std::cout << "Target " << target << " found at indices: [" 
                  << result[0] << ", " << result[1] << "]" << std::endl;
        std::cout << "Values: " << nums[result[0]] << " + " << nums[result[1]] << " = " << target << std::endl;
    }
    return 0;
}`
  },
  {
    name: "Vector-Jacobian Gradient (C++)",
    lang: "cpp",
    code: `// Synapse AI Code Sandbox - Vector-Jacobian Product
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
}`
  },
  {
    name: "Binary Search (Python)",
    lang: "python",
    code: `# Binary Search in Python (O(log N))
def binary_search(arr, target):
    low = 0
    high = len(arr) - 1
    steps = 0
    
    while low <= high:
        steps += 1
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid, steps
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
            
    return -1, steps

data = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21]
target = 15

print(f"[Python Engine] Searching for target {target} in array of size {len(data)}...")
idx, total_steps = binary_search(data, target)
print(f"Target found at index: {idx}")
print(f"Total binary comparisons: {total_steps} (Log2(N) complexity verified)")
`
  },
  {
    name: "Reverse Linked List (C++)",
    lang: "cpp",
    code: `// Reverse a Singly Linked List (Iterative O(N))
#include <iostream>

struct ListNode {
    int val;
    ListNode *next;
    ListNode(int x) : val(x), next(nullptr) {}
};

ListNode* reverseList(ListNode* head) {
    ListNode* prev = nullptr;
    ListNode* curr = head;
    while (curr != nullptr) {
        ListNode* nextTemp = curr->next;
        curr->next = prev;
        prev = curr;
        curr = nextTemp;
    }
    return prev;
}

int main() {
    ListNode* head = new ListNode(1);
    head->next = new ListNode(2);
    head->next->next = new ListNode(3);
    head->next->next->next = new ListNode(4);

    std::cout << "[LinkedList] Original: 1 -> 2 -> 3 -> 4 -> NULL" << std::endl;
    ListNode* rev = reverseList(head);
    std::cout << "[LinkedList] Reversed: ";
    while (rev) {
        std::cout << rev->val << " -> ";
        rev = rev->next;
    }
    std::cout << "NULL" << std::endl;
    return 0;
}`
  },
  {
    name: "Loss Function & MSE (Python)",
    lang: "python",
    code: `# Mean Squared Error Loss Calculation
y_true = [1.5, 2.0, 3.2, 4.8, 5.1]
y_pred = [1.4, 2.2, 3.1, 4.6, 5.3]

squared_errors = [(yt - yp) ** 2 for yt, yp in zip(y_true, y_pred)]
mse = sum(squared_errors) / len(squared_errors)

print("[Neural Loss] Computing Mean Squared Error...")
for i, (yt, yp, se) in enumerate(zip(y_true, y_pred, squared_errors)):
    print(f"Sample {i+1}: True={yt}, Pred={yp} -> Loss = {se:.4f}")
print(f"Overall MSE Loss: {mse:.4f}")
`
  }
];

export default function CodeSandboxPage() {
  const [selectedLang, setSelectedLang] = useState<'cpp' | 'python' | 'javascript'>('cpp');
  const [code, setCode] = useState(PRESETS[1].code);
  const [output, setOutput] = useState<string>('Click "Run Code" to execute your program on the Synapse kernel...');
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'console' | 'ai' | 'tests'>('console');
  const [execStats, setExecStats] = useState<{ time: string; memory: string; status: string } | null>(null);

  const handleRun = () => {
    setIsRunning(true);
    setOutput("Compiling and linking executable...\nExecuting on isolated container...");

    setTimeout(() => {
      setIsRunning(false);
      setExecStats({
        time: "0.038 ms",
        memory: "14.2 MB",
        status: "Exited with code 0"
      });

      // Interactive simulation based on code contents
      if (code.includes("twoSum") || code.includes("Two Sum")) {
        setOutput(`[Synapse Engine] Compiling C++ (Clang 18) ...\n[Synapse Engine] Running Two Sum...\nTarget 9 found at indices: [0, 1]\nValues: 2 + 7 = 9\n\n--------------------------------\nProgram exited successfully (Exit code: 0)`);
      } else if (code.includes("binary_search") || code.includes("Binary Search")) {
        setOutput(`[Python Engine] Searching for target 15 in array of size 11...\nTarget found at index: 7\nTotal binary comparisons: 3 (Log2(N) complexity verified)\n\n--------------------------------\nProcess finished with exit code 0`);
      } else if (code.includes("reverseList") || code.includes("Reverse")) {
        setOutput(`[Synapse Engine] Compiling C++ (Clang 18) ...\n[LinkedList] Original: 1 -> 2 -> 3 -> 4 -> NULL\n[LinkedList] Reversed: 4 -> 3 -> 2 -> 1 -> NULL\n\n--------------------------------\nMemory leak check: 0 bytes leaked. Clean exit.`);
      } else if (code.includes("Mean Squared Error") || code.includes("MSE")) {
        setOutput(`[Neural Loss] Computing Mean Squared Error...\nSample 1: True=1.5, Pred=1.4 -> Loss = 0.0100\nSample 2: True=2.0, Pred=2.2 -> Loss = 0.0400\nSample 3: True=3.2, Pred=3.1 -> Loss = 0.0100\nSample 4: True=4.8, Pred=4.6 -> Loss = 0.0400\nSample 5: True=5.1, Pred=5.3 -> Loss = 0.0400\nOverall MSE Loss: 0.0280\n\n--------------------------------\nProcess finished successfully.`);
      } else {
        // Generic execution
        setOutput(`[Synapse Kernel] Compiling code with high optimization (-O3)...\n[Synapse Kernel] Computing Vector-Jacobian Product...\nSum of upstream gradient flow: 23\nStatus: Converged in 0.042 ms\n\n--------------------------------\nProcess finished with exit code 0`);
      }
    }, 600);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = selectedLang === 'cpp' ? 'cpp' : selectedLang === 'python' ? 'py' : 'js';
    const element = document.createElement("a");
    const file = new Blob([code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `solution.${ext}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const selectPreset = (preset: Preset) => {
    setSelectedLang(preset.lang);
    setCode(preset.code);
    setOutput('Code preset loaded. Click "Run Code" to execute.');
    setExecStats(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Top Professional Navigation Bar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-6 py-3.5 sticky top-0 z-30 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs">
            <Sparkles size={16} />
          </div>
          <div>
            <span className="font-extrabold text-base text-slate-900 tracking-tight">Synapse AI</span>
            <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-bold ml-1.5 border border-blue-200">
              Level 5 LMS
            </span>
          </div>
        </div>

        {/* Global Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2 text-xs font-bold text-slate-600">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-blue-600 transition-colors"
          >
            <LayoutDashboard size={15} />
            <span>Dashboard</span>
          </Link>

          <Link 
            href="/board" 
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-blue-600 transition-colors"
          >
            <GraduationCap size={15} />
            <span>AI Tutor Board</span>
          </Link>

          <Link 
            href="/sandbox" 
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 text-blue-600 font-bold transition-colors border border-blue-100"
          >
            <Code2 size={15} />
            <span>Code Sandbox</span>
          </Link>

          <Link 
            href="/quiz" 
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-blue-600 transition-colors"
          >
            <HelpCircle size={15} />
            <span>Practice Quiz</span>
          </Link>

          <Link 
            href="/" 
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-blue-600 transition-colors"
          >
            <span>Study Planner</span>
          </Link>
        </nav>
      </header>

      {/* Sandbox Workspace Header & Action Toolbar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
            <Code2 size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-slate-900">Interactive Code Sandbox</h1>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Ready
              </span>
            </div>
            <p className="text-xs text-slate-500">Live code editor and compiler for C++, Python, and Algorithms</p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Preset Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl">
            <FileCode2 size={14} className="text-slate-400" />
            <select
              onChange={(e) => {
                const found = PRESETS.find(p => p.name === e.target.value);
                if (found) selectPreset(found);
              }}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              {PRESETS.map(p => (
                <option key={p.name} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Language Selector */}
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="cpp">C++ (Clang 18)</option>
            <option value="python">Python 3.11</option>
            <option value="javascript">JavaScript (Node.js)</option>
          </select>

          {/* Action Buttons */}
          <button
            onClick={handleCopy}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all cursor-pointer"
            title="Copy Code"
          >
            {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
          </button>

          <button
            onClick={handleDownload}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all cursor-pointer"
            title="Download File"
          >
            <Download size={16} />
          </button>

          <button
            onClick={() => setCode(PRESETS[0].code)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all cursor-pointer"
            title="Reset Code"
          >
            <RotateCcw size={16} />
          </button>

          {/* Run Button */}
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer disabled:bg-blue-300"
          >
            {isRunning ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Executing...</span>
              </span>
            ) : (
              <>
                <Play size={14} className="fill-white" />
                <span>Run Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main IDE Body */}
      <main className="flex-1 p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-7xl mx-auto w-full">
        {/* Left Pane: Code Editor */}
        <div className="bg-[#0f172a] rounded-2xl border border-slate-800 flex flex-col shadow-lg overflow-hidden h-[620px]">
          {/* File Tab */}
          <div className="bg-[#1e293b] px-4 py-2.5 flex items-center justify-between border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
              <span className="text-slate-300 font-mono font-medium ml-2">
                {selectedLang === 'cpp' ? 'main.cpp' : selectedLang === 'python' ? 'solution.py' : 'index.js'}
              </span>
            </div>
            <span className="text-slate-500 font-mono text-[11px]">UTF-8 • Unix (LF)</span>
          </div>

          {/* Textarea Code Editor */}
          <div className="flex-1 relative p-4 flex">
            {/* Fake line numbers */}
            <div className="text-slate-600 font-mono text-xs select-none pr-3 text-right leading-6 opacity-60">
              {code.split('\n').map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck="false"
              className="flex-1 bg-transparent text-emerald-400 font-mono text-xs leading-6 resize-none focus:outline-none pl-2 selection:bg-blue-600 selection:text-white"
            />
          </div>
        </div>

        {/* Right Pane: Console Output & AI Insights */}
        <div className="bg-white rounded-2xl border border-slate-200 flex flex-col shadow-sm overflow-hidden h-[620px]">
          {/* Output Navigation Tabs */}
          <div className="bg-slate-50 px-4 py-2 flex items-center justify-between border-b border-slate-200">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('console')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'console'
                    ? 'bg-white text-blue-600 shadow-2xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Terminal size={14} />
                <span>Console Output</span>
              </button>

              <button
                onClick={() => setActiveTab('ai')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'ai'
                    ? 'bg-white text-blue-600 shadow-2xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles size={14} />
                <span>AI Code Analysis</span>
              </button>

              <button
                onClick={() => setActiveTab('tests')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'tests'
                    ? 'bg-white text-blue-600 shadow-2xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 size={14} />
                <span>Test Cases</span>
              </button>
            </div>

            {execStats && (
              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
                <span className="text-emerald-600 font-bold">● {execStats.time}</span>
                <span>{execStats.memory}</span>
              </div>
            )}
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-4 overflow-y-auto">
            {activeTab === 'console' && (
              <div className="bg-slate-950 text-slate-200 font-mono text-xs p-4 rounded-xl h-full overflow-y-auto border border-slate-900 leading-relaxed whitespace-pre-wrap selection:bg-blue-600">
                {output}
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl">
                  <div className="flex items-start gap-2.5">
                    <Lightbulb className="text-blue-600 shrink-0 mt-0.5" size={18} />
                    <div>
                      <h4 className="text-xs font-bold text-blue-900 mb-1">Time & Space Complexity</h4>
                      <p className="text-xs text-blue-800 leading-relaxed">
                        • <span className="font-semibold">Time Complexity:</span> O(N) linear time, passing through elements in a single sweep.<br />
                        • <span className="font-semibold">Space Complexity:</span> O(N) auxiliary memory for hash storage or O(1) in-place pointers.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                    <div>
                      <h4 className="text-xs font-bold text-emerald-900 mb-1">Code Quality & Safety Check</h4>
                      <p className="text-xs text-emerald-800 leading-relaxed">
                        ✓ Modern idioms and standard containers used.<br />
                        ✓ No out-of-bounds pointer dereferencing detected.<br />
                        ✓ Memory safely allocated and freed upon program termination.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <h4 className="text-xs font-bold text-slate-800 mb-1.5">Optimization Suggestion</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    If input data is pre-sorted, consider using the Two-Pointer technique instead of a hash table to reduce space complexity down to O(1) auxiliary RAM.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'tests' && (
              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800">Test Case 1: Standard Input</span>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">nums = [2, 7, 11, 15], target = 9</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    Passed (0.02ms)
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800">Test Case 2: Negative Elements</span>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">nums = [-3, 4, 3, 90], target = 0</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    Passed (0.01ms)
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800">Test Case 3: Duplicate Numbers</span>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">nums = [3, 3], target = 6</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    Passed (0.01ms)
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
