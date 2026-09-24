"use client";
import { useState, useEffect } from "react";
import { Settings, X, Key, ShieldCheck } from "lucide-react";

export default function SettingsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");

  const [status, setStatus] = useState<{
    state: "idle" | "checking" | "valid" | "invalid";
    message: string;
    model?: string;
  }>({ state: "idle", message: "" });

  useEffect(() => {
    const stored = localStorage.getItem("gemini_api_key") || "";
    setApiKey(stored);
    if (stored) {
      verifyKey(stored);
    }
  }, []);

  const verifyKey = async (keyToVerify?: string) => {
    const k = (keyToVerify !== undefined ? keyToVerify : apiKey).trim();
    if (!k) {
      setStatus({ state: "invalid", message: "Please paste your Gemini API key first." });
      return;
    }
    setStatus({ state: "checking", message: "Verifying with Google AI Studio..." });
    try {
      const res = await fetch("http://localhost:5000/api/check-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: k })
      });
      const data = await res.json();
      if (data.valid) {
        setStatus({
          state: "valid",
          message: data.message || "Key Active & Verified!",
          model: data.active_model
        });
      } else {
        setStatus({
          state: "invalid",
          message: data.message || "Invalid API key or Quota limit reached"
        });
      }
    } catch (e: any) {
      setStatus({
        state: "invalid",
        message: "Failed to connect to backend server: " + (e?.message || "")
      });
    }
  };

  const saveSettings = () => {
    localStorage.setItem("gemini_api_key", apiKey.trim());
    verifyKey(apiKey.trim());
    setTimeout(() => {
      setIsOpen(false);
    }, 1200);
  };

  return (
    <>
      <button 
        onClick={() => {
          setIsOpen(true);
          const stored = localStorage.getItem("gemini_api_key") || "";
          if (stored) verifyKey(stored);
        }}
        className="fixed bottom-6 right-6 p-3.5 bg-white text-slate-700 rounded-full shadow-lg hover:shadow-xl hover:text-blue-600 transition-all z-50 border border-slate-200/80 group"
        title="Settings & API Key"
      >
        <Settings size={22} className="group-hover:rotate-45 transition-transform duration-300" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg hover:bg-slate-100"
            >
              <X size={20} />
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Key size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Platform Settings</h2>
                <p className="text-xs text-slate-500">Configure AI Intelligence & API Keys</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Gemini API Key
                  </label>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Get API Key ↗
                  </a>
                </div>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Paste your Gemini API key here"
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 font-mono text-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => verifyKey()}
                    disabled={status.state === "checking"}
                    className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer whitespace-nowrap"
                  >
                    {status.state === "checking" ? "Verifying..." : "Check Key"}
                  </button>
                </div>

                {/* Key Status Feedback */}
                {status.state !== "idle" && (
                  <div className={`mt-3 p-3 rounded-xl text-xs flex items-start gap-2.5 border ${
                    status.state === "valid"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : status.state === "checking"
                      ? "bg-amber-50 text-amber-800 border-amber-200 animate-pulse"
                      : "bg-rose-50 text-rose-800 border-rose-200"
                  }`}>
                    <span className="text-sm">
                      {status.state === "valid" ? "🟢" : status.state === "checking" ? "🟡" : "🔴"}
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold">{status.message}</p>
                      {status.model && (
                        <p className="text-[11px] opacity-80 mt-0.5">Active Model: {status.model}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2 mt-2.5 text-xs text-slate-500">
                  <ShieldCheck size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>Your key is saved in your local storage and directly authorizes Gemini 2.5 Flash Native Audio & live tutoring.</span>
                </div>
              </div>
              
              <div className="pt-2">
                <button
                  onClick={saveSettings}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all cursor-pointer"
                >
                  Save & Apply Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
