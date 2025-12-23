"use client";

import { useState, useRef, useEffect } from "react";
import { Mail, Package, ChevronDown, ArrowRight, ExternalLink, Check } from "lucide-react";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const glowRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Mouse Glow Effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (glowRef.current) {
        glowRef.current.style.left = `${e.clientX}px`;
        glowRef.current.style.top = `${e.clientY}px`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 3D Tilt Effect Logic
  const handleTiltMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || window.innerWidth < 768) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -2; 
    const rotateY = ((x - centerX) / centerX) * 2;

    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
  };

  const handleTiltLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
  };

  // Custom Validation Handler
  const handleInvalid = (e: React.InvalidEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (e.target.validity.valueMissing) {
      e.target.setCustomValidity("Vul dit veld in.");
    } else if (e.target.validity.typeMismatch && e.target.type === 'email') {
      e.target.setCustomValidity("Voer een geldig e-mailadres in.");
    }
  };

  const handleInput = (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.setCustomValidity("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current?.checkValidity()) {
      formRef.current?.reportValidity();
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        formRef.current?.reset();
      }, 2000);
    }, 1500);
  };

  return (
    <div className="relative min-h-screen pt-24 pb-12 overflow-hidden">
      {/* Interactive Mouse Background */}
      <div 
        ref={glowRef}
        className="fixed w-[600px] h-[600px] bg-gradient-to-r from-[#f24f13]/10 to-orange-200/20 rounded-full blur-3xl -z-10 pointer-events-none transition-transform duration-1000 ease-out -translate-x-1/2 -translate-y-1/2"
        style={{ left: '50%', top: '50%' }}
      />

      <main className="px-4 sm:px-6 max-w-7xl mx-auto perspective-1000">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-start">
            
            {/* Left Column: Info & Context */}
            <div className="flex flex-col justify-center animate-in slide-in-from-bottom-8 fade-in duration-700 delay-100">
                <span className="text-[#f24f13] font-medium text-xs tracking-widest uppercase mb-6 block">Klantervaring</span>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-black mb-6 lg:mb-8 leading-[1.1]">
                    Stap Verder Dan <br />Comfort.
                    <span className="text-zinc-400 block mt-2 text-3xl sm:text-4xl lg:text-5xl font-normal">Laten we je vragen beantwoorden.</span>
                </h1>
                <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal mb-10 lg:mb-12 max-w-md">
                    Of het nu gaat om de status van je bestelling, groothandelsaanvragen of de verzorging van je favoriete sokken. Het Ensokken-team staat bij elke stap voor je klaar.
                </p>

                {/* Contact Details */}
                <div className="space-y-6 lg:space-y-8">
                    <div className="flex items-start gap-4 group cursor-default">
                        <div className="w-12 h-12 bg-white rounded-2xl border border-black/5 flex items-center justify-center shadow-sm group-hover:border-[#f24f13]/30 group-hover:scale-110 group-hover:shadow-md transition-all duration-300 shrink-0">
                            <Mail className="w-6 h-6 text-zinc-600 group-hover:text-[#f24f13] transition-colors" strokeWidth={1.5} />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-black mb-1">Hulplijn</h3>
                            <a href="mailto:support@ensokken.com" className="text-zinc-500 hover:text-black transition-colors text-base relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-px after:bottom-0 after:left-0 after:bg-black after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left break-all">support@ensokken.com</a>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 group cursor-default">
                        <div className="w-12 h-12 bg-white rounded-2xl border border-black/5 flex items-center justify-center shadow-sm group-hover:border-[#f24f13]/30 group-hover:scale-110 group-hover:shadow-md transition-all duration-300 shrink-0">
                            <Package className="w-6 h-6 text-zinc-600 group-hover:text-[#f24f13] transition-colors" strokeWidth={1.5} />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-black mb-1">Showroom & Magazijn</h3>
                            <p className="text-zinc-500 text-base leading-snug">
                                Teşvikiye Mah. Valikonağı Cad.<br />
                                Şişli, Istanbul, Turkije
                            </p>
                        </div>
                    </div>
                </div>

                {/* Social Mini Row */}
                <div className="mt-10 lg:mt-12 pt-10 lg:pt-12 border-t border-black/5">
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Volg Ons</p>
                    <div className="flex gap-4">
                        <a href="#" className="text-black hover:text-[#f24f13] transition-colors text-sm font-medium hover:-translate-y-0.5 inline-block">Instagram</a>
                        <span className="text-zinc-300">/</span>
                        <a href="#" className="text-black hover:text-[#f24f13] transition-colors text-sm font-medium hover:-translate-y-0.5 inline-block">Pinterest</a>
                        <span className="text-zinc-300">/</span>
                        <a href="#" className="text-black hover:text-[#f24f13] transition-colors text-sm font-medium hover:-translate-y-0.5 inline-block">LinkedIn</a>
                    </div>
                </div>
            </div>

            {/* Right Column: Form with Tilt Effect */}
            <div 
              className="relative group/card perspective-1000 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-300"
              onMouseMove={handleTiltMove}
              onMouseLeave={handleTiltLeave}
            >
                {/* Interactive Form Card */}
                <div 
                  ref={cardRef}
                  className="bg-white rounded-3xl md:rounded-[2rem] p-6 md:p-10 shadow-xl shadow-black/5 border border-black/5 relative z-10 overflow-hidden transform-style-3d transition-transform duration-100 ease-out"
                >
                    
                    {/* Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none z-20"></div>

                    <form ref={formRef} className="space-y-5 md:space-y-6 relative z-30" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                            <div className="space-y-2 group/input">
                                <label htmlFor="name" className="text-sm font-medium text-zinc-700 ml-1 group-focus-within/input:text-[#f24f13] transition-colors">Naam</label>
                                <input 
                                  type="text" 
                                  id="name" 
                                  placeholder="John Doe" 
                                  required 
                                  onInvalid={handleInvalid}
                                  onInput={handleInput}
                                  className="w-full px-4 py-3 md:py-3.5 rounded-xl bg-[#f9f9f9] border border-black/5 text-black placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-[#f24f13]/20 transition-all duration-300 text-base md:text-sm" 
                                />
                            </div>
                            <div className="space-y-2 group/input">
                                <label htmlFor="email" className="text-sm font-medium text-zinc-700 ml-1 group-focus-within/input:text-[#f24f13] transition-colors">E-mail</label>
                                <input 
                                  type="email" 
                                  id="email" 
                                  placeholder="voorbeeld@email.com" 
                                  required 
                                  onInvalid={handleInvalid}
                                  onInput={handleInput}
                                  className="w-full px-4 py-3 md:py-3.5 rounded-xl bg-[#f9f9f9] border border-black/5 text-black placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-[#f24f13]/20 transition-all duration-300 text-base md:text-sm" 
                                />
                            </div>
                        </div>

                        <div className="space-y-2 group/input">
                            <label htmlFor="subject" className="text-sm font-medium text-zinc-700 ml-1 group-focus-within/input:text-[#f24f13] transition-colors">Onderwerp</label>
                            <div className="relative">
                                <select 
                                  id="subject" 
                                  className="w-full px-4 py-3 md:py-3.5 rounded-xl bg-[#f9f9f9] border border-black/5 text-black appearance-none focus:outline-none focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-[#f24f13]/20 transition-all duration-300 cursor-pointer text-base md:text-sm"
                                >
                                    <option>Algemene Informatie</option>
                                    <option>Bestelstatus</option>
                                    <option>Retourneren en Ruilen</option>
                                    <option>Zakelijk / Groothandel</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                                    <ChevronDown className="w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 group/input">
                            <label htmlFor="message" className="text-sm font-medium text-zinc-700 ml-1 group-focus-within/input:text-[#f24f13] transition-colors">Je Bericht</label>
                            <textarea 
                              id="message" 
                              rows={5} 
                              placeholder="Hoe kunnen we je helpen met je bestelling?" 
                              required 
                              onInvalid={handleInvalid}
                              onInput={handleInput}
                              className="w-full px-4 py-3 md:py-3.5 rounded-xl bg-[#f9f9f9] border border-black/5 text-black placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-[#f24f13]/20 transition-all duration-300 resize-none text-base md:text-sm"
                            ></textarea>
                        </div>

                        <div className="pt-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-4">
                            <div className="flex items-center gap-2 cursor-pointer group select-none" onClick={() => document.getElementById('kvkk')?.click()}>
                                <div className="w-5 h-5 rounded border border-zinc-300 flex items-center justify-center bg-white group-hover:border-[#f24f13] transition-colors relative shrink-0">
                                    <input 
                                      type="checkbox" 
                                      id="kvkk" 
                                      className="absolute inset-0 opacity-0 cursor-pointer z-10 peer" 
                                      required 
                                      onInvalid={handleInvalid}
                                      onInput={handleInput}
                                    />
                                    <Check className="w-3 h-3 text-[#f24f13] opacity-0 peer-checked:opacity-100 transition-all duration-300 scale-50 peer-checked:scale-100" strokeWidth={4} />
                                </div>
                                <span className="text-xs text-zinc-500 group-hover:text-zinc-700 transition-colors leading-tight">Ik heb de privacyverklaring gelezen en ga akkoord.</span>
                            </div>

                            <button 
                              type="submit" 
                              disabled={isSubmitting || isSuccess}
                              className={`
                                w-full md:w-auto px-8 py-3.5 rounded-xl font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden relative
                                ${isSuccess 
                                  ? 'bg-green-600 text-white' 
                                  : isSubmitting 
                                    ? 'bg-black/80 text-white cursor-wait' 
                                    : 'bg-black text-white hover:bg-[#f24f13] hover:shadow-lg hover:shadow-[#f24f13]/20 hover:-translate-y-1 active:translate-y-0 active:scale-95'
                                }
                              `}
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    <span>
                                      {isSuccess ? "Verzonden!" : isSubmitting ? "Verzenden..." : "Verstuur"}
                                    </span>
                                    {!isSubmitting && !isSuccess && (
                                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                                    )}
                                </span>
                            </button>
                        </div>
                    </form>
                </div>

                {/* Decorative elements behind form */}
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 rounded-full border border-black/5 -z-10 animate-spin-slow pointer-events-none hidden md:block"></div>
            </div>
        </div>

        {/* FAQ Teaser */}
        <section className="mt-16 lg:mt-24 pt-12 lg:pt-16 border-t border-black/5 animate-in fade-in duration-700 delay-500">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
                <div>
                    <h3 className="text-lg md:text-xl font-semibold text-black">Vragen over maat of verzending?</h3>
                    <p className="text-zinc-500 text-sm mt-1">Alle details vind je in onze veelgestelde vragen sectie.</p>
                </div>
                <a href="#" className="w-full md:w-auto group flex items-center justify-center gap-2 text-sm font-medium text-black border border-black/10 rounded-full px-6 py-3 bg-white hover:border-[#f24f13] hover:text-[#f24f13] transition-all duration-300 hover:shadow-sm">
                    Ga naar Helpcentrum
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
            </div>
        </section>

      </main>
    </div>
  );
}
