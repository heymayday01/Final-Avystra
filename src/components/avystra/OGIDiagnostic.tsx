"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import {
  User,
  Briefcase,
  MessageSquare,
  Mail,
  Phone,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Loader2,
  TrendingUp,
  Award,
  Zap,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DoodleSparkle } from "./DoodleWidgets";
import { smoothScrollTo, getLenis } from "@/lib/scroll";
import {
  questions as ogiQuestions,
  answerOptions as ogiAnswerOptions,
  computeOgiScore,
  getResultBand,
  type DimensionCode,
  type ResultBand,
} from "@/lib/ogi-data";

// Shared easing curve — premium expo-out for elegant reveals
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

// Questions + answer options + scoring now live in src/lib/ogi-data.ts
// so the API route and this component share the exact same data source.
const questions = ogiQuestions;
const answerOptions = ogiAnswerOptions;

interface Contradiction {
  title: string;
  desc: string;
  risk: string;
  antidote: string;
}

interface RecommendedProgram {
  pillar: DimensionCode;
  name: string;
  why: string;
}

interface PillarDatum {
  code: DimensionCode;
  avg: number;
  pct: number;
  label: string;
  color: string;
}

export default function OGIDiagnostic() {
  // Screens state: 'INTRO', 'INFO_CAPTURE', 'QUESTIONS', 'NUDGE', 'LOADING', 'RESULTS'
  const [screen, setScreen] = useState<"INTRO" | "INFO_CAPTURE" | "QUESTIONS" | "NUDGE" | "LOADING" | "RESULTS">("INTRO");

  // User info
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");  // WhatsApp number
  const [email, setEmail] = useState("");  // Business email — used for result delivery

  // Question tracking
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [selectedOptionTemp, setSelectedOptionTemp] = useState<number | null>(null);

  // Validation state
  const [infoError, setInfoError] = useState("");

  // ── Submission state ──
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{ emailSent: boolean } | null>(null);
  const [submitError, setSubmitError] = useState("");
  // Tracks whether the auto-save (DB + Excel) has been done for this session.
  // Prevents duplicate saves when the RESULTS screen re-renders.
  const [autoSaved, setAutoSaved] = useState(false);

  // Ref to the content box — used to auto-scroll into view on screen changes
  const contentBoxRef = useRef<HTMLDivElement>(null);
  // Track whether this is the first render — we don't auto-scroll on mount
  const isFirstRender = useRef(true);

  // ── Intelligent viewport auto-scroll on screen changes ──
  // Skips the initial mount (INTRO) so the page loads normally.
  // For each subsequent screen change, intelligently decides whether + how
  // to scroll based on the current viewport position:
  //
  // - If the box TOP is already in the upper 40% of the viewport (between
  //   120px and 40% of viewport height), the user can already see the
  //   start of the content → don't scroll (prevents fighting with user scroll).
  // - Otherwise, scroll the box TOP to 120px from viewport top (just below
  //   the sticky header with breathing room).
  //
  // This is more lenient than checking if the WHOLE box is visible (which
  // never passes for the tall RESULTS screen, causing it to always scroll).
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (screen === "LOADING") return; // don't scroll during loading spinner

    const el = contentBoxRef.current;
    if (!el) return;

    // Slight delay to let the new screen's AnimatePresence render + layout settle
    const timer = setTimeout(() => {
      const rect = el.getBoundingClientRect();
      const headerOffset = 120; // clear sticky header + breathing room
      const viewportHeight = window.innerHeight;
      const upperViewportBound = viewportHeight * 0.4;

      // If the box top is already in the upper viewport, don't scroll.
      // The 20px tolerance prevents micro-scrolls when the box is right
      // at the boundary.
      const isTopVisible =
        rect.top >= headerOffset - 20 && rect.top <= upperViewportBound;
      if (isTopVisible) return;

      // Scroll the box top to headerOffset (120px from viewport top).
      const lenis = getLenis();
      if (lenis) {
        lenis.scrollTo(el, { offset: -headerOffset, duration: 0.8 });
      } else {
        const top = rect.top + window.scrollY - headerOffset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [screen]);

  // Auto-advance delay handler
  const handleAnswerSelect = (score: number) => {
    setSelectedOptionTemp(score);
    // Persist answer
    setAnswers((prev) => ({
      ...prev,
      [questions[currentQuestionIndex].id]: score,
    }));

    // Auto-advance with 300ms visual delay
    setTimeout(() => {
      setSelectedOptionTemp(null);
      const nextIndex = currentQuestionIndex + 1;

      if (currentQuestionIndex === 7) {
        // Just answered Q8 (index 7), trigger nudge before Q9 (index 8)
        setScreen("NUDGE");
      } else if (nextIndex < 16) {
        setCurrentQuestionIndex(nextIndex);
      } else {
        // Finished all 16 questions
        setScreen("LOADING");
      }
    }, 300);
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    } else {
      setScreen("INFO_CAPTURE");
    }
  };

  const validateAndNextInfo = (e?: FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) {
      setInfoError("Please enter your name.");
      return;
    }
    if (!role.trim()) {
      setInfoError("Please enter your professional role.");
      return;
    }
    const cleanPhone = phone.trim();
    const digitsOnly = cleanPhone.replace(/[^0-9]/g, "");
    if (!cleanPhone || digitsOnly.length < 10) {
      setInfoError("Please enter a valid WhatsApp number (at least 10 digits).");
      return;
    }
    const cleanEmail = email.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);
    if (!cleanEmail || !emailOk) {
      setInfoError("Please enter a valid business email address.");
      return;
    }
    setInfoError("");
    setScreen("QUESTIONS");
  };

  // Nudge auto-timer
  useEffect(() => {
    if (screen === "NUDGE") {
      const timer = setTimeout(() => {
        setScreen("QUESTIONS");
        setCurrentQuestionIndex(8); // Start Q9
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  // Loading auto-timer — results computation is local, no backend call
  useEffect(() => {
    if (screen === "LOADING") {
      const timer = setTimeout(() => {
        setScreen("RESULTS");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  // ── Auto-save to DB + update Excel when RESULTS screen appears ──
  // This fires once when the results screen first shows up, BEFORE the user
  // clicks "GET MY FULL REPORT". It saves the submission to the database and
  // regenerates the Excel file. The "GET MY FULL REPORT" button then only
  // triggers the email sending (via /api/ogi/submit) — the data is already saved.
  useEffect(() => {
    if (screen !== "RESULTS" || autoSaved) return;
    setAutoSaved(true); // set immediately to prevent double-fire in StrictMode

    const autoSave = async () => {
      try {
        await fetch("/api/ogi/save?XTransformPort=3000", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            role: role.trim(),
            contact: phone.trim(),
            email: email.trim(),
            answers,
          }),
        });
      } catch (err) {
        // Silent failure — the user hasn't explicitly submitted yet,
        // so we don't show any error UI. The /api/ogi/submit call (when
        // the user clicks "GET MY FULL REPORT") will retry the save.
        console.error("[OGI] auto-save failed:", err);
      }
    };
    autoSave();
  }, [screen, autoSaved, name, role, phone, email, answers]);

  // Restart assessment
  const handleRestart = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setName("");
    setRole("");
    setPhone("");
    setEmail("");
    setSubmissionResult(null);
    setSubmitError("");
    setAutoSaved(false);
    setScreen("INTRO");
  };

  // ── Submit results to backend ──
  // POSTs { name, role, contact(=phone), email, answers, score, band } to
  // /api/ogi/submit. The score + band are recomputed here from `answers`
  // using the shared computeOgiScore() so the DB record exactly matches
  // what the user saw on the results screen.
  const handleSubmitResults = async () => {
    if (isSubmitting || submissionResult) return;
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const { score, band } = computeOgiScore(answers);
      const res = await fetch("/api/ogi/submit?XTransformPort=3000", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          role: role.trim(),
          contact: phone.trim(),
          email: email.trim(),
          answers,
          score,
          band: band.badge,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error || "Submission failed");
      }
      setSubmissionResult({ emailSent: !!data.emailSent });
    } catch (err) {
      console.error("[OGI] submit failed:", err);
      setSubmitError("Something went wrong while saving your results. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQ = questions[currentQuestionIndex];
  const progressPercent = ((currentQuestionIndex + 1) / 16) * 100;

  return (
    <section id="consult" className="relative py-4 bg-transparent border-none overflow-hidden md:py-6 scroll-mt-20">
      {/* Decorative overlays */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] rounded-full bg-[#C5A059]/[0.02] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-blue-500/[0.01] blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 gsap-stagger-container">
        {/* Content Box */}
        <div
          ref={contentBoxRef}
          className="bg-gradient-to-br from-white to-slate-50 border border-slate-100 rounded-3xl overflow-hidden min-h-[420px] flex flex-col justify-between gsap-stagger-card"
        >
          <AnimatePresence mode="wait">
            {/* INTRO SCREEN */}
            {screen === "INTRO" && (
              <motion.div
                key="intro"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-center items-center h-full flex-grow text-center"
                id="ogi-screen-intro"
              >
                <div className="max-w-3xl">
                  <div className="flex justify-center mb-5">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#C2A56D]/5 rounded-full border border-[#C2A56D]/10 text-[12.5px] text-[#C2A56D] font-mono tracking-widest font-bold uppercase relative">
                      <Zap className="w-3.5 h-3.5 text-[#C2A56D]" />
                      Organizational Assessment
                      <DoodleSparkle className="-top-3 -right-4 text-[#C2A56D] w-5 h-5 animate-pulse" delay={0.1} />
                    </span>
                  </div>

                  <h2 className="font-display font-medium text-3xl sm:text-5xl text-[#2C3947] tracking-tighter leading-[1.15] mb-5">
                    OGI — <span className="font-serif italic text-[#C2A56D]">Organizational Growth Index</span>
                  </h2>

                  <p className="text-slate-600 font-sans text-base sm:text-lg max-w-xl mx-auto leading-relaxed font-light mb-8">
                    A structured self-assessment measuring execution gaps across 4 core growth pillars. It takes 3 minutes to complete and instantly generates your personalized strategic report.
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                    {[
                      { name: "Leadership", code: "L", color: "bg-[#2C3947]" },
                      { name: "Managers", code: "M", color: "bg-[#C2A56D]" },
                      { name: "Accountability", code: "T", color: "bg-[#547A95]" },
                      { name: "Execution", code: "E", color: "bg-[#10B981]" },
                    ].map((item) => (
                      <div key={item.code} className="p-3 rounded-xl bg-white/50 border border-slate-200/50 flex flex-col items-center group">
                        <span className={`w-6 h-6 rounded-full ${item.color} mb-2 flex items-center justify-center text-[11.5px] text-white font-mono font-bold`}>
                          {item.code}
                        </span>
                        <h3 className="text-[11.5px] font-display font-bold text-[#2C3947] leading-tight">{item.name}</h3>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    onClick={() => setScreen("INFO_CAPTURE")}
                    aria-label="Begin OGI assessment"
                    className="group inline-flex items-center gap-3 bg-[#2C3947] hover:bg-[#C2A56D] text-white font-display text-sm font-semibold tracking-wider uppercase px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                    id="ogi-btn-start"
                  >
                    <span>Begin Assessment</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* INFO CAPTURE SCREEN */}
            {screen === "INFO_CAPTURE" && (
              <motion.div
                key="info_capture"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="p-6 sm:p-8 md:p-10 flex flex-col justify-between h-full flex-grow"
                id="ogi-screen-info"
              >
                <div>
                  <button
                    onClick={() => setScreen("INTRO")}
                    aria-label="Back to intro"
                    className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-[#C5A059] font-mono tracking-wide mb-5 group cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform" />
                    Back to intro
                  </button>

                  <h3 className="font-display font-bold text-xl sm:text-2xl text-[#0A192F] tracking-tight mb-2">
                    Let&rsquo;s index your identity
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm font-sans font-light leading-relaxed mb-6 max-w-xl">
                    Who is operating the blueprint? Provide brief parameters so we customize your index evaluation correctly.
                  </p>

                  <form onSubmit={validateAndNextInfo} className="space-y-5 max-w-xl">
                    {/* Name Entry */}
                    <div className="space-y-1.5">
                      <label className="block text-[11.5px] font-mono tracking-wider text-slate-400 uppercase font-bold">Your Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-3.5 w-4 h-4 text-[#C5A059] pointer-events-none" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            if (infoError) setInfoError("");
                          }}
                          placeholder="e.g. Kirankumar Pandey"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]/20 rounded-xl py-3.5 pl-11 pr-4 text-slate-800 placeholder-slate-400/80 font-sans text-sm focus:outline-none transition-all"
                          id="ogi-input-name"
                        />
                      </div>
                    </div>

                    {/* Role Entry */}
                    <div className="space-y-1.5">
                      <label className="block text-[11.5px] font-mono tracking-wider text-slate-400 uppercase font-bold">Professional Designation / Role</label>
                      <div className="relative">
                        <Briefcase className="absolute left-4 top-3.5 w-4 h-4 text-[#C5A059] pointer-events-none" />
                        <input
                          type="text"
                          required
                          value={role}
                          onChange={(e) => {
                            setRole(e.target.value);
                            if (infoError) setInfoError("");
                          }}
                          placeholder="e.g. Founder, CEO, VP of Operations"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]/20 rounded-xl py-3.5 pl-11 pr-4 text-slate-800 placeholder-slate-400/80 font-sans text-sm focus:outline-none transition-all"
                          id="ogi-input-role"
                        />
                      </div>
                    </div>

                    {/* WhatsApp Number */}
                    <div className="space-y-1.5">
                      <label className="block text-[11.5px] font-mono tracking-wider text-slate-400 uppercase font-bold">WhatsApp Number</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-3.5 w-4 h-4 text-[#C5A059] pointer-events-none" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            if (infoError) setInfoError("");
                          }}
                          placeholder="e.g. +91 91234 56789"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]/20 rounded-xl py-3.5 pl-11 pr-4 text-slate-800 placeholder-slate-400/80 font-sans text-sm focus:outline-none transition-all"
                          id="ogi-input-phone"
                          autoComplete="tel"
                        />
                      </div>
                    </div>

                    {/* Business Email */}
                    <div className="space-y-1.5">
                      <label className="block text-[11.5px] font-mono tracking-wider text-slate-400 uppercase font-bold">Business Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-3.5 w-4 h-4 text-[#C5A059] pointer-events-none" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (infoError) setInfoError("");
                          }}
                          placeholder="e.g. contact@firm.com"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]/20 rounded-xl py-3.5 pl-11 pr-4 text-slate-800 placeholder-slate-400/80 font-sans text-sm focus:outline-none transition-all"
                          id="ogi-input-email"
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    {infoError && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: EASE }}
                        className="text-xs text-red-500 font-mono"
                      >
                        {infoError}
                      </motion.p>
                    )}
                  </form>
                </div>

                <div className="flex justify-end pt-8 mt-6 border-t border-slate-100">
                  <button
                    onClick={() => validateAndNextInfo()}
                    aria-label="Continue to questions"
                    className="group inline-flex items-center gap-2.5 bg-[#0A192F] hover:bg-[#C5A059] text-white font-display text-xs font-bold tracking-wider uppercase px-7 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                    id="ogi-btn-info-continue"
                  >
                    <span>Continue to Questions</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* QUESTION SCREENS */}
            {screen === "QUESTIONS" && (
              <motion.div
                key={`question-${currentQuestionIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="p-6 sm:p-8 md:p-10 flex flex-col justify-between h-full flex-grow"
                id={`ogi-screen-q-${currentQuestionIndex + 1}`}
              >
                <div>
                  {/* Top Header: Pillar indicator dot + pillar name, back button */}
                  <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: currentQ.color }}
                      />
                      <span className="text-[11.5px] font-mono tracking-widest text-[#0A192F] uppercase font-bold">
                        {currentQ.dimensionName}
                      </span>
                    </div>

                    <button
                      onClick={handleBack}
                      aria-label="Go back to previous question"
                      className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#C5A059] font-mono transition-colors group cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5 transform group-hover:-translate-x-0.5 transition-transform" />
                      Back
                    </button>
                  </div>

                  {/* Progress Indicators */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-[11.5px] font-mono text-slate-400 uppercase tracking-widest mb-2">
                      <span>Index Integrity Question</span>
                      <strong className="text-slate-700">{currentQuestionIndex + 1} of 16</strong>
                    </div>
                    {/* Minimal elegant progress trail */}
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: currentQ.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.5, ease: EASE }}
                      />
                    </div>
                  </div>

                  {/* Question Text: Large, Centered */}
                  <div className="text-center py-4 px-2 max-w-2xl mx-auto my-3">
                    <h3 className="font-display font-medium text-xl sm:text-2xl text-[#0A192F] leading-snug tracking-tight">
                      &ldquo;{currentQ.text}&rdquo;
                    </h3>
                  </div>
                </div>

                {/* 5 Answer Options pills */}
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 max-w-3xl mx-auto">
                    {answerOptions.map((opt) => {
                      const isSelected = selectedOptionTemp === opt.value || answers[currentQ.id] === opt.value;
                      return (
                        <motion.button
                          key={opt.label}
                          onClick={() => handleAnswerSelect(opt.value)}
                          whileTap={{ scale: 0.95 }}
                          transition={{ duration: 0.15, ease: EASE }}
                          className={`relative py-4 px-3 text-xs sm:text-sm text-center rounded-xl font-display font-semibold transition-all duration-300 border cursor-pointer select-none ${
                            isSelected
                              ? "bg-[#0A192F] border-[#0A192F] text-white shadow-md shadow-slate-900/10"
                              : "bg-slate-50 border-slate-200/80 hover:border-[#C5A059] hover:bg-white text-slate-600 hover:text-[#0A192F] hover:shadow-sm"
                          }`}
                          id={`ogi-q-${currentQ.id}-opt-${opt.label}`}
                        >
                          {opt.label}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Informational help note */}
                  <p className="text-center text-[11.5px] font-mono text-slate-400 mt-5 tracking-wider uppercase">
                    Selecting auto-advances to the next milestone
                  </p>
                </div>
              </motion.div>
            )}

            {/* HALFWAY NUDGE SCREEN */}
            {screen === "NUDGE" && (
              <motion.div
                key="nudge"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                onClick={() => {
                  setScreen("QUESTIONS");
                  setCurrentQuestionIndex(8);
                }}
                className="p-8 sm:p-10 md:p-12 flex flex-col items-center justify-center h-full flex-grow text-center bg-slate-50 relative cursor-pointer group"
                id="ogi-screen-nudge"
              >
                <div className="absolute top-4 right-4 text-[10.5px] font-mono text-slate-300 uppercase tracking-widest">
                  Tap to skip countdown
                </div>

                <div className="w-14 h-14 rounded-full bg-[#C5A059]/10 border border-[#C5A059]/20 flex items-center justify-center text-[#C5A059] mb-5">
                  <TrendingUp className="w-8 h-8 animate-pulse" />
                </div>

                <h3 className="font-display font-medium text-xl sm:text-2xl text-[#0A192F] tracking-tight mb-2">
                  Halfway There
                </h3>

                <p className="text-slate-500 font-sans text-sm max-w-sm leading-relaxed font-light mb-3 text-center">
                  Outstanding consistency! Diagnosing execution friction is the single most vital step towards systemic scaling. You are doing fantastic.
                </p>

                <div className="w-24 h-[1px] bg-slate-200 my-4" />

                <p className="text-[#A68449] font-mono text-[11.5px] tracking-widest uppercase font-bold flex items-center gap-1.5 animate-bounce">
                  Next Dimension: Team Accountability
                  <ChevronRight className="w-3.5 h-3.5" />
                </p>
              </motion.div>
            )}

            {/* LOADING SCREEN */}
            {screen === "LOADING" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="p-8 sm:p-10 md:p-12 flex flex-col items-center justify-center h-full flex-grow text-center bg-[#0D1640] text-white relative min-h-[380px]"
                id="ogi-screen-loading"
              >
                {/* Micro tech grid background overlay */}
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:20px_20px]" />

                <div className="relative flex flex-col items-center z-10">
                  <div className="relative mb-6">
                    <Loader2 className="w-10 h-10 text-[#C5A059] animate-spin" />
                    <div className="absolute inset-0 rounded-full border-2 border-white/5 opacity-25 animate-ping" />
                  </div>

                  <h3 className="font-display font-medium text-xl sm:text-2xl text-white tracking-tight mb-2">
                    Analyzing {name}&rsquo;s Results...
                  </h3>

                  <p className="text-slate-300 font-sans text-sm max-w-sm font-light mt-1 mb-6 leading-relaxed">
                    Calculating organizational growth dimensions, resolving execution dependencies, and scanning critical alignments.
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-[11.5px] font-mono text-slate-300 uppercase tracking-widest animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Executing strategic scoring matrices</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* HIGH-FIDELITY RESULTS SCREEN */}
            {screen === "RESULTS" && (() => {
              // 1. Calculate average and percentage for each pillar
              const getPillarData = (code: DimensionCode): PillarDatum => {
                const qIds = questions.filter((q) => q.dimensionCode === code).map((q) => q.id);
                const sum = qIds.reduce((acc, id) => acc + (answers[id] ?? 2), 0);
                const avg = sum / 4;
                const pct = Math.round((avg / 4) * 100);

                let label = "";
                let color = "";
                if (code === "L") { label = "Leadership & Direction"; color = "#2C3947"; }
                if (code === "M") { label = "Manager Effectiveness"; color = "#C2A56D"; }
                if (code === "T") { label = "Team Accountability"; color = "#547A95"; }
                if (code === "E") { label = "Execution Systems"; color = "#10B981"; }

                return { code, avg, pct, label, color };
              };

              const pillarsList: PillarDatum[] = [
                getPillarData("L"),
                getPillarData("M"),
                getPillarData("T"),
                getPillarData("E"),
              ];

              // OGI Score = (sum of all 4 averages ÷ 4 ÷ 4) * 100
              const sumOfAverages = pillarsList.reduce((acc, p) => acc + p.avg, 0);
              const overallScorePct = Math.round(((sumOfAverages / 4) / 4) * 100);

              // Find the 2 weakest pillars
              const sortedPillars = [...pillarsList].sort((a, b) => a.pct - b.pct);
              const weakPillar1 = sortedPillars[0];
              const weakPillar2 = sortedPillars[1];

              // Identify 3 lowest individual question answers from the 2 weakest pillars
              const weakPillarCodes: DimensionCode[] = [weakPillar1.code, weakPillar2.code];
              const weakQuestions = questions
                .filter((q) => weakPillarCodes.includes(q.dimensionCode))
                .map((q) => ({
                  ...q,
                  answer: answers[q.id] ?? 2,
                }))
                .sort((a, b) => a.answer - b.answer); // Sort ascending (lowest score first)

              const lowest3Questions = weakQuestions.slice(0, 3);

              const getFindingForQuestion = (qId: number): string => {
                switch (qId) {
                  case 1: return "Strategic priorities set at the leadership level fail to consistently shift day-to-day work routines on the front line.";
                  case 2: return "Standard operational decisions are heavily centralized, resulting in bottleneck delays as matters route back to the founder.";
                  case 3: return "High performance and exceptional contributions are not recognized or rewarded with clear, objective consistency.";
                  case 4: return "Core day-to-day operations experience high friction or slow down when the founder is not directly involved.";
                  case 5: return "Manager feedback given to team members fails to translate into visible, lasting change or behavioral improvements.";
                  case 6: return "Promotions, salary updates, and growth paths feel influenced more by relationship status than measurable outcomes.";
                  case 7: return "Consistent underperformance is tolerated too long and not addressed swiftly or directly by line managers.";
                  case 8: return "Team members do not feel fully safe raising honest concerns or challenging their direct manager's feedback.";
                  case 9: return "Commitments and milestones agreed upon during meetings are frequently missed or delayed over subsequent weeks.";
                  case 10: return "When projects or tasks fail, ownership vanishes due to blurred responsibilities and lack of clear accountability loops.";
                  case 11: return "Standard organizational policies and expectations are applied inconsistently based on seniority or tenure.";
                  case 12: return "Collaborative efforts between different departments are frequently delayed by communication silos and friction.";
                  case 13: return "The annual plan and key milestones lose momentum and tracking diligence by the middle of the fiscal year.";
                  case 14: return "Newly introduced operational processes or tools are abandoned or ignored within three months of release.";
                  case 15: return "The most deserving, high-performing individuals are overlooked in favor of politically connected or highly visible peers.";
                  case 16: return "Under tight deadlines or elevated pressure, team focus and execution quality degrade significantly.";
                  default: return "Execution consistency and structural alignment require standardization within this pillar.";
                }
              };

              const keyFindings = lowest3Questions.map((q) => getFindingForQuestion(q.id));

              // Generate Top 3 Priority Actions from the 2 weakest pillars
              const getPriorityActions = (p1Code: DimensionCode, p2Code: DimensionCode): string[] => {
                const actionPool: Record<DimensionCode, [string, string]> = {
                  L: [
                    "Establish a structured delegation model specifying which decisions can be made without founder sign-off.",
                    "Conduct a 'Founder Dependency Audit' to transition daily operations to functional department leads.",
                  ],
                  M: [
                    "Build a structured bi-weekly 1-on-1 cadence between managers and teams to normalize productive feedback.",
                    "Train managers on direct, objective performance-issue scripts to address underperformance in under 48 hours.",
                  ],
                  T: [
                    "Implement a centralized post-meeting tracker with single-person owners and firm dates for all deliverables.",
                    "Establish written inter-departmental SLAs to reduce friction and coordinate collaborative handoffs.",
                  ],
                  E: [
                    "Create a mid-year operational checkpoint to review annual plan momentum and realign lagging projects.",
                    "Establish a standard 'Process Adoption Checklist' to monitor newly introduced workflows for at least 90 days.",
                  ],
                };

                return [
                  actionPool[p1Code][0],
                  actionPool[p1Code][1],
                  actionPool[p2Code][0],
                ];
              };

              const priorityActions = getPriorityActions(weakPillar1.code, weakPillar2.code);

              // Evaluates up to 2 contradictions
              const getContradictionsList = (): Contradiction[] => {
                const triggered: Contradiction[] = [];

                // Pair 1: Q6 high (3-4) and Q3 low (0-1)
                if ((answers[6] ?? 2) >= 3 && (answers[3] ?? 2) <= 1) {
                  triggered.push({
                    title: "Policy vs. Informal Reality Mismatch",
                    desc: "You indicated that promotions are based on measurable performance (Q6), yet high performers are not consistently recognized (Q3).",
                    risk: "Indicates that while formal HR policies appear merit-based, informal networks or personal biases may override them, leading to cultural cynicism and the loss of key talent.",
                    antidote: "Establish open, standardized calibration sessions for promotion and pay reviews, involving multiple peer managers to remove single-point subjectivity.",
                  });
                }

                // Pair 2: Q9 high (3-4) and Q10 low (0-1)
                if ((answers[9] ?? 2) >= 3 && (answers[10] ?? 2) <= 1) {
                  triggered.push({
                    title: "Task Completion vs. Outcome Ownership Mismatch",
                    desc: "You indicated that meeting commitments are consistently followed through (Q9), yet ownership of failures is unclear when things go wrong (Q10).",
                    risk: "Indicates a compliance-driven culture where tasks are checked off to avoid trouble, but true outcome ownership is missing. Teams focus on output over actual business outcomes.",
                    antidote: "Shift from tracking tasks to assigning end-to-end outcome metrics to individual owners. Use weekly post-mortems focused on systemic fixes, not blame.",
                  });
                }

                // Pair 3: Q4 high (3-4) and Q1 low (0-1)
                if ((answers[4] ?? 2) >= 3 && (answers[1] ?? 2) <= 1) {
                  triggered.push({
                    title: "Independence vs. Alignment Mismatch",
                    desc: "You indicated that standard operations run smoothly without the founder (Q4), yet setting new priorities fails to change ground behavior (Q1).",
                    risk: "Your organization is highly efficient at standard repeating operations but lacks the responsive feedback loops needed to adapt when strategic direction pivots. Teams operate in a self-perpetuating bubble.",
                    antidote: "Institute cascading weekly focus reviews that bridge long-term strategic changes down to short-term sprint tasks, ensuring pivots are immediately translated to daily operations.",
                  });
                }

                // Pair 4: Q2 high (3-4) and Q7 low (0-1)
                if ((answers[2] ?? 2) >= 3 && (answers[7] ?? 2) <= 1) {
                  triggered.push({
                    title: "Operational vs. Interpersonal Leadership Mismatch",
                    desc: "You indicated that decisions are delegated to the right levels (Q2), yet managers fail to address underperformance quickly (Q7).",
                    risk: "While managers have the formal authority to decide and execute, they avoid the difficult accountability conversations required to address performance drag. This breeds resentment from high performers who carry the extra weight.",
                    antidote: "Equip managers with a structured, non-accusatory conversation script and standard Performance Improvement templates to lower the psychological barrier to addressing underperformance.",
                  });
                }

                return triggered.slice(0, 2);
              };

              const detectedContradictions = getContradictionsList();

              // Get recommended programs for the 2 weakest pillars
              const getRecommendedProgramsList = (p1Code: DimensionCode, p2Code: DimensionCode): RecommendedProgram[] => {
                const programMap: Record<DimensionCode, { name: string; why: string }> = {
                  L: {
                    name: "Decision-Making Under Uncertainty",
                    why: "This program aligns leadership's intent with frontline execution and reduces key-person dependency so standard operations don't stall in the founder's absence.",
                  },
                  M: {
                    name: "Feedback & Difficult Conversations",
                    why: "Your scores indicate that feedback loops are inconsistent and underperformance is tolerated too long; this builds skills for objective, consequence-driven performance conversations.",
                  },
                  T: {
                    name: "Accountability & Ownership",
                    why: "Meeting commitments and inter-departmental handoffs are leaking action; this establishes clear, systematic ownership structures that build extreme high-integrity execution.",
                  },
                  E: {
                    name: "Workplace Effectiveness & Execution",
                    why: "Strategic plans lose momentum mid-year and new process compliance degrades rapidly; this instills systemic routines that convert hard work into consistent, measurable results.",
                  },
                };

                return [
                  { pillar: p1Code, ...programMap[p1Code] },
                  { pillar: p2Code, ...programMap[p2Code] },
                ];
              };

              const recommendedPrograms = getRecommendedProgramsList(weakPillar1.code, weakPillar2.code);

              // Band details come from the shared getResultBand in ogi-data.ts
              // (same function used by the API route — single source of truth).
              const band = getResultBand(overallScorePct);

              const getPillarInsightAndBadge = (code: DimensionCode, avg: number): string => {
                let status: "H" | "R" | "G" | "C" = "C";
                if (avg >= 3.2) status = "H";
                else if (avg >= 2.0) status = "R";
                else if (avg >= 1.0) status = "G";
                else status = "C";

                if (code === "L") {
                  if (status === "H") return "Your leaders create direction that consistently reaches the people who need to act on it. This is rare — and one of the strongest predictors of sustainable growth.";
                  if (status === "R") return "Direction is being set at the top but losing clarity on the way down. There is a gap between what leadership intends and what the organization actually does. This gap widens as you grow.";
                  if (status === "G") return "Leadership direction is not reaching the ground floor. Decisions are escalating upward. Teams are operating without the clarity they need. This is one of the most common and most expensive gaps in growing organizations.";
                  return "Leadership effectiveness is a critical concern. Almost everything depends on one or two people at the top — a bottleneck that grows more damaging as the organization scales.";
                } else if (code === "M") {
                  if (status === "H") return "Your managers are genuinely leading people — not just managing tasks. Feedback is landing. Performance issues are being addressed. This is a real competitive advantage.";
                  if (status === "R") return "Your managers have good intent but inconsistent tools. Feedback varies by manager. Performance issues are tolerated longer than they should be. The manager layer is where strategy gets executed — or quietly dies.";
                  if (status === "G") return "Managers are operating more as senior individual contributors than as people leaders. Promotions appear influenced by relationships more than performance. Accountability conversations are being systematically avoided.";
                  return "Manager effectiveness is a critical concern. Evaluations appear driven by personal bias. Important conversations are avoided. Standards are inconsistent. This creates an environment where the wrong people advance.";
                } else if (code === "T") {
                  if (status === "H") return "Your teams demonstrate strong ownership culture. People know what they are responsible for, follow through, and collaborate well. This is one of the hardest things to build — and you have it.";
                  if (status === "R") return "Teams are working — but ownership is blurred at the edges. Commitments made in meetings do not consistently translate into action. The result is repeated follow-up and avoidable delay.";
                  if (status === "G") return "There is a meaningful accountability gap. Ownership disappears when things go wrong. Cross-functional work creates friction rather than results. This drains organizational energy every day.";
                  return "Team accountability is critically weak. The gap between what is agreed and what gets done is large. Inconsistent standards and favoritism are eroding the trust that high-performing teams require.";
                } else {
                  if (status === "H") return "Your organization translates plans into consistent execution — genuinely rare. Systems are working. Measurement drives decisions. Focus now on protecting these as you scale.";
                  if (status === "R") return "Planning happens but execution consistency is the missing ingredient. Tracking exists but does not always drive decisions. New initiatives take too long to fully adopt.";
                  if (status === "G") return "Execution is inconsistent. Annual plans lose momentum by mid-year. New processes struggle to get adopted. Performance depends on individual effort rather than organizational systems.";
                  return "Execution systems are the primary concern. Plans are made but not tracked. New initiatives are announced but not adopted. Hard work is not converting into results because the systems do not yet exist.";
                }
              };

              const getPillarStatus = (code: DimensionCode, pct: number) => {
                const benchmark = code === "L" ? 60 : code === "M" ? 55 : code === "T" ? 60 : 50;
                if (pct >= benchmark + 8) {
                  return {
                    statusText: "Strong",
                    statusStyle: "bg-emerald-50 text-emerald-700 border-emerald-200",
                  };
                } else if (pct >= benchmark) {
                  return {
                    statusText: "On Track",
                    statusStyle: "bg-blue-50 text-blue-700 border-blue-200",
                  };
                } else if (pct >= benchmark - 12) {
                  return {
                    statusText: "Needs Work",
                    statusStyle: "bg-amber-50 text-amber-700 border-amber-200",
                  };
                } else {
                  return {
                    statusText: "Critical Gap",
                    statusStyle: "bg-rose-50 text-rose-700 border-rose-200",
                  };
                }
              };

              const strokeDasharray = 2 * Math.PI * 45;
              const strokeDashoffset = strokeDasharray - (strokeDasharray * overallScorePct) / 100;

              return (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="p-4 sm:p-6 md:p-8 flex flex-col justify-between h-full flex-grow text-[#2C3947]"
                  id="ogi-screen-results"
                >
                  <div className="space-y-6">
                    {/* 2.1 Header: Score circle progress and band details */}
                    <div className="flex flex-col md:flex-row items-center gap-6 bg-gradient-to-br from-[#0D1640] to-[#12205C] rounded-2xl p-5 sm:p-8 text-white border border-blue-900/40 relative overflow-hidden shadow-lg">
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
                      <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#C2A56D]/5 rounded-full blur-3xl pointer-events-none" />

                      {/* Circle Progress Meter */}
                      <div className="relative flex-shrink-0 w-32 h-32 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
                          <circle
                            cx="64"
                            cy="64"
                            r="45"
                            className="stroke-blue-950"
                            strokeWidth="8"
                            fill="transparent"
                          />
                          <motion.circle
                            cx="64"
                            cy="64"
                            r="45"
                            stroke={band.colour}
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={strokeDasharray}
                            initial={{ strokeDashoffset: strokeDasharray }}
                            animate={{ strokeDashoffset }}
                            transition={{ duration: 1.5, ease: EASE, delay: 0.2 }}
                            strokeLinecap="round"
                          />
                        </svg>

                        <div className="absolute flex flex-col items-center">
                          <motion.span
                            className="text-3xl font-mono font-bold leading-none"
                            initial={{ opacity: 0, scale: 0.6 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, ease: EASE, delay: 0.4 }}
                          >
                            {overallScorePct}
                          </motion.span>
                          <span className="text-[10.5px] font-mono text-slate-400 uppercase tracking-widest mt-1">
                            / 100
                          </span>
                        </div>
                      </div>

                      {/* Band Details */}
                      <div className="space-y-3 text-left max-w-2xl relative z-10">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#C2A56D]/15 rounded-full border border-[#C2A56D]/20 text-[10.5px] text-[#C2A56D] font-mono tracking-widest font-bold uppercase">
                            Growth Level
                          </span>
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-mono tracking-wider font-bold uppercase text-white shadow-sm"
                            style={{ backgroundColor: band.colour }}
                          >
                            {band.badge}
                          </span>
                        </div>

                        <h3 className="font-display font-medium text-xl sm:text-3xl text-white tracking-tight leading-tight">
                          {band.headline}
                        </h3>

                        <p className="text-slate-300 font-sans text-xs sm:text-sm leading-relaxed font-light">
                          {band.description}
                        </p>

                        <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-300 text-xs font-sans leading-relaxed">
                          <strong className="text-[#C2A56D] font-semibold">Reflection Note:</strong> This report reflects how you see your organization. The most important question — would your team answer these the same way?
                        </div>
                      </div>
                    </div>

                    {/* 2.2 Bar Chart — Score vs Benchmark */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                        <div>
                          <h3 className="font-display font-semibold text-lg text-[#2C3947]">
                            Score vs. Benchmark
                          </h3>
                          <p className="text-xs text-slate-500 font-sans font-light">
                            Compare your scores across pillars against reference thresholds.
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 bg-[#2C3947] rounded" /> User Score
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="w-3 border-t border-dashed border-slate-400" /> Benchmark Threshold
                          </span>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {pillarsList.map((p, idx) => {
                          const benchmark = p.code === "L" ? 60 : p.code === "M" ? 55 : p.code === "T" ? 60 : 50;
                          const diff = p.pct - benchmark;
                          const isAbove = diff >= 0;

                          let PillarIcon = TrendingUp;
                          if (p.code === "L") PillarIcon = Award;
                          if (p.code === "M") PillarIcon = Briefcase;
                          if (p.code === "T") PillarIcon = User;

                          return (
                            <div key={p.code} className="space-y-2">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-700">
                                    <PillarIcon className="w-4 h-4" style={{ color: p.color }} />
                                  </span>
                                  <span className="font-display font-medium text-sm text-[#2C3947]">
                                    {p.label}
                                  </span>

                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11.5px] font-semibold font-mono border ${
                                    isAbove
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : "bg-rose-50 text-rose-700 border-rose-200"
                                  }`}>
                                    {isAbove ? `+${diff}%` : `${diff}%`} {isAbove ? "above" : "below"}
                                  </span>
                                </div>

                                <div className="text-sm font-mono font-bold text-[#2C3947]">
                                  {p.pct}%
                                </div>
                              </div>

                              <div className="relative h-4 bg-slate-50 rounded-full border border-slate-100 overflow-visible">
                                <motion.div
                                  className="absolute left-0 top-0 h-full rounded-full"
                                  style={{ backgroundColor: p.color }}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${p.pct}%` }}
                                  transition={{ duration: 1.2, ease: EASE, delay: 0.3 + idx * 0.1 }}
                                />

                                <div
                                  className="absolute top-0 bottom-0 border-l border-dashed border-slate-400 z-10 flex flex-col items-center justify-center overflow-visible"
                                  style={{ left: `${benchmark}%` }}
                                >
                                  <span className="absolute -top-4 text-[10.5px] font-mono text-slate-400 tracking-wider">
                                    Target
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 2.3 Pillar Cards — Performance By Dimension */}
                    <div className="space-y-4">
                      <div className="pb-2 border-b border-slate-100">
                        <h3 className="font-display font-semibold text-lg text-[#2C3947]">
                          Pillar Insights & Analysis
                        </h3>
                        <p className="text-xs text-slate-500 font-sans font-light">
                          Detailed performance feedback based on your organizational scores.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pillarsList.map((p, idx) => {
                          const insight = getPillarInsightAndBadge(p.code, p.avg);
                          const statusObj = getPillarStatus(p.code, p.pct);

                          let PillarIcon = TrendingUp;
                          if (p.code === "L") PillarIcon = Award;
                          if (p.code === "M") PillarIcon = Briefcase;
                          if (p.code === "T") PillarIcon = User;

                          return (
                            <motion.div
                              key={p.code}
                              initial={{ opacity: 0, y: 16 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.6, ease: EASE, delay: 0.1 + idx * 0.08 }}
                              className={`p-6 rounded-2xl border transition-all duration-300 bg-gradient-to-br from-white to-slate-50/50 hover:shadow-md ${statusObj.statusStyle.split(" ")[2]} flex flex-col justify-between space-y-4`}
                            >
                              <div className="space-y-3">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="p-2 rounded-xl bg-white border border-slate-100 shadow-sm">
                                      <PillarIcon className="w-5 h-5" style={{ color: p.color }} />
                                    </span>
                                    <h4 className="font-display font-semibold text-base text-[#2C3947]">
                                      {p.label}
                                    </h4>
                                  </div>
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold font-mono border ${statusObj.statusStyle}`}>
                                    {statusObj.statusText}
                                  </span>
                                </div>

                                <div className="flex items-baseline gap-1.5">
                                  <span className="text-2xl font-mono font-bold text-[#2C3947]">
                                    {p.pct}%
                                  </span>
                                  <span className="text-xs font-sans text-slate-400">
                                    score
                                  </span>
                                </div>

                                <p className="text-xs sm:text-sm text-slate-600 font-sans font-light leading-relaxed">
                                  {insight}
                                </p>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 2.4 & 2.5 Key Findings & Priority Actions */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Key Findings Card */}
                      <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6">
                        <div className="space-y-4">
                          <div>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-rose-50 rounded-full border border-rose-100 text-[11.5px] text-rose-700 font-mono tracking-wider font-bold uppercase mb-2">
                              Critical Gaps
                            </span>
                            <h3 className="font-display font-semibold text-lg text-[#2C3947]">
                              Key Assessment Findings
                            </h3>
                            <p className="text-xs text-slate-500 font-sans font-light">
                              Specific bottlenecks identified based on your lowest individual responses.
                            </p>
                          </div>

                          <ul className="space-y-4">
                            {keyFindings.map((finding, idx) => (
                              <motion.li
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, ease: EASE, delay: 0.15 + idx * 0.1 }}
                                className="flex items-start gap-3"
                              >
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-xs font-mono font-bold flex items-center justify-center mt-0.5">
                                  {idx + 1}
                                </span>
                                <p className="text-xs sm:text-sm text-slate-600 font-sans font-light leading-relaxed">
                                  {finding}
                                </p>
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Priority Actions Card */}
                      <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6">
                        <div className="space-y-4">
                          <div>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 rounded-full border border-emerald-100 text-[11.5px] text-emerald-700 font-mono tracking-wider font-bold uppercase mb-2">
                              Strategic Focus
                            </span>
                            <h3 className="font-display font-semibold text-lg text-[#2C3947]">
                              Top 3 Priority Actions
                            </h3>
                            <p className="text-xs text-slate-500 font-sans font-light">
                              Practical, high-impact interventions to stabilize execution systems.
                            </p>
                          </div>

                          <ul className="space-y-4">
                            {priorityActions.map((action, idx) => (
                              <motion.li
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, ease: EASE, delay: 0.15 + idx * 0.1 }}
                                className="flex items-start gap-3"
                              >
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-mono font-bold flex items-center justify-center mt-0.5">
                                  {idx + 1}
                                </span>
                                <p className="text-xs sm:text-sm text-slate-600 font-sans font-light leading-relaxed">
                                  {action}
                                </p>
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* 2.6 Contradiction Detector */}
                    {detectedContradictions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: EASE }}
                        className="bg-amber-50/40 border border-amber-100 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm"
                      >
                        <div className="space-y-1 text-left">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-50 rounded-full border border-amber-100 text-[11.5px] text-amber-700 font-mono tracking-wider font-bold uppercase">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Friction Indicators Detected
                          </span>
                          <h3 className="font-display font-semibold text-lg text-[#2C3947]">
                            Your responses reveal an interesting pattern...
                          </h3>
                          <p className="text-xs text-slate-500 font-sans font-light">
                            Potential structural alignments that may cause executive drag if left unresolved.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                          {detectedContradictions.map((item, idx) => (
                            <div key={idx} className="bg-white border border-slate-100 rounded-xl p-5 space-y-4">
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                                <h4 className="font-display font-bold text-sm text-[#2C3947] uppercase tracking-wider">
                                  {item.title}
                                </h4>
                              </div>

                              <div className="space-y-3 text-xs sm:text-sm text-slate-600 font-sans font-light leading-relaxed">
                                <p>
                                  <strong className="text-[#2C3947] font-semibold">Contradiction:</strong> {item.desc}
                                </p>
                                <p>
                                  <strong className="text-rose-600 font-semibold">Strategic Risk:</strong> {item.risk}
                                </p>
                                <p className="bg-emerald-50/50 text-emerald-900 p-3 rounded-lg border border-emerald-100/55 font-light leading-relaxed">
                                  <strong className="text-emerald-800 font-semibold block mb-1">Structural Antidote:</strong> {item.antidote}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* 2.7 Recommended Programs */}
                    <div className="space-y-4 text-left">
                      <div className="pb-2 border-b border-slate-100">
                        <h3 className="font-display font-semibold text-lg text-[#2C3947]">
                          Recommended Alignment Portfolios
                        </h3>
                        <p className="text-xs text-slate-500 font-sans font-light">
                          Curated operational programs to address your weakest pillars directly.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {recommendedPrograms.map((prog, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, ease: EASE, delay: idx * 0.1 }}
                            className="bg-gradient-to-br from-[#0D1640] to-[#12205C] rounded-2xl p-6 text-white border border-blue-900/40 relative overflow-hidden shadow-md"
                          >
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
                            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#C2A56D]/5 rounded-full blur-2xl pointer-events-none" />

                            <div className="relative z-10 space-y-4 flex flex-col justify-between h-full">
                              <div className="space-y-2">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#C2A56D]/15 rounded-full border border-[#C2A56D]/20 text-[10.5px] text-[#C2A56D] font-mono tracking-widest font-bold uppercase">
                                  Pillar {prog.pillar} Solution
                                </span>
                                <h4 className="font-display font-semibold text-base text-white">
                                  {prog.name}
                                </h4>
                                <p className="text-slate-300 font-sans text-xs sm:text-sm leading-relaxed font-light">
                                  <strong className="text-white font-medium">Why this fits your scores:</strong> {prog.why}
                                </p>
                              </div>

                              <a
                                href="#programs"
                                onClick={(e) => {
                                  e.preventDefault();
                                  smoothScrollTo("programs");
                                }}
                                className="inline-flex items-center gap-1 text-[12.5px] font-mono font-bold text-[#C2A56D] hover:text-white transition-colors pt-2"
                              >
                                Explore Portfolio Details
                                <ArrowRight className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* 2.75 Get My Full Report — submit results to backend */}
                    <div className="bg-gradient-to-br from-[#0A192F] to-[#162033] rounded-2xl p-6 sm:p-8 border border-[#C2A56D]/20 shadow-lg text-left">
                      {!submissionResult ? (
                        <div className="space-y-4">
                          <div>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#C2A56D]/15 rounded-full border border-[#C2A56D]/20 text-[10.5px] text-[#C2A56D] font-mono tracking-widest font-bold uppercase mb-2">
                              <Mail className="w-3 h-3" />
                              Get Your Full Report
                            </span>
                            <h4 className="font-display font-semibold text-lg text-white mb-1">
                              Save your results &amp; receive a copy
                            </h4>
                            <p className="text-xs sm:text-sm text-slate-300 font-sans font-light leading-relaxed">
                              We&apos;ll save your assessment and email a summary of your OGI score to <strong className="text-white font-medium">{email || "your inbox"}</strong>. The AVYSTRA team will follow up to discuss what these results mean for your organization.
                            </p>
                          </div>

                          {submitError && (
                            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                              <p className="text-xs text-red-300 font-sans">{submitError}</p>
                            </div>
                          )}

                          <button
                            onClick={handleSubmitResults}
                            disabled={isSubmitting}
                            aria-label="Get my full OGI report"
                            className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 bg-[#C2A56D] hover:bg-[#D4B26A] disabled:opacity-60 disabled:cursor-not-allowed text-[#0A192F] font-display font-bold text-xs uppercase tracking-[0.16em] rounded-xl cursor-pointer transition-all active:scale-[0.98] shadow-md"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Saving your results…</span>
                              </>
                            ) : (
                              <>
                                <span>Get My Full Report</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.97 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.4, ease: EASE }}
                          className="space-y-3 text-center"
                        >
                          <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-2">
                            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                          </div>
                          <h4 className="font-display font-semibold text-lg text-white">
                            {submissionResult.emailSent
                              ? "Your results have been emailed to you"
                              : "Your submission was received"}
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-300 font-sans font-light leading-relaxed max-w-md mx-auto">
                            {submissionResult.emailSent
                              ? `A summary of your OGI score has been sent to ${email}. Our team will reach out shortly to walk through the findings.`
                              : "Thank you for completing the OGI assessment. A member of the AVYSTRA team will follow up with you soon."}
                          </p>
                        </motion.div>
                      )}
                    </div>

                    {/* 2.8 WhatsApp CTA — full width */}
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 text-left">
                      <div className="space-y-4">
                        <div>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10.5px] font-mono tracking-wider font-bold uppercase mb-2">
                            Fast-Track Action
                          </span>
                          <h4 className="font-display font-semibold text-lg text-[#0F5132]">
                            Discuss on WhatsApp
                          </h4>
                          <p className="text-xs sm:text-sm text-emerald-800 font-sans font-light leading-relaxed">
                            Instantly connect with an Avystra Partner to debrief your custom OGI results.
                          </p>
                        </div>

                        <div className="bg-white/60 p-4 rounded-xl border border-emerald-100/85 text-xs font-mono text-[#0F5132] italic leading-relaxed">
                          &ldquo;Hi AVYSTRA, I completed the OGI. My name is {name} ({role}). My OGI score was {overallScorePct}/100. I'd like to discuss what this means for my organization.&rdquo;
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const msg = `Hi AVYSTRA, I completed the OGI. My name is ${name} (${role}). My OGI score was ${overallScorePct}/100. I'd like to discuss what this means for my organization.`;
                          window.open(`https://wa.me/918596059607?text=${encodeURIComponent(msg)}`);
                        }}
                        aria-label="Discuss on WhatsApp"
                        className="w-full inline-flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-display font-semibold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-[0.98] shadow-sm"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Discuss on WhatsApp</span>
                      </button>
                    </div>

                    {/* 4. Disclaimer Section */}
                    <div className="pt-6 border-t border-slate-100">
                      <p className="text-[11.5px] text-slate-400 font-sans font-light leading-relaxed max-w-5xl text-left">
                        The OGI is a directional self-reported assessment tool — not a professional organizational audit. It is based on the responses of a single individual and reflects one perspective. Results are indicative only. For a full organizational assessment, contact AVYSTRA directly at <span className="font-medium text-slate-500">info@avystra.co.in</span>.
                      </p>
                    </div>
                  </div>

                  {/* Footer restart and navigation hooks */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-8 mt-10 border-t border-slate-100">
                    <button
                      onClick={handleRestart}
                      aria-label="Restart assessment"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs font-mono font-bold text-slate-400 hover:text-[#C2A56D] uppercase tracking-wider bg-slate-50 hover:bg-slate-100 border border-slate-200 px-6 py-3.5 rounded-xl cursor-pointer transition-all active:scale-95"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Restart assessment
                    </button>
                    <a
                      href="#team"
                      onClick={(e) => {
                        e.preventDefault();
                        smoothScrollTo("team");
                      }}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs font-display font-bold text-slate-500 hover:text-[#2C3947] uppercase tracking-wider px-6 py-3.5 rounded-xl cursor-pointer transition-all"
                    >
                      Meet our Partners
                    </a>
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
