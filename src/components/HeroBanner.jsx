export default function HeroBanner({ title, imageUrl }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-6">
      <div className="relative overflow-hidden rounded-2xl">
        <div
          className="h-[380px] sm:h-[400px] lg:h-[600px] w-full bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.35)), url(${imageUrl})`,
          }}
        />
        <div className="absolute bottom-6 left-6">
          <h2 className="text-xl font-extrabold tracking-wide text-white sm:text-2xl">
            {title}
          </h2>
        </div>
      </div>
    </section>
  );
}