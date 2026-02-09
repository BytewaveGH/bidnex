import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import TopHeader from "../components/TopHeader";
import HeroBanner from "../components/HeroBanner";
import FiltersBar from "../components/FiltersBar";
import ItemCard from "../components/ItemCard";
import Footer from "../components/Footer";

import { HERO_BY_CATEGORY, moneyNum } from "../data/items";


import iphone16 from "../assets/images/iphone16.png";

export default function AllItems() {
  const location = useLocation();
  const navigate = useNavigate();

  const url = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const urlCategory = url.get("category") || "All";
  const urlQ = (url.get("q") || "").trim();

  const [filters, setFilters] = useState({
    category: "All",
    condition: "All",
    price: "All",
    sort: "EndingLatest",
  });

  
  const ITEMS_PER_PAGE = 9;
  const TOTAL_PAGES = 30;
  const [page, setPage] = useState(3);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, category: urlCategory }));
  }, [urlCategory]);

  useEffect(() => {
    const nextQs = new URLSearchParams(location.search);

    if (filters.category === "All") nextQs.delete("category");
    else nextQs.set("category", filters.category);

    const nextUrl = nextQs.toString()
      ? `/items?${nextQs.toString()}`
      : "/items";

    if (nextUrl !== `/items${location.search}`) {
      navigate(nextUrl, { replace: true });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.category]);

  const hero = HERO_BY_CATEGORY[filters.category] || HERO_BY_CATEGORY.All;


  // iPhone 16 mock items 
  
  const items = useMemo(() => {
    const conditions = [
      { type: "NewLikeNew", label: "New/Like New" },
      { type: "Good", label: "Good Condition" },
      { type: "AsIs", label: "As Is" },
    ];

    const total = TOTAL_PAGES * ITEMS_PER_PAGE;

    return Array.from({ length: total }, (_, i) => {
      const c = conditions[i % conditions.length];

      return {
        id: String(i + 1),
        title: "Apple iPhone 16 Pro Max",
        category: "Phones",
        conditionType: c.type,
        conditionLabel: c.label,
        marketPrice: "GHS 267.00",
        currentBid: "GHS 100.00",
        bidStep: "GHS10.00",
        endingHours: 36,
        timeLeft: "1 DAYS 22:01:11",
        bidders: 12,
        qty: 1,
        imageUrl: iphone16, 
      };
    });
  }, [ITEMS_PER_PAGE]);

  const visibleItems = useMemo(() => {
    let list = [...items];

    // Search
    if (urlQ) {
      const q = urlQ.toLowerCase();
      list = list.filter((it) =>
        `${it.title} ${it.category} ${it.conditionLabel}`.toLowerCase().includes(q),
      );
    }

    // Category
    if (filters.category !== "All") {
      list = list.filter((it) => it.category === filters.category);
    }

    // Condition
    if (filters.condition !== "All") {
      list = list.filter((it) => it.conditionType === filters.condition);
    }

    // Price
    if (filters.price !== "All") {
      list = list.filter((it) => {
        const p = moneyNum(it.marketPrice);
        if (filters.price === "Under50") return p < 50;
        if (filters.price === "50to100") return p >= 50 && p <= 100;
        if (filters.price === "100to300") return p >= 100 && p <= 300;
        if (filters.price === "300plus") return p >= 300;
        return true;
      });
    }

    // Sort
    if (filters.sort === "EndingSoonest")
      list.sort((a, b) => a.endingHours - b.endingHours);
    else if (filters.sort === "EndingLatest")
      list.sort((a, b) => b.endingHours - a.endingHours);
    else if (filters.sort === "PriceLow")
      list.sort((a, b) => moneyNum(a.marketPrice) - moneyNum(b.marketPrice));
    else if (filters.sort === "PriceHigh")
      list.sort((a, b) => moneyNum(b.marketPrice) - moneyNum(a.marketPrice));

    return list;
  }, [items, filters, urlQ]);


  const totalFiltered = visibleItems.length;
  const computedTotalPages = Math.max(1, Math.ceil(totalFiltered / ITEMS_PER_PAGE));

  useEffect(() => {
    
    setPage((p) => Math.min(p, computedTotalPages));
  }, [computedTotalPages]);

  const start = (page - 1) * ITEMS_PER_PAGE;
  const pageItems = visibleItems.slice(start, start + ITEMS_PER_PAGE);

  const pageNumbers = useMemo(() => {
    const total = computedTotalPages;
    const head = [1, 2].filter((n) => n <= total);
    const around = [page - 1, page, page + 1].filter((n) => n >= 1 && n <= total);
    const tail = [total - 2, total - 1, total].filter((n) => n >= 1);

    const set = new Set([...head, ...around, ...tail]);
    return Array.from(set).sort((a, b) => a - b);
  }, [page, computedTotalPages]);

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{ fontFamily: "Roboto, system-ui, -apple-system, Segoe UI, Arial, sans-serif" }}
    >
      <TopHeader />

      <HeroBanner title={hero.title} imageUrl={hero.imageUrl} />

      <FiltersBar filters={filters} onChange={setFilters} />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-4 text-sm text-gray-600">
          Showing{" "}
          <span className="font-semibold text-gray-900">{totalFiltered}</span>{" "}
          items {urlQ && <span>(search: “{urlQ}”)</span>}
        </div>

    
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pageItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>

        
        <div className="mt-10 flex items-center justify-center gap-4 text-sm">
          <div className="text-gray-600">
            Page {page} of {computedTotalPages}
          </div>

          <div className="flex items-center gap-2">
            {pageNumbers.map((n, idx) => {
              const prev = pageNumbers[idx - 1];
              const showDots = prev && n - prev > 1;

              return (
                <span key={n} className="flex items-center gap-2">
                  {showDots ? <span className="px-1 text-gray-400">…</span> : null}

                  <button
                    type="button"
                    onClick={() => setPage(n)}
                    className={
                      n === page
                        ? "h-8 w-8 rounded-md bg-gray-900 text-white text-xs font-semibold"
                        : "h-8 w-8 rounded-md border border-gray-200 bg-white text-gray-700 text-xs font-semibold hover:bg-gray-50"
                    }
                  >
                    {n}
                  </button>
                </span>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={
                page === 1
                  ? "h-9 rounded-md border border-gray-200 bg-white px-4 text-xs font-semibold text-gray-400 cursor-not-allowed"
                  : "h-9 rounded-md border border-gray-200 bg-white px-4 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              }
            >
              Previous
            </button>

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(computedTotalPages, p + 1))}
              disabled={page === computedTotalPages}
              className={
                page === computedTotalPages
                  ? "h-9 rounded-md border border-gray-200 bg-white px-4 text-xs font-semibold text-gray-400 cursor-not-allowed"
                  : "h-9 rounded-md border border-gray-200 bg-white px-4 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              }
            >
              Next
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}