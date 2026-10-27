"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  MapPin, 
  Calendar, 
  Clock, 
  Car, 
  Zap, 
  Bike, 
  Accessibility, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export type VehicleCategory = "car" | "ev" | "motorcycle" | "accessible";

export function HeroSearch() {
  const router = useRouter();

  // Helper to format today's date for inputs (YYYY-MM-DD)
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getFutureTime = (hoursAhead: number) => {
    const date = new Date();
    date.setHours(date.getHours() + hoursAhead);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = "00";
    return `${hours}:${minutes}`;
  };

  const [location, setLocation] = useState("");
  const [arrivalDate, setArrivalDate] = useState(getTodayDate());
  const [arrivalTime, setArrivalTime] = useState(getFutureTime(1));
  const [departureDate, setDepartureDate] = useState(getTodayDate());
  const [departureTime, setDepartureTime] = useState(getFutureTime(3));
  // Default selected vehicle type is "car" managed via React state
  const [vehicleType, setVehicleType] = useState<VehicleCategory>("car");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const quickLocations = [
    "Downtown Metro",
    "Tech Plaza",
    "SkyHarbor Airport",
    "Harbor Bay",
    "Medical Arts"
  ];

  const vehicleOptions: { id: VehicleCategory; label: string; icon: typeof Car; desc: string }[] = [
    { id: "car", label: "Car", icon: Car, desc: "Standard Sedan / SUV" },
    { id: "ev", label: "EV", icon: Zap, desc: "Level 2 / Fast Charge" },
    { id: "motorcycle", label: "Moto", icon: Bike, desc: "Motorcycle / Scooter" },
    { id: "accessible", label: "Access", icon: Accessibility, desc: "ADA Accessible Bay" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate inputs
    const arrivalDateTime = new Date(`${arrivalDate}T${arrivalTime}`);
    const departureDateTime = new Date(`${departureDate}T${departureTime}`);

    if (isNaN(arrivalDateTime.getTime()) || isNaN(departureDateTime.getTime())) {
      setError("Please select valid arrival and departure dates and times.");
      return;
    }

    if (departureDateTime <= arrivalDateTime) {
      setError("Departure time must be after arrival time.");
      return;
    }

    setIsLoading(true);

    const queryParams = new URLSearchParams({
      query: location.trim(),
      arrivalDate,
      arrivalTime,
      departureDate,
      departureTime,
      vehicleType,
    });

    router.push(`/parking?${queryParams.toString()}`);
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50/50 py-12 lg:py-20 border-b border-slate-200/60">
      {/* Subtle Background Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#059669 1px, transparent 1px)",
          backgroundSize: "24px 24px"
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-800 shadow-2xs">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Smart Availability & Instant Reservation</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Find Your <span className="text-emerald-600">Perfect Parking Spot</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Eliminate circling for parking. Browse live slot availability across verified facilities, 
            reserve in advance with guaranteed spots, and check in touchlessly via QR pass.
          </p>
        </div>

        {/* Search Card */}
        <div className="mt-10 max-w-5xl mx-auto">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xl shadow-slate-900/5 ring-1 ring-slate-900/5">
            {error && (
              <div className="mb-5 flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSearch} className="space-y-5">
              {/* Top Row: Location & Vehicle Type */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                {/* Location Search Input */}
                <div className="lg:col-span-7">
                  <label 
                    htmlFor="location-input" 
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                  >
                    Destination or Parking Facility
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      id="location-input"
                      type="text"
                      placeholder="e.g. Downtown Metro, Financial Way, Airport, or City Center"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                    />
                  </div>

                  {/* Quick Location Pills */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-medium text-slate-400">Popular:</span>
                    {quickLocations.map((loc) => (
                      <button
                        type="button"
                        key={loc}
                        onClick={() => setLocation(loc)}
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                          location === loc
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vehicle Type Selector (Fix: React state controlled, visible green border, light green background, immediate selection update) */}
                <div className="lg:col-span-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Vehicle Type
                    </label>
                    <span className="text-[11px] font-medium text-emerald-700">
                      Selected: <strong className="capitalize">{vehicleType}</strong>
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 rounded-xl border border-slate-200 bg-slate-50/80 p-1.5">
                    {vehicleOptions.map((item) => {
                      const Icon = item.icon;
                      const isSelected = vehicleType === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          id={`vehicle-type-${item.id}`}
                          aria-label={`Select ${item.label} vehicle`}
                          aria-pressed={isSelected}
                          onClick={() => setVehicleType(item.id)}
                          className={`flex flex-col items-center justify-center rounded-lg py-2.5 px-1 text-xs transition-all cursor-pointer ${
                            isSelected
                              ? "border-2 border-emerald-600 bg-emerald-50 text-emerald-800 font-bold shadow-xs ring-1 ring-emerald-500/20"
                              : "border-2 border-transparent bg-transparent text-slate-600 hover:text-slate-900 hover:bg-white/70"
                          }`}
                        >
                          <Icon className={`h-5 w-5 mb-1 transition-colors ${isSelected ? "text-emerald-600" : "text-slate-400"}`} />
                          <span className="text-[11px] font-semibold">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Row: Date & Time Selectors + Submit Button */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
                {/* Arrival Date */}
                <div className="lg:col-span-1">
                  <label 
                    htmlFor="arrival-date" 
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Arrival Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      id="arrival-date"
                      type="date"
                      value={arrivalDate}
                      onChange={(e) => setArrivalDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-2.5 pl-9 pr-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                      required
                    />
                  </div>
                </div>

                {/* Arrival Time */}
                <div className="lg:col-span-1">
                  <label 
                    htmlFor="arrival-time" 
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Arrival Time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      id="arrival-time"
                      type="time"
                      value={arrivalTime}
                      onChange={(e) => setArrivalTime(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-2.5 pl-9 pr-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                      required
                    />
                  </div>
                </div>

                {/* Departure Date */}
                <div className="lg:col-span-1">
                  <label 
                    htmlFor="departure-date" 
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Departure Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      id="departure-date"
                      type="date"
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-2.5 pl-9 pr-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                      required
                    />
                  </div>
                </div>

                {/* Departure Time */}
                <div className="lg:col-span-1">
                  <label 
                    htmlFor="departure-time" 
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Departure Time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      id="departure-time"
                      type="time"
                      value={departureTime}
                      onChange={(e) => setDepartureTime(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-2.5 pl-9 pr-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                      required
                    />
                  </div>
                </div>

                {/* Find Parking Button */}
                <div className="lg:col-span-1 flex items-end">
                  <button
                    type="submit"
                    id="find-parking-submit-btn"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 px-4 text-sm font-semibold text-white shadow-md shadow-emerald-700/20 hover:bg-emerald-700 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 disabled:opacity-70 cursor-pointer"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        <span>Searching...</span>
                      </span>
                    ) : (
                      <>
                        <Search className="h-4 w-4" />
                        <span>Find Parking</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* Feature Highlights beneath form */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Guaranteed Spot Reserved</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Zero Hidden Fees</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Free Cancellation prior to arrival</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Instant Mobile QR Pass</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
