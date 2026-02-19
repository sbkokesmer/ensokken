// Product data generation logic matching the provided HTML
export interface Product {
  id: number;
  name: string;
  price: string;
  priceValue: number;
  image: string;
  gallery: string[];
  colors: string[];
  badge: string;
  description: string;
}

const imageMap: Record<string, string> = {
  "#f0f0f0": "https://images.pexels.com/photos/4495705/pexels-photo-4495705.jpeg?auto=compress&cs=tinysrgb&w=800", // White/Cream equivalent
  "#1a1a1a": "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800", // Black/Dark equivalent
  "#f24f13": "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800", // Orange equivalent
  "#17a6a6": "https://images.pexels.com/photos/11220213/pexels-photo-11220213.jpeg?auto=compress&cs=tinysrgb&w=800"  // Turquoise/Green equivalent
};

// Renk kodlarını isimlere çeviren harita
export const colorNames: Record<string, string> = {
  "#f0f0f0": "Crème",
  "#1a1a1a": "Zwart",
  "#f24f13": "Oranje",
  "#17a6a6": "Turkoois"
};

// Renk ismini getiren yardımcı fonksiyon
export const getColorName = (hex: string) => colorNames[hex] || hex;

const baseImages = [imageMap["#f0f0f0"], imageMap["#f24f13"], imageMap["#1a1a1a"]];

const descriptions = [
  "Speciaal ontworpen voor comfort de hele dag. Dit stuk weerspiegelt Scandinavisch minimalisme en biedt zowel elegantie als duurzaamheid met zijn ademende biologische katoenstructuur en versterkte hiel.",
  "Maak bij elke stap het verschil met levendige kleuren en een zachte textuur. Dankzij speciale garentechnologie behouden de kleuren langdurig hun helderheid.",
  "Een moderne interpretatie van de klassieke stijl. Gemaakt van de hoogste kwaliteit katoengarens, omhult dit model je voet zonder te knellen."
];

export const products: Product[] = Array.from({ length: 40 }, (_, i) => {
  const id = i + 1;
  const type = id % 3;
  let colors: string[] = [];
  let name = "";
  let priceVal = 26;
  let badge = "";
  let productImages: string[] = [];

  if (type === 0) {
    name = "Essential White";
    colors = ["#f0f0f0", "#1a1a1a", "#f24f13"];
    productImages = [imageMap["#f0f0f0"], imageMap["#1a1a1a"], imageMap["#f24f13"]];
  } else if (type === 1) {
    name = "Sunset Orange";
    colors = ["#f24f13", "#f0f0f0"];
    if (id % 5 === 0) badge = "Best Seller";
    priceVal = 28;
    productImages = [imageMap["#f24f13"], imageMap["#f0f0f0"], imageMap["#1a1a1a"]];
  } else {
    name = "Midnight Black";
    colors = ["#1a1a1a", "#17a6a6"];
    if (id % 7 === 0) badge = "Nieuw";
    priceVal = 30;
    productImages = [imageMap["#1a1a1a"], imageMap["#17a6a6"], imageMap["#f0f0f0"]];
  }

  return {
    id,
    name: `${name} ${id < 10 ? '0' + id : id}`,
    price: `€${priceVal}.00`,
    priceValue: priceVal,
    image: baseImages[type],
    gallery: productImages,
    colors,
    badge,
    description: descriptions[type]
  };
});
