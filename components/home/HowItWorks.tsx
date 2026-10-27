import { Search, Grid, QrCode, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Search & Check Availability",
      description: "Enter your destination and intended arrival/departure times to view real-time open slots across verified facilities.",
      icon: Search,
    },
    {
      step: "02",
      title: "Choose Compatible Slot",
      description: "Explore the visual slot grid. Select standard, EV charging, motorcycle, or accessible bays with transparent pricing.",
      icon: Grid,
    },
    {
      step: "03",
      title: "Instant Encrypted QR Pass",
      description: "Your reservation locks the slot atomically. A unique booking reference and digital QR pass are instantly issued.",
      icon: QrCode,
    },
    {
      step: "04",
      title: "Scan & Park Seamlessly",
      description: "Arrive at the gate. The operator scans your pass on-device for verified check-in, eliminating ticketing delays.",
      icon: CheckCircle2,
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-white border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 mb-2">
            <span>Simple 4-Step Process</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            How ParkSmart Works
          </h2>
          <p className="mt-3 text-base text-slate-600">
            From discovering available spaces to automated gate exit, our unified platform guarantees effortless urban parking.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 relative">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.step}
                className="relative flex flex-col rounded-2xl border border-slate-200 bg-slate-50/60 p-6 transition-all hover:bg-white hover:shadow-lg hover:border-slate-300"
              >
                {/* Step Pill */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                    <Icon className="h-6 w-6 text-emerald-400" />
                  </div>
                  <span className="text-2xl font-black text-slate-300">
                    {item.step}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-14 rounded-2xl bg-slate-900 p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-bold">
              Ready to park without the hassle?
            </h3>
            <p className="text-sm text-slate-300 max-w-xl">
              Lock in your parking spot in under 60 seconds with our guaranteed availability engine.
            </p>
          </div>
          <Link
            href="/parking"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-emerald-500 transition-colors shrink-0"
          >
            <span>Search Available Spots</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
