import { Star, Quote } from "lucide-react";

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Alex Morgan",
      role: "Daily Commuter, Financial District",
      quote: "ParkSmart saved me at least 25 minutes of morning circling around downtown. Having a guaranteed spot reserved before I even left home was a game changer.",
      rating: 5,
      facility: "Downtown Metro Central Garage",
    },
    {
      name: "Elena Rostova",
      role: "EV Driver & Tech Executive",
      quote: "The ability to filter specifically for high-speed EV charging bays that are actually available when I arrive is fantastic. QR scan at the barrier took under 5 seconds.",
      rating: 5,
      facility: "Tech Plaza Smart Bay",
    },
    {
      name: "Marcus Vance",
      role: "Frequent Flyer",
      quote: "Booked a 4-day spot for my airport trip. The pass sat right on my phone, zero paper tickets to lose, and the automated shuttle was right there. Smooth experience.",
      rating: 5,
      facility: "SkyHarbor Airport Express Deck",
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 mb-2">
            <span>Sample Pilot Feedback</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            What Drivers Say About ParkSmart
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Real feedback collected during the Metro City smart parking pilot phase.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((item) => (
            <div
              key={item.name}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/50 p-7 transition-all hover:border-slate-300 hover:shadow-md"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400" />
                  ))}
                </div>
                <Quote className="h-6 w-6 text-emerald-600/30 mb-2" />
                <p className="text-sm text-slate-700 leading-relaxed italic">
                  "{item.quote}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200/60">
                <p className="text-sm font-bold text-slate-900">{item.name}</p>
                <p className="text-xs text-slate-500">{item.role}</p>
                <span className="mt-1 inline-block rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                  {item.facility}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
