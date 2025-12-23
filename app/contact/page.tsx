"use client";
import { Mail, MapPin, Phone } from "lucide-react";

export default function Contact() {
  return (
    <main className="flex-1 pt-24 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">İletişime Geçin</h1>
              <p className="text-zinc-600 text-lg">
                Sorularınız, önerileriniz veya işbirlikleri için bize ulaşın. Ekibimiz en kısa sürede size dönüş yapacaktır.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4 p-6 bg-white rounded-2xl">
                <div className="w-10 h-10 bg-[#eeebdf] rounded-full flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">E-posta</h3>
                  <p className="text-zinc-600">hello@ensokken.com</p>
                  <p className="text-zinc-600">support@ensokken.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white rounded-2xl">
                <div className="w-10 h-10 bg-[#eeebdf] rounded-full flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Ofis</h3>
                  <p className="text-zinc-600">
                    Maslak Mah. Büyükdere Cad.<br />
                    No: 123, Sarıyer<br />
                    İstanbul, Türkiye
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white rounded-2xl">
                <div className="w-10 h-10 bg-[#eeebdf] rounded-full flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Telefon</h3>
                  <p className="text-zinc-600">+90 (212) 555 0123</p>
                  <p className="text-sm text-zinc-400 mt-1">Pzt-Cum: 09:00 - 18:00</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-black/5">
            <h3 className="text-2xl font-bold mb-6">Mesaj Gönder</h3>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700">Adınız</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-xl bg-[#f9f9f9] border border-black/5 focus:border-black focus:ring-0 outline-none transition-colors"
                    placeholder="Ad Soyad"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700">E-posta</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-3 rounded-xl bg-[#f9f9f9] border border-black/5 focus:border-black focus:ring-0 outline-none transition-colors"
                    placeholder="ornek@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Konu</label>
                <select className="w-full px-4 py-3 rounded-xl bg-[#f9f9f9] border border-black/5 focus:border-black focus:ring-0 outline-none transition-colors">
                  <option>Genel Bilgi</option>
                  <option>Sipariş Durumu</option>
                  <option>İade ve Değişim</option>
                  <option>İşbirliği</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Mesajınız</label>
                <textarea 
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl bg-[#f9f9f9] border border-black/5 focus:border-black focus:ring-0 outline-none transition-colors resize-none"
                  placeholder="Size nasıl yardımcı olabiliriz?"
                ></textarea>
              </div>

              <button className="w-full bg-black text-white font-medium py-4 rounded-xl hover:bg-[#f24f13] transition-colors duration-300">
                Gönder
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
