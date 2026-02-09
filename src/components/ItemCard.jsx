import { useNavigate } from "react-router-dom";

import heartIcon from "../assets/icons/icons8-heart-24.png";
import timerIcon from "../assets/icons/icons8-timer-30.png";
import bidderIcon from "../assets/icons/bidderprofile.png";

function badgeClass(type) {
  if (type === "NewLikeNew") return "bg-[#099137]";
  if (type === "Good") return "bg-[#003C71]";
  if (type === "AsIs") return "bg-[#8E8E93]";
  return "bg-gray-500";
}

export default function ItemCard({ item }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/items/${item.id}`)}
      className="cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md"
    >
      <div className="relative bg-gray-100 h-80">
        <span
          className={`absolute right-0 top-3 rounded-bl-xl px-3 py-2 text-xs font-semibold text-white ${badgeClass(
            item.conditionType
          )}`}
        >
          {item.conditionLabel}
        </span>

<div className="p-6">
  <div className="flex justify-center">
    <img
      src={item.imageUrl}
      alt={item.title}
      className="object-contain -mt-8"
      style={{ width: 345, height: 345 }}
    />
  </div>
</div>
        <span className="absolute bottom-0 left-0 rounded-tr-xl bg-gray-200 px-3 py-2 text-xs text-gray-800">
          {item.qty ?? 1} qty
        </span>

        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-3 right-3 grid h-8 w-8 place-items-center rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
        >
          <img src={heartIcon} alt="Favorite" className="h-4 w-4" />
        </button>
      </div>

      <div className="px-5 pb-5 pt-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-2 text-xs text-gray-800">
            <img src={timerIcon} alt="Timer" className="h-4 w-4" />
            {item.endsIn || "1 DAYS 2:20:11"}
          </span>

          <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-2 text-xs text-gray-800">
            <img src={bidderIcon} alt="Bidders" className="h-4 w-4" />
            {item.bidders ?? 12} BIDDERS
          </span>
        </div>

        <h3 className="text-lg font-semibold text-gray-900">
          {item.title}
        </h3>

        <div className="mt-2 text-sm text-gray-600">
          <div>MKT PR: {item.marketPrice}</div>
          <div className="font-semibold text-gray-900">
            CURRENT BID: {item.currentBid}
          </div>
        </div>


        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="mt-4 w-full rounded-xl bg-black py-3 text-sm font-semibold text-white"
        >
          Bid {item.currentBid}
        </button>

        <div className="mt-4 flex gap-3">
          <input
            onClick={(e) => e.stopPropagation()}
            className="h-11 flex-1 rounded-xl border border-gray-200 px-4 text-sm outline-none focus:ring-2 focus:ring-gray-200"
            placeholder="GHS0.00"
          />
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="h-11 rounded-xl bg-[#F2C94C] px-4 text-sm font-semibold text-black"
          >
            Set Max Bid
          </button>
        </div>
      </div>
    </div>
  );
}
