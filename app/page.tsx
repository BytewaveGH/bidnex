import TopNav from "@/components/generals/top-nav";
import ButtonTemplate from "@/components/templates/button-template";
import Image from "next/image";
import banner from "@/assets/images/landing.png";
import FeaturedItems from "@/components/generals/featured-items";
import HowItWorks from "@/components/generals/how-it-works";
import LiveAuctions from "@/components/generals/live-auctions";
import person from "@/assets/images/person.png";
import InfoCard from "@/components/generals/info-card";
import Categories from "@/components/generals/categories";
import FAQs from "@/components/generals/faqs";
import Footer from "@/components/generals/footer";



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
      <section className="p-20">
        <InfoCard />
      </section>
      <section className="p-20 ">
        <Categories />
      </section>
      <section className="p-20 bg-[#F6F6F6] ">
        <FAQs />
      </section>
      <section className="px-20 pt-20 ">
        <Footer />
      </section>
    </main>
  );
}
