import { useState } from "react";

import bg from "../assets/nav/bg.jpg";
import electronics from "../assets/nav/icon-electronics.png";
import office from "../assets/nav/icon-office.png";
import clothing from "../assets/nav/icon-clothing.png";
import home from "../assets/nav/icon-home.png";
import phones from "../assets/nav/icon-phones.png";
import car from "../assets/nav/icon-car.png";

// CATEGORIES// 

const CATEGORIES = [
  {
    name: "Electronics",
    desc: "Find monitors, TVs, headsets, etc",
    icon: electronics,
  },
  {
    name: "Office Products",
    desc: "Find office chairs, lamps, desks, etc",
    icon: office,
  },
  {
    name: "Clothing",
    desc: "Find shirts, sneakers, dresses, etc",
    icon: clothing,
  },
  {
    name: "Phones & Accessories",
    desc: "Find phones, cases, chargers, etc",
    icon: phones,
  },
  {
    name: "Home/Kitchen",
    desc: "Find air fryer, duvet, utensils, etc",
    icon: home,
  },
  {
    name: "Car Parts",
    desc: "Find shaft, brake pads, jumper etc",
    icon: car,
  },
];

export default function CategoriesMenu({ onSelect }) {
  const [active, setActive] = useState(CATEGORIES[0]);

  return (
    <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">

      {/* LEFT – CATEGORY LIST */}
      <div className="col-span-2 p-5">
        <div className="grid grid-cols-2 gap-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onMouseEnter={() => setActive(cat)}
              onClick={() => onSelect(cat.name)}
              className={`flex items-start gap-3 rounded-xl p-4 text-left transition
                ${
                  active.name === cat.name
                    ? "bg-gray-100"
                    : "hover:bg-gray-50"
                }
              `}
            >
              <img
                src={cat.icon}
                alt={cat.name}
                className="h-8 w-8 object-contain"
              />
              <div>
                <div className="font-semibold text-gray-900">
                  {cat.name}
                </div>
                <div className="text-xs text-gray-500">{cat.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      
      <div className="relative overflow-hidden">

        {/* Background */}
        <img
          src={bg}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />

        {/* Category Image */}
        <img
          src={active.icon}
          alt={active.name}
          className="
            absolute right-6 top-1/2
            h-48 w-48
            -translate-y-1/2
            scale-[1.8]
            object-contain
            drop-shadow-[0_25px_50px_rgba(0,0,0,0.6)]
          "
        />
      </div>
    </div>
  );
}
