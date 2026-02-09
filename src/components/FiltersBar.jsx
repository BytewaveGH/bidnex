export default function FiltersBar({ filters, onChange }) {
  function setField(name, value) {
    onChange((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <section className="mx-auto max-w-6xl px-4">
      <div className="-mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <select
            className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none"
            value={filters.category}
            onChange={(e) => setField("category", e.target.value)}
          >
            <option value="All">Category</option>
            <option value="Electronics">Electronics</option>
            <option value="Office Products">Office Products</option>
            <option value="Home/Kitchen">Home/Kitchen</option>
            <option value="Phones & Accessories">Phones & Accessories</option>
            <option value="Car Parts">Car Parts</option>
            <option value="Clothing">Clothing</option>
          </select>

          <select
            className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none"
            value={filters.condition}
            onChange={(e) => setField("condition", e.target.value)}
          >
            <option value="All">Condition</option>
            <option value="new">New/Like New</option>
            <option value="good">Good Condition</option>
            <option value="asIs">As is</option>
          </select>

          <select
            className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none"
            value={filters.price}
            onChange={(e) => setField("price", e.target.value)}
          >
            <option value="All">Mkt Pr</option>
            <option value="Under50">Under GHS50</option>
            <option value="50to100">GHS50 to GHS100</option>
            <option value="100to300">GHS100 to GHS300</option>
            <option value="300plus">GHS300+</option>
          </select>

          <select
            className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none"
            value={filters.sort}
            onChange={(e) => setField("sort", e.target.value)}
          >
            <option value="EndingLatest">Ending Latest</option>
            <option value="EndingSoonest">Ending Soonest</option>
            <option value="PriceLow">Price: Low to High</option>
            <option value="PriceHigh">Price: High to Low</option>
          </select>
        </div>

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={() =>
              onChange({
                category: "All",
                condition: "All",
                price: "All",
                sort: "EndingLatest",
              })
            }
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm"
          >
            Clear filters
          </button>
        </div>
      </div>
    </section>
  );
}