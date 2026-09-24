'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, PlusCircle, ArrowLeft, RotateCcw, CheckCircle2, Calendar, Clock, BookOpen, GraduationCap } from 'lucide-react';

interface DayPlan {
  day: number;
  topics: string[];
  tasks: string[];
  type: string;
}

interface StudyPlanResponse {
  title: string;
  days: DayPlan[];
}

export default function AIStudyPlanner() {
  const [selectedExam, setSelectedExam] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [studyHours, setStudyHours] = useState('4');
  const [isGenerating, setIsGenerating] = useState(false);
  const [planGenerated, setPlanGenerated] = useState<StudyPlanResponse | null>(null);
  const [completedDayNumbers, setCompletedDayNumbers] = useState<number[]>([]);
  const [feasibilityError, setFeasibilityError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    try {
      const savedPlan = localStorage.getItem('current_study_plan');
      const savedDays = localStorage.getItem('completed_day_numbers');
      const savedTopic = localStorage.getItem('current_topic');

      if (savedTopic) setSelectedExam(savedTopic);

      if (savedPlan) {
        const parsed = JSON.parse(savedPlan);
        if (parsed && parsed.days && parsed.days.length > 0) {
          setPlanGenerated(parsed);
          setShowCreateForm(false);
        } else {
          setShowCreateForm(true);
        }
      } else {
        setShowCreateForm(true);
      }

      if (savedDays) {
        setCompletedDayNumbers(JSON.parse(savedDays));
      }
    } catch (e) {
      console.warn("Failed to parse saved plan from localStorage", e);
      setShowCreateForm(true);
    } finally {
      setHasInitialized(true);
    }
  }, []);

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setFeasibilityError('');
    try {
      const weakAreas = JSON.parse(localStorage.getItem('weak_areas') || '[]');
      
      const target = new Date(targetDate);
      const today = new Date();
      const diffTime = target.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 0) {
        setFeasibilityError("Target date must be in the future.");
        setIsGenerating(false);
        return;
      }
      
      const apiKey = localStorage.getItem('gemini_api_key') || '';
      const response = await fetch('http://localhost:5000/api/planner', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({ 
          topic: selectedExam, 
          duration_days: diffDays, 
          daily_hours: parseInt(studyHours) || 1,
          weak_areas: weakAreas
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setFeasibilityError(data.detail || "Failed to generate plan.");
        setIsGenerating(false);
        return;
      }
      
      setPlanGenerated(data);
      setShowCreateForm(false);
      setCompletedDayNumbers([]);
      localStorage.setItem('current_study_plan', JSON.stringify(data));
      localStorage.setItem('completed_day_numbers', JSON.stringify([]));
      localStorage.setItem('current_topic', selectedExam);
    } catch (error) {
      console.error("Failed to generate plan:", error);
      alert("Failed to connect to the AI Service.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReplan = async () => {
    if (!planGenerated) return;
    setIsGenerating(true);
    try {
      const completedDaysList = planGenerated.days.filter(d => completedDayNumbers.includes(d.day));
      const weakAreas = JSON.parse(localStorage.getItem('weak_areas') || '[]');
      
      const apiKey = localStorage.getItem('gemini_api_key') || '';
      const response = await fetch('http://localhost:5000/api/planner/replan', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({ 
          topic: selectedExam || "Topic",
          completed_days: completedDaysList,
          remaining_duration_days: Math.max(1, planGenerated.days.length - completedDaysList.length),
          weak_areas: weakAreas
        })
      });
      const data = await response.json();
      setPlanGenerated(data);
      localStorage.setItem('current_study_plan', JSON.stringify(data));
    } catch (error) {
      console.error("Failed to replan:", error);
      alert("Failed to connect to the AI Service for replanning.");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleDayCompletion = (day: number) => {
    setCompletedDayNumbers(prev => {
      const updated = prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day];
      localStorage.setItem('completed_day_numbers', JSON.stringify(updated));
      return updated;
    });
  };

  const getDayColor = (type: string) => {
    switch (type) {
      case 'mock': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'revision': return 'bg-green-100 text-green-700 border-green-200';
      case 'buffer': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'final_review': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  if (!hasInitialized) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-white border border-slate-200 p-12 rounded-3xl shadow-xs text-center">
        <span className="text-sm font-semibold text-slate-500">Loading your learning workspace...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white border border-slate-200/90 p-6 sm:p-8 rounded-3xl shadow-sm relative z-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            AI Study Planner
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {planGenerated && !showCreateForm 
              ? `Currently studying: ${planGenerated.title}` 
              : "Set your target exam and daily study hours"}
          </p>
        </div>

        {planGenerated && (
          <div className="flex items-center gap-2">
            {!showCreateForm ? (
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <PlusCircle size={15} />
                <span>+ Create New Study Plan</span>
              </button>
            ) : (
              <button
                onClick={() => setShowCreateForm(false)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                <ArrowLeft size={15} />
                <span>Cancel & View Current Plan</span>
              </button>
            )}
          </div>
        )}
      </div>

      {(!planGenerated || showCreateForm) ? (
        /* Create New Plan Form */
        <form onSubmit={handleGeneratePlan} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="exam" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Target Exam / Subject
            </label>
            <input
              type="text"
              id="exam"
              placeholder="e.g. DSA in C++, NEET Biology, JEE Math, Machine Learning..."
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-sm transition-all"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="date" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Target Exam Date
              </label>
              <input
                type="date"
                id="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-sm transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="hours" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Daily Study Hours
              </label>
              <input
                type="number"
                id="hours"
                min="1"
                max="16"
                value={studyHours}
                onChange={(e) => setStudyHours(e.target.value)}
                placeholder="Hours per day"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-sm transition-all"
                required
              />
            </div>
          </div>

          {feasibilityError && (
            <div className="p-4 bg-rose-50 border-l-4 border-rose-500 rounded-r-xl">
              <p className="text-xs font-bold text-rose-800">{feasibilityError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isGenerating}
            className={`w-full py-4 px-6 rounded-xl text-white font-bold text-sm sm:text-base transition-all duration-200 shadow-sm cursor-pointer ${
              isGenerating 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 active:scale-98'
            }`}
          >
            {isGenerating ? (
              <span className="flex items-center justify-center space-x-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Synthesizing Adaptive Schedule...</span>
              </span>
            ) : (
              'Generate Personalized Study Plan'
            )}
          </button>
        </form>
      ) : (
        /* Display Active Study Plan */
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200 p-4 rounded-2xl">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active Plan
                </span>
                <span className="text-xs text-slate-500">
                  Completed: <strong className="text-slate-900">{completedDayNumbers.length}</strong> / {planGenerated.days.length} Days
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {planGenerated.title}
              </h3>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button 
                onClick={handleReplan}
                disabled={isGenerating}
                className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-3.5 py-2 rounded-xl font-bold hover:bg-amber-100 transition-all cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? 'Replanning...' : 'Adaptive Replan'}
              </button>

              <Link
                href="/board"
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
              >
                <GraduationCap size={15} />
                <span>Start AI Tutor Board →</span>
              </Link>
            </div>
          </div>

          {/* Days Schedule Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-1">
            {planGenerated.days.map((dayPlan) => {
              const isCompleted = completedDayNumbers.includes(dayPlan.day);
              const formattedTopics = Array.isArray(dayPlan.topics)
                ? dayPlan.topics.map(t => typeof t === 'string' ? t : (t as any)?.name || 'Study Topic').join(', ')
                : typeof dayPlan.topics === 'string'
                  ? dayPlan.topics
                  : (dayPlan.topics as any)?.name || 'Study Topic';

              return (
                <div
                  key={dayPlan.day}
                  onClick={() => toggleDayCompletion(dayPlan.day)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer select-none flex flex-col justify-between ${
                    isCompleted
                      ? 'bg-slate-50 border-emerald-300 opacity-80'
                      : 'bg-white border-slate-200 hover:border-blue-300 shadow-2xs'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-black text-slate-900">
                        Day {dayPlan.day}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getDayColor(dayPlan.type)}`}>
                        {dayPlan.type.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-slate-800 mb-2 leading-snug">
                      {formattedTopics}
                    </h4>

                    <ul className="space-y-1 mb-3">
                      {dayPlan.tasks?.slice(0, 2).map((task, idx) => (
                        <li key={idx} className="text-[11px] text-slate-500 leading-tight flex items-start gap-1.5">
                          <span className="text-blue-500 font-bold">•</span>
                          <span className="line-clamp-1">{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-medium text-slate-400">
                      {isCompleted ? 'Completed' : 'Click to complete'}
                    </span>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                      isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {isCompleted && <CheckCircle2 size={14} />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
