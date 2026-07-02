"use client";

import { useEffect, useRef } from "react";
import { Quote, Star, MessageSquare } from "lucide-react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { usePageReady } from "@/lib/pageReady";
import { useGsapReveal } from "@/lib/useGsapReveal";
import { useGsapCards } from "@/lib/useGsapCards";

interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  company: string;
  initial: string;
}

export default function TestimonialsSection() {
  const eyebrowRef = useGsapReveal<HTMLDivElement>("fade", {
    duration: 0.6,
  });
  const headingRef = useGsapReveal<HTMLHeadingElement>("words");
  const gridRef = useGsapCards<HTMLDivElement>();
  const pageReady = usePageReady();

  // Animate stars — stagger pop-in when the star container scrolls into view
  useEffect(() => {
    if (!pageReady) return;
    const el = gridRef.current;
    if (!el) return;

    const starContainers = el.querySelectorAll('[aria-label="5 out of 5 stars"]');
    if (starContainers.length === 0) return;

    const ctx = gsap.context(() => {
      starContainers.forEach((container) => {
        const stars = container.querySelectorAll("svg");
        gsap.set(stars, { scale: 0, opacity: 0 });
        gsap.to(stars, {
          scale: 1,
          opacity: 1,
          duration: 0.4,
          ease: "back.out(1.7)",
          stagger: 0.08,
          scrollTrigger: {
            trigger: container,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        });
      });
    }, el);

    return () => ctx.revert();
  }, [pageReady]);

  const testimonials: Testimonial[] = [
    {
      id: "testimonial-1",
      quote:
        '"Three months after the program, our managers are having conversations they would have avoided before. Measurable change — not just a good day."',
      name: "Rajesh M.",
      role: "HR Head",
      company: "Manufacturing, Delhi",
      initial: "R",
    },
    {
      id: "testimonial-2",
      quote:
        '"The assessment before the program made all the difference. They understood our actual problems before walking in. It felt built for us, not off a shelf."',
      name: "Sunita K.",
      role: "Founder",
      company: "Technology Firm, Noida",
      initial: "S",
    },
    {
      id: "testimonial-3",
      quote:
        '"Accountability was our biggest gap. Six weeks later, project follow-through has improved significantly. The frameworks are actually being used."',
      name: "Amit S.",
      role: "CEO",
      company: "80-person Company, Gurgaon",
      initial: "A",
    },
  ];

  return (
    <section
      id="testimonials"
      className="relative py-6 bg-transparent border-none overflow-x-hidden md:py-10 scroll-mt-24"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 select-none">
        {/* Section Heading Container */}
        <div
          className="flex flex-col items-center text-center max-w-3xl mx-auto mb-6 md:mb-8"
        >
          {/* Aesthetic Capsule Badge */}
          <div
            ref={eyebrowRef}
            className="border border-gold/20 bg-gradient-to-br from-white to-slate-50 px-4 py-1.5 rounded-full inline-flex items-center gap-2.5 mb-3 shadow-sm"
          >
            <MessageSquare className="w-3.5 h-3.5 text-gold" />
            <span className="text-[11.5px] text-gold font-mono tracking-[0.18em] font-medium uppercase">
              Client Success Stories
            </span>
          </div>

          {/* Heading */}
          <h2
            ref={headingRef}
            className="font-display font-medium text-4xl sm:text-5xl md:text-6xl text-navy-deep tracking-tight leading-[1.2] mb-6 inline-flex flex-wrap justify-center gap-x-2"
          >
            Trusted by{" "}
            <span className="font-serif italic font-light text-gold">Industry</span>{" "}
            Leaders
          </h2>
        </div>

        {/* Testimonials Grid Row */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8"
        >
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="card-premium group relative bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 sm:p-8 lg:p-10 flex flex-col justify-between overflow-hidden"
            >
              {/* Shimmer sweep on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-gold/0 via-gold/5 to-gold/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

              <div className="relative z-10">
                {/* Quote Icon Badge */}
                <div className="w-9 h-9 rounded-full bg-gold/5 border border-gold/10 flex items-center justify-center mb-6 text-gold group-hover:bg-gold/10 transition-colors duration-500">
                  <Quote className="w-4 h-4 fill-gold/10" />
                </div>

                {/* Star Ratings */}
                <div
                  className="flex items-center gap-1 mb-5"
                  aria-label="5 out of 5 stars"
                >
                  {[...Array(5)].map((_, starIdx) => (
                    <span key={starIdx}>
                      <Star className="w-4 h-4 fill-gold text-gold stroke-[1.5]" />
                    </span>
                  ))}
                </div>

                {/* Elegant Testimonial Quote */}
                <p className="font-serif italic text-slate-700 text-base sm:text-lg leading-[1.65] font-light mb-8">
                  {testimonial.quote}
                </p>
              </div>

              {/* Card Footer Divider & Avatar */}
              <div className="border-t border-slate-100/90 pt-6 mt-auto">
                <div className="flex items-center gap-3.5">
                  {/* Luxury Initials Avatar */}
                  <div className="w-11 h-11 rounded-full bg-gold/10 text-gold font-serif italic font-bold text-base flex items-center justify-center shrink-0 border border-gold/20 shadow-inner">
                    {testimonial.initial}
                  </div>

                  {/* Authorship Info */}
                  <div className="flex flex-col">
                    <span className="font-display font-medium text-sm text-navy-deep tracking-wide">
                      {testimonial.name}
                    </span>
                    <span className="text-xs text-slate-500 mt-0.5 font-sans font-light">
                      {testimonial.role},{" "}
                      <span className="text-gold font-medium">
                        {testimonial.company}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
