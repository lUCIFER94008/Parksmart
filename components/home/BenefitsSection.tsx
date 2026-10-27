import { 
  ShieldCheck, 
  Zap, 
  Clock, 
  QrCode, 
  Grid, 
  CreditCard,
  UserCheck,
  Smartphone
} from "lucide-react";

export function BenefitsSection() {
  const benefits = [
    {
      title: "Real-Time Slot Engine",
      desc: "Live slot availability synchronized with gate check-ins and scheduled turnover buffers. No stale inventory.",
      icon: Clock,
    },
    {
      title: "Zero Double-Booking Guarantee",
      desc: "Server-side atomic interval checks prevent overlapping reservations across identical time windows.",
      icon: ShieldCheck,
    },
    {
      title: "High-Speed EV Charging",
      desc: "Reserve dedicated Level-2 and DC Fast Charging bays for electric vehicles with clear wattage ratings.",
      icon: Zap,
    },
    {
      title: "Encrypted QR Digital Pass",
      desc: "Cryptographically generated passes for touchless barrier entry. No paper tickets, no lost passes.",
      icon: QrCode,
    },
    {
      title: "Visual Parking Layouts",
      desc: "Interactive lot maps with color-coded bay status (Available, Occupied, Reserved, Maintenance).",
      icon: Grid,
    },
    {
      title: "Multi-Role Ecosystem",
      desc: "Tailored dashboards for drivers, handheld camera scanners for operators, and full analytics for admins.",
      icon: UserCheck,
    },
  ];

  return (
    <section id="features" className="py-16 sm:py-24 bg-slate-50/50 border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 mb-2">
            <span>Enterprise-Grade Features</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Built for Maximum Efficiency & Security
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Engineered from the ground up to solve parking congestion, streamline operator workflows, and give drivers peace of mind.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xs transition-all hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 mb-5">
                  <Icon className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
