import messageIcon from "../assets/icons/message-icon.png";

export default function AuthLayout({
  brand = "BidChale",
  title,
  subtitle,
  children,

  
  leftImageUrl = "/images/signup.png",
}) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-6">
      
      
      <div className="w-full max-w-[1440px] bg-white">
        <div className="w-full p-[20px]">
          <div className="grid w-full gap-[20px] lg:grid-cols-2">

            {/* LEFT IMAGE PANEL */}
            <div className="relative overflow-hidden rounded-[30px] h-[520px] lg:h-[984px] w-full">
              <img
                src={leftImageUrl}
                alt={brand}
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: "50% 20%" }}
              />

              <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-black/60" />

              <div className="absolute left-8 top-8 text-white">
                <div
                  className="text-2xl font-extrabold tracking-wide"
                  style={{
                    fontFamily:
                      "Roboto, system-ui, -apple-system, Segoe UI, Arial, sans-serif",
                  }}
                >
                  {brand.toUpperCase()}
                </div>
              </div>

              {/* Quote card */}
              <div className="absolute left-1/2 bottom-8 -translate-x-1/2">
                <div className="flex flex-col gap-3 h-[249.65px] w-[344.4px] rounded-[24px] bg-[#2C292A]/90 p-8 text-white backdrop-blur">
                  <div className="mx-auto grid size-8 place-items-center rounded-full bg-white overflow-hidden shrink-0">
                    <img
                      src={messageIcon}
                      alt="Message"
                      className="block h-6 w-6 object-contain"
                    />
                  </div>

                  <p className="text-sm leading-7 text-white/80">
                    Auctions allow buyers to compete openly for items, with
                    prices rising only when there is real demand. This makes
                    bidding one of the fairest ways to buy, and many bidders end
                    up paying less than fixed prices.
                  </p>

                  <div className="flex gap-2">
                    <span className="h-2 w-2 rounded-full bg-white/50" />
                    <span className="h-2 w-2 rounded-full bg-white/50" />
                    <span className="h-2 w-2 rounded-full bg-white" />
                  </div>
                </div>
              </div>
            </div>


            {/* RIGHT CONTENT PANEL */}
            <div className="flex items-center justify-center w-full">
              <div className="w-full max-w-[454px]">
                <h1
                  className="text-[33px] font-semibold text-[#2A3239] leading-[120%]"
                  style={{
                    fontFamily:
                      "Roboto, system-ui, -apple-system, Segoe UI, Arial, sans-serif",
                  }}
                >
                  {title}
                </h1>

                {subtitle ? (
                  <div
                    className="mt-2 text-[16px] text-[#657688] leading-[120%]"
                    style={{
                      fontFamily:
                        "Roboto, system-ui, -apple-system, Segoe UI, Arial, sans-serif",
                    }}
                  >
                    {subtitle}
                  </div>
                ) : null}

                <div className="mt-8">{children}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}