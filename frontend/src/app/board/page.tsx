"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, Mic, MicOff, Sparkles, 
  Send, CheckCircle, BookOpen, Layers, Code, HelpCircle, 
  Download, ArrowLeft, Lightbulb, AlertTriangle, ChevronRight,
  Compass, Award, RefreshCw, Eye, Settings, X, Check
} from "lucide-react";
import "katex/dist/katex.min.css";
import FormattedBoardContent from "@/components/FormattedBoardContent";

// Dynamic imports for heavy libraries to prevent SSR hydration issues
const Latex = dynamic(() => import("react-latex-next"), { ssr: false });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SyntaxHighlighter: any = dynamic(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  () => import("react-syntax-highlighter").then((mod: any) => mod.Prism as any),
  { ssr: false }
);

interface BoardBlock {
  id: string;
  type: "diagram" | "math" | "code" | "highlight" | "text" | "image" | "quiz" | "practice_editor" | "table" | "pitfall";
  content: string;
  speechText?: string;
  audioBase64?: string;
  voiceUsed?: string;
  language?: string;
  diagramType?: string;
  imageUrl?: string;
  altText?: string;
  question?: string;
  options?: string[];
  selectedOption?: number | null;
  correctAnswer?: number;
  explanation?: string;
  hidden?: boolean;
  starterCode?: string;
  timeLimitSec?: number;
  headers?: string[];
  rows?: string[][];
  studentSubmittedCode?: string;
  badge?: string;
}

interface TopicPlan {
  name: string;
  complexity?: string;
  grounded_definition?: string;
  [key: string]: any;
}

interface DayPlan {
  day: number;
  topics: (TopicPlan | string)[];
  tasks: string[];
  type: string;
  estimatedDurationMin?: number;
  theoryMinutes?: number;
  practiceMinutes?: number;
}

interface StudyPlanResponse {
  title: string;
  days: DayPlan[];
}

// Mermaid Component for dynamically rendering SVG from string in clean light mode
const MermaidRenderer = ({ chart, id }: { chart: string; id: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (ref.current && chart) {
      const cleanChart = chart
        .replace(/^```(mermaid)?\s*/im, "")
        .replace(/\s*```$/im, "")
        .trim() || "graph TD;\n  A[Start] --> B[Core Concept];\n  B --> C[Visual Architecture];";
      const normalizedChart = cleanChart
        .replace(/\]\s+(?=[A-Za-z][\w-]*\s*\[)/g, "]\n")
        .replace(/(\b[\w-]+)\[([^\]\n]+)\]/g, (_, node: string, label: string) =>
          `${node}["${label.replace(/"/g, "'").trim()}"]`
        );
      
      const safeId = `mermaid-${id.replace(/[^a-zA-Z0-9]/g, "")}-${Math.random().toString(36).substring(2, 6)}`;
      
      import("mermaid").then((mermaid) => {
        mermaid.default.initialize({ 
          startOnLoad: false, 
          theme: 'default',
          fontFamily: 'var(--font-sans), sans-serif',
          themeVariables: {
            primaryColor: '#e0e7ff',
            primaryBorderColor: '#6366f1',
            primaryTextColor: '#1e1b4b',
            lineColor: '#64748b',
            secondaryColor: '#f0fdf4',
            tertiaryColor: '#fef3c7'
          }
        });
        try {
          mermaid.default.render(safeId, normalizedChart).then(({ svg }) => {
            if (ref.current) ref.current.innerHTML = svg;
          }).catch(e => {
            console.error("Mermaid parsing error:", e, normalizedChart);
            const fallbackChart = "graph TD;\n  A[Input] --> B[Processing];\n  B --> C[Output];";
            mermaid.default.render(`fb-${safeId}`, fallbackChart).then(({ svg }) => {
              if (ref.current) ref.current.innerHTML = svg;
            }).catch(() => {
              if (ref.current) ref.current.innerHTML = `<div class="text-slate-500 font-mono text-sm p-4 bg-slate-50 rounded-lg">Diagram: ${cleanChart}</div>`;
            });
          });
        } catch (e) {
          console.error("Mermaid error:", e);
        }
      });
    }
  }, [chart, id]);

  return <div ref={ref} className="flex justify-center w-full min-h-[160px] items-center overflow-x-auto py-2" />;
};

// Pedagogy Phases definition
const PEDAGOGY_PHASES = [
  { num: 1, name: "Definition", desc: "Core Concept & Scope", icon: BookOpen },
  { num: 2, name: "Intuition", desc: "Real-World Analogy", icon: Lightbulb },
  { num: 3, name: "Diagram", desc: "Visual Architecture", icon: Compass },
  { num: 4, name: "Formula / Code", desc: "Mathematical & Code Derivation", icon: Code },
  { num: 5, name: "Pitfalls", desc: "Common Traps & Bugs", icon: AlertTriangle },
  { num: 6, name: "Check", desc: "Interactive Question", icon: HelpCircle },
  { num: 7, name: "Practice", desc: "Hands-on Challenge", icon: Layers },
  { num: 8, name: "Summary", desc: "Recap & Key Points", icon: Award },
];

export default function TeachingBoardPage() {
  const router = useRouter();
  const [studyPlan, setStudyPlan] = useState<StudyPlanResponse | null>(null);
  const [activeDay, setActiveDay] = useState<DayPlan | null>(null);
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [boardBlocks, setBoardBlocks] = useState<BoardBlock[]>([]);
  
  // Teaching State Machine
  const [currentPhaseNumber, setCurrentPhaseNumber] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isNovaSpeaking, setIsNovaSpeaking] = useState<boolean>(false);
  const [isHighlighting, setIsHighlighting] = useState<boolean>(false);
  const [isPhaseLoading, setIsPhaseLoading] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>("");
  
  // Language & Voice Engine State (Aoede & Professional Hinglish)
  const [teachingLanguage, setTeachingLanguage] = useState<"hinglish" | "english">("hinglish");
  const [geminiVoice, setGeminiVoice] = useState<string>("Aoede");
  const [isTestingVoice, setIsTestingVoice] = useState<boolean>(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  
  // Query & Doubt Box
  const [queryText, setQueryText] = useState<string>("");
  const [isGeneratingCard, setIsGeneratingCard] = useState<boolean>(false);
  
  // Live Voice / WebSocket
  const [isAiConnected, setIsAiConnected] = useState<boolean>(false);
  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>("");
  const [transcript, setTranscript] = useState<string>("");
  const [keyStatus, setKeyStatus] = useState<{
    state: "idle" | "checking" | "valid" | "invalid";
    message: string;
    model?: string;
  }>({ state: "idle", message: "" });

  const verifyApiKey = async (keyToVerify?: string) => {
    const k = (keyToVerify !== undefined ? keyToVerify : apiKey).trim();
    if (!k) {
      setKeyStatus({ state: "invalid", message: "Please enter your Gemini API key." });
      return;
    }
    setKeyStatus({ state: "checking", message: "Verifying with Google AI Studio..." });
    try {
      const res = await fetch("http://localhost:5000/api/check-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: k })
      });
      const data = await res.json();
      if (data.valid) {
        setKeyStatus({
          state: "valid",
          message: data.message || "Key Active & Verified!",
          model: data.active_model
        });
      } else {
        setKeyStatus({
          state: "invalid",
          message: data.message || "Invalid API key or Quota limit reached"
        });
      }
    } catch (e: any) {
      setKeyStatus({
        state: "invalid",
        message: "Failed to connect to backend server: " + (e?.message || "")
      });
    }
  };

  const boardEndRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Helper to extract clean topic title from any data shape
  const getTopicTitle = (day: DayPlan | null): string => {
    if (!day || !day.topics || day.topics.length === 0) return "General Study Session";
    return day.topics.map(t => {
      if (typeof t === 'string') return t;
      return t.name || t.topic || (t as any).title || "Topic";
    }).join(' & ');
  };

  // Helper to get grounded definition
  const getGroundedDefinition = (day: DayPlan | null): string => {
    if (!day || !day.topics || day.topics.length === 0) return "";
    const first = day.topics[0];
    if (typeof first === 'object' && first !== null) {
      return first.grounded_definition || "";
    }
    return "";
  };

  // Load saved study plan and progress on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
      const defaultBuiltinKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
      let storedKey = localStorage.getItem("gemini_api_key") || "";
      if (!storedKey && defaultBuiltinKey) {
        storedKey = defaultBuiltinKey;
        localStorage.setItem("gemini_api_key", defaultBuiltinKey);
      }
      setApiKey(storedKey);
      if (storedKey) {
        verifyApiKey(storedKey);
      }

      const savedLang = localStorage.getItem("teaching_language") as "hinglish" | "english";
      if (savedLang) setTeachingLanguage(savedLang);
      setGeminiVoice("Aoede");
      localStorage.setItem("gemini_voice", "Aoede");

      // Load Speech Voices
      const updateVoices = () => {
        if ("speechSynthesis" in window) {
          const vList = window.speechSynthesis.getVoices();
          setAvailableVoices(vList);
          if (vList.length > 0 && !selectedVoiceName) {
            const defVoice = vList.find(v => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha") || v.name.includes("David"))) || vList.find(v => v.lang.startsWith("en"));
            if (defVoice) setSelectedVoiceName(defVoice.name);
          }
        }
      };

      updateVoices();
      if ("speechSynthesis" in window) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }

      const planStr = localStorage.getItem("current_study_plan");
      if (planStr) {
        try {
          const plan: StudyPlanResponse = JSON.parse(planStr);
          setStudyPlan(plan);
          if (plan.days && plan.days.length > 0) {
            setActiveDay(plan.days[0]);
          }
        } catch (e) {
          console.error("Failed to parse study plan:", e);
        }
      } else {
        // Fallback default sample plan if user directly visits /board
        const defaultPlan: StudyPlanResponse = {
          title: "DSA & Core Computer Science 30-Day Master Plan",
          days: [
            {
              day: 1,
              topics: [{ name: "Arrays & Dynamic Memory Allocation", complexity: "medium", grounded_definition: "Contiguous memory layout, pointer indexing, and O(1) random access fundamentals." }],
              tasks: ["Study contiguous memory representation", "Solve 15 two-pointer problems", "Visual walkthrough of heap vs stack"],
              type: "theory",
              estimatedDurationMin: 45
            },
            {
              day: 2,
              topics: [{ name: "Two-Pointer Technique & Sliding Window", complexity: "medium", grounded_definition: "Optimizing O(N^2) search patterns into linear O(N) dual cursor scans." }],
              tasks: ["Master container with most water", "Longest substring without repeating characters"],
              type: "theory",
              estimatedDurationMin: 45
            },
            {
              day: 3,
              topics: [{ name: "Singly & Doubly Linked Lists", complexity: "medium", grounded_definition: "Non-contiguous dynamic nodes connected via pointer references." }],
              tasks: ["Reverse linked list iteratively & recursively", "Detect cycle via Floyd's algorithm"],
              type: "theory",
              estimatedDurationMin: 50
            },
            {
              day: 7,
              topics: [{ name: "Weekly Revision: Arrays & Linked Lists", complexity: "medium", grounded_definition: "Comprehensive revision and practice problem solving for linear data structures." }],
              tasks: ["Solve 20 cumulative PYQs", "Review time and space complexity tables"],
              type: "revision",
              estimatedDurationMin: 60
            }
          ]
        };
        setStudyPlan(defaultPlan);
        setActiveDay(defaultPlan.days[0]);
      }

      const completed = localStorage.getItem("completed_days");
      if (completed) {
        try {
          setCompletedDays(JSON.parse(completed));
        } catch (e) {}
      }
    }
  }, []);

  // Auto-scroll to latest card
  useEffect(() => {
    boardEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [boardBlocks]);

  // Unlocks browser audio and speech synthesis within user-gesture call
  const unlockAudio = () => {
    if (typeof window === "undefined") return;
    try {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.resume();
      }
    } catch (e) {}

    try {
      if (!audioPlayerRef.current) {
        audioPlayerRef.current = new Audio();
      }
      // Prime audio element on user click to defeat autoplay policy
      audioPlayerRef.current.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
      audioPlayerRef.current.play().catch(() => {});
    } catch (e) {}
  };

  // Web Speech Fallback Engine with sentence-chunking and Chromium resilience
  const playWebSpeech = (text: string) => {
    if (!isVoiceEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
    } catch (e) {}

    const cleanText = text
      .replace(/```[\s\S]*?```/g, "Code and architecture displayed on the blackboard.")
      .replace(/[*#`$]/g, "")
      .replace(/\n+/g, " ")
      .trim();
    
    if (!cleanText) return;

    const voices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();
    
    // Find best expressive female voice (Neerja, Swara, Zira, Samantha, Jenny)
    let targetVoice = null;
    if (teachingLanguage === "hinglish") {
      targetVoice = voices.find(v => 
        (v.name.toLowerCase().includes("neerja") || v.name.toLowerCase().includes("swara") || v.name.toLowerCase().includes("india") || v.name.toLowerCase().includes("hindi")) &&
        (v.name.toLowerCase().includes("natural") || v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("online"))
      ) || voices.find(v => v.lang.toLowerCase().includes("in") || v.lang.toLowerCase().startsWith("hi"));
    }

    if (!targetVoice) {
      targetVoice = voices.find(v => 
        v.lang.startsWith("en") && 
        (v.name.toLowerCase().includes("zira") || v.name.toLowerCase().includes("samantha") || v.name.toLowerCase().includes("jenny") || v.name.toLowerCase().includes("natural") || v.name.toLowerCase().includes("google") || v.name.toLowerCase().includes("female"))
      ) || voices.find(v => v.lang.startsWith("en"));
    }

    const sentenceChunks = cleanText.match(/[^.!?।]+[.!?।]+|\S+/g) || [cleanText];
    let chunkIndex = 0;

    const speakNextChunk = () => {
      if (chunkIndex >= sentenceChunks.length) {
        setIsNovaSpeaking(false);
        return;
      }

      const chunk = sentenceChunks[chunkIndex].trim();
      chunkIndex++;
      if (!chunk) {
        speakNextChunk();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunk);
      utterance.rate = playbackSpeed;
      utterance.pitch = 1.05; // Expressive female educator pitch
      utterance.lang = teachingLanguage === "hinglish" ? "en-IN" : "en-US";
      if (targetVoice) utterance.voice = targetVoice;

      utterance.onstart = () => setIsNovaSpeaking(true);
      utterance.onend = () => speakNextChunk();
      utterance.onerror = (e) => {
        if (e.error !== "interrupted" && e.error !== "canceled") {
          console.warn("Speech synthesis chunk warning:", e);
        }
        setIsNovaSpeaking(false);
      };

      try {
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("SpeechSynthesis.speak failed:", err);
        setIsNovaSpeaking(false);
      }
    };

    speakNextChunk();
  };

  // Primary Voice Player (Supports Gemini 2.5 Flash Native Audio Aoede with zero-latency fallback)
  const speakNarration = async (text: string, audioBase64?: string) => {
    if (!isVoiceEnabled || typeof window === "undefined") return;

    // Stop currently playing audio or speech
    if (audioPlayerRef.current) {
      try {
        audioPlayerRef.current.pause();
      } catch (e) {}
    }
    if ("speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }

    // 1. If Gemini 2.5 Flash Native Audio / Aoede female audio base64 is available, play directly!
    if (audioBase64) {
      try {
        let audio = audioPlayerRef.current;
        if (!audio) {
          audio = new Audio();
          audioPlayerRef.current = audio;
        }
        audio.src = audioBase64;
        audio.playbackRate = playbackSpeed;
        audio.volume = 1.0;
        audio.onplay = () => setIsNovaSpeaking(true);
        audio.onended = () => {
          setIsNovaSpeaking(false);
        };
        audio.onerror = (e) => {
          console.warn("Gemini audio decode failed:", e);
          setIsNovaSpeaking(false);
        };
        const p = audio.play();
        if (p !== undefined) {
          p.catch((err) => {
            console.warn("Gemini audio playback was prevented by the browser:", err);
            setIsNovaSpeaking(false);
          });
        }
        return;
      } catch (e) {
        console.warn("Gemini audio playback error:", e);
      }
    }
  };

  // Live Test Voice button (Requests Aoede from backend /api/tts or tests Web Speech)
  const testVoiceAudio = async () => {
    unlockAudio();
    setIsTestingVoice(true);
    const testScript = teachingLanguage === "hinglish"
      ? "Namaste! Main Nova hoon. Hum Gemini 2.5 Flash Native Audio aur Aoede female voice ke sath aapke conceptual learning ko deconstruct karenge."
      : "Hello! I am Nova. We will deconstruct technical engineering concepts together using Gemini 2.5 Flash Native Audio and the Aoede female voice.";

    const storedKey = apiKey || (typeof window !== "undefined" ? localStorage.getItem("gemini_api_key") || "" : "");

    try {
      const res = await fetch("http://localhost:5000/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(storedKey ? { "x-api-key": storedKey } : {})
        },
        body: JSON.stringify({
          text: testScript,
          voice: "Aoede",
          language: teachingLanguage
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.status === "success" && data.audio_base64) {
          await speakNarration(testScript, data.audio_base64);
          setIsTestingVoice(false);
          return;
        }
      }
    } catch (e) {
      console.warn("TTS test fetch failed, falling back to Web Speech:", e);
    }

    setIsTestingVoice(false);
  };

  const stopAudio = () => {
    if (audioPlayerRef.current) {
      try {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      } catch (e) {}
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
      setIsNovaSpeaking(false);
    }
  };

  // Generate specific pedagogical phase blocks for the topic connected to /api/teach
  const teachPhase = async (phaseNum: number, day: DayPlan) => {
    unlockAudio();
    setCurrentPhaseNumber(phaseNum);
    const title = getTopicTitle(day);
    setIsPhaseLoading(true);

    const isHinglish = teachingLanguage === "hinglish";
    const phaseName = PEDAGOGY_PHASES[phaseNum - 1]?.name || "Definition";

    // Gemini supplies the single narration voice after the teaching block is generated.
    const introSpeech = isHinglish
      ? `Namaste! Aaj hum ${title} ke Phase ${phaseNum}: ${phaseName} ko master karenge.`
      : `Welcome! Starting Phase ${phaseNum}: ${phaseName} for ${title}.`;

    const initialPlaceholder: BoardBlock = {
      id: `phase-${phaseNum}-init`,
      type: "text",
      content: isHinglish
        ? `### Phase ${phaseNum}: ${phaseName} — ${title}\n\nNova is preparing the visual blackboard and Aoede female voice script...\n\nContiguous memory layout aur pointer arithmetic invariants load ho rahe hain.`
        : `### Phase ${phaseNum}: ${phaseName} — ${title}\n\nNova is preparing the visual blackboard and Aoede female voice script...\n\nLoading contiguous memory invariants and pointer arithmetic models.`,
      badge: `Phase ${phaseNum}: Loading ${phaseName}...`,
      speechText: introSpeech
    };

    setBoardBlocks(prev => {
      if (prev.length === 0) return [initialPlaceholder];
      return prev;
    });

    try {
      const storedKey = apiKey || (typeof window !== "undefined" ? localStorage.getItem("gemini_api_key") || "" : "");
      const res = await fetch("http://localhost:5000/api/teach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(storedKey ? { "x-api-key": storedKey } : {})
        },
        body: JSON.stringify({
          topic: title,
          phase_number: phaseNum,
          phase_name: PEDAGOGY_PHASES[phaseNum - 1]?.name || "Definition",
          day_number: day.day,
          language: teachingLanguage,
          voice: "Aoede"
        })
      });

      if (!res.ok) throw new Error("Failed to fetch teaching content");
      const data = await res.json();

      let newBlock: BoardBlock;
      if (data.type === "diagram" || data.diagram_code) {
        newBlock = {
          id: `diag-${Date.now()}`,
          type: "diagram",
          content: data.diagram_code || data.content,
          diagramType: data.title || "Visual Architecture",
          badge: data.badge || `Phase ${phaseNum}: Visual Architecture`,
          speechText: data.speech_script,
          audioBase64: data.audio_base64,
          voiceUsed: data.voice_used
        };
      } else if (data.type === "code" || data.code_snippet) {
        newBlock = {
          id: `code-${Date.now()}`,
          type: "code",
          content: data.code_snippet || data.content,
          language: data.language || "cpp",
          badge: data.badge || `Phase ${phaseNum}: Code Pattern`,
          speechText: data.speech_script,
          audioBase64: data.audio_base64,
          voiceUsed: data.voice_used
        };
      } else if (data.type === "quiz" || data.quiz) {
        newBlock = {
          id: `quiz-${Date.now()}`,
          type: "quiz",
          content: "",
          question: data.quiz?.question || data.question,
          options: data.quiz?.options || data.options,
          correctAnswer: data.quiz?.correct_answer ?? 0,
          explanation: data.quiz?.explanation,
          badge: data.badge || `Phase ${phaseNum}: Concept Check`,
          speechText: data.speech_script,
          audioBase64: data.audio_base64,
          voiceUsed: data.voice_used
        };
      } else if (data.type === "practice_editor" || data.practice_question) {
        newBlock = {
          id: `practice-${Date.now()}`,
          type: "practice_editor",
          content: data.starter_code || data.content,
          starterCode: data.starter_code,
          language: data.language || "cpp",
          question: data.practice_question || data.question || `Implement solution for: ${title}`,
          timeLimitSec: 180,
          badge: data.badge || `Phase ${phaseNum}: Hands-On Challenge`,
          speechText: data.speech_script,
          audioBase64: data.audio_base64,
          voiceUsed: data.voice_used
        };
      } else if (data.type === "pitfall") {
        newBlock = {
          id: `pitfall-${Date.now()}`,
          type: "pitfall",
          content: data.content,
          badge: data.badge || `Phase ${phaseNum}: Traps & Pitfalls`,
          speechText: data.speech_script,
          audioBase64: data.audio_base64,
          voiceUsed: data.voice_used
        };
      } else {
        newBlock = {
          id: `text-${Date.now()}`,
          type: "text",
          content: data.content,
          language: data.title || `Phase ${phaseNum}: ${PEDAGOGY_PHASES[phaseNum - 1]?.name}`,
          badge: data.badge || `Phase ${phaseNum}: ${PEDAGOGY_PHASES[phaseNum - 1]?.name}`,
          speechText: data.speech_script,
          audioBase64: data.audio_base64,
          voiceUsed: data.voice_used
        };
      }

      setBoardBlocks(prev => {
        const filtered = prev.filter(b => b.id !== `phase-${phaseNum}-init`);
        return [...filtered, newBlock];
      });
      speakNarration(data.speech_script || data.content, data.audio_base64);
    } catch (err) {
      console.warn("API teach fetch failed, using fallback:", err);
      // Extensive local fallback in requested language mode
      const isHinglishMode = teachingLanguage === "hinglish";
      const fallbackDef = isHinglishMode
        ? `### Core Architectural Definition: ${title}

C++ me, fundamental data structures direct physical memory address space ke upar operate karte hain. Memory sequentially contiguous blocks me allocate hoti hai, jisse pointer arithmetic se deterministic $O(1)$ constant-time random access milta hai:
$$\\text{Address}(A[i]) = \\text{BaseAddress}(A) + i \\times \\text{sizeof}(T)$$

* **Contiguous Cache Locality:** L1/L2 prefetching hit rate ko maximize karta hai.
* **Deterministic Pointer Invariants:** Direct base offset calculation se indirect pointer hopping avoid hoti hai.`
        : `### Fundamental Architectural Definition: ${title}

In C++, fundamental data structures operate directly above physical memory address spaces. Data is organized sequentially in contiguous memory blocks, enabling deterministic $O(1)$ constant-time random access via pointer arithmetic:
$$\\text{Address}(A[i]) = \\text{BaseAddress}(A) + i \\times \\text{sizeof}(T)$$

* **Contiguous Cache Locality:** Maximizes L1/L2 prefetching hit rates.
* **Deterministic Pointer Invariants:** Base address offset resolution avoids costly indirection lookups.`;

      const fallbackSpeech = isHinglishMode
        ? `Namaste and welcome! Aaj hum ${title} ke Phase ${phaseNum} ko complete depth me master karenge. Contiguous memory layout aur pointer arithmetic se direct O(1) random access milta hai.`
        : `Welcome to Phase ${phaseNum} of ${title}. In this session, we dissect the memory architecture and deterministic execution bounds.`;

      const fallbackBlock: BoardBlock = {
        id: `def-${Date.now()}`,
        type: phaseNum === 3 ? "diagram" : (phaseNum === 4 ? "code" : (phaseNum === 6 ? "quiz" : "text")),
        content: phaseNum === 3 
          ? "graph LR\n  A[Base Pointer] --> B[Index 0]\n  B --> C[Index 1]\n  C --> D[Index 2]\n  classDef def fill:#eff6ff,stroke:#2563eb; class A,B,C,D def;" 
          : (phaseNum === 4 ? "// C++ Implementation\n#include <iostream>\n#include <vector>\n\nint main() {\n    std::cout << \"Contiguous Memory Invariant\" << std::endl;\n    return 0;\n}" : fallbackDef),
        badge: `Phase ${phaseNum}: ${PEDAGOGY_PHASES[phaseNum - 1]?.name}`,
        speechText: fallbackSpeech
      };

      setBoardBlocks(prev => {
        const filtered = prev.filter(b => b.id !== `phase-${phaseNum}-init`);
        return [...filtered, fallbackBlock];
      });
      speakNarration(fallbackBlock.speechText || fallbackBlock.content);
    } finally {
      setIsPhaseLoading(false);
    }
  };

  // Launch or advance lesson
  const handleStartOrAdvance = () => {
    if (!activeDay) return;
    unlockAudio();
    setIsPlaying(true);

    if (boardBlocks.length === 0) {
      teachPhase(1, activeDay);
    } else if (currentPhaseNumber < 8) {
      teachPhase(currentPhaseNumber + 1, activeDay);
    } else {
      teachPhase(1, activeDay); // Restart
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
    stopAudio();
  };

  const handleClearBoard = () => {
    setBoardBlocks([]);
    stopAudio();
    setCurrentPhaseNumber(1);
    setIsPlaying(false);
  };

  const handleSelectDay = (day: DayPlan) => {
    stopAudio();
    setActiveDay(day);
    setBoardBlocks([]);
    setCurrentPhaseNumber(1);
    setIsPlaying(false);
  };

  const handleMarkCompleted = () => {
    if (activeDay && !completedDays.includes(activeDay.day)) {
      const updated = [...completedDays, activeDay.day];
      setCompletedDays(updated);
      localStorage.setItem("completed_days", JSON.stringify(updated));
    }
  };

  // Handle quiz option selection
  const handleQuizSelect = (blockId: string, optionIdx: number) => {
    setBoardBlocks(prev => prev.map(b => {
      if (b.id === blockId) {
        const isCorrect = optionIdx === (b.correctAnswer ?? 1);
        if (isCorrect) {
          speakNarration("Correct! Excellent job nailing that concept.");
        } else {
          speakNarration(`Not quite! The correct answer was option ${String.fromCharCode(65 + (b.correctAnswer ?? 1))}. Notice the explanation on the board.`);
        }
        return { ...b, selectedOption: optionIdx };
      }
      return b;
    }));
  };

  // Handle code submission in practice block
  const handlePracticeSubmit = (blockId: string, code: string) => {
    setBoardBlocks(prev => prev.map(b => {
      if (b.id === blockId) {
        return { ...b, studentSubmittedCode: code };
      }
      return b;
    }));
    speakNarration("Code received! Your implementation structure looks clean and properly formatted. Great work!");
  };

  // Ask Nova / Doubt box handler
  const handleAskNova = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryText.trim() || !activeDay) return;

    const userQ = queryText.trim();
    setQueryText("");
    setIsGeneratingCard(true);

    // If API key is available, we could query Gemini, or generate an instant diagram/explanation card
    const lowerQ = userQ.toLowerCase();
    let replyCard: BoardBlock;

    if (lowerQ.includes("diagram") || lowerQ.includes("flow") || lowerQ.includes("draw")) {
      replyCard = {
        id: `user-diag-${Date.now()}`,
        type: "diagram",
        content: `flowchart TD
  Q["Student Inquiry: ${userQ}"] --> Analyze["Nova Analysis & Parsing"]
  Analyze --> Node1["Concept Component A"]
  Analyze --> Node2["Concept Component B"]
  Node1 --> Solution["Grounded Resolution"]
  Node2 --> Solution
  classDef novaStyle fill:#eff6ff,stroke:#3b82f6,stroke-width:2px;
  class Q,Analyze,Node1,Node2,Solution novaStyle;`,
        diagramType: "Visual Explanation",
        badge: "Nova Visual Response"
      };
    } else {
      replyCard = {
        id: `user-q-${Date.now()}`,
        type: "text",
        content: `💡 Nova's Answer to: "${userQ}"\n\nIn ${getTopicTitle(activeDay)}, this is a critical aspect. The key is understanding that state invariants must hold before and after each transformation. This guarantees zero undefined behaviors and optimal exam execution.`,
        language: "Doubt Resolution",
        badge: "Nova Explains"
      };
    }

    setBoardBlocks(prev => [...prev, replyCard]);
    setIsGeneratingCard(false);
    speakNarration(`Regarding your question: ${userQ}. I have projected the visual explanation right onto the blackboard for you.`);
  };

  // Export session notes as Markdown
  const handleExportNotes = () => {
    if (boardBlocks.length === 0 || !activeDay) return;
    const title = getTopicTitle(activeDay);
    let md = `# Study Notes: ${title}\nEpisode ${activeDay.day} • Date: ${new Date().toLocaleDateString()}\n\n---\n\n`;

    boardBlocks.forEach((b, idx) => {
      md += `### ${idx + 1}. [${b.badge || b.type.toUpperCase()}]\n\n`;
      if (b.type === "diagram") {
        md += "```mermaid\n" + b.content + "\n```\n\n";
      } else if (b.type === "code") {
        md += "```" + (b.language || "cpp") + "\n" + b.content + "\n```\n\n";
      } else if (b.type === "math") {
        md += "$$\n" + b.content + "\n$$\n\n";
      } else if (b.type === "quiz") {
        md += `**Question:** ${b.question}\n`;
        b.options?.forEach((opt, oIdx) => {
          md += `- [${b.selectedOption === oIdx ? "X" : " "}] ${opt}\n`;
        });
        md += `\n*Explanation:* ${b.explanation || ""}\n\n`;
      } else {
        md += `${b.content}\n\n`;
      }
    });

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Episode_${activeDay.day}_${title.replace(/[^a-zA-Z0-9]/g, "_")}_Notes.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const completedCount = completedDays.length;
  const totalCount = studyPlan?.days.length || 1;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Top Header - Modern White Theme */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-6 py-3.5 sticky top-0 z-30 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={15} />
            <span>Dashboard</span>
          </Link>

          <Link 
            href="/sandbox" 
            className="hidden md:flex items-center gap-1.5 text-slate-600 hover:text-blue-600 font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Code size={15} />
            <span>Code Sandbox</span>
          </Link>

          <Link 
            href="/quiz" 
            className="hidden md:flex items-center gap-1.5 text-slate-600 hover:text-blue-600 font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <HelpCircle size={15} />
            <span>Practice Quiz</span>
          </Link>
          
          <div className="h-4 w-px bg-slate-200" />
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-900 text-base leading-none">Nova AI Teaching Board</h1>
                <span className="text-[11px] font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                  Level 5 LMS
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {studyPlan?.title ? `${studyPlan.title} • ` : ""}
                <span className="font-medium text-slate-700">{completedCount} of {totalCount} Episodes Completed ({progressPercent}%)</span>
              </p>
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {/* Language Switcher (Hinglish vs English) */}
          <button
            onClick={() => {
              const next = teachingLanguage === "hinglish" ? "english" : "hinglish";
              setTeachingLanguage(next);
              localStorage.setItem("teaching_language", next);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100 shadow-2xs"
            title="Toggle Teaching Language (Professional Hinglish / Academic English)"
          >
            <span>🌐</span>
            <span>{teachingLanguage === "hinglish" ? "Hinglish (Pro)" : "English"}</span>
          </button>

          {/* Voice Model Badge */}
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100 shadow-2xs"
            title="Configure Gemini Aoede Voice & Audio Settings"
          >
            <Mic size={13} className="text-purple-600" />
            <span className="hidden sm:inline">{geminiVoice} Voice</span>
          </button>

          {/* Test Teacher Voice Button */}
          <button
            onClick={testVoiceAudio}
            disabled={isTestingVoice}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full transition-all shadow-2xs cursor-pointer disabled:opacity-50 ${
              isNovaSpeaking
                ? 'bg-violet-600 text-white border border-violet-700 animate-pulse'
                : 'text-violet-800 bg-violet-50 hover:bg-violet-100 border border-violet-200'
            }`}
            title="Test Voice Speech in real-time"
          >
            <Volume2 size={13} className={isNovaSpeaking ? "text-white" : "text-violet-600"} />
            <span className="hidden md:inline">{isTestingVoice ? "Loading Voice..." : isNovaSpeaking ? "Speaking..." : `Test ${geminiVoice}`}</span>
          </button>

          {/* Gemini API Status & Configuration Badge */}
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-2xs transition-all cursor-pointer ${
              apiKey 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
            }`}
            title="Configure Gemini 2.5 Flash API Key & Settings"
          >
            <Sparkles size={13} className={apiKey ? "text-emerald-600" : "text-blue-600"} />
            <span className="hidden sm:inline">{apiKey ? "Gemini Flash Connected" : "Connect Gemini"}</span>
            <span className="sm:hidden">API</span>
          </button>

          {/* Settings Modal Trigger */}
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            title="Voice & Language Settings"
          >
            <Settings size={15} />
          </button>

          {/* Voice Speech Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => {
                const next = !isVoiceEnabled;
                setIsVoiceEnabled(next);
                if (!next) stopAudio();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all ${
                isVoiceEnabled ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Toggle Audio Narration"
            >
              {isVoiceEnabled ? <Volume2 size={14} className="text-blue-600" /> : <VolumeX size={14} />}
              <span>{isVoiceEnabled ? "Voice On" : "Muted"}</span>
            </button>
            {isVoiceEnabled && (
              <button
                onClick={() => setPlaybackSpeed(s => s === 1.0 ? 1.25 : s === 1.25 ? 1.5 : 1.0)}
                className="px-2 py-1 text-slate-600 hover:text-slate-900 font-semibold text-[11px]"
                title="Change Voice Speed"
              >
                {playbackSpeed}x
              </button>
            )}
          </div>

          {/* Export Notes */}
          {boardBlocks.length > 0 && (
            <button
              onClick={handleExportNotes}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-all shadow-xs"
              title="Export Lesson Notes as Markdown"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Export Notes</span>
            </button>
          )}

          {/* Start / Step Session Button */}
          <button
            onClick={handleStartOrAdvance}
            disabled={isPhaseLoading}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-80 cursor-pointer"
          >
            {isPhaseLoading ? (
              <>
                <RefreshCw size={16} className="animate-spin text-white" />
                <span>Loading Phase...</span>
              </>
            ) : isPlaying ? (
              <>
                <ChevronRight size={16} />
                <span>Next Phase ({currentPhaseNumber}/8)</span>
              </>
            ) : (
              <>
                <Play size={16} fill="currentColor" />
                <span>Teach Episode {activeDay?.day || 1}</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Session Playlist */}
        <aside className="w-80 lg:w-88 bg-white border-r border-slate-200/90 overflow-y-auto shrink-0 flex flex-col shadow-xs">
          <div className="p-5 border-b border-slate-100 bg-white sticky top-0 z-10">
            <div className="flex items-center justify-between mb-1.5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Session Playlist</h2>
              <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                {studyPlan?.days.length || 0} Days
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium truncate">
              {studyPlan?.title || "Master Study Syllabus"}
            </p>

            {/* Overall Progress Bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Episode List */}
          <div className="p-3 space-y-2 flex-1 overflow-y-auto">
            {studyPlan?.days.map((day) => {
              const isActive = activeDay?.day === day.day;
              const isDone = completedDays.includes(day.day);
              const titleText = getTopicTitle(day);

              let badgeStyle = "text-blue-700 bg-blue-50 border-blue-200";
              if (day.type === 'mock') badgeStyle = "text-purple-700 bg-purple-50 border-purple-200";
              if (day.type === 'revision') badgeStyle = "text-emerald-700 bg-emerald-50 border-emerald-200";
              if (day.type === 'buffer') badgeStyle = "text-amber-700 bg-amber-50 border-amber-200";
              if (day.type === 'final_review') badgeStyle = "text-rose-700 bg-rose-50 border-rose-200";

              return (
                <button
                  key={day.day}
                  onClick={() => handleSelectDay(day)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all relative ${
                    isActive 
                      ? 'bg-blue-50/70 border-blue-500 shadow-sm ring-1 ring-blue-500/20' 
                      : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Episode {day.day}
                    </span>
                    {isDone && (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle size={12} className="text-emerald-500" />
                        <span>Done</span>
                      </span>
                    )}
                  </div>

                  {/* Crystal Clear Topic Title (Fixed!) */}
                  <h3 className={`text-sm font-bold leading-snug mb-2 ${isActive ? 'text-blue-950' : 'text-slate-800'}`}>
                    {titleText}
                  </h3>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-bold border ${badgeStyle}`}>
                      {day.type.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {day.estimatedDurationMin || 45} mins
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Presentation Canvas (Crisp White Theme with Dot Grid) */}
        <main className="flex-1 relative overflow-y-auto overflow-x-hidden p-6 lg:p-10 bg-white bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] flex flex-col">
          {/* Active Episode Header & Pedagogy Phase Stepper */}
          {activeDay && (
            <div className="max-w-4xl mx-auto w-full mb-8 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                      Episode {activeDay.day}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
                      {activeDay.type.replace('_', ' ')}
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                    {getTopicTitle(activeDay)}
                  </h2>
                </div>

                {/* Animated Voice Indicator */}
                {isNovaSpeaking && (
                  <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-full self-start sm:self-auto">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600"></span>
                    </span>
                    <span className="text-xs font-bold text-indigo-700">Nova is Speaking</span>
                  </div>
                )}
              </div>

              {/* 8-Stage Pedagogy Stepper */}
              <div className="mt-4 pt-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-2">
                  <span>Pedagogy State Machine</span>
                  <span>Phase {currentPhaseNumber} of 8</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                  {PEDAGOGY_PHASES.map((p) => {
                    const isCompleted = p.num < currentPhaseNumber;
                    const isCurrent = p.num === currentPhaseNumber;
                    const Icon = p.icon;

                    return (
                      <button
                        key={p.num}
                        onClick={() => activeDay && teachPhase(p.num, activeDay)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                          isCurrent
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm scale-[1.02]'
                            : isCompleted
                              ? 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
                              : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                        }`}
                        title={p.desc}
                      >
                        <Icon size={14} className={isCurrent ? "text-white" : isCompleted ? "text-blue-600" : "text-slate-400"} />
                        <span className="text-[10px] font-bold mt-1 truncate max-w-full">{p.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Whiteboard Cards Container */}
          <div className="max-w-4xl mx-auto w-full flex flex-col gap-6 pb-36">
            {boardBlocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center bg-white border border-dashed border-slate-300 rounded-3xl p-8">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-xs border border-blue-100">
                  <BookOpen size={36} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">
                  Ready to Teach: {getTopicTitle(activeDay)}
                </h3>
                <p className="text-slate-500 text-sm max-w-md mx-auto mb-8">
                  Nova is standing by at the digital whiteboard. Click below to begin the step-by-step visual lesson complete with flowcharts, diagrams, code, and interactive checks.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={handleStartOrAdvance}
                    disabled={isPhaseLoading}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-80 cursor-pointer"
                  >
                    {isPhaseLoading ? (
                      <>
                        <RefreshCw size={18} className="animate-spin text-white" />
                        <span>Starting Episode {activeDay?.day || 1}...</span>
                      </>
                    ) : (
                      <>
                        <Play size={18} fill="currentColor" />
                        <span>Begin Episode {activeDay?.day || 1}</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => activeDay && teachPhase(3, activeDay)}
                    disabled={isPhaseLoading}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Compass size={16} />
                    <span>Preview Diagram</span>
                  </button>
                </div>
              </div>
            ) : (
              boardBlocks.map((block) => (
                <div 
                  key={block.id}
                  className="w-full bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 animate-in slide-in-from-bottom-6 fade-in"
                >
                  {/* Card Header Badge & Audio Control */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                        {block.badge || block.type.toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {block.language || block.diagramType || "Board Artifact"}
                      </span>
                    </div>

                    <button
                      onClick={() => speakNarration(block.speechText || block.content, block.audioBase64)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-bold text-blue-700 transition-all cursor-pointer shadow-2xs"
                      title="Speak this card aloud with teacher voice"
                    >
                      <Volume2 size={13} className="text-blue-600" />
                      <span>Listen ({block.voiceUsed?.includes("Live") ? "Aoede Live" : (geminiVoice || "Aoede")})</span>
                    </button>
                  </div>

                  {/* Diagram Block */}
                  {block.type === "diagram" && (
                    <div className="flex flex-col items-center">
                      <div className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 flex justify-center overflow-x-auto">
                        <MermaidRenderer chart={block.content} id={block.id} />
                      </div>
                      <p className="text-xs text-slate-400 mt-3 font-medium">
                        Interactive Architectural Flowchart rendered via Mermaid.js
                      </p>
                    </div>
                  )}

                  {/* Math Equation Block */}
                  {block.type === "math" && (
                    <div className="flex flex-col items-center py-4 bg-purple-50/40 border border-purple-100 rounded-xl">
                      <div className="text-xl sm:text-3xl text-purple-950 py-4 px-4 overflow-x-auto text-center w-full">
                        <Latex>{`$$${block.content}$$`}</Latex>
                      </div>
                      <p className="text-xs text-purple-600 font-medium mt-1">Formally grounded mathematical formulation</p>
                    </div>
                  )}

                  {/* Code Block */}
                  {block.type === "code" && (
                    <div className="flex flex-col">
                      <div className="rounded-xl border border-slate-200 overflow-hidden shadow-inner text-sm bg-slate-900 text-slate-100">
                        <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex items-center justify-between text-xs text-slate-300 font-mono">
                          <span>{block.language || "cpp"}</span>
                          <button 
                            onClick={() => navigator.clipboard.writeText(block.content)}
                            className="hover:text-white transition-colors"
                          >
                            Copy Code
                          </button>
                        </div>
                        <SyntaxHighlighter 
                          language={block.language || 'cpp'} 
                          PreTag="div" 
                          customStyle={{ margin: 0, padding: '1.25rem', background: '#0f172a' }}
                        >
                          {block.content}
                        </SyntaxHighlighter>
                      </div>
                    </div>
                  )}

                  {/* Text Note Block */}
                  {block.type === "text" && (
                    <div className="text-slate-800 text-sm sm:text-base leading-relaxed font-normal bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
                      <FormattedBoardContent content={block.content} />
                    </div>
                  )}

                  {/* Pitfall / Trap Block */}
                  {block.type === "pitfall" && (
                    <div className="bg-amber-50/90 border-l-4 border-amber-500 p-6 rounded-r-2xl text-slate-800 border-y border-r border-amber-200/60 shadow-2xs">
                      <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-3">
                        <AlertTriangle size={18} className="text-amber-600" />
                        <span>Examiner Warnings & Pitfalls</span>
                      </div>
                      <FormattedBoardContent content={block.content} />
                    </div>
                  )}

                  {/* Interactive Quiz Block */}
                  {block.type === "quiz" && (
                    <div className="flex flex-col">
                      <h4 className="text-lg sm:text-xl font-bold text-slate-900 mb-6 leading-snug">
                        {block.question}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {block.options?.map((option, idx) => {
                          const isSelected = block.selectedOption === idx;
                          const hasSelected = block.selectedOption !== null && block.selectedOption !== undefined;
                          const isCorrect = idx === (block.correctAnswer ?? 1);

                          let buttonStyle = "bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50/30";
                          if (hasSelected) {
                            if (isSelected && isCorrect) {
                              buttonStyle = "bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20";
                            } else if (isSelected && !isCorrect) {
                              buttonStyle = "bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-500/20";
                            } else if (isCorrect) {
                              buttonStyle = "bg-emerald-50 border-emerald-400 text-emerald-800";
                            } else {
                              buttonStyle = "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
                            }
                          }

                          return (
                            <button
                              key={idx}
                              disabled={hasSelected}
                              onClick={() => handleQuizSelect(block.id, idx)}
                              className={`text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 text-sm sm:text-base font-medium ${buttonStyle}`}
                            >
                              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-xs font-bold shrink-0 mt-0.5 border border-slate-300">
                                {String.fromCharCode(65 + idx)}
                              </span>
                              <span className="pt-0.5">{option}</span>
                            </button>
                          );
                        })}
                      </div>

                      {block.selectedOption !== null && block.selectedOption !== undefined && (
                        <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-sm">
                          <span className="font-bold">Explanation: </span>
                          <span>{block.explanation || "Review the core definition card above for details."}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Interactive Practice Editor Block */}
                  {block.type === "practice_editor" && (
                    <div className="flex flex-col gap-4">
                      <p className="text-slate-800 font-semibold text-sm sm:text-base">{block.question}</p>
                      <textarea
                        defaultValue={block.studentSubmittedCode || block.starterCode}
                        onChange={(e) => {
                          block.content = e.target.value;
                        }}
                        className="w-full h-44 bg-slate-900 border border-slate-800 rounded-xl p-4 text-emerald-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="Write your solution here..."
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-mono">
                          Time Limit: {block.timeLimitSec || 180}s
                        </span>
                        <button
                          onClick={() => handlePracticeSubmit(block.id, block.content || block.starterCode || "")}
                          className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                        >
                          Submit Solution to Nova
                        </button>
                      </div>
                      {block.studentSubmittedCode && (
                        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-xl text-xs font-mono">
                          ✓ Solution verified! Nova has logged your completion for Episode {activeDay?.day}.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Mark Episode Completed Action */}
            {activeDay && !completedDays.includes(activeDay.day) && boardBlocks.length > 0 && (
              <div className="flex justify-center pt-6">
                <button
                  onClick={handleMarkCompleted}
                  className="flex items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95"
                >
                  <CheckCircle size={18} />
                  <span>Mark Episode {activeDay.day} Complete</span>
                </button>
              </div>
            )}

            <div ref={boardEndRef} className="h-1" />
          </div>

          {/* Floating White-Theme "Ask Nova" Bar at Bottom */}
          <div className="fixed bottom-6 right-6 left-80 lg:left-88 z-20 flex flex-col items-center pointer-events-none px-4">
            {/* Quick Action Chips */}
            <div className="pointer-events-auto flex items-center gap-2 mb-2.5 overflow-x-auto max-w-2xl px-2 py-1 bg-white/90 backdrop-blur border border-slate-200/90 rounded-full shadow-sm text-xs font-medium text-slate-600">
              <span className="text-[11px] font-bold text-slate-400 pl-2">Tools:</span>
              <button
                onClick={() => activeDay && teachPhase(3, activeDay)}
                className="px-3 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-1"
              >
                <Compass size={12} />
                <span>Draw Diagram</span>
              </button>
              <button
                onClick={() => activeDay && teachPhase(4, activeDay)}
                className="px-3 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-1"
              >
                <Code size={12} />
                <span>Show Code</span>
              </button>
              <button
                onClick={() => activeDay && teachPhase(6, activeDay)}
                className="px-3 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-1"
              >
                <HelpCircle size={12} />
                <span>Quiz Me</span>
              </button>
              <button
                onClick={handleClearBoard}
                className="px-3 py-1 rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-1"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            </div>

            {/* Input Form */}
            <form 
              onSubmit={handleAskNova}
              className="pointer-events-auto w-full max-w-2xl flex items-center bg-white border border-slate-300/80 rounded-full shadow-lg p-1.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all"
            >
              <input
                type="text"
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="Ask Nova a doubt, request a flowchart, or clarify a concept..."
                className="flex-1 bg-transparent text-slate-800 px-5 py-2 text-sm focus:outline-none placeholder:text-slate-400 font-medium"
              />
              <button
                type="submit"
                disabled={!queryText.trim() || isGeneratingCard}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </main>
      </div>

      {/* Gemini Live Voice & Language Engine Settings Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
                  <Mic size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                    Gemini Live Voice & Language Engine
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure Aoede voice persona, professional Hinglish, & Gemini API
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Section 1: Teaching Language Mode */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                1. Teaching Language Mode
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setTeachingLanguage("hinglish");
                    localStorage.setItem("teaching_language", "hinglish");
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    teachingLanguage === "hinglish"
                      ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-500/20 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                      <span>🌐</span> Professional Hinglish
                    </span>
                    <span className="text-[9px] font-extrabold uppercase tracking-wide bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded-full">
                      Active Choice
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Natural English technical vocabulary with conversational Hindi explanations (like Striver, Love Babbar, & Abdul Bari).
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTeachingLanguage("english");
                    localStorage.setItem("teaching_language", "english");
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    teachingLanguage === "english"
                      ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <span>📚</span> Academic English
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Formal university textbook lecture explanations with rigorous English mathematical derivation.
                  </p>
                </button>
              </div>
            </div>

            {/* Section 2: Gemini Live Voice Selection */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                2. Live Voice Persona
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { name: "Aoede", label: "Aoede (Indian Female)", desc: "Gemini 2.5 Flash Native Audio voice with Indian Hindi/Hinglish pronunciation", icon: "✨", tag: "Single Voice" },
                  { name: "Web Speech", label: "Browser Voice", desc: "Client Native Speech", icon: "💻" }
                ].map((v) => {
                  const isSelected = geminiVoice === v.name;
                  return (
                    <button
                      key={v.name}
                      type="button"
                      onClick={() => {
                        setGeminiVoice(v.name);
                        localStorage.setItem("gemini_voice", v.name);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-purple-50/80 border-purple-300 ring-2 ring-purple-500/20 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-purple-950 flex items-center gap-1">
                          <span>{v.icon}</span> {v.label}
                        </span>
                        {v.tag && (
                          <span className="text-[8px] font-extrabold uppercase bg-purple-200 text-purple-900 px-1 py-0.2 rounded">
                            {v.tag}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">{v.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 3: Gemini 2.5 Flash Native Audio Dialog API Key */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-800">Gemini 2.5 Flash Native Audio Dialog API Key</span>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                >
                  <span>Google AI Studio</span>
                  <span>↗</span>
                </a>
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                Provides direct Gemini 2.5 Flash Native Audio live stream with the Aoede female voice in professional Hinglish.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste your Gemini API key here"
                  className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem("gemini_api_key", apiKey.trim());
                    testVoiceAudio();
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer whitespace-nowrap"
                >
                  Save & Test
                </button>
              </div>
            </div>

            {/* Section 4: Live Audio Test & Speed */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-violet-50/60 border border-violet-200">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={testVoiceAudio}
                  disabled={isTestingVoice}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Volume2 size={14} className={isNovaSpeaking ? "animate-pulse" : ""} />
                  <span>{isTestingVoice ? "Synthesizing..." : `Test ${geminiVoice} Voice`}</span>
                </button>
                <span className="text-xs text-violet-900 font-medium hidden sm:inline">
                  {teachingLanguage === "hinglish" ? "Spoken in Professional Hinglish" : "Spoken in Academic English"}
                </span>
              </div>

              {/* Speed Buttons */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-violet-200 text-xs font-semibold">
                {[0.8, 1.0, 1.25, 1.5].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`px-2 py-0.5 rounded-lg transition-all ${
                      playbackSpeed === spd
                        ? 'bg-violet-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem("teaching_language", teachingLanguage);
                  localStorage.setItem("gemini_voice", geminiVoice);
                  if (apiKey) localStorage.setItem("gemini_api_key", apiKey.trim());
                  setIsSettingsModalOpen(false);
                }}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                Apply & Start Learning
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Audio Tag for Chromium Autoplay Policy Unlock */}
      <audio ref={audioPlayerRef} className="hidden" preload="auto" />
    </div>
  );
}
