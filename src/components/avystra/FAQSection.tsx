"use client";

import { useState, useCallback } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";
import { getLenis } from "@/lib/scroll";
import { useScrollReveal } from "@/lib/useScrollReveal";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "What does AVYSTRA actually do?",
    answer:
      "AVYSTRA is a strategic performance and execution consulting firm. We help organizations identify where performance is breaking down and build the clarity, accountability, management, and execution systems required to improve how the business actually runs.",
  },
  {
    question: "Who is AVYSTRA for?",
    answer:
      "AVYSTRA is built for founders, business owners, CEOs, HR leaders, and senior leadership teams who feel that growth is slowing because too much still depends on a few people, decisions are delayed, accountability is inconsistent, or execution is not translating strategy into results.",
  },
  {
    question:
      "What makes AVYSTRA different from a typical workshop-based intervention?",
    answer:
      "Most workshop-led interventions stop at delivery. AVYSTRA is built around four stages — Assess, Design, Deliver, and Measure — so the focus is not participant satisfaction alone, but whether leadership, managers, teams, and systems actually improve after the work is done.",
  },
  {
    question: "What is the Organizational Growth Index (OGI)?",
    answer:
      "The OGI is AVYSTRA's structured assessment that helps organizations identify growth bottlenecks across four dimensions: Leadership Direction, Manager Effectiveness, Team Accountability, and Execution Systems. It uses 15 questions to generate a directional report based on self-reported responses.",
  },
  {
    question: "How do we know whether we need AVYSTRA?",
    answer:
      "A simple test is this: if your organization is working hard but key outcomes still depend too heavily on the founder or a few individuals, you likely do not have an effort problem — you have a structure, management, or execution problem. That is exactly where AVYSTRA fits.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const headerRef = useScrollReveal<HTMLDivElement>();
  const accordionsRef = useScrollReveal<HTMLDivElement>();

  const toggleIndex = useCallback((index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));

    // Refresh scroll after the accordion animation settles using
    // a debounced rAF — waits for paint, then refreshes Lenis/ScrollTrigger
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (typeof window === "undefined") return;
        const st = (window as unknown as { ScrollTrigger?: { refresh: () => void } }).ScrollTrigger;
        st?.refresh();
        getLenis()?.resize();
      });
    });
  }, []);

  return (
    <section
      id="faq"
      className="relative py-6 bg-transparent border-none overflow-hidden md:py-10 scroll-mt-24"
    >
      {/* Visual Guideline Overlays */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-gold/10 to-transparent" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 select-none">
        {/* Section Header */}
        <div
          ref={headerRef}
          className="flex flex-col items-center text-center max-w-3xl mx-auto mb-6 md:mb-8"
        >
          {/* Aesthetic Badge */}
          <div className="border border-gold/20 bg-gradient-to-br from-white to-slate-50 px-4 py-1.5 rounded-full inline-flex items-center gap-2 mb-3 shadow-sm">
            <HelpCircle className="w-3.5 h-3.5 text-gold" />
            <span className="text-[11.5px] text-gold font-mono tracking-[0.18em] font-medium uppercase">
              Common Questions
            </span>
          </div>

          {/* Heading */}
          <h2 className="font-display font-medium text-4xl sm:text-5xl md:text-6xl text-navy-deep tracking-tight leading-[1.2] mb-6">
            Frequently Asked{" "}
            <span className="font-serif italic font-light text-gold">
              Questions
            </span>
          </h2>

          {/* Slogan */}
          <p className="text-slate-500 font-sans text-base sm:text-lg font-light leading-relaxed max-w-2xl">
            Clear answers to help you understand our approach, process, and what
            to expect from an AVYSTRA engagement.
          </p>
        </div>

        {/* Accordions Containment Block */}
        <div
          ref={accordionsRef}
          className="bg-gradient-to-br from-white to-slate-50 border border-slate-100 rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 lg:p-10 divide-y divide-slate-300/20"
        >
          {faqData.map((faq, index) => {
            const isOpen = openIndex === index;
            const numberStr = (index + 1).toString().padStart(2, "0");
            return (
              <div
                key={index}
                className={`py-4 first:pt-2 last:pb-2 ${
                  isOpen
                    ? "bg-slate-50/40 px-4 -mx-4 rounded-2xl border border-gold/10"
                    : "border-transparent"
                }`}
              >
                {/* Accordion Toggle Header */}
                <button
                  onClick={() => toggleIndex(index)}
                  className="w-full flex items-center justify-between text-left gap-4 sm:gap-6 group cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                  aria-label={`Question ${index + 1}: ${faq.question}`}
                >
                  <div className="flex items-center gap-4 sm:gap-6 flex-1">
                    {/* Index Number Badge */}
                    <span
                      className={`font-mono text-xs sm:text-sm font-black w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-300 ${
                        isOpen
                          ? "bg-gold text-white border border-gold"
                          : "text-gold/80 bg-gold/5 border border-gold/20 group-hover:bg-gold/10"
                      }`}
                    >
                      {numberStr}
                    </span>

                    <span
                      className={`font-sans font-medium text-base sm:text-[17px] leading-snug transition-colors duration-300 flex-1 ${
                        isOpen
                          ? "text-gold"
                          : "text-navy-deep group-hover:text-gold"
                      }`}
                    >
                      {faq.question}
                    </span>
                  </div>

                  {/* Chevron — CSS-only rotation (no spring physics, no jank) */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-all duration-300 ${
                      isOpen
                        ? "border-gold bg-gold text-white rotate-180"
                        : "border-slate-300/30 bg-white/20 text-slate-500 group-hover:border-gold/40 group-hover:bg-gold/10 group-hover:text-gold"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {/* ═══ Answer Panel — CSS Grid height trick ═══
                    Uses grid-template-rows: 0fr → 1fr instead of animating
                    height: auto. This is GPU-friendly, doesn't trigger
                    layout recalculation per-frame, and eliminates jank.
                    The inner div has overflow:hidden + opacity transition. */}
                <div
                  className="grid transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{
                    gridTemplateRows: isOpen ? "1fr" : "0fr",
                  }}
                >
                  <div className="overflow-hidden">
                    <div
                      className="pt-3 pb-1 pl-12 pr-4 sm:pl-14 text-slate-700 text-sm sm:text-base leading-relaxed font-medium transition-opacity duration-300"
                      style={{ opacity: isOpen ? 1 : 0 }}
                    >
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
