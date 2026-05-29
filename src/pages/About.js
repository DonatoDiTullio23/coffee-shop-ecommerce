// src/pages/About.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <main className="bg-white text-gray-800">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1920&auto=format&fit=crop"
            alt="Freshly brewed coffee in a café"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white mb-4 backdrop-blur">
            Since 2025
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Coffee. Care. Community.
          </h1>
          <p className="mt-4 max-w-2xl text-white/90">
            Brewing quality beans, supporting sustainable farms, and creating a café culture that feels like home.
          </p>

          <div className="mt-8 flex gap-3">
            <Link
              to="/shop"
              className="inline-flex items-center rounded-lg px-5 py-3 bg-green-600 text-white font-medium hover:bg-green-700 transition"
            >
              Shop Now
            </Link>
            <a
              href="#our-story"
              className="inline-flex items-center rounded-lg px-5 py-3 bg-white/10 text-white font-medium hover:bg-white/20 transition"
            >
              Our Story
            </a>
          </div>
        </div>
      </section>

      {/* QUICK STATS */}
      <section className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            ["20+", "Partner Farms"],
            ["98%", "5★ Reviews"],
            ["48h", "Roast-to-Ship"],
            ["100%", "Carbon Offset"],
          ].map(([n, t]) => (
            <div key={t}>
              <div className="text-3xl font-bold text-gray-900">{n}</div>
              <div className="text-gray-500 text-sm mt-1">{t}</div>
            </div>
          ))}
        </div>
      </section>

      {/* IMAGE + STORY */}
      <section id="our-story" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1600&auto=format&fit=crop"
              alt="Latte art pouring in a café"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Our Story</h2>
            <p className="mt-4 text-gray-700 leading-relaxed">
              It all started with a simple belief: coffee is more than a drink — it’s a daily ritual, a craft, and a connection.
            </p>
            <p className="mt-4 text-gray-700 leading-relaxed">
              We source from ethical farms, roast in small batches, and serve with pride. From bean to cup, our goal is to create a café experience that warms hearts and sparks conversations.
            </p>
            <div className="mt-6 flex items-center gap-4">
            <img
                src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80"
                alt="Founder"
                className="h-12 w-12 rounded-full object-cover ring-2 ring-green-100"
                />
              <div>
                <div className="font-semibold">Donato & Team</div>
                <div className="text-sm text-gray-500">Founders & Coffee Enthusiasts</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
<section className="bg-gray-50 border-y border-gray-100">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <h3 className="text-2xl font-bold text-gray-900 text-center">
      What We Stand For
    </h3>
    <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {[
        {
          title: "Ethical Sourcing",
          desc: "We partner with small farms and cooperatives to ensure fair wages and sustainable practices.",
          icon: "☕",
        },
        {
          title: "Freshness First",
          desc: "All beans are roasted in small batches and shipped within 48 hours for peak flavor.",
          icon: "🌱",
        },
        {
          title: "Sustainability",
          desc: "From compostable packaging to carbon-neutral shipping, we keep our footprint light.",
          icon: "🌍",
        },
        {
          title: "Craft & Quality",
          desc: "Our baristas and roasters are obsessed with details — from latte art to bean profiling.",
          icon: "🎨",
        },
        {
          title: "Community",
          desc: "We host tastings, workshops, and donate a portion of profits to local food programs.",
          icon: "🤝",
        },
        {
          title: "Customer Care",
          desc: "Real people, fast replies, and a no-hassle satisfaction promise.",
          icon: "💬",
        },
      ].map((item) => (
        <div
          key={item.title}
          className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition"
        >
          <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-green-50 text-green-700 text-xl">
            {item.icon}
          </div>
          <h4 className="mt-4 font-semibold text-gray-900">{item.title}</h4>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            {item.desc}
          </p>
        </div>
      ))}
    </div>
  </div>
</section>


      {/* COFFEE GALLERY */}
<section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
  <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
    A Glimpse Into Our World
  </h3>

  <div className="grid sm:grid-cols-3 gap-4">
    {[
      "https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800",
      "https://images.unsplash.com/photo-1522992319-0365e5f11656?auto=format&fit=crop&w=1200&q=80",
      "https://images.pexels.com/photos/374885/pexels-photo-374885.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800",
    ].map((src, i) => (
      <div key={i} className="aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100">
        <img
          src={src}
          alt={`Coffee Gallery ${i + 1}`}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const fallback = `data:image/svg+xml;utf8,${encodeURIComponent(
              `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'>
                <rect width='100%' height='100%' fill='#f3f4f6'/>
                <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
                  fill='#6b7280' font-size='32' font-family='system-ui,Segoe UI,Roboto'>
                  Image unavailable
                </text>
              </svg>`
            )}`;
            e.currentTarget.src = fallback;
          }}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
      </div>
    ))}
  </div>
</section>


    {/* TIMELINE */}
<section className="bg-gray-50 border-y border-gray-100">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <h3 className="text-2xl font-bold text-gray-900 text-center">Milestones</h3>
    <div className="mt-12 relative">
      {/* central vertical line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -translate-x-1/2" />

      <ul className="space-y-12">
        {[
          {
            year: "2025",
            text: "Launched our first small-batch lineup and direct-trade partnerships.",
            img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80", // beans
          },
          {
            year: "2026",
            text: "Expanded QC lab, added cupping events for the community.",
            img: "https://images.unsplash.com/photo-1522992319-0365e5f11656?auto=format&fit=crop&w=400&q=80", // latte art
          },
          {
            year: "2027",
            text: "Introduced recyclable packaging and full carbon-offset shipping.",
            img: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=256&q=80", // eco packaging vibe
          },
        ].map((item) => (
          <li key={item.year} className="relative flex items-center justify-between">
            {/* Left: text */}
            <div className="w-5/12 text-right pr-8">
              <span className="text-green-700 font-semibold">{item.year}</span>
              <p className="mt-2 text-gray-700">{item.text}</p>
            </div>

            {/* Middle: marker */}
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-600 border-4 border-white shadow relative z-10" />

            {/* Right: milestone image */}
            <div className="w-5/12 pl-8">
              <div className="rounded-lg overflow-hidden shadow-md border border-gray-100">
                <img
                  src={item.img}
                  alt={`${item.year} milestone`}
                  className="w-full h-32 object-cover"
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </div>
</section>



      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-2xl border border-gray-200 p-8 md:p-10 bg-gradient-to-br from-green-50 to-white">
          <div className="md:flex md:items-center md:justify-between gap-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Taste the difference.</h3>
              <p className="mt-2 text-gray-700">
                Fresh roast cycles, ethical sourcing, and packaging that respects the planet.
              </p>
            </div>
            <div className="mt-6 md:mt-0 flex gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center rounded-lg px-5 py-3 bg-green-600 text-white font-medium hover:bg-green-700 transition"
              >
                Explore the Shop
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center rounded-lg px-5 py-3 border border-gray-300 text-gray-800 font-medium hover:bg-gray-50 transition"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
