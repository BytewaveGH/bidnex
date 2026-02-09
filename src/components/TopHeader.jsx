import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import CategoriesMenu from "./CategoriesMenu";

import heartIcon from "../assets/icons/icons8-heart-24.png";
import profileIcon from "../assets/icons/icons8-test-account-32.png";

export default function TopHeader() {
  const [openCats, setOpenCats] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const qs = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const currentCategory = qs.get("category") || "All";
  const currentQ = qs.get("q") || "";

 
  const search = currentQ;

  function goToCategory(name) {
    const nextQs = new URLSearchParams(location.search);

    if (name === "All") nextQs.delete("category");
    else nextQs.set("category", name);

    navigate(`/items?${nextQs.toString()}`);
  }

  function onSearchChange(value) {
    const nextQs = new URLSearchParams(location.search);

    if (!value.trim()) nextQs.delete("q");
    else nextQs.set("q", value);

    navigate(`/items?${nextQs.toString()}`, { replace: true });
  }

  return (
    <header className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-4">

        {/* top row */}
        <div className="flex items-center gap-4">
          <Link to="/items" className="text-lg font-extrabold tracking-wide">
            BIDCHALE
          </Link>

          <div className="flex-1">
            <div className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2">
              <input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-transparent text-sm outline-none"
                placeholder="Search for anything ....."
              />
              {search.trim() && (
                <button
                  type="button"
                  className="text-xs text-gray-500 hover:text-gray-900"
                  onClick={() => onSearchChange("")}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative rounded-full p-2 hover:bg-gray-100">
              <img src={heartIcon} alt="Wishlist" className="h-6 w-6" />
              <span className="absolute -right-1 -top-1 rounded-full bg-black px-1.5 text-xs text-white">
                0
              </span>
            </button>

            <button className="rounded-full p-2 hover:bg-gray-100">
              <img src={profileIcon} alt="Profile" className="h-8 w-8" />
            </button>
          </div>
        </div>

        {/* nav row */}
        <div className="relative mt-4">
          <div className="flex items-center justify-center gap-10 rounded-full bg-black px-6 py-3 text-sm text-white/90">
            <button
              className="hover:text-white"
              onClick={() => {
                setOpenCats(false);
                navigate("/items");
              }}
            >
              All Items
            </button>

            <button
              className="font-semibold text-white"
              onClick={() => setOpenCats((v) => !v)}
            >
              Categories
            </button>

            <button className="hover:text-white">Buy Now</button>
            <button className="hover:text-white">Popular</button>
          </div>

          {/* dropdown */}
          {openCats && (
            <>
              
              <button
                className="fixed inset-0 z-10 cursor-default"
                onClick={() => setOpenCats(false)}
                aria-label="Close categories"
              />

              <div className="absolute left-1/2 top-14 z-20 w-[860px] -translate-x-1/2">
                <CategoriesMenu
                  currentCategory={currentCategory}
                  onSelect={(name) => {
                    goToCategory(name);
                    setOpenCats(false);
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}