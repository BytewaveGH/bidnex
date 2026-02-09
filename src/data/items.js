import allItemsHero from "../assets/images/allitem-image.png";
import electronicsHero from "../assets/images/electronics.png";
import officeHero from "../assets/images/office.png";
import homeKitchenHero from "../assets/images/home-and kitchen.png";
import phonesHero from "../assets/images/phones&accessories.png";
import carPartsHero from "../assets/images/cars-parts.png";
import fashionHero from "../assets/images/fashion.png";

export const HERO_BY_CATEGORY = {
  All: {
    title: "ALL ITEMS",
    imageUrl: allItemsHero,
  },
  Electronics: {
    title: "ELECTRONICS",
    imageUrl: electronicsHero,
  },
  "Office Products": {
    title: "OFFICE PRODUCTS",
    imageUrl: officeHero,
  },
  "Home/Kitchen": {
    title: "HOME/KITCHEN",
    imageUrl: homeKitchenHero,
  },
  "Phones & Accessories": {
    title: "PHONES & ACCESSORIES",
    imageUrl: phonesHero,
  },
  "Car Parts": {
    title: "CAR PARTS",
    imageUrl: carPartsHero,
  },
  Clothing: {
    title: "CLOTHING",
    imageUrl: fashionHero,
  },
};

export function moneyNum(ghs) {
  return Number(String(ghs).replace(/[^\d.]/g, "")) || 0;
}

export function buildMockItems() {
  const categories = Object.keys(HERO_BY_CATEGORY).filter((c) => c !== "All");

  const titles = [
    "Apple iPhone 16 Pro Max",
    "HP Laptop 15”",
    "Office Chair",
    "Kitchen Blender",
    "Samsung TV 55”",
    "Car Jumper Cable",
    "Nike Sneakers",
    "Wireless Headset",
  ];


  const images = [
    "https://images.unsplash.com/photo-1603898037225-0f8a10d4a730?auto=format&fit=crop&w=900&q=60",
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=60",
    "https://images.unsplash.com/photo-1582582621959-48d27397dc04?auto=format&fit=crop&w=900&q=60",
    "https://images.unsplash.com/photo-1518441902117-f0a87d9d1f5c?auto=format&fit=crop&w=900&q=60",
  ];

  return Array.from({ length: 24 }).map((_, i) => {
    const conditionType = i % 3 === 0 ? "new" : i % 3 === 1 ? "good" : "asIs";
    const conditionLabel =
      conditionType === "new"
        ? "New/Like New"
        : conditionType === "good"
        ? "Good Condition"
        : "As is";

    const category = categories[i % categories.length];
    const market = 40 + (i % 10) * 80;
    const bid = 60 + (i % 6) * 25;
    const endingHours = 2 + (i % 30);

return {
  id: i + 1,
  title: titles[i % titles.length],
  category,
  marketPrice: `GHS ${market}.00`,
  currentBid: `GHS ${bid}.00`,
  timeLeft: `${Math.ceil(endingHours / 24)} dy`,
  endingHours,
  conditionType,
  conditionLabel,
  imageUrl: images[i % images.length],
  qty: 1,
  bidders: 12,
  endsIn: "1 DAYS 2:20:11",
  description: "Later this comes from backend.",
};
  });
}