import Link from 'next/link';
import AIStudyPlanner from '@/components/AIStudyPlanner';
import { Sparkles, LayoutDashboard, GraduationCap, HelpCircle, BookOpen, Code2 } from 'lucide-react';

export default function Home() {
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
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-blue-600 transition-colors"
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
            href="/dashboard" 
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-all active:scale-95"
          >
            <BookOpen size={14} />
            <span>Textbooks & Reader</span>
          </Link>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        {/* Subtle decorative radial gradients */}
        <div className="absolute top-0 -left-40 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none" />
        <div className="absolute top-0 -right-40 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none" />

        <div className="flex flex-col items-center gap-10 relative z-10 w-full max-w-5xl">
          <div className="text-center space-y-4 max-w-3xl">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-xs font-bold tracking-wide shadow-2xs">
              <span className="flex w-2 h-2 rounded-full bg-blue-600 mr-2 animate-pulse" />
              Level-5 Cognitive AI Learning Platform
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Master Any Exam with <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Cognitive AI Precision
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
              Intelligent topic-weighted study planner, interactive visual blackboard with Mermaid flowcharts, and dedicated interactive code sandbox.
            </p>
          </div>

          <AIStudyPlanner />

          {/* Value Props Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-10">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-blue-200 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Sparkles size={20} />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Weighted Syllabus Engine</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Prioritizes high-yield exam topics for NEET, JEE, GATE, and CS with automated revision and mock cadences.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-blue-200 transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <GraduationCap size={20} />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Visual Blackboard Teaching</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Nova AI teaches step-by-step with dynamic Mermaid diagrams, LaTeX formulas, and interactive code challenges.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-blue-200 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <BookOpen size={20} />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Indexed Textbook AI Reader</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Read Deep Learning, CLRS, and standard references with neural marginal notes and Socratic questions.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-slate-400 text-xs border-t border-slate-200 bg-white">
        &copy; {new Date().getFullYear()} Synapse AI eLearning Platform • Level 5 Cognitive Architecture
      </footer>
    </div>
  );
}
