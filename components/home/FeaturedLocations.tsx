import Link from "next/link";
import Image from "next/image";
import { 
  MapPin, 
  Star, 
  ArrowRight, 
  Zap, 
  Shield, 
  Car, 
  CheckCircle2, 
  Clock 
} from "lucide-react";
import { SAMPLE_LOCATIONS } from "@/lib/data/sample-parking";
import { formatCurrency } from "@/lib/utils";

export function FeaturedLocations() {
  const featured = SAMPLE_LOCATIONS.filter((loc) => loc.featured);

  return (
    <section id="featured" className="py-16 sm:py-24 bg-slate-50/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 mb-2">
              <Star className="h-3.5 w-3.5 fill-emerald-600 text-emerald-600" />
              <span>Prime Facilities</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Featured Parking Locations
            </h2>
            <p className="mt-2 text-base text-slate-600 max-w-2xl">
              Hand-picked, high-security parking garages with guaranteed reservation, 
              EV rapid charging, and continuous CCTV surveillance.
            </p>
          </div>

          <Link
            href="/parking"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 group"
          >
            <span>View All Facilities ({SAMPLE_LOCATIONS.length})</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Locations Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((location) => {
            return (
              <div
                key={location.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-900/5"
              >
                {/* Photo & Top Badges */}
                <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                  <Image
                    src={location.image}
                    alt={location.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                  {/* Availability Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-xs px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{location.availableSlots} Slots Free</span>
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-slate-900/80 backdrop-blur-xs px-2.5 py-1 text-xs font-semibold text-white">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>{location.rating}</span>
                    <span className="text-slate-400 text-[10px]">({location.reviewCount})</span>
                  </div>

                  {/* Bottom Image Overlay: Price Tag */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                    <div>
                      <p className="text-[11px] font-medium text-slate-200 uppercase tracking-wider">
                        Starting from
                      </p>
                      <p className="text-xl font-bold">
                        {formatCurrency(location.hourlyRate)}
                        <span className="text-xs font-normal text-slate-300"> / hour</span>
                      </p>
                    </div>
                    {location.hasEVCharging && (
                      <span className="flex items-center gap-1 rounded-md bg-emerald-500/90 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-xs">
                        <Zap className="h-3 w-3" /> EV Ready
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Area */}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {location.name}
                    </h3>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{location.address}, {location.city}</span>
                    </p>
                    <p className="mt-2 text-xs text-slate-600 line-clamp-2">
                      {location.tagline}
                    </p>

                    {/* Amenity Badges */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {location.amenities.slice(0, 3).map((amenity) => (
                        <span
                          key={amenity}
                          className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                        >
                          {amenity}
                        </span>
                      ))}
                      {location.amenities.length > 3 && (
                        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-500 font-medium">
                          +{location.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>{location.openingHours.is24_7 ? "Open 24/7" : `${location.openingHours.open} - ${location.openingHours.close}`}</span>
                    </div>

                    <Link
                      href={`/parking/${location.id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-600 transition-colors"
                    >
                      <span>Reserve Spot</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
