"use client";

import React, { useState } from "react";
import {
  User,
  BarChart4,
  Users2,
  Users,
  TrendingUp,
  Briefcase,
  AlertTriangle,
  Award,
  Building2,
} from "lucide-react";
import { UnderlineSquiggle } from "./DoodleWidgets";
import CountUp from "./CountUp";
import CumulativePenalty from "./CumulativePenalty";
import { useGsapReveal } from "@/lib/useGsapReveal";
import { useGsapCards } from "@/lib/useGsapCards";

interface StatItemProps {
  id: string;
  value: string;
  numValue?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  percentage: number;
  label: string;
  context: string;
  icon: React.ReactNode;
}

export default function StatsFounder() {
  const [photoFailed, setPhotoFailed] = useState(false);

  // GSAP ScrollTrigger reveals (single call per reveal group, never inside .map()).
  const eyebrowRef = useGsapReveal<HTMLDivElement>("fade", { duration: 0.6 });
  const headingRef = useGsapReveal<HTMLHeadingElement>("words");
  const subtextRef = useGsapReveal<HTMLParagraphElement>("fade", { delay: 0.2, duration: 0.75 });
  const statsGridRef = useGsapCards<HTMLDivElement>();
  const portraitRef = useGsapReveal<HTMLDivElement>("fade", { delay: 0.2, duration: 0.8 });
  const credentialsLabelRef = useGsapReveal<HTMLParagraphElement>("fade", { delay: 0.1 });
  const credentialsGridRef = useGsapCards<HTMLDivElement>();

  // CountUp (inside StatCard) uses motion/react useInView as a counter
  // trigger (not a reveal animation) — left untouched.

  const stats: StatItemProps[] = [
    {
      id: "stat-lost",
      value: "₹32.7T",
      numValue: 32.7,
      prefix: "₹",
      suffix: "T",
      decimals: 1,
      percentage: 95,
      label: "Financial Drain",
      context: "lost to disengagement every year in India",
      icon: <TrendingUp className="w-5 h-5 text-danger" />,
    },
    {
      id: "stat-managers",
      value: "82%",
      numValue: 82,
      prefix: "",
      suffix: "%",
      decimals: 0,
      percentage: 82,
      label: "Manager Selection",
      context: "of companies choose the wrong managers",
      icon: <Users2 className="w-5 h-5 text-danger" />,
    },
    {
      id: "stat-engaged",
      value: "23%",
      numValue: 23,
      prefix: "",
      suffix: "%",
      decimals: 0,
      percentage: 23,
      label: "Employee Engagement",
      context: "of India employees are engaged at work",
      icon: <Briefcase className="w-5 h-5 text-danger" />,
    },
    {
      id: "stat-responsibility",
      value: "69%",
      numValue: 69,
      prefix: "",
      suffix: "%",
      decimals: 0,
      percentage: 69,
      label: "Latent Ownership",
      context: "Employees are ready. Systems aren't.",
      icon: <BarChart4 className="w-5 h-5 text-danger" />,
    },
  ];

  const credentials = [
    {
      title: "10+ YEARS",
      subtitle: "EXECUTIVE ADVISOR",
      desc: "Experience in advisory, consulting, and leadership development.",
      icon: <Award className="w-5 h-5 text-gold" />,
    },
    {
      title: "LEADERS & MANAGERS",
      subtitle: "ACCOUNTABILITY BLUEPRINTS",
      desc: "Supporting decision-makers in building accountability, ownership, and execution.",
      icon: <Users className="w-5 h-5 text-gold" />,
    },
    {
      title: "ACROSS ORGANIZATIONS",
      subtitle: "DIVERSE EXPERIENCE",
      desc: "Professional experience across diverse organizational environments.",
      icon: <Building2 className="w-5 h-5 text-gold" />,
    },
    {
      title: "MEASURABLE IMPACT",
      subtitle: "REAL OUTCOMES",
      desc: "Every engagement designed to drive implementation, improvement, and outcomes.",
      icon: <TrendingUp className="w-5 h-5 text-gold" />,
    },
  ];

  return (
    <section
      id="team"
      className="relative py-10 bg-transparent border-none overflow-hidden animate-fade-in scroll-mt-24"
    >
      {/* Background radial spotlights */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
        <div
          className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(197, 160, 89, 0.04) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-[20%] left-[-15%] w-[550px] h-[550px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(147, 197, 253, 0.03) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* SECTION 1: STATS */}
        <div className="mb-8 text-center">
          <div className="mb-8">
            <div ref={eyebrowRef} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/60 border border-slate-200/50 rounded-full mb-3 shadow-sm">
              <AlertTriangle className="w-3.5 h-3.5 text-danger" />
              <span className="text-[10.5px] text-danger font-mono tracking-widest font-bold uppercase">
                The Numbers Don&apos;t Lie
              </span>
            </div>
            <h2
              ref={headingRef}
              className="font-display font-bold text-3xl sm:text-4xl text-danger tracking-tight mb-3 leading-[1.2]"
            >
              India is Bleeding{" "}
              <span className="font-serif italic font-light relative inline-block">
                Performance
                <UnderlineSquiggle
                  className="text-danger"
                  duration={1.5}
                  delay={0.3}
                />
              </span>
            </h2>
            <p ref={subtextRef} className="text-slate-600 font-sans text-xs sm:text-sm max-w-lg mx-auto font-medium leading-relaxed">
              The cost of inaction is staggering. These are not opinions — they are research-backed realities every leader must confront.
            </p>
          </div>

          {/* Metrics Grid */}
          <div
            ref={statsGridRef}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10"
          >
            {stats.map((stat) => (
              <div key={stat.id} className="h-full">
                <StatCard stat={stat} />
              </div>
            ))}
          </div>
        </div>

        {/* ═══ CUMULATIVE PENALTY ═══
            Rendered here (between the stats grid and the founder profile)
            so it flows: India is Bleeding → Cumulative Penalty → About the Founder. */}
        <div className="py-8">
          <CumulativePenalty />
        </div>

        {/* SECTION 2: ABOUT THE FOUNDER */}
        <div id="about" className="border-t border-slate-100 pt-12 sm:pt-16 scroll-mt-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            {/* Founder Portrait Column — premium framed card */}
            <div
              ref={portraitRef}
              className="lg:col-span-5 flex justify-center"
            >
              <div className="relative w-full max-w-[280px] sm:max-w-[320px]">
                {/* Decorative gold glow behind portrait */}
                <div
                  className="absolute -inset-4 rounded-3xl pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(ellipse at center, rgba(184,146,78,0.08) 0%, transparent 70%)",
                  }}
                />
                {/* Decorative offset frame */}
                <div className="absolute -top-3 -right-3 w-full h-full rounded-2xl border border-gold/20 pointer-events-none" />

                <div className="relative rounded-2xl p-2.5 shadow-[0_20px_50px_-15px_rgba(11,27,46,0.15)] bg-gradient-to-br from-white to-slate-50 border border-slate-200/60">
                  <div className="relative overflow-hidden rounded-xl aspect-[4/5] bg-slate-50/40 flex items-center justify-center border border-white/40 p-0.5">
                    {!photoFailed ? (
                      <img
                        src="/founder-portrait.jpg"
                        alt="Kirankumar Pandey"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        onError={() => setPhotoFailed(true)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center p-6 text-slate-400">
                        <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-gold mb-3">
                          <User className="w-8 h-8" />
                        </div>
                        <span className="text-xs font-mono text-navy-deep font-bold uppercase">
                          Kirankumar Pandey
                        </span>
                        <span className="text-[11.5px] text-slate-500 mt-1 font-mono">
                          Founder &amp; Director
                        </span>
                      </div>
                    )}

                    {/* Floating badge — premium gradient */}
                    <div className="absolute bottom-4 left-4 bg-gradient-to-r from-navy-deep to-navy-soft px-3.5 py-1.5 rounded-lg border border-gold/30 shadow-lg">
                      <span className="text-[9.5px] text-gold font-mono tracking-[0.18em] font-bold uppercase">
                        Founder &amp; Director
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Founder Philosophy Column — refined typography + premium quote */}
            <div className="lg:col-span-7">
              <div className="space-y-5 text-left">
                {/* Eyebrow with decorative line */}
                <div className="flex items-center gap-3">
                  <span className="h-px w-8 bg-gold/40" />
                  <span className="text-[10.5px] font-mono tracking-[0.22em] font-bold uppercase text-gold">
                    The Person Behind AVYSTRA
                  </span>
                </div>

                {/* Name with role */}
                <div>
                  <h3 className="font-display font-bold text-3xl sm:text-4xl text-navy-deep tracking-tight leading-tight">
                    Kirankumar Pandey
                  </h3>
                  <span className="text-[13px] font-sans text-slate-500 font-medium tracking-wide mt-1 block">
                    Founder &amp; Director, AVYSTRA Consulting
                  </span>
                </div>

                <p className="text-slate-600 text-[13.5px] sm:text-[14.5px] font-sans font-normal leading-relaxed">
                  Most organizations don&apos;t struggle with knowing what to do.
                  They struggle with consistently doing it. Kirankumar Pandey has
                  spent over a decade in that room — and what he kept seeing
                  wasn&apos;t a knowledge problem. It was a doing problem.
                </p>

                <p className="text-slate-600 text-[13.5px] sm:text-[14.5px] font-sans font-light leading-relaxed">
                  Postgraduate and MBA, Kirankumar built his career on one
                  demanding skill — holding a room of skeptical, distracted
                  people and making something complex land so clearly that they
                  couldn&apos;t ignore it. That ability to translate structure
                  into immediate action became the engine behind AVYSTRA.
                </p>

                {/* Premium quote box — gold gradient with decorative marks */}
                <div className="relative my-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-navy-deep to-navy-soft border border-gold/20 shadow-[0_12px_36px_-12px_rgba(11,27,46,0.25)] overflow-hidden">
                  {/* Decorative quote mark */}
                  <span className="absolute top-2 left-4 text-5xl font-serif text-gold/20 leading-none select-none pointer-events-none">
                    &ldquo;
                  </span>
                  {/* Gold accent line */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-gold via-gold/60 to-transparent" />
                  <p className="text-white font-serif italic text-[15px] sm:text-base leading-relaxed font-medium pl-6 pt-2">
                    Great companies aren&apos;t built by knowing more. They are
                    built by executing better.
                  </p>
                </div>

                <p className="text-slate-600 text-[13.5px] sm:text-[14.5px] font-sans font-light leading-relaxed">
                  Across advisory, consulting, and director-level roles, he built
                  AVYSTRA on that conviction — every program research-backed,
                  organization-specific, and measured for outcomes.
                </p>
              </div>
            </div>
          </div>

          {/* Credentials Block */}
          <div className="mt-10 pt-6 border-t border-slate-100 text-left">
            <p ref={credentialsLabelRef} className="text-[11.5px] font-mono font-bold text-gold uppercase tracking-widest text-center mb-6">
              — A DECADE OF BUILDING WHAT WORKS —
            </p>
            <div
              ref={credentialsGridRef}
              className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6"
            >
              {credentials.map((cred, i) => (
                <div
                  key={i}
                  className="card-premium p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-white to-slate-50 flex flex-col"
                >
                  {/* Icon */}
                  <div className="p-2 bg-gold/10 rounded-xl w-fit mb-3 shrink-0">
                    {cred.icon}
                  </div>
                  <span className="text-sm sm:text-base font-display font-black text-navy-deep tracking-tight uppercase leading-tight block">
                    {cred.title}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-mono text-gold uppercase tracking-widest font-black block mt-1 leading-none mb-2 sm:mb-3">
                    {cred.subtitle}
                  </span>
                  <p className="text-slate-600 font-sans text-[11px] sm:text-[12.5px] leading-relaxed font-light mt-auto">
                    {cred.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const StatCard = React.memo(function StatCard({
  stat,
}: {
  stat: StatItemProps;
}) {
  return (
    <div className="card-premium relative rounded-2xl p-5 bg-navy-deep border border-danger/15 flex flex-col items-center text-center group overflow-hidden h-full">
      {/* Red warning line at top */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-danger/0 via-danger to-danger/0" />

      <div className="p-3 bg-danger/10 rounded-full text-danger mb-4 shrink-0">
        {stat.icon}
      </div>

      <span className="font-display font-black text-3xl text-white tracking-tight block">
        {stat.numValue !== undefined ? (
          <CountUp
            to={stat.numValue}
            from={0}
            prefix={stat.prefix}
            suffix={stat.suffix}
            decimals={stat.decimals || 0}
            duration={2}
            delay={0.1}
          />
        ) : (
          stat.value
        )}
      </span>

      <span className="text-[10px] font-mono font-bold text-danger uppercase tracking-widest mt-1 mb-2">
        {stat.label}
      </span>

      {/* flex-1 pushes this paragraph to fill remaining vertical space,
          so all cards have identical visible height even when description
          text lengths differ. flex-end keeps the text bottom-aligned. */}
      <p className="text-slate-400 text-xs font-sans font-light leading-relaxed flex-1 flex items-end justify-center">
        <span>{stat.context}</span>
      </p>
    </div>
  );
});
