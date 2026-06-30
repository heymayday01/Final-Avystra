"use client";

import { motion } from "motion/react";
import {
  Clock,
  TrendingUp,
  RefreshCw,
  UserCog,
  PenLine,
  Calendar,
} from "lucide-react";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const penalties = [
  {
    icon: Clock,
    text: "Every delay",
    suffix: "has a cost",
  },
  {
    icon: TrendingUp,
    text: "Every lost opportunity",
    suffix: "has a cost",
  },
  {
    icon: RefreshCw,
    text: "Every escalation that routes back to you",
    suffix: "has a cost",
  },
  {
    icon: UserCog,
    text: "Every unclear role",
    suffix: "has a cost",
  },
  {
    icon: PenLine,
    text: "Every approval that never needed your signature",
    suffix: "has a cost",
  },
];

export default function CumulativePenalty() {
  return (
    <section
      id="penalty"
      className="relative py-12 sm:py-16 lg:py-20 overflow-hidden scroll-mt-24"
    >
      {/* Ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, rgba(184,146,78,0.04) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 rounded-3xl overflow-hidden shadow-[0_30px_80px_-20px_rgba(11,27,46,0.25)] border border-slate-200/60">

          {/* LEFT PANEL — Dark navy with headline */}
          <div className="lg:col-span-2 bg-navy-deep p-8 sm:p-10 lg:p-12 flex flex-col justify-center relative overflow-hidden">
            {/* Subtle grid pattern */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
            {/* Gold glow */}
            <div
              className="absolute -top-10 -left-10 w-40 h-40 rounded-full pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, rgba(184,146,78,0.12) 0%, transparent 70%)",
              }}
            />

            <div className="relative z-10">
              {/* Calendar icon */}
              <div className="mb-6">
                <div className="w-12 h-12 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-gold" strokeWidth={1.5} />
                </div>
              </div>

              {/* Eyebrow */}
              <span className="text-[11px] font-mono font-bold text-gold tracking-[0.2em] uppercase block mb-4">
                The Cumulative Penalty
              </span>

              {/* Main headline */}
              <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-white leading-tight tracking-tight mb-3">
                The cost is not always visible.
              </h2>
              <p className="font-display text-xl sm:text-2xl lg:text-3xl text-white/80 leading-tight tracking-tight mb-3 font-light">
                But it compounds.
              </p>
              <p className="font-display font-bold text-xl sm:text-2xl lg:text-3xl text-gold leading-tight tracking-tight relative inline-block">
                Every single day.
                <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gold rounded-full" />
              </p>
            </div>
          </div>

          {/* RIGHT PANEL — White with penalty list */}
          <div className="lg:col-span-3 bg-white p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
            <div className="space-y-3 sm:space-y-4">
              {penalties.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1,
                      ease: EASE,
                    }}
                    className="flex items-center gap-4 sm:gap-5 p-3 sm:p-4 rounded-2xl hover:bg-slate-50 transition-colors duration-300 group"
                  >
                    {/* Icon */}
                    <div className="p-2.5 sm:p-3 rounded-xl bg-gold/10 border border-gold/20 text-gold shrink-0 group-hover:scale-110 group-hover:bg-gold/15 transition-all duration-300">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.5} />
                    </div>

                    {/* Text */}
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2 flex-1 min-w-0">
                      <span className="font-display font-bold text-navy-deep text-base sm:text-lg leading-snug">
                        {item.text}
                      </span>
                      {/* whitespace-nowrap ensures "has a cost" never breaks
                          mid-phrase, even on narrow viewports. shrink-0
                          prevents it from being squeezed by the main text. */}
                      <span className="font-sans text-slate-400 italic text-sm sm:text-base font-light whitespace-nowrap shrink-0">
                        {item.suffix}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Bottom emphasis line */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6, ease: EASE }}
              className="mt-6 pt-5 border-t border-slate-100"
            >
              <p className="font-serif italic text-navy-deep/70 text-sm sm:text-base leading-relaxed text-center">
                The question isn&rsquo;t whether you&rsquo;re paying.
                <br className="hidden sm:block" /> The question is whether you
                know how much.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
