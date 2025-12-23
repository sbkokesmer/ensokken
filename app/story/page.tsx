export default function Story() {
  return (
    <main className="flex-1 pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16 space-y-6">
          <span className="text-[#f24f13] font-medium tracking-wider uppercase text-sm">Hakkımızda</span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Kuzeyin sadeliği, <br />
            doğanın dokunuşu.
          </h1>
        </div>

        <div className="aspect-video w-full rounded-2xl overflow-hidden mb-16 bg-zinc-100">
          <img 
            src="https://images.pexels.com/photos/3735641/pexels-photo-3735641.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
            alt="Production Process" 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-12 text-lg leading-relaxed text-zinc-700">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-black">Başlangıç</h3>
            <p>
              Ensokken, 2024 yılında basit bir fikirle doğdu: Günlük hayatta en çok kullandığımız ama en az önem verdiğimiz giysi parçası olan çorapları, hak ettiği kaliteye kavuşturmak.
            </p>
            <p>
              İskandinav tasarım felsefesini benimseyerek, "az ama öz" prensibiyle yola çıktık. Karmaşık desenlerden uzak, fonksiyonel ve estetik ürünler tasarlıyoruz.
            </p>
          </div>
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-black">Sürdürülebilirlik</h3>
            <p>
              Üretim sürecimizin her adımında doğaya saygı duyuyoruz. Kullandığımız pamuk %100 GOTS sertifikalı organiktir. Bu, üretimde zararlı kimyasalların kullanılmadığı ve su tüketiminin minimize edildiği anlamına gelir.
            </p>
            <p>
              Ambalajlarımızda plastik kullanmıyoruz. Geri dönüştürülmüş kağıt ve biyolojik olarak parçalanabilen malzemeler tercih ediyoruz.
            </p>
          </div>
        </div>

        <div className="mt-24 bg-white p-12 rounded-3xl text-center space-y-6">
          <h2 className="text-3xl font-bold">Değerlerimiz</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
            <div>
              <div className="w-12 h-12 bg-[#eeebdf] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🌿</div>
              <h4 className="font-bold mb-2">Organik</h4>
              <p className="text-sm text-zinc-600">Doğal ve sertifikalı hammadde.</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-[#eeebdf] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✨</div>
              <h4 className="font-bold mb-2">Kalite</h4>
              <p className="text-sm text-zinc-600">Uzun ömürlü kullanım.</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-[#eeebdf] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🤝</div>
              <h4 className="font-bold mb-2">Adil</h4>
              <p className="text-sm text-zinc-600">Etik üretim standartları.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
