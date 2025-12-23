"use client";

import { useState } from "react";
import { Gem, Leaf, Layers, Fingerprint, Waves } from "lucide-react";

export default function StoryPage() {
  const [activeSlide, setActiveSlide] = useState(0);

  const philosophyItems = [
    {
      id: 0,
      number: "01",
      title: "En Kwaliteit.",
      desc: "En Kwaliteit. Superieure garenstandaarden.",
      colorClass: "group-hover:text-black/50",
      barColor: "bg-black",
      icon: <Gem className="w-6 h-6 text-black" strokeWidth={1.5} />,
      bgColor: "bg-zinc-100"
    },
    {
      id: 1,
      number: "02",
      title: "En Duurzaamheid.",
      desc: "En Duurzaamheid. Productie met respect voor de natuur.",
      colorClass: "group-hover:text-[#17a6a6]/50",
      barColor: "bg-[#17a6a6]",
      icon: <Leaf className="w-6 h-6 text-[#17a6a6]" strokeWidth={1.5} />,
      bgColor: "bg-[#e0f2f1]"
    },
    {
      id: 2,
      number: "03",
      title: "En Flexibiliteit.",
      desc: "En Flexibiliteit. Vrijheid van beweging.",
      colorClass: "group-hover:text-[#f24f13]/50",
      barColor: "bg-[#f24f13]",
      icon: <Waves className="w-6 h-6 text-[#f24f13]" strokeWidth={1.5} />,
      bgColor: "bg-[#fff1eb]"
    },
    {
      id: 3,
      number: "04",
      title: "Ensokken.",
      desc: "Het geheel is meer dan de som der delen.",
      colorClass: "group-hover:text-black/50",
      barColor: "bg-black",
      icon: <span className="font-bold text-lg">E.</span>,
      bgColor: "bg-white"
    }
  ];

  return (
    <main className="flex-1 pt-32 pb-16 px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-7xl mx-auto">
        
        {/* Hero Text */}
        <section className="max-w-4xl mx-auto mb-20 mt-8">
            <span className="text-[#f24f13] font-medium text-xs tracking-widest uppercase mb-6 block">Over Ons</span>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-semibold tracking-tight text-black mb-8 leading-[1.1]">
                De laatste stap van voorbereiding.
                <span className="text-zinc-400 block mt-2">"En sokken."</span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-600 leading-relaxed max-w-2xl font-normal">
                Dat laatste moment voordat de drukte van de dag begint. Je hebt je outfit gekozen, je bent klaar, en er rest nog maar één ding. **Ensokken**, wat 'en sokken' betekent in het Nederlands, is geïnspireerd door dit aanvullende moment.
            </p>
        </section>

        {/* Interactive Philosophy Section */}
        <section className="mb-24">
            <p className="text-xs font-bold text-zinc-300 uppercase tracking-widest mb-6 px-2 lg:px-6">Onze Waarden</p>
            
            {/* MOBILE VIEW (Stacked Cards) */}
            <div className="flex flex-col gap-4 lg:hidden">
                {philosophyItems.map((item) => (
                    <div key={item.id} className={`p-8 rounded-[2rem] border border-black/5 ${item.bgColor} relative overflow-hidden`}>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-xs font-mono text-black/40 bg-white/50 px-2 py-1 rounded-md">{item.number}</span>
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                                    {item.icon}
                                </div>
                            </div>
                            <h3 className="text-2xl font-medium text-black tracking-tight mb-2">{item.title}</h3>
                            <p className="text-zinc-600 text-sm leading-relaxed">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* DESKTOP VIEW (Interactive Split) */}
            <div className="hidden lg:grid bg-white rounded-[3rem] border border-black/5 p-12 shadow-2xl shadow-black/5 overflow-hidden grid-cols-12 gap-12 min-h-[650px]">
                    
                    {/* Left: Triggers */}
                    <div className="col-span-5 flex flex-col justify-center space-y-2">
                        {philosophyItems.map((item) => (
                          <div 
                            key={item.id}
                            className={`group cursor-pointer p-6 rounded-2xl hover:bg-black/[0.02] border-l-2 border-transparent relative transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                              activeSlide === item.id 
                                ? 'opacity-100 translate-x-2.5' 
                                : 'opacity-40'
                            }`}
                            onMouseEnter={() => setActiveSlide(item.id)}
                          >
                              <div className="flex items-baseline gap-4 pointer-events-none">
                                  <span className={`text-sm font-mono text-zinc-300 transition-colors ${item.colorClass}`}>
                                    {item.number}
                                  </span>
                                  <div>
                                      <h3 className="text-3xl font-light text-black tracking-tight mb-2 group-hover:translate-x-1 transition-transform">
                                        {item.title}
                                      </h3>
                                      <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                                        {item.desc}
                                      </p>
                                  </div>
                              </div>
                              <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 rounded-r-full transition-opacity duration-300 ${item.barColor} ${activeSlide === item.id ? 'opacity-100' : 'opacity-0'}`}></div>
                          </div>
                        ))}
                    </div>

                    {/* Right: Visual Display */}
                    <div className="col-span-7 relative bg-[#f9f9f9] rounded-[2.5rem] overflow-hidden border border-black/5">
                        
                        {/* Slide 1: Quality */}
                        <div className={`absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col items-center justify-center p-12 bg-zinc-900 ${
                          activeSlide === 0 
                            ? 'opacity-100 scale-100 translate-y-0' 
                            : 'opacity-0 scale-95 translate-y-5 pointer-events-none'
                        }`}>
                            <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                            <div className="w-64 h-64 border border-white/10 rounded-full flex items-center justify-center relative animate-spin-slow">
                                <div className="absolute inset-0 border-t border-white/30 rounded-full"></div>
                                <div className="w-48 h-48 border border-white/10 rounded-full flex items-center justify-center">
                                    <Gem className="text-white w-16 h-16 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" strokeWidth={1.5} />
                                </div>
                            </div>
                            <span className="absolute bottom-8 text-white/40 text-xs tracking-[0.3em] uppercase">Premium Standaarden</span>
                        </div>

                        {/* Slide 2: Sustainability */}
                        <div className={`absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col items-center justify-center p-12 bg-[#e0f2f1] ${
                          activeSlide === 1
                            ? 'opacity-100 scale-100 translate-y-0' 
                            : 'opacity-0 scale-95 translate-y-5 pointer-events-none'
                        }`}>
                            <div className="absolute top-0 right-0 w-96 h-96 bg-[#17a6a6]/10 rounded-full blur-[80px]"></div>
                            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#17a6a6]/20 rounded-full blur-[80px]"></div>
                            <div className="relative z-10 text-center">
                                <div className="w-32 h-32 mx-auto bg-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-[#17a6a6]/10 text-[#17a6a6]">
                                    <Leaf className="w-12 h-12" strokeWidth={1.5} />
                                </div>
                                <h4 className="text-2xl font-medium text-[#0f5c5c]">Terug naar de Natuur</h4>
                                <p className="text-[#17a6a6] mt-2">100% Recyclebaar</p>
                            </div>
                        </div>

                        {/* Slide 3: Flexibility */}
                        <div className={`absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col items-center justify-center p-12 bg-[#fff1eb] ${
                          activeSlide === 2
                            ? 'opacity-100 scale-100 translate-y-0' 
                            : 'opacity-0 scale-95 translate-y-5 pointer-events-none'
                        }`}>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-32 bg-[#f24f13] blur-[100px] opacity-20 rotate-12"></div>
                            <div className="relative flex gap-4">
                                {[0, 100, 200, 300, 400, 500, 600].map((delay, i) => (
                                  <div 
                                    key={i}
                                    className="w-4 h-32 bg-[#f24f13] rounded-full animate-pulse"
                                    style={{ 
                                      animationDelay: `${delay}ms`,
                                      opacity: i === 3 ? 1 : i === 2 || i === 4 ? 0.8 : i === 1 || i === 5 ? 0.6 : 0.4 
                                    }}
                                  ></div>
                                ))}
                            </div>
                            <span className="absolute bottom-8 text-[#f24f13] text-xs tracking-[0.3em] uppercase font-bold">Vrijheid van Beweging</span>
                        </div>

                        {/* Slide 4: Ensokken */}
                        <div className={`absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col items-center justify-center p-12 bg-white ${
                          activeSlide === 3
                            ? 'opacity-100 scale-100 translate-y-0' 
                            : 'opacity-0 scale-95 translate-y-5 pointer-events-none'
                        }`}>
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,#00000005_25%,transparent_25%,transparent_75%,#00000005_75%,#00000005),linear-gradient(45deg,#00000005_25%,transparent_25%,transparent_75%,#00000005_75%,#00000005)] bg-[length:20px_20px] bg-[position:0_0,10px_10px]"></div>
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="w-24 h-24 bg-black rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-black/20">
                                    <span className="text-white text-4xl font-bold tracking-tighter">E</span>
                                </div>
                                <h4 className="text-4xl font-bold text-black tracking-tighter">Ensokken.</h4>
                                <p className="text-zinc-400 mt-2 tracking-widest text-xs uppercase">Est. 2024</p>
                            </div>
                        </div>

                    </div>
            </div>
        </section>

        {/* Technical Details */}
        <section className="border-t border-black/5 pt-24">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                <div>
                    <span className="text-[#f24f13] font-medium text-xs tracking-widest uppercase mb-4 block">Technische Details</span>
                    <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-black">Onzichtbare verschillen.</h2>
                </div>
                <p className="text-zinc-500 max-w-md text-sm leading-relaxed">
                    Wat Ensokken anders maakt dan een gewone sok, zijn de technische details die op het eerste gezicht niet opvallen, maar de hele dag voelbaar zijn.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1 */}
                <div className="bg-white p-8 rounded-[2rem] border border-black/5 hover:border-black/20 transition-all group">
                    <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-colors">
                        <Layers className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-black mb-2">200 Naalden Breiwerk</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed">Door 200 naalden te gebruiken in plaats van de standaard 144, wordt een strakkere, gladdere en duurzamere textuur verkregen.</p>
                </div>
                
                {/* Card 2 */}
                <div className="bg-white p-8 rounded-[2rem] border border-black/5 hover:border-black/20 transition-all group">
                    <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-colors">
                        <Fingerprint className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-black mb-2">Naadloze Teen</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed">Met de hand afgewerkte "Seamless Toe" technologie die ongemakkelijke naden elimineert.</p>
                </div>

                {/* Card 3 */}
                <div className="bg-white p-8 rounded-[2rem] border border-black/5 hover:border-black/20 transition-all group">
                    <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-colors">
                        <Waves className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-black mb-2">Siliconen Wassing</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed">Krimpt niet dankzij een speciaal wasproces na productie en biedt vanaf de eerste dag een zijdezachte zachtheid.</p>
                </div>
            </div>
        </section>
      </div>
    </main>
  );
}
