"use client";

import React from "react";
import { Compass, Target, Users, Landmark, Award, ChevronRight } from "lucide-react";
import { DoodleSparkle, UnderlineSquiggle } from "./DoodleWidgets";
import TextReveal from "./TextReveal";
import TiltCard from "./TiltCard";
import { useReveal } from "@/lib/useReveal";

interface Pillar {
  id: string;
  num: string;
  title: string;
  category: string;
  description: string;
  icon: React.ReactNode;
}

export default function FourPillars() {
  const headerRef = useReveal<HTMLDivElement>();
  const gridRef = useReveal<HTMLDivElement>({ stagger: 0.08 });

  const pillars: Pillar[] = [
    {
      id: "pillar-direction",
      num: "01",
      category: "DIRECTION",
      title: "Leadership Development",
      description:
        "Leaders who give their teams a clear direction to execute toward — and hold them accountable to it.",
      icon: <Compass className="w-5 h-5 text-gold" />,
    },
    {
      id: "pillar-translation",
      num: "02",
      category: "TRANSLATION",
      title: "Manager Effectiveness",
      description:
        "Managers who translate direction into what actually happens day to day — not bottlenecks who bring every problem back up.",
      icon: <Target className="w-5 h-5 text-gold" />,
    },
    {
      id: "pillar-coordination",
      num: "03",
      category: "COORDINATION",
      title: "Team Effectiveness",
      description:
        "Teams that own their outcomes, communicate clearly, and follow through — without constant supervision.",
      icon: <Users className="w-5 h-5 text-gold" />,
    },
    {
      id: "pillar-sustainability",
      num: "04",
      category: "SUSTAINABILITY",
      title: "Organizational Performance",
      description:
        "Systems that sustain improvement — so gains don't disappear three weeks after the program ends.",
      icon: <Landmark className="w-5 h-5 text-gold" />,
    },
  ];

  return (
    <section
      id="pillars"
      className="relative py-6 md:py-10 bg-transparent overflow-x-hidden select-none scroll-mt-24"
    >
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 z-10">
        {/* Header Section */}
        <div
          ref={headerRef}
          className="reveal max-w-4xl mb-6 md:mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-br from-white to-slate-50 border border-slate-100 px-4 py-2 rounded-full mb-3 shadow-sm">
            <Award className="w-4 h-4 text-gold" />
            <span className="text-[11.5px] text-slate-600 font-mono tracking-[0.2em] font-black uppercase">
              The Framework for Autonomy
            </span>
          </div>

          <h2 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl text-navy-deep tracking-tight leading-[1.2] mb-4 uppercase">
            The Four Pillars of{" "}
            <span className="font-serif italic font-light text-gold relative inline-block px-1">
              Organizational Excellence
              <UnderlineSquiggle
                className="text-gold"
                duration={1.5}
                delay={0.4}
              />
            </span>
          </h2>

          <TextReveal
            text="Sustainable performance isn't accidental. It's built on four pillars that strengthen your organization from the inside out."
            as="p"
            className="text-slate-500 font-sans text-lg md:text-xl font-light leading-relaxed max-w-2xl"
            delay={0.8}
            blur={false}
          />
        </div>

        {/* Pillars Grid */}
        <div ref={gridRef} className="pillar-card-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">
          {pillars.map((pillar, idx) => (
            <div
              key={pillar.id}
              data-reveal
              className="pillar-card group relative h-full flex flex-col"
              style={{ perspective: 1000 }}
            >
              <TiltCard
                maxTilt={6}
                scale={1.02}
                className="group relative h-full will-change-transform"
              >
                <div className="premium-card relative h-full bg-gradient-to-br from-white to-slate-50 border border-slate-100 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 md:p-10 hover:border-gold/40 group-hover:border-gold/40 flex flex-col justify-between">
                  {/* Background Number Accent */}
                  <span className="absolute top-6 right-8 text-7xl font-serif font-black text-slate-200/30 group-hover:text-gold/20 transition-colors duration-700 select-none z-0">
                    {pillar.num}
                  </span>

                  <div className="relative z-10" style={{ transform: "translateZ(40px)" }}>
                    {/* Icon Slot */}
                    <div className="mb-10 inline-flex p-4 rounded-2xl bg-gradient-to-br from-white to-slate-50 border border-slate-100 text-gold group-hover:bg-gold/10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                      {pillar.icon}
                    </div>

                    {/* Category */}
                    <span className="block text-[10.5px] font-mono font-black text-gold uppercase tracking-[0.2em] mb-4 opacity-70 group-hover:opacity-100 transition-opacity">
                      {pillar.category}
                    </span>

                    {/* Main Title */}
                    <h3 className="font-display font-bold text-xl md:text-2xl text-navy-deep tracking-tight leading-snug mb-5">
                      {pillar.title}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-500 text-sm md:text-[15px] font-light leading-relaxed transition-colors duration-500 group-hover:text-slate-700 break-words">
                      {pillar.description}
                    </p>
                  </div>

                  {/* Micro-interaction Footer */}
                  <div className="relative z-10 mt-10 pt-6 border-t border-slate-100 flex items-center justify-between group-hover:border-gold/10 transition-colors" style={{ transform: "translateZ(20px)" }}>
                    <span className="text-[11.5px] font-mono font-bold text-slate-400 group-hover:text-navy-deep transition-colors uppercase tracking-widest">
                      Phase {pillar.num}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gold transform translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500" />
                  </div>

                  {/* Subtle Hover Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-transparent to-gold/8 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                </div>
              </TiltCard>

              {idx === 0 && (
                <DoodleSparkle
                  className="absolute -top-4 -right-4 text-gold/20 group-hover:text-gold/60 group-hover:scale-125 transition-all duration-700 pointer-events-none z-20"
                  delay={0.2}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
