import facebookIcon from "../assets/icons/icons8-facebook-48.png";
import instagramIcon from "../assets/icons/icons8-instagram-logo.png";
import xIcon from "../assets/icons/icons8-x-30.png";
import linkedinIcon from "../assets/icons/icons8-linkedin-48.png";
import youtubeIcon from "../assets/icons/icons8-youtube-50.png";

export default function Footer() {
  return (
    <footer className="relative mt-20 bg-white overflow-hidden min-h-[570px]">

      {/* WATERMARk */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute bottom-0 select-none flex items-center justify-center"
          style={{
            width: "1481px",
            height: "600px",

            
            left: "50%",
            transform: "translate(-50%, 270px)",

            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily:
              "Roboto, system-ui, -apple-system, Segoe UI, Arial, sans-serif",
            fontWeight: 400,
            fontStyle: "normal",
            fontSize: "270px",
            lineHeight: "120%",
            letterSpacing: "-10px",
            textAlign: "center",
            color: "#F7F9FC",
            whiteSpace: "nowrap",
            zIndex: 0,
          }}
          aria-hidden="true"
        >
          BIDCHALE
        </div>
      </div>

      {/* FOOTER CONTENT */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-3">

          {/* Brand */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide">
              BIDCHALE
            </h3>
            <p className="mt-4 text-sm text-gray-600">
              Address <br />
              Accra, Ghana
            </p>
            <p className="mt-3 text-sm text-gray-600">
              Contact <br />
              +233 xx xxx xxxx <br />
              support@bidchale.com
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide">
              Categories
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>Appliances</li>
              <li>Electronics</li>
              <li>Office Products</li>
              <li>Phones & Accessories</li>
              <li>Car Parts</li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide">
              Resources
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>Blog</li>
              <li>Help Center</li>
              <li>Contact</li>
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-6 text-xs text-gray-500 sm:flex-row">

          {/* SOCIAL MEDIA ICONS */}
          <div className="flex items-center gap-4">
            {[facebookIcon, instagramIcon, xIcon, linkedinIcon, youtubeIcon].map(
              (icon, idx) => (
                <img
                  key={idx}
                  src={icon}
                  alt="social icon"
                  draggable="false"
                  style={{
                    width: "19.14px",
                    height: "19.14px",
                    objectFit: "contain",
                    filter:
                      "brightness(0) saturate(100%) invert(17%) sepia(7%) saturate(430%) hue-rotate(169deg) brightness(92%) contrast(92%)",
                  }}
                />
              )
            )}
          </div>

          <div>© Copyright 2026 BIDCHALE</div>
        </div>
      </div>
    </footer>
  );
}