"use client";
import Link from "next/link";
import { Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-black/5 pt-16 pb-8 mt-auto relative z-10" id="footer">
        <div className="max-w-7xl mx-auto px-6">
            {/* Top Section: Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                {/* Col 1: Brand */}
                <div className="space-y-4">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
                            <span className="font-semibold text-[#eeebdf] text-xs">E</span>
                        </div>
                        <span className="font-semibold text-base tracking-tight text-black">Ensokken.</span>
                    </div>
                    <p className="text-zinc-500 text-sm leading-relaxed">
                        Het ontmoetingspunt van Scandinavisch minimalisme en organisch comfort.
                    </p>
                </div>
                
                {/* Col 2: Shop */}
                <div>
                    <h4 className="font-semibold text-black text-sm mb-4">Winkelen</h4>
                    <ul className="space-y-3 text-sm text-zinc-500">
                        <li><Link href="/collection" className="hover:text-black transition-colors text-left">Nieuw Binnen</Link></li>
                        <li><Link href="/collection" className="hover:text-black transition-colors text-left">Sokken</Link></li>
                        <li><Link href="/collection" className="hover:text-black transition-colors text-left">Pakketten</Link></li>
                    </ul>
                </div>

                {/* Col 3: Support */}
                <div>
                    <h4 className="font-semibold text-black text-sm mb-4">Ondersteuning</h4>
                    <ul className="space-y-3 text-sm text-zinc-500">
                        <li><Link href="/iletisim" className="hover:text-black transition-colors text-left">Contact</Link></li>
                        <li><button className="hover:text-black transition-colors text-left">Verzending & Retour</button></li>
                        <li><button className="hover:text-black transition-colors text-left">Veelgestelde Vragen</button></li>
                    </ul>
                </div>

                {/* Col 4: Newsletter */}
                <div>
                    <h4 className="font-semibold text-black text-sm mb-4">Nieuwsbrief</h4>
                    <p className="text-zinc-500 text-sm mb-4">Blijf op de hoogte van nieuwe collecties.</p>
                    <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                        <input type="email" placeholder="E-mail" className="w-full bg-[#f9f9f9] border border-black/5 rounded-lg px-3 py-2 text-sm focus:border-black outline-none transition-colors" />
                        <button className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-[#222] transition-colors">Inschrijven</button>
                    </form>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="border-t border-black/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-xs text-zinc-400">© 2024 Ensokken Inc. Alle rechten voorbehouden.</p>
                <div className="flex gap-6">
                    <a href="#" className="text-zinc-400 hover:text-black transition-colors"><Instagram width={16} height={16} /></a>
                    <a href="#" className="text-zinc-400 hover:text-black transition-colors"><Twitter width={16} height={16} /></a>
                </div>
            </div>
        </div>
    </footer>
  );
}
