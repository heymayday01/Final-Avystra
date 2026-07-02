"use client";

import { Linkedin, Instagram, MessageCircle, Facebook, Mail, Phone, ArrowUpRight } from "lucide-react";
import AvystraLogo from "./AvystraLogo";
import { smoothScrollTo } from "@/lib/scroll";
import { useReveal } from "@/lib/useReveal";

interface FooterProps {
  leadCount: number;
}

export default function Footer({ leadCount }: FooterProps) {
  const mainRef = useReveal<HTMLDivElement>();

  const scrollTo = (href: string) => {
    const elementId = href.substring(1);
    smoothScrollTo(elementId);
  };

  const socialLinks = [
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: "https://linkedin.com/in/kirankumar-pandey-841859218",
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      href: "https://wa.me/918596059607",
    },
    {
      name: "Instagram",
      icon: Instagram,
      href: "https://instagram.com/kp_biobali",
    },
    {
      name: "Facebook",
      icon: Facebook,
      href: "https://facebook.com/share/1FpxeyvRHF/",
    },
  ];

  const links = [
    { label: "Frameworks", href: "#bottlenecks" },
    { label: "Process", href: "#process" },
    { label: "Team", href: "#about" },
    { label: "Clients", href: "#testimonials" },
    { label: "FAQ", href: "#faq" },
    { label: "OGI Score", href: "#consult" },
  ];

  return (
    <footer className="relative bg-navy-deep text-slate-100 overflow-hidden pt-12 sm:pt-16 mt-auto">
      {/* Ambient gold and navy glows */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-gold/[0.04] blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-gold/[0.02] blur-[120px] pointer-events-none" />

      <div
        ref={mainRef}
        className="reveal max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10 w-full"
      >
        {/* Main Footer Content — compact 3-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 mb-10">
          {/* Brand & Description */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-6">
            {/* Logo in footer */}
            <div className="mb-5">
              <AvystraLogo size="lg" showTagline={true} theme="dark" />
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-medium text-white mb-3 tracking-tight leading-[1.25]">
              Let&apos;s re-engineer your{" "}
              <span className="text-gold">business performance.</span>
            </h2>
            <p className="text-slate-400 max-w-md leading-relaxed text-sm mb-5">
              AVYSTRA helps founders and leaders build the clarity,
              accountability, and systems necessary for scalable, decisive
              growth.
            </p>

            {/* Contact quick row */}
            <div className="flex flex-wrap gap-2.5">
              <a
                href="mailto:info@avystra.co.in"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/5 border border-white/10 text-slate-200 hover:bg-gold/10 hover:border-gold/30 hover:text-gold transition-all duration-300 text-[13px] font-medium focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <Mail className="w-3.5 h-3.5 text-gold" />
                <span>info@avystra.co.in</span>
              </a>
              <a
                href="tel:+918596059607"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/5 border border-white/10 text-slate-200 hover:bg-gold/10 hover:border-gold/30 hover:text-gold transition-all duration-300 text-[13px] font-medium focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <Phone className="w-3.5 h-3.5 text-gold" />
                <span>+91 85960 59607</span>
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="col-span-1 lg:col-span-3">
            <h3 className="text-[12.5px] font-mono text-gold uppercase tracking-[0.2em] mb-4 font-bold">
              Navigation
            </h3>
            <ul className="space-y-2.5">
              {links.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollTo(item.href);
                    }}
                    className="text-slate-300 hover:text-gold transition-colors cursor-pointer inline-flex items-center gap-2 group text-[14px] focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:outline-none"
                  >
                    <span className="w-0 group-hover:w-3 h-px bg-gold transition-all duration-300" />
                    <span className="group-hover:translate-x-0.5 transition-transform duration-300">
                      {item.label}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect & Socials */}
          <div className="col-span-1 lg:col-span-3">
            <h3 className="text-[12.5px] font-mono text-gold uppercase tracking-[0.2em] mb-4 font-bold">
              Connect
            </h3>
            <p className="text-slate-400 text-[13px] leading-relaxed mb-4 max-w-xs">
              Follow our work for insights on leadership, execution, and
              organizational performance.
            </p>
            <div className="grid grid-cols-4 gap-2 max-w-[200px]">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="aspect-square flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-gold hover:text-navy-deep hover:border-gold hover:shadow-[var(--shadow-btn-glow)] hover:scale-[1.02] active:scale-95 transition-all duration-300 ease-in-out focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:outline-none"
                  aria-label={link.name}
                >
                  <link.icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Meta — compact single row */}
        <div className="py-5 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs font-mono text-slate-500">
          <p className="text-center sm:text-left">
            &copy; {new Date().getFullYear()} AVYSTRA Consulting Pvt. Ltd. All
            rights reserved.
          </p>
          <div className="flex gap-6 items-center">
            <a
              href="#consult"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("#consult");
              }}
              className="cursor-pointer text-gold hover:text-gold-light transition-colors inline-flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              Begin Assessment
              <ArrowUpRight className="w-3 h-3" />
            </a>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="cursor-pointer hover:text-gold transition-colors inline-flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              Privacy
            </a>
            {leadCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-gold/20 bg-gold/5 text-[11.5px] text-gold">
                <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                {leadCount} Active
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Massive Brand Name — compressed, responsive */}
      <div className="w-full overflow-hidden flex justify-center items-end select-none pointer-events-none relative">
        <span
          className="font-display font-black tracking-tighter text-navy-soft uppercase text-center whitespace-nowrap leading-[0.75] z-0 block"
          style={{
            fontSize: "clamp(3.5rem, 18vw, 16rem)",
            marginBottom: "clamp(-0.4rem, -1.5vw, -1.5rem)",
          }}
          aria-hidden="true"
        >
          AVYSTRA
        </span>
      </div>
    </footer>
  );
}
