import { ShieldCheck, MapPin, CheckCircle, Clock } from "lucide-react";
import { SAMPLE_LOCATIONS } from "@/lib/data/sample-parking";

export function StatsSection() {
  const totalFacilities = SAMPLE_LOCATIONS.length;
  const totalSlots = SAMPLE_LOCATIONS.reduce((sum, loc) => sum + loc.totalSlots, 0);
  const availableSlots = SAMPLE_LOCATIONS.reduce((sum, loc) => sum + loc.availableSlots, 0);

  const stats = [
    {
      label: "Active Parking Facilities",
      value: `${totalFacilities}`,
      desc: "Multilevel garages, express decks & open bays",
      icon: MapPin,
    },
    {
      label: "Total Monitored Slots",
      value: `${totalSlots}+`,
      desc: "Sensor-ready slots across 5 prime city zones",
      icon: ShieldCheck,
    },
    {
      label: "Currently Available",
      value: `${availableSlots}`,
      desc: "Live verified spots ready for immediate booking",
      icon: CheckCircle,
    },
    {
      label: "Average Gate Scan",
      value: "< 35s",
      desc: "Rapid QR pass check-in & automated exit",
      icon: Clock,
    },
  ];

  return (
    <section className="bg-white py-12 border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Dataset Label Banner */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 px-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-emerald-950">
              Operational Availability Metrics
            </span>
            <span className="text-emerald-700">
              — Real-time availability computed from monitored facility slots
            </span>
          </div>
          <span className="rounded-full bg-white px-2.5 py-0.5 font-medium text-emerald-800 shadow-2xs border border-emerald-200">
            Live Verified Demo Data
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 transition-all hover:bg-white hover:shadow-md hover:border-slate-300"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                    {stat.value}
                  </span>
                  <div className="rounded-xl bg-emerald-100/70 p-2 text-emerald-700">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-800">
                  {stat.label}
                </h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  {stat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
