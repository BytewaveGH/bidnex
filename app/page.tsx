import TopNav from "@/components/generals/top-nav";
import ButtonTemplate from "@/components/templates/button-template";
import Image from "next/image";
import banner from "@/assets/images/landing.png";
import FeaturedItems from "@/components/generals/featured-items";
import HowItWorks from "@/components/generals/how-it-works";
import LiveAuctions from "@/components/generals/live-auctions";
import person from "@/assets/images/person.png";



export default function Home() {
  return (
    <main className="min-h-screen w-full">
      <TopNav />
      <section className="h-[82dvh] relative  w-full" >
        <Image src={banner} alt="banner" className="w-full h-full object-cover" />
        <div className="absolute top-0 left-0 w-full h-full bg-linear-to-b from-transparent to-black/90 p-20">
          <div className="flex flex-col items-start justify-end h-full">
            <p className="text-white text-4xl font-bold mb-4">Discover Amazing Deals & Bid<br />Smart, Win Big, & Shop With<br />Confidence.</p>
            <ButtonTemplate title="Start Bidding" className="bg-white text-black hover:bg-white w-40" />
          </div>
        </div>
      </section>
      <section className="p-20">
        <FeaturedItems />
      </section>
      <section className="p-20 bg-black">
        <HowItWorks />
      </section>
      <section className="p-20 ">
        <LiveAuctions />
      </section>
      <section className="px-20 pb-20">
        <div className="w-full mx-auto relative">
          {/* Banner Container */}
          <div className="relative bg-[#1A1A1A] rounded-[24px] overflow-hidden flex flex-col lg:flex-row min-h-[500px]">
            {/* Decorative Circles - Background Elements */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-gray-300/20 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute top-8 left-24 w-32 h-32 bg-gray-300/20 rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gray-300/20 rounded-full -translate-x-1/2 translate-y-1/2"></div>
            <div className="absolute top-0 right-0 w-56 h-56 bg-gray-300/20 rounded-full translate-x-1/4 -translate-y-1/4"></div>
            
            {/* Left Content Area */}
            <div className="flex-1 p-12 lg:p-16 flex flex-col justify-center relative z-10">
              <h2 className="text-white text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 leading-tight">
                Delivery Right<br />To Your<br />Doorstep
              </h2>
              <p className="text-white text-base lg:text-lg mb-8 leading-relaxed opacity-90 max-w-lg">
                Experience the convenience of having your essentials brought directly to you, making life easier and more efficient.
              </p>
              <ButtonTemplate 
                title="Shop Now" 
                className="bg-white text-black hover:bg-white border border-black w-fit px-8 py-3 rounded-lg font-semibold"
              />
            </div>
          </div>
          
          {/* Right Image Area - Positioned absolutely to overlay on the banner */}
          <div className="absolute bottom-9 right-0 w-1/2 h-full z-20 overflow-visible">
            <div className="absolute bottom-0 right-0 w-full h-[110%] flex items-end justify-end">
              <div className="w-full h-full rounded-r-[24px] overflow-hidden flex justify-end">
                <Image src={person} alt="person" className="h-full w-auto object-contain" />
              </div>
            </div>
          </div>
          
          {/* Pagination Indicators */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-800"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-white border border-gray-400"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-white border border-gray-400"></div>
          </div>
        </div>
      </section>
    </main>
  );
}
