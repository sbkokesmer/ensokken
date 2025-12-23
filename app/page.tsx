"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  Zap, 
  Droplet, 
  ShieldCheck, 
  Box, 
  Rotate3d, 
  ZoomIn, 
  Wind, 
  ThermometerSun, 
  Feather, 
  Recycle, 
  TrendingUp, 
  Flame, 
  Star 
} from "lucide-react";

// TypeScript definition for model-viewer custom element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        src?: string;
        'auto-rotate'?: boolean;
        'camera-controls'?: boolean;
        exposure?: string;
        'shadow-intensity'?: string;
        'environment-image'?: string;
        'disable-zoom'?: boolean;
      }, HTMLElement>;
    }
  }
}

export default function Home() {
  const [activeColor, setActiveColor] = useState<'white' | 'orange' | 'black'>('white');
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Otomatik Renk Döngüsü (Auto-Cycle Logic) - Kesintisiz
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveColor((current) => {
        if (current === 'white') return 'orange';
        if (current === 'orange') return 'black';
        return 'white';
      });
    }, 3000); // 3 saniyede bir değiştir

    return () => clearInterval(interval);
  }, []);

  // 3D Tilt Effect Logic
  useEffect(() => {
    const container = containerRef.current;
    const card = cardRef.current;

    if (!container || !card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const handleMouseLeave = () => {
      card.style.transform = 'rotateX(0) rotateY(0)';
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Fix Transparency Issue Logic
  useEffect(() => {
    const modelViewer = document.querySelector('#sock-3d-model') as any;
    
    if (modelViewer) {
      const handleLoad = () => {
        if (modelViewer.model && modelViewer.model.materials) {
          modelViewer.model.materials.forEach((material: any) => {
            material.setAlphaMode('OPAQUE');
            material.setDoubleSided(true);
            const pbr = material.pbrMetallicRoughness;
            const baseColor = pbr.baseColorFactor;
            if (baseColor[3] < 1) {
                pbr.setBaseColorFactor([baseColor[0], baseColor[1], baseColor[2], 1]);
            }
          });
        }
      };

      modelViewer.addEventListener('load', handleLoad);
      return () => {
        modelViewer.removeEventListener('load', handleLoad);
      };
    }
  }, []);

  // Background Glow Color Logic
  const getGlowColor = () => {
    switch(activeColor) {
      case 'white': return 'rgba(23, 166, 166, 0.2)';
      case 'orange': return 'rgba(242, 79, 19, 0.2)';
      case 'black': return 'rgba(0, 0, 0, 0.2)';
      default: return 'rgba(23, 166, 166, 0.2)';
    }
  };

  return (
    <main className="pt-16 flex-grow relative">
         <div className="max-w-7xl mx-auto px-6">
            
            {/* Section 1: Hero */}
            <section className="min-h-[calc(100vh-64px)] flex flex-col lg:flex-row items-center justify-center relative overflow-hidden py-12 lg:py-0 border-b border-black/5">
                <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#f24f13]/5 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#17a6a6]/5 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

                {/* Text Content - z-30 */}
                <div className="flex-1 z-30 flex flex-col items-start justify-center space-y-8 lg:pr-12 order-2 lg:order-1 w-full pointer-events-none">
                    <div className="pointer-events-auto w-full">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/60 border border-black/5 rounded-full backdrop-blur-sm mb-8">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#17a6a6] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#17a6a6]"></span>
                            </span>
                            <span className="text-xs font-semibold text-zinc-800 uppercase tracking-wide">Nieuw Seizoen</span>
                        </div>
                        
                        <h1 className="text-5xl lg:text-7xl font-semibold text-black tracking-tight leading-[1.05] mb-8">
                            De perfecte basis <br />
                            <span className="text-zinc-400">voor je stappen.</span>
                        </h1>
                        
                        <p className="text-lg text-zinc-600 max-w-lg leading-relaxed font-normal mb-8">
                            Premium biologisch katoenen sokken die Scandinavisch minimalisme combineren met superieur comfort. Ontdek zachtheid die de hele dag duurt.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-2">
                            <Link href="#koleksiyon" className="group relative px-8 py-4 bg-black text-white font-medium rounded-full overflow-hidden transition-all hover:bg-[#222] shadow-xl shadow-black/10 active:scale-95 text-center">
                                <span className="relative flex items-center justify-center gap-2">
                                    Bekijk Collectie 
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </Link>
                            <Link href="#hikaye" className="px-8 py-4 bg-white text-black font-medium rounded-full border border-black/5 hover:border-black/20 transition-all hover:bg-gray-50 text-center">
                                Ons Verhaal
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 3D Container */}
                <div 
                  ref={containerRef}
                  className="flex-1 w-full h-[400px] lg:h-[600px] flex items-center justify-center relative order-1 lg:order-2 stage-3d z-40" 
                  id="scene-container"
                >
                    <div 
                      ref={cardRef}
                      id="card" 
                      className="card-3d relative w-[300px] h-[440px] lg:w-[340px] lg:h-[500px] bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-white/60 shadow-2xl shadow-black/5 cursor-grab active:cursor-grabbing"
                    >
                        <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] layer-base">
                            <div 
                              id="bg-glow" 
                              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] blur-[60px] rounded-full transition-colors duration-700"
                              style={{ backgroundColor: getGlowColor() }}
                            ></div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center layer-mid pointer-events-none">
                            <img 
                              src="https://i.ibb.co/6RdqX3G0/Chat-GPT-mage-18-Ara-2025-02-52-44.png" 
                              className={`sock-image absolute w-[260px] lg:w-[300px] object-contain drop-shadow-2xl z-20 ${activeColor === 'white' ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} 
                              alt="White Sock" 
                            />
                            <img 
                              src="https://i.ibb.co/HT9tPqGp/Chat-GPT-mage-18-Ara-2025-03-02-28.png" 
                              className={`sock-image absolute w-[260px] lg:w-[300px] object-contain drop-shadow-2xl z-10 ${activeColor === 'orange' ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} 
                              alt="Orange Sock" 
                            />
                            <img 
                              src="https://i.ibb.co/4wj5mHtM/Chat-GPT-mage-18-Ara-2025-02-57-54.png" 
                              className={`sock-image absolute w-[260px] lg:w-[300px] object-contain drop-shadow-2xl z-10 ${activeColor === 'black' ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} 
                              alt="Black Sock" 
                            />
                        </div>
                        
                        {/* Layer Top - Buttons */}
                        <div className="absolute bottom-8 left-0 w-full px-8 layer-top z-50 pointer-events-auto">
                            <div className="p-4 bg-white/80 backdrop-blur-md rounded-2xl border border-white/60 shadow-lg flex justify-between items-center">
                                <div className="flex gap-3">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); setActiveColor('white'); }} 
                                      className={`w-6 h-6 rounded-full bg-[#f0f0f0] border border-zinc-300 hover:scale-110 transition-transform focus:outline-none ring-2 ring-transparent focus:ring-black/10 cursor-pointer relative z-50 ${activeColor === 'white' ? 'scale-110 ring-black/10 ring-2' : ''}`}
                                      aria-label="White Color"
                                    ></button>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); setActiveColor('orange'); }} 
                                      className={`w-6 h-6 rounded-full bg-[#f24f13] border border-[#f24f13] hover:scale-110 transition-transform focus:outline-none ring-2 ring-transparent focus:ring-black/10 cursor-pointer relative z-50 ${activeColor === 'orange' ? 'scale-110 ring-black/10 ring-2' : ''}`}
                                      aria-label="Orange Color"
                                    ></button>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); setActiveColor('black'); }} 
                                      className={`w-6 h-6 rounded-full bg-[#1a1a1a] border border-[#1a1a1a] hover:scale-110 transition-transform focus:outline-none ring-2 ring-transparent focus:ring-black/10 cursor-pointer relative z-50 ${activeColor === 'black' ? 'scale-110 ring-black/10 ring-2' : ''}`}
                                      aria-label="Black Color"
                                    ></button>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-800">The Essential</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 2: Features */}
            <section className="py-24 border-b border-black/5" id="hikaye">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-[2rem] border border-black/5 hover:border-black/10 transition-colors">
                        <div className="w-12 h-12 bg-[#eeebdf] rounded-2xl flex items-center justify-center mb-6 text-black">
                          <Zap width={24} height={24} />
                        </div>
                        <h3 className="text-lg font-semibold text-black mb-2">Comfort de Hele Dag</h3>
                        <p className="text-sm text-zinc-500 leading-relaxed">Maximaal comfort met speciale breitechniek die je voeten omhult en laat ademen.</p>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] border border-black/5 hover:border-black/10 transition-colors">
                        <div className="w-12 h-12 bg-[#eeebdf] rounded-2xl flex items-center justify-center mb-6 text-black">
                          <Droplet width={24} height={24} />
                        </div>
                        <h3 className="text-lg font-semibold text-black mb-2">Biologisch Katoen</h3>
                        <p className="text-sm text-zinc-500 leading-relaxed">GOTS-gecertificeerd, 100% biologisch materiaal dat vriendelijk is voor de natuur en je huid.</p>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] border border-black/5 hover:border-black/10 transition-colors">
                        <div className="w-12 h-12 bg-[#eeebdf] rounded-2xl flex items-center justify-center mb-6 text-black">
                          <ShieldCheck width={24} height={24} />
                        </div>
                        <h3 className="text-lg font-semibold text-black mb-2">Duurzame Structuur</h3>
                        <p className="text-sm text-zinc-500 leading-relaxed">Extra weerstand tegen slijtage met versterkte hiel- en teenstructuur.</p>
                    </div>
                </div>
            </section>

            {/* Section 3: 3D Texture Inspection (GLB Container) */}
            <section className="py-24 border-b border-black/5 relative z-0">
                <div className="flex flex-col md:flex-row items-center justify-between mb-12 px-2 gap-4">
                    <div className="max-w-xl">
                        <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 bg-[#eeebdf] rounded-full">
                            <Box width={14} height={14} />
                            <span className="text-xs font-semibold uppercase tracking-wide">360° Ervaring</span>
                        </div>
                        <h2 className="text-3xl font-semibold text-black tracking-tight mb-3">Inspectie Katoenstructuur.</h2>
                        <p className="text-zinc-500">
                            Ontdek de textuur van biologisch katoen en de stikdetails van dichtbij. 
                            <span className="hidden md:inline"> Sleep om het model te draaien.</span>
                        </p>
                    </div>
                    
                    <div className="flex gap-2">
                            <div className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center text-zinc-400" title="Draaien">
                              <Rotate3d width={16} height={16} />
                            </div>
                            <div className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center text-zinc-400" title="Inzoomen">
                              <ZoomIn width={16} height={16} />
                            </div>
                    </div>
                </div>

                {/* 3D Model Viewer Container */}
                <div className="w-full h-[500px] lg:h-[600px] bg-[#f24f13] rounded-[2.5rem] border border-transparent relative overflow-hidden group cursor-grab active:cursor-grabbing shadow-inner">
                    <model-viewer 
                      id="sock-3d-model" 
                      src="https://res.cloudinary.com/dqrfaaoie/image/upload/v1766247096/Blender_mb6jzh.glb" 
                      auto-rotate 
                      camera-controls 
                      exposure="1" 
                      shadow-intensity="0.7" 
                      environment-image="neutral" 
                      className="w-full h-full focus:outline-none" 
                      style={{ backgroundColor: 'transparent' }}
                    ></model-viewer>
                </div>
            </section>

            {/* Section 3.5: Material Features */}
            <section className="py-24 border-b border-black/5">
                <div className="mb-12 text-center max-w-2xl mx-auto">
                    <span className="text-[#f24f13] font-medium text-xs tracking-widest uppercase mb-4 block">Materiaaleigenschappen</span>
                    <h2 className="text-3xl font-semibold text-black tracking-tight mb-4">De Wetenschap achter Natuurlijkheid.</h2>
                    <p className="text-zinc-500 text-lg">Ontworpen om te voelen, niet alleen om te dragen. De onderscheidende details van de Ensokken biologische katoenmix.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Feature Card 1 */}
                    <div className="group bg-white p-8 rounded-[2rem] border border-black/5 hover:border-[#17a6a6]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#17a6a6]/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#17a6a6]/5 rounded-bl-[4rem] transition-colors group-hover:bg-[#17a6a6]/10"></div>
                        <div className="w-12 h-12 rounded-full bg-[#f0f9f9] text-[#17a6a6] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Wind width={24} height={24} />
                        </div>
                        <h3 className="text-lg font-semibold text-black mb-2">Ademend</h3>
                        <p className="text-sm text-zinc-500 leading-relaxed">Zorgt voor luchtcirculatie door micro-openingen tussen vezels en voorkomt zweten.</p>
                    </div>

                    {/* Feature Card 2 */}
                    <div className="group bg-white p-8 rounded-[2rem] border border-black/5 hover:border-[#f24f13]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#f24f13]/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#f24f13]/5 rounded-bl-[4rem] transition-colors group-hover:bg-[#f24f13]/10"></div>
                        <div className="w-12 h-12 rounded-full bg-[#fff5f2] text-[#f24f13] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <ThermometerSun width={24} height={24} />
                        </div>
                        <h3 className="text-lg font-semibold text-black mb-2">Thermische Balans</h3>
                        <p className="text-sm text-zinc-500 leading-relaxed">Natuurlijke isolatie die zich aanpast aan weersomstandigheden: warm in de winter, koel in de zomer.</p>
                    </div>

                    {/* Feature Card 3 */}
                    <div className="group bg-white p-8 rounded-[2rem] border border-black/5 hover:border-black/20 transition-all duration-300 hover:shadow-lg hover:shadow-black/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-black/5 rounded-bl-[4rem] transition-colors group-hover:bg-black/10"></div>
                        <div className="w-12 h-12 rounded-full bg-zinc-100 text-black flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Feather width={24} height={24} />
                        </div>
                        <h3 className="text-lg font-semibold text-black mb-2">Hypoallergeen</h3>
                        <p className="text-sm text-zinc-500 leading-relaxed">Onbehandelde vezels bieden een zachte textuur die irritatie voorkomt voor de gevoelige huid.</p>
                    </div>

                    {/* Feature Card 4 */}
                    <div className="group bg-white p-8 rounded-[2rem] border border-black/5 hover:border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-[4rem] transition-colors group-hover:bg-purple-500/10"></div>
                        <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Recycle width={24} height={24} />
                        </div>
                        <h3 className="text-lg font-semibold text-black mb-2">Recyclebaar</h3>
                        <p className="text-sm text-zinc-500 leading-relaxed">Laat nul afval achter in de natuur met 100% biologisch afbreekbaar materiaal.</p>
                    </div>
                </div>
            </section>

            {/* Section 4: Most Visited / Collection */}
            <section className="py-24 border-b border-black/5" id="koleksiyon">
                <div className="flex items-end justify-between mb-12 px-2">
                    <div>
                        <h2 className="text-3xl font-semibold text-black tracking-tight mb-2">Meest Geliefd.</h2>
                        <p className="text-zinc-500 text-sm md:text-base">De modellen die onze gebruikers deze week het meest hebben bekeken.</p>
                    </div>
                    <button className="hidden sm:flex items-center gap-2 text-sm font-medium hover:text-[#f24f13] transition-colors group">
                        Alles Bekijken <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Card 1 */}
                    <div className="group cursor-pointer flex flex-col h-full">
                        <div className="aspect-[4/5] bg-white rounded-[2rem] overflow-hidden border border-black/5 relative mb-6 hover:border-black/20 hover:shadow-xl transition-all duration-300">
                            <div className="absolute top-4 left-4 bg-black/5 backdrop-blur-sm border border-black/5 text-black text-[10px] font-bold px-3 py-1.5 rounded-full z-10 uppercase tracking-wide flex items-center gap-1">
                                <TrendingUp width={10} height={10} /> Populair
                            </div>
                            <div className="w-full h-full flex items-center justify-center bg-[#fcfcfc] group-hover:bg-white transition-colors duration-500">
                                <img src="https://i.ibb.co/6RdqX3G0/Chat-GPT-mage-18-Ara-2025-02-52-44.png" loading="lazy" className="w-[70%] object-contain drop-shadow-lg group-hover:scale-110 group-hover:drop-shadow-2xl transition-all duration-500" alt="Essential White" />
                            </div>
                        </div>
                        <div className="flex justify-between items-start px-2">
                            <div>
                                <h3 className="font-semibold text-black text-lg mb-1">Essential White</h3>
                                <p className="text-sm text-zinc-500">Klassieke Serie</p>
                            </div>
                            <span className="text-black font-semibold bg-[#eeebdf] px-3 py-1 rounded-lg text-sm">€26.00</span>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="group cursor-pointer flex flex-col h-full">
                        <div className="aspect-[4/5] bg-white rounded-[2rem] overflow-hidden border border-black/5 relative mb-6 hover:border-black/20 hover:shadow-xl transition-all duration-300">
                            <div className="absolute top-4 left-4 bg-[#f24f13] text-white text-[10px] font-bold px-3 py-1.5 rounded-full z-10 uppercase tracking-wide flex items-center gap-1">
                                <Flame width={10} height={10} /> Best Seller
                            </div>
                            <div className="w-full h-full flex items-center justify-center bg-[#fcfcfc] group-hover:bg-white transition-colors duration-500">
                                <img src="https://i.ibb.co/4wj5mHtM/Chat-GPT-mage-18-Ara-2025-02-57-54.png" loading="lazy" className="w-[70%] object-contain drop-shadow-lg group-hover:scale-110 group-hover:drop-shadow-2xl transition-all duration-500" alt="Midnight Black" />
                            </div>
                        </div>
                        <div className="flex justify-between items-start px-2">
                            <div>
                                <h3 className="font-semibold text-black text-lg mb-1">Midnight Black</h3>
                                <p className="text-sm text-zinc-500">Premium Serie</p>
                            </div>
                            <span className="text-black font-semibold bg-[#eeebdf] px-3 py-1 rounded-lg text-sm">€26.00</span>
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="group cursor-pointer flex flex-col h-full">
                        <div className="aspect-[4/5] bg-white rounded-[2rem] overflow-hidden border border-black/5 relative mb-6 hover:border-black/20 hover:shadow-xl transition-all duration-300">
                                <div className="absolute top-4 left-4 bg-[#17a6a6] text-white text-[10px] font-bold px-3 py-1.5 rounded-full z-10 uppercase tracking-wide flex items-center gap-1">
                                <Star width={10} height={10} /> Keuze van de Redactie
                            </div>
                            <div className="w-full h-full flex items-center justify-center bg-[#fcfcfc] group-hover:bg-white transition-colors duration-500">
                                <img src="https://i.ibb.co/HT9tPqGp/Chat-GPT-mage-18-Ara-2025-03-02-28.png" loading="lazy" className="w-[70%] object-contain drop-shadow-lg group-hover:scale-110 group-hover:drop-shadow-2xl transition-all duration-500" alt="Sunset Orange" />
                            </div>
                        </div>
                        <div className="flex justify-between items-start px-2">
                            <div>
                                <h3 className="font-semibold text-black text-lg mb-1">Sunset Orange</h3>
                                <p className="text-sm text-zinc-500">Trendkleuren</p>
                            </div>
                            <span className="text-black font-semibold bg-[#eeebdf] px-3 py-1 rounded-lg text-sm">€26.00</span>
                        </div>
                    </div>
                </div>
                
                <button className="w-full mt-8 py-4 bg-white border border-black/5 rounded-xl font-medium sm:hidden flex items-center justify-center gap-2 text-sm hover:bg-gray-50 transition-colors">
                    Alles Bekijken <ArrowRight width={16} height={16} />
                </button>
            </section>
        </div>
    </main>
  );
}
