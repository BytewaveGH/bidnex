import TopHeader from "../components/TopHeader";
import HeroBanner from "../components/HeroBanner";
import ItemCard from "../components/ItemCard";
import Footer from "../components/Footer";
import { buildMockItems } from "../data/items";

export default function Home() {
  const items = buildMockItems();

  const featured = items.slice(0, 3);
  const endingSoon = items.slice(3, 6);

  return (
    <div className="min-h-screen bg-white">
      <TopHeader />

      {/* HERO */}
      <HeroBanner
        title="Discover Amazing Deals & Bid Smart, Win Big, & Shop With Confidence."
        subtitle="BidChale brings real-time auctions to Ghana. Find deals, set max bids, and win!"
        ctaText="Start Bidding"
      />

      {/* FEATURED ITEMS */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Featured Items</h2>
          <div className="flex gap-2">
            <button className="h-9 w-9 rounded-full border border-gray-200 bg-white">
              ‹
            </button>
            <button className="h-9 w-9 rounded-full border border-gray-200 bg-white">
              ›
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-black py-12 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-lg font-semibold">How It Works</h2>
          <p className="mt-2 text-center text-sm text-white/70">
            The easiest way to bid and win on BidChale.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n: 1, t: "Create An Account" },
              { n: 2, t: "Browse And Bid" },
              { n: 3, t: "Win Auctions" },
              { n: 4, t: "Pay & Receive" },
            ].map((s) => (
              <div
                key={s.n}
                className="rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-black font-semibold">
                  {s.n}
                </div>
                <div className="font-semibold">{s.t}</div>
                <div className="mt-1 text-sm text-white/70">
                  UI-only placeholder text.
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LIVE AUCTIONS ENDING SOON */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Live Auctions Ending Soon</h2>
            <p className="text-sm text-gray-500">Don’t miss out on these deals.</p>
          </div>
          <button className="text-sm font-semibold underline">See all</button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {endingSoon.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>

    
      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="overflow-hidden rounded-3xl bg-black text-white">
          <div className="grid gap-6 p-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h3 className="text-2xl font-semibold">Delivery Right To Your Doorstep</h3>
              <p className="mt-2 text-sm text-white/70">
                Win an item and we’ll help you get it delivered (UI-only).
              </p>
              <button className="mt-5 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black">
                Learn More
              </button>
            </div>
            <div className="hidden lg:block">
              <div className="h-56 w-full rounded-2xl bg-white/10" />
            </div>
          </div>
        </div>
      </section>

      {/* SHOP BY CATEGORY */}
      <section className="mx-auto max-w-6xl px-4 pb-10">
        <h2 className="text-lg font-semibold">Shop By Category</h2>
        <p className="mt-1 text-sm text-gray-500">
          Find items faster by category.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "Electronics",
            "Clothing",
            "Home/Kitchen",
            "Office Products",
            "Phones & Accessories",
            "Car Parts",
          ].map((c) => (
            <div
              key={c}
              className="rounded-2xl border border-gray-200 bg-white p-6"
            >
              <div className="font-semibold">{c}</div>
              <div className="mt-1 text-sm text-gray-500">
                UI-only placeholder.
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="text-lg font-semibold">Frequently Asked Questions</h2>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl bg-black p-8 text-white">
            <div className="text-sm text-white/70">Still Have Questions?</div>
            <div className="mt-2 text-xl font-semibold">We’re here to help.</div>
            <button className="mt-5 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black">
              Contact Support
            </button>
          </div>

          <div className="space-y-3">
            {[
              "What is BidChale?",
              "How do I bid?",
              "How do I get started?",
              "How do I get paid?",
            ].map((q) => (
              <div
                key={q}
                className="rounded-2xl border border-gray-200 bg-white p-5"
              >
                <div className="font-semibold">{q}</div>
                <div className="mt-1 text-sm text-gray-500">
                  UI-only placeholder answer.
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}