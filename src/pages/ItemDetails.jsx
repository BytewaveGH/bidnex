import { useParams } from "react-router-dom";
import TopHeader from "../components/TopHeader";
import Footer from "../components/Footer";

export default function ItemDetails() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50">
      <TopHeader />

      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-2">
          
          {/* Image */}
          <div className="rounded-2xl bg-white p-6">
            <div className="aspect-square rounded-xl bg-gray-100" />
          </div>

          {/* Details */}
          <div className="rounded-2xl bg-white p-6">
            <h1 className="text-2xl font-semibold">Apple iPhone 16 Pro Max</h1>

            <p className="mt-2 text-sm text-gray-500">Item ID: {id}</p>

            <div className="mt-4 space-y-1 text-sm">
              <div>MKT PR: GHS 267.00</div>
              <div>CURRENT BID: GHS 100.00</div>
              <div className="text-green-600 font-semibold">New / Like New</div>
            </div>

            <div className="mt-6">
              <button className="w-full rounded-xl bg-black py-3 font-semibold text-white">
                Place Bid
              </button>
            </div>

            <p className="mt-6 text-sm text-gray-600">
              UI-only placeholder description. Full item details, bidding
              history, seller info, and location will come from the backend
              later.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
