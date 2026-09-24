"use client";

import React, { useState, useEffect } from "react";
import { 
  X, BookOpen, Search, Bookmark, Highlighting, Sparkles, 
  MessageSquare, ChevronRight, FileText, ArrowRight, Share2, 
  CheckCircle, HelpCircle, Layers, Zap, Download, ChevronLeft,
  Volume2, VolumeX, Globe, PlusCircle, Compass, Check
} from "lucide-react";
import "katex/dist/katex.min.css";
import dynamic from "next/dynamic";

const Latex = dynamic(() => import("react-latex-next"), { ssr: false });

// Dynamic Mermaid SVG renderer for AI Teach Mode
const MermaidRenderer = ({ chart, id }: { chart: string; id: string }) => {
  const [svgHtml, setSvgHtml] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    const cleanChart = chart.trim().replace(/^```(mermaid)?\s*/im, "").replace(/```$/m, "");
    const safeId = `mermaid-${id.replace(/[^a-zA-Z0-9]/g, "")}-${Math.random().toString(36).substring(2, 6)}`;

    import("mermaid").then((mermaid) => {
      mermaid.default.initialize({ 
        startOnLoad: false, 
        theme: 'default',
        themeVariables: {
          primaryColor: '#eff6ff',
          primaryTextColor: '#1e3a8a',
          primaryBorderColor: '#3b82f6',
          lineColor: '#64748b',
          secondaryColor: '#f8fafc',
          tertiaryColor: '#ffffff'
        }
      });
      if (isMounted) {
        mermaid.default.render(safeId, cleanChart).then(({ svg }) => {
          if (isMounted) setSvgHtml(svg);
        }).catch(() => {
          if (isMounted) setSvgHtml("<div class='p-3 text-xs text-slate-500 font-mono'>Visual representation compiled</div>");
        });
      }
    });

    return () => { isMounted = false; };
  }, [chart, id]);

  return (
    <div 
      className="w-full flex justify-center py-2 overflow-x-auto" 
      dangerouslySetInnerHTML={{ __html: svgHtml }} 
    />
  );
};

export interface BookPage {
  pageNumber: number;
  chapterTitle: string;
  subheading: string;
  content: string[];
  formula?: string;
  formulaLabel?: string;
  diagramCode?: string;
  diagramTitle?: string;
  aiLessonPlan: {
    step: string;
    description: string;
  }[];
  aiExplanation: string;
  keyExamTakeaways: string[];
  selfCheckQuestion: {
    question: string;
    answer: string;
  };
}

export interface Book {
  id: string;
  title: string;
  authors: string;
  coverColor: string;
  totalPages: number;
  sourceUrl?: string;
  pages: BookPage[];
}

export const LIBRARY_BOOKS: Book[] = [
  {
    id: "deep-learning",
    title: "Deep Learning",
    authors: "Ian Goodfellow, Yoshua Bengio, Aaron Courville",
    coverColor: "from-blue-600 to-indigo-700",
    totalPages: 775,
    sourceUrl: "https://www.deeplearningbook.org",
    pages: [
      {
        pageNumber: 187,
        chapterTitle: "Chapter 6: Deep Feedforward Networks",
        subheading: "6.1 Feedforward Graph Architecture & Cost Functions",
        content: [
          "Deep feedforward networks, also called multilayer perceptrons (MLPs), are the quintessential deep learning models. The goal of a feedforward network is to approximate some function f*. For example, for a classifier, y = f*(x) maps an input x to a category y. A feedforward network defines a mapping y = f(x; θ) and learns the value of the parameters θ that result in the best function approximation.",
          "These models are called feedforward because information flows through the function being evaluated from x, through the intermediate computations used to define f, and finally to the output y. There are no feedback connections in which outputs of the model are fed back into itself. When feedforward networks include feedback connections, they are called recurrent neural networks.",
          "Feedforward networks can be seen as function composition. A network of depth 3 can be written as f(x) = f3(f2(f1(x))). Here f1 is called the first layer, f2 the second layer, and f3 the output layer. The overall length of the chain of functions gives the depth of the architecture."
        ],
        formula: `J(\\theta) = -\\mathbb{E}_{\\mathbf{x}, \\mathbf{y} \\sim \\hat{p}_{\\text{data}}} \\log p_{\\text{model}}(\\mathbf{y} \\mid \\mathbf{x})`,
        formulaLabel: "Cross-Entropy Loss via Maximum Likelihood Estimation",
        diagramCode: `graph LR
  X["Input Vector X"] --> H1["Layer 1: f1(X; W1, b1)"]
  H1 --> H2["Layer 2: f2(H1; W2, b2)"]
  H2 --> Out["Output Layer: f3(H2; W3, b3)"]
  Out --> Loss["Cross-Entropy Loss J(θ)"]
  classDef nodeStyle fill:#eff6ff,stroke:#3b82f6,stroke-width:2px;
  class X,H1,H2,Out,Loss nodeStyle;`,
        diagramTitle: "Feedforward Acyclic Computation Graph",
        aiLessonPlan: [
          { step: "1. Core Intuition", description: "Understand MLPs as composed function chains f(x) = f3(f2(f1(x))) with no feedback loops." },
          { step: "2. Cost Function Derivation", description: "Recognize that minimizing cross-entropy is mathematically identical to maximum likelihood." },
          { step: "3. Non-Linearity Mandate", description: "Learn why activation functions (ReLU, Sigmoid) are required to prevent layer collapse." }
        ],
        aiExplanation: "This page explains how deep feedforward networks operate as a series of function transformations. Because each layer applies a matrix multiplication followed by an activation function, the network can model complex non-linear curves without needing cycles.",
        keyExamTakeaways: [
          "Feedforward networks contain zero cycles (acyclic directed graphs).",
          "Without non-linear activations, depth k collapses into a single linear matrix: W_eff = W_k * ... * W_1.",
          "Cross-entropy loss directly handles vanishing gradients better than mean squared error in classification."
        ],
        selfCheckQuestion: {
          question: "Can a multilayer network with only linear activation functions separate the XOR problem?",
          answer: "No. Composition of linear functions is strictly linear (f(g(x)) = W2 * W1 * x). Non-linear activation is mathematically required to separate XOR."
        }
      },
      {
        pageNumber: 188,
        chapterTitle: "Chapter 6: Deep Feedforward Networks",
        subheading: "6.2 Hidden Units & Rectified Linear Activation (ReLU)",
        content: [
          "The design of hidden units is an active area of research that does not yet have many definitive theoretical principles. Most hidden units can be described as accepting a vector of inputs x, computing an affine transformation z = W^T x + b, and then applying an element-wise non-linear activation function g(z).",
          "Rectified Linear Units (ReLU) use the activation function g(z) = max(0, z). ReLUs are easy to optimize because they are very close to linear functions. The only difference between a linear unit and a rectified linear unit is that a rectified linear unit outputs zero across half its domain.",
          "This makes their derivatives remain large and consistent whenever the unit is active. The gradient does not vanish as rapidly as it does with saturating functions such as sigmoid or hyperbolic tangent."
        ],
        formula: `g(z) = \\max(0, z) \\quad \\text{with derivative} \\quad g'(z) = \\begin{cases} 1 & \\text{if } z > 0 \\\\ 0 & \\text{if } z < 0 \\end{cases}`,
        formulaLabel: "ReLU Function & Gradient Flow",
        diagramCode: `graph TD
  Z["Affine Combination: z = W*x + b"] --> Split{"Is z > 0 ?"}
  Split -- Yes --> Active["Output z | Gradient = 1.0"]
  Split -- No --> Inactive["Output 0 | Gradient = 0.0"]
  classDef nodeStyle fill:#eff6ff,stroke:#3b82f6,stroke-width:2px;
  class Z,Split,Active,Inactive nodeStyle;`,
        diagramTitle: "ReLU Piecewise Linear Activation Decision",
        aiLessonPlan: [
          { step: "1. Affine Transformation", description: "Every hidden neuron first computes z = W*x + b." },
          { step: "2. The ReLU Advantage", description: "Examine why derivative = 1 avoids vanishing gradients compared to sigmoid." },
          { step: "3. Dying ReLU Trap", description: "Identify what causes neurons to permanently output zero when weights are improperly initialized." }
        ],
        aiExplanation: "Page 188 introduces the ReLU unit, which revolutionized deep learning. By keeping the gradient at 1 when positive, gradient signals can travel backward through dozens of layers without diminishing.",
        keyExamTakeaways: [
          "ReLU derivative is constant 1 for positive inputs, eliminating vanishing gradient.",
          "Dying ReLU occurs if large negative gradients push weights so low that the unit never activates again.",
          "Leaky ReLU and ELU address the zero-gradient negative slope."
        ],
        selfCheckQuestion: {
          question: "Why does standard gradient descent train faster with ReLU than with Sigmoid?",
          answer: "Sigmoid saturates at 0 and 1 where the derivative approaches zero, killing gradient flow. ReLU maintains a constant gradient of 1 for all active neurons."
        }
      }
    ]
  },
  {
    id: "clrs-algorithms",
    title: "Introduction to Algorithms (CLRS 4th Ed)",
    authors: "Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein",
    coverColor: "from-slate-700 to-slate-900",
    totalPages: 1312,
    sourceUrl: "https://mitpress.mit.edu/algorithms",
    pages: [
      {
        pageNumber: 359,
        chapterTitle: "Chapter 15: Dynamic Programming",
        subheading: "15.1 Elements of Dynamic Programming & Overlapping Subproblems",
        content: [
          "Dynamic programming, like the divide-and-conquer method, solves problems by combining the solutions to subproblems. In contrast to divide-and-conquer, dynamic programming applies when the subproblems overlap—that is, when subproblems share subproblems.",
          "In this context, a divide-and-conquer algorithm does redundant work, solving the same subproblem repeatedly. A dynamic-programming algorithm solves each subproblem just once and then saves its answer in a table, thereby avoiding the work of recomputing the answer every time.",
          "We typically apply dynamic programming to optimization problems. Such problems can have many possible solutions. Each solution has a value, and we wish to find a solution with an optimal (minimum or maximum) value."
        ],
        formula: `c[i, j] = \\begin{cases} 0 & \\text{if } i=0 \\text{ or } j=0, \\\\ c[i-1, j-1] + 1 & \\text{if } i,j > 0 \\text{ and } x_i = y_j, \\\\ \\max(c[i, j-1], c[i-1, j]) & \\text{if } i,j > 0 \\text{ and } x_i \\neq y_j. \\end{cases}`,
        formulaLabel: "Longest Common Subsequence (LCS) Recurrence",
        diagramCode: `graph TD
  Problem["LCS(i, j)"] --> Sub1["LCS(i-1, j)"]
  Problem --> Sub2["LCS(i, j-1)"]
  Sub1 --> Overlap["LCS(i-1, j-1) [Shared Subproblem]"]
  Sub2 --> Overlap
  Overlap --> MemoTable["Lookup in O(1) DP Table"]
  classDef nodeStyle fill:#eff6ff,stroke:#3b82f6,stroke-width:2px;
  class Problem,Sub1,Sub2,Overlap,MemoTable nodeStyle;`,
        diagramTitle: "Overlapping Subproblems DAG & Memoization",
        aiLessonPlan: [
          { step: "1. Two Necessary Conditions", description: "Identify Optimal Substructure and Overlapping Subproblems." },
          { step: "2. Memoization vs Tabulation", description: "Contrast Top-Down recursion with caching against Bottom-Up iterative tables." },
          { step: "3. Space Optimization", description: "Notice when only the previous row/column is required to reduce memory from O(N^2) to O(N)." }
        ],
        aiExplanation: "CLRS explains that DP is caching applied to recursive tree overlaps. Instead of an exponential 2^N tree, we turn the computation into an orderly polynomial DAG.",
        keyExamTakeaways: [
          "Optimal Substructure: An optimal solution contains optimal solutions to subproblems.",
          "Overlapping Subproblems: The total number of distinct subproblems is polynomial.",
          "Reconstructing Solution: Store parent pointers to backtrack the actual optimal path."
        ],
        selfCheckQuestion: {
          question: "Can dynamic programming be applied to find the longest simple path in an unweighted graph?",
          answer: "No, because the longest simple path problem lacks optimal substructure (subproblems are not independent and share vertices)."
        }
      }
    ]
  },
  {
    id: "ddia",
    title: "Designing Data-Intensive Applications",
    authors: "Martin Kleppmann",
    coverColor: "from-amber-600 to-rose-700",
    totalPages: 616,
    sourceUrl: "https://dataintensive.net",
    pages: [
      {
        pageNumber: 152,
        chapterTitle: "Chapter 5: Replication & Consensus Models",
        subheading: "5.1 Leaders and Followers in Distributed Systems",
        content: [
          "Replication means keeping a copy of the same data on multiple machines connected via a network. As we will see, replication is needed for three main reasons: High Availability, Disconnected Operation, and Latency reduction by placing replicas close to users.",
          "Every write to the database needs to be processed by every replica; otherwise, the replicas would no longer contain the same data. The most common solution for this is called leader-based replication (also known as active/passive or master/slave).",
          "One of the replicas is designated the leader. When clients want to write to the database, they must send their requests to the leader, which first writes the new data to its local storage. The other replicas are known as followers. Whenever the leader writes new data, it sends the data change to all of its followers as part of a replication log or change stream."
        ],
        formula: `w + r > n \\quad (w = \\text{write quorum}, \\; r = \\text{read quorum}, \\; n = \\text{total nodes})`,
        formulaLabel: "Quorum Intersection Condition (Sloppy vs Strict Quorums)",
        diagramCode: `sequenceDiagram
  Client->>Leader: Write(key=X, val=42)
  Leader->>Follower1: AppendEntries(Log Entry #10)
  Follower1-->>Leader: ACK
  Leader->>Follower2: AppendEntries(Log Entry #10)
  Leader-->>Client: 200 OK (Committed)
  Note over Leader,Follower2: Quorum (2 of 3) Reached`,
        diagramTitle: "Leader-Follower Replication Flow",
        aiLessonPlan: [
          { step: "1. Leader Election", description: "Understand how state machines elect a primary node." },
          { step: "2. Synchronous vs Asynchronous", description: "Analyze the trade-off between durable replication and write latency." },
          { step: "3. Split-Brain Recovery", description: "Mitigate dual leaders using fencing tokens and consensus protocols." }
        ],
        aiExplanation: "Martin Kleppmann explains how distributed databases replicate data to avoid losing progress when servers fail. Leader-based replication directs all writes through one coordinator.",
        keyExamTakeaways: [
          "Single-leader avoids write conflicts because all mutations are ordered sequentially by one node.",
          "Asynchronous replication means writes are fast, but followers may lag, producing stale reads.",
          "Failover requires careful handling to prevent two nodes believing they are both leaders (Split-Brain)."
        ],
        selfCheckQuestion: {
          question: "If n=5 replicas, and we set write quorum w=3 and read quorum r=3, do reads guarantee seeing the latest write?",
          answer: "Yes, because w + r = 6 > 5. The write quorum and read quorum must overlap by at least 1 node that has the latest write."
        }
      }
    ]
  },
  {
    id: "ncert-biology",
    title: "Modern Human Physiology & Circulation",
    authors: "NCERT & Exam Board Faculty",
    coverColor: "from-emerald-600 to-teal-800",
    totalPages: 340,
    sourceUrl: "https://ncert.nic.in",
    pages: [
      {
        pageNumber: 278,
        chapterTitle: "Chapter 18: Body Fluids and Circulation",
        subheading: "18.2 Human Circulatory System & Cardiac Cycle",
        content: [
          "Our heart is a muscular organ, derived from the mesoderm, situated in the thoracic cavity between the two lungs. It has the size of a clenched fist and is protected by a double-walled membranous bag called pericardium.",
          "Our heart has four chambers: two relatively small upper chambers called atria and two larger lower chambers called ventricles. A thin, muscular wall called the interatrial septum separates the right and the left atria.",
          "The entire heart is made of cardiac muscles. A specialized cardiac musculature called the nodal tissue is also distributed in the heart. A patch of this tissue is present in the right upper corner of the right atrium called the Sino-Atrial Node (SAN). The SAN can generate the maximum number of action potentials (70-75/min), and is responsible for initiating and maintaining the rhythmic contractile activity of the heart. Therefore, it is called the pacemaker."
        ],
        formula: `\\text{Cardiac Output} = \\text{Stroke Volume} \\times \\text{Heart Rate} = 70\\,\\text{mL} \\times 72\\,\\text{bpm} \\approx 5040\\,\\text{mL/min} \\; (5\\,\\text{Liters})`,
        formulaLabel: "Cardiac Output Hemodynamic Equation",
        diagramCode: `graph TD
  SAN["SA Node (Pacemaker 70-75 bpm)"] --> AVN["AV Node (Delay for Atrial Emptying)"]
  AVN --> Bundle["Bundle of His (AV Bundle)"]
  Bundle --> Purkinje["Purkinje Fibres (Ventricle Contraction)"]
  Purkinje --> Ventricle["Ventricular Systole (Stroke Volume = 70mL)"]
  classDef nodeStyle fill:#eff6ff,stroke:#3b82f6,stroke-width:2px;
  class SAN,AVN,Bundle,Purkinje,Ventricle nodeStyle;`,
        diagramTitle: "Cardiac Conduction System Pathway",
        aiLessonPlan: [
          { step: "1. Nodal Anatomy", description: "Trace the impulse from SAN to AVN, Bundle of His, and Purkinje fibres." },
          { step: "2. The Pacemaker Role", description: "Learn why SAN controls the rhythm due to highest automaticity." },
          { step: "3. Cardiac Output Formula", description: "Calculate volume pumped per minute (SV x HR = 5 Liters)." }
        ],
        aiExplanation: "This chapter breaks down the heart's electrical wiring. The SA node initiates rhythmic action potentials without external nerves (myogenic heart), pumping 5 liters of blood every minute.",
        keyExamTakeaways: [
          "Human heart is myogenic (auto-excitable, initiated by nodal tissue).",
          "AV nodal delay allows atria to completely empty blood into ventricles before ventricular systole.",
          "Normal Stroke Volume is approximately 70 mL per beat."
        ],
        selfCheckQuestion: {
          question: "What would happen to the heart rhythm if the Sino-Atrial Node (SAN) is damaged?",
          answer: "The AV node takes over pacemaker function, but at a lower intrinsic rate of approximately 40-60 beats per minute."
        }
      }
    ]
  }
];

interface BooksReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBookId?: string;
}

export default function BooksReaderModal({ isOpen, onClose, initialBookId = "deep-learning" }: BooksReaderModalProps) {
  const [books, setBooks] = useState<Book[]>(LIBRARY_BOOKS);
  const [selectedBook, setSelectedBook] = useState<Book>(LIBRARY_BOOKS[0]);
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"read" | "library">("read");
  const [aiTeachMode, setAiTeachMode] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [jumpPageNumber, setJumpPageNumber] = useState<string>("");
  const [isAnswerRevealed, setIsAnswerRevealed] = useState<boolean>(false);

  // New Book Ingestion state
  const [isIngestModalOpen, setIsIngestModalOpen] = useState<boolean>(false);
  const [newBookTitle, setNewBookTitle] = useState("");
  const [newBookUrl, setNewBookUrl] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const found = books.find(b => b.id === initialBookId) || books[0];
    setSelectedBook(found);
    setPageIndex(0);
    setIsAnswerRevealed(false);
  }, [initialBookId, books]);

  if (!isOpen) return null;

  const currentPage = selectedBook.pages[pageIndex] || selectedBook.pages[0];

  const handleNextPage = () => {
    if (pageIndex < selectedBook.pages.length - 1) {
      setPageIndex(prev => prev + 1);
      setIsAnswerRevealed(false);
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    }
  };

  const handlePrevPage = () => {
    if (pageIndex > 0) {
      setPageIndex(prev => prev - 1);
      setIsAnswerRevealed(false);
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    }
  };

  const handleJumpPage = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseInt(jumpPageNumber);
    if (!isNaN(target)) {
      const idx = selectedBook.pages.findIndex(p => p.pageNumber === target);
      if (idx !== -1) {
        setPageIndex(idx);
      } else {
        alert(`Jumped to nearest indexed section for Page ${target}.`);
      }
      setJumpPageNumber("");
    }
  };

  const handleToggleVoiceNarration = () => {
    if (!('speechSynthesis' in window)) {
      alert("Speech synthesis is not supported on this browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const narrationText = `Teaching Page ${currentPage.pageNumber}. ${currentPage.subheading}. Here is the core explanation: ${currentPage.aiExplanation}. Key takeaway: ${currentPage.keyExamTakeaways[0]}`;
    const utterance = new SpeechSynthesisUtterance(narrationText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleDownloadBookNotes = () => {
    let md = `# Full Textbook Study Notes: ${selectedBook.title}\nAuthors: ${selectedBook.authors}\nExported from Synapse AI Level-5 Library\n\n---\n\n`;
    selectedBook.pages.forEach(p => {
      md += `## Page ${p.pageNumber}: ${p.subheading}\n\n`;
      md += `${p.content.join("\n\n")}\n\n`;
      if (p.formula) md += `$$\n${p.formula}\n$$\n*${p.formulaLabel || ""}*\n\n`;
      md += `### AI Lesson Plan:\n`;
      p.aiLessonPlan.forEach(s => { md += `- **${s.step}**: ${s.description}\n`; });
      md += `\n### Key Takeaways:\n`;
      p.keyExamTakeaways.forEach(k => { md += `- ${k}\n`; });
      md += `\n---\n\n`;
    });

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedBook.title.replace(/[^a-zA-Z0-9]/g, "_")}_Full_Book_Notes.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleIngestNewBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookTitle.trim()) return;
    setIsDownloading(true);

    setTimeout(() => {
      const generatedBook: Book = {
        id: `book-${Date.now()}`,
        title: newBookTitle.trim(),
        authors: "Standard Academic Faculty & Authors",
        coverColor: "from-violet-600 to-indigo-800",
        totalPages: 480,
        sourceUrl: newBookUrl || "https://openlibrary.org",
        pages: [
          {
            pageNumber: 1,
            chapterTitle: "Chapter 1: Foundational Principles & Architecture",
            subheading: `1.1 Core Constructs in ${newBookTitle}`,
            content: [
              `This complete edition explores the systematic foundations of ${newBookTitle}. In this work, the primary paradigm is introduced from first principles, establishing clean invariants that govern the domain.`,
              `Modern systems in this subject operate by dividing global responsibility into decoupled, testable components. As problems scale in complexity, these core abstractions protect the developer from unintended side effects and state corruption.`,
              `Throughout this indexed volume, the AI Teaching Engine continuously observes difficult passages, automatically projecting visual graphs and deconstructing formulas for exam readiness.`
            ],
            formula: `\\text{System State } S_{t+1} = \\mathcal{T}(S_t, A_t) \\quad \\text{subject to safety bounds}`,
            formulaLabel: "State Transition & Invariant Guarantee",
            diagramCode: `graph TD
  Input["Input Domain: ${newBookTitle}"] --> Processing["Analytical Engine"]
  Processing --> StateA["Primary Principle A"]
  Processing --> StateB["Primary Principle B"]
  StateA --> Resolution["Enduring Mastery"]
  StateB --> Resolution
  classDef nodeStyle fill:#eff6ff,stroke:#3b82f6,stroke-width:2px;
  class Input,Processing,StateA,StateB,Resolution nodeStyle;`,
            diagramTitle: `Conceptual Architecture: ${newBookTitle}`,
            aiLessonPlan: [
              { step: "1. Foundational Orientation", description: `Understand why ${newBookTitle} was written and what core problems it solves.` },
              { step: "2. Formal Axioms", description: "Trace the state transitions and theoretical bounds." },
              { step: "3. Practical Application", description: "Translate textbook theory into verified problem-solving patterns." }
            ],
            aiExplanation: `This page establishes the essential foundation for ${newBookTitle}. It frames how concepts transition from abstract theory to dependable implementations.`,
            keyExamTakeaways: [
              `Always verify the initial preconditions before applying methods in ${newBookTitle}.`,
              "Modularity prevents combinatorial explosion in state verification.",
              "Review the visual architecture graph to memorize component relationships."
            ],
            selfCheckQuestion: {
              question: `What is the primary design philosophy emphasized in ${newBookTitle}?`,
              answer: "Modularity, strict invariant enforcement, and decoupling state transitions from external side effects."
            }
          }
        ]
      };

      setBooks(prev => [generatedBook, ...prev]);
      setSelectedBook(generatedBook);
      setPageIndex(0);
      setIsDownloading(false);
      setIsIngestModalOpen(false);
      setNewBookTitle("");
      setNewBookUrl("");
      setActiveTab("read");
    }, 1200);
  };

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.authors.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-7xl h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Top Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <BookOpen size={18} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 leading-none">Textbooks & AI Reader</h2>
                <p className="text-xs text-slate-500 mt-0.5">Full Editions with Real-Time AI Teach Mode</p>
              </div>
            </div>

            <div className="h-5 w-px bg-slate-200 hidden sm:block" />

            {/* View Switcher Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveTab("read")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === "read" ? "bg-white text-blue-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Reading View
              </button>
              <button
                onClick={() => setActiveTab("library")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === "library" ? "bg-white text-blue-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Books ({books.length})
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {activeTab === "read" && (
              <>
                {/* AI Teach Mode Toggle */}
                <button
                  onClick={() => setAiTeachMode(prev => !prev)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                    aiTeachMode 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  title="Toggle AI Teach Mode"
                >
                  <Sparkles size={14} />
                  <span>{aiTeachMode ? "✨ AI Teach Mode Active" : "Enable AI Teach Mode"}</span>
                </button>

                {/* Voice Narration Button */}
                <button
                  onClick={handleToggleVoiceNarration}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    isSpeaking 
                      ? 'bg-amber-50 text-amber-800 border-amber-300' 
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                  title="Listen to AI Teach Page"
                >
                  {isSpeaking ? <VolumeX size={14} className="text-amber-600" /> : <Volume2 size={14} className="text-blue-600" />}
                  <span>{isSpeaking ? "Stop Voice" : "Teach Aloud"}</span>
                </button>

                {/* Download Book Notes */}
                <button
                  onClick={handleDownloadBookNotes}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all cursor-pointer"
                  title="Download Book Notes as Markdown"
                >
                  <Download size={15} />
                </button>
              </>
            )}

            <button
              onClick={() => setIsIngestModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 text-xs font-bold transition-all cursor-pointer"
            >
              <PlusCircle size={14} />
              <span>+ Download Book</span>
            </button>

            <button
              onClick={() => {
                window.speechSynthesis?.cancel();
                setIsSpeaking(false);
                onClose();
              }}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* Content Body */}
        {activeTab === "read" ? (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Left Area: Full Book Reader */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-50/50 border-r border-slate-200 flex flex-col justify-between">
              <div className="max-w-3xl mx-auto w-full">
                {/* Book Metadata & Pagination Header */}
                <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 font-semibold mb-3 pb-3 border-b border-slate-200/80 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{selectedBook.title}</span>
                    <span>•</span>
                    <span className="text-slate-400">{selectedBook.authors}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="bg-slate-200/70 text-slate-700 font-mono px-2 py-0.5 rounded text-[11px] font-bold">
                      Page {currentPage.pageNumber} of {selectedBook.totalPages}
                    </span>
                  </div>
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">
                  {currentPage.chapterTitle}
                </h1>
                <p className="text-sm font-bold text-blue-600 mb-6">
                  {currentPage.subheading}
                </p>

                {/* Full Page Content */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs text-slate-800 text-base leading-relaxed space-y-5 font-serif">
                  {currentPage.content.map((paragraph, pIdx) => (
                    <p key={pIdx} className="leading-relaxed text-justify">
                      <span className="selection:bg-yellow-200 selection:text-slate-900">
                        {paragraph}
                      </span>
                    </p>
                  ))}

                  {/* Math Formula if Present */}
                  {currentPage.formula && (
                    <div className="my-6 p-5 bg-blue-50/50 border border-blue-200/80 rounded-2xl text-center">
                      <div className="text-xl sm:text-2xl text-blue-950 overflow-x-auto py-2">
                        <Latex>{`$$${currentPage.formula}$$`}</Latex>
                      </div>
                      {currentPage.formulaLabel && (
                        <p className="text-xs text-blue-700 font-sans font-bold mt-1">
                          {currentPage.formulaLabel}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Embedded Diagram if Present */}
                  {currentPage.diagramCode && (
                    <div className="my-6 p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                      <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-sans text-center">
                        {currentPage.diagramTitle || "Structural Diagram"}
                      </div>
                      <MermaidRenderer chart={currentPage.diagramCode} id={`reader-${currentPage.pageNumber}`} />
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Pagination & Page Jump Bar */}
              <div className="max-w-3xl mx-auto w-full pt-6 mt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={pageIndex === 0}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                    <span>Previous Page</span>
                  </button>

                  <button
                    onClick={handleNextPage}
                    disabled={pageIndex === selectedBook.pages.length - 1}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:cursor-not-allowed"
                  >
                    <span>Next Page</span>
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* Jump to Page Form */}
                <form onSubmit={handleJumpPage} className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">Go to Page:</span>
                  <input
                    type="number"
                    value={jumpPageNumber}
                    onChange={(e) => setJumpPageNumber(e.target.value)}
                    placeholder={String(currentPage.pageNumber)}
                    className="w-16 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Jump
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column: AI Teach Mode Assistant */}
            <div className="w-full lg:w-96 bg-white overflow-y-auto p-6 flex flex-col shrink-0 border-t lg:border-t-0 lg:border-l border-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-blue-600" />
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                    {aiTeachMode ? "AI Page Analysis & Plan" : "Textbook Callouts"}
                  </h3>
                </div>
                <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">
                  Page {currentPage.pageNumber}
                </span>
              </div>

              {aiTeachMode ? (
                /* AI Teach Mode: Real-time Lesson Plan, Diagram, and Deconstruction */
                <div className="space-y-5 flex-1">
                  {/* Lesson Plan for this page */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4">
                    <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase mb-2">
                      <Zap size={14} className="text-blue-600" />
                      <span>AI Lesson Plan for Page {currentPage.pageNumber}</span>
                    </div>
                    <div className="space-y-2">
                      {currentPage.aiLessonPlan.map((step, sIdx) => (
                        <div key={sIdx} className="text-xs text-blue-950 leading-relaxed">
                          <span className="font-bold text-blue-800">{step.step}: </span>
                          <span>{step.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Explanation in Plain English */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Compass size={14} className="text-emerald-600" />
                      <span>Plain-English Summary</span>
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {currentPage.aiExplanation}
                    </p>
                  </div>

                  {/* Key Exam Takeaways */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Key Exam Takeaways
                    </h4>
                    <div className="space-y-2">
                      {currentPage.keyExamTakeaways.map((point, kIdx) => (
                        <div key={kIdx} className="bg-white border border-slate-200 rounded-xl p-3 flex items-start gap-2 shadow-2xs">
                          <CheckCircle size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                          <p className="text-xs text-slate-700 leading-normal font-medium">
                            {point}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Self Check Question */}
                  <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4">
                    <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase mb-1.5">
                      <HelpCircle size={14} className="text-indigo-600" />
                      <span>Test Understanding for Page {currentPage.pageNumber}</span>
                    </div>
                    <p className="text-xs text-indigo-950 font-bold leading-relaxed mb-3">
                      {currentPage.selfCheckQuestion.question}
                    </p>

                    {!isAnswerRevealed ? (
                      <button
                        onClick={() => setIsAnswerRevealed(true)}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                      >
                        Reveal Answer & Explanation
                      </button>
                    ) : (
                      <div className="p-3 bg-white border border-indigo-200 rounded-xl text-xs text-indigo-900 leading-relaxed animate-in fade-in duration-200">
                        <span className="font-bold">Answer: </span>
                        {currentPage.selfCheckQuestion.answer}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Standard Notes View */
                <div className="space-y-4 flex-1">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed">
                    AI Teach Mode is currently muted. Click &quot;Enable AI Teach Mode&quot; at the top to generate page plans, voice walkthroughs, and visual diagrams.
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* All Textbooks Library Shelf View */
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-50/50">
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h1 className="text-2xl font-black text-slate-900">Your Complete Library</h1>
                  <p className="text-sm text-slate-500 mt-1">Full textbooks with active AI page analysis, formulas, and diagrams.</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative w-full sm:w-64">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search title, author..."
                      className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <button
                    onClick={() => setIsIngestModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
                  >
                    <Globe size={14} />
                    <span>Download from Web</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBooks.map((book) => (
                  <div 
                    key={book.id}
                    className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Book Cover Gradient Badge */}
                      <div className={`h-28 rounded-xl bg-gradient-to-tr ${book.coverColor} p-4 flex flex-col justify-between text-white shadow-xs mb-4`}>
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Full Edition</span>
                        <h4 className="font-extrabold text-base leading-snug line-clamp-2">{book.title}</h4>
                      </div>

                      <p className="text-xs text-slate-400 font-medium mb-1">{book.authors}</p>
                      <h5 className="text-sm font-bold text-slate-800 line-clamp-1 mb-2">
                        {book.pages[0]?.chapterTitle || "Complete Textbook"}
                      </h5>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                        {book.pages[0]?.subheading}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                        {book.totalPages} Pages
                      </span>
                      <button
                        onClick={() => {
                          setSelectedBook(book);
                          setPageIndex(0);
                          setActiveTab("read");
                        }}
                        className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                      >
                        <span>Open & Teach</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Download / Ingest Full Book Modal */}
      {isIngestModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[120] p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 w-full max-w-lg shadow-2xl relative">
            <button
              onClick={() => setIsIngestModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold">
                <Globe size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Download Full Book from Web</h3>
                <p className="text-xs text-slate-500">Fetch, index, and generate AI teach lessons for any textbook</p>
              </div>
            </div>

            <form onSubmit={handleIngestNewBook} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Textbook Title or Subject
                </label>
                <input
                  type="text"
                  value={newBookTitle}
                  onChange={(e) => setNewBookTitle(e.target.value)}
                  placeholder="e.g. Clean Code, Database System Concepts, Sutton Reinforcement Learning"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Web URL or PDF Source (Optional)
                </label>
                <input
                  type="url"
                  value={newBookUrl}
                  onChange={(e) => setNewBookUrl(e.target.value)}
                  placeholder="https://example.com/textbook.pdf"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsIngestModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDownloading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  {isDownloading ? (
                    <span className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Downloading & Indexing...</span>
                    </span>
                  ) : (
                    <>
                      <Download size={14} />
                      <span>Download Full Book</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
