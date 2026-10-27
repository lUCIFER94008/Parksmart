"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  Search, 
  MapPin, 
  Filter, 
  Star, 
  Car, 
  Zap, 
  Bike, 
  Accessibility, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  SlidersHorizontal,
  Map as MapIcon,
  List,
  RotateCcw,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";
import { SAMPLE_LOCATIONS, ParkingLocationType } from "@/lib/data/sample-parking";
import { formatCurrency } from "@/lib/utils";

function ParkingSearchResults() {
  const searchParams = useSearchParams();

  // Read query params from URL
  const initialQuery = searchParams.get("query") || "";
  const initialVehicle = searchParams.get("vehicleType") || "all";
  const arrivalDate = searchParams.get("arrivalDate") || "";
  const arrivalTime = searchParams.get("arrivalTime") || "";
  const departureDate = searchParams.get("departureDate") || "";
  const departureTime = searchParams.get("departureTime") || "";

  // State filters
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedVehicle, setSelectedVehicle] = useState<string>(initialVehicle);
  const [maxHourlyPrice, setMaxHourlyPrice] = useState<number>(15);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"price_asc" | "rating_desc" | "slots_desc">("rating_desc");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedMapFacility, setSelectedMapFacility] = useState<ParkingLocationType | null>(
    SAMPLE_LOCATIONS[0]
  );

  const allAmenities = [
    "EV Charging",
    "24/7 Access",
    "CCTV Security",
    "Covered Parking",
    "Elevator Access",
    "Wheelchair Accessible",
  ];

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedVehicle("all");
    setMaxHourlyPrice(15);
    setSelectedAmenities([]);
    setSortBy("rating_desc");
  };

  // Helper to build URL preserving all search parameters
  const getFacilityUrl = (facilityId: string) => {
    const params = new URLSearchParams();
    if (selectedVehicle && selectedVehicle !== "all") params.set("vehicleType", selectedVehicle);
    if (arrivalDate) params.set("arrivalDate", arrivalDate);
    if (arrivalTime) params.set("arrivalTime", arrivalTime);
    if (departureDate) params.set("departureDate", departureDate);
    if (departureTime) params.set("departureTime", departureTime);
    const qs = params.toString();
    return `/parking/${facilityId}${qs ? `?${qs}` : ""}`;
  };

  // Filtered & Sorted Locations
  const filteredLocations = useMemo(() => {
    return SAMPLE_LOCATIONS.filter((loc) => {
      // Search term filter
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchesName = loc.name.toLowerCase().includes(q);
        const matchesAddress = loc.address.toLowerCase().includes(q);
        const matchesCity = loc.city.toLowerCase().includes(q);
        const matchesTagline = loc.tagline.toLowerCase().includes(q);
        if (!matchesName && !matchesAddress && !matchesCity && !matchesTagline) {
          return false;
        }
      }

      // Vehicle compatibility filter (if not "all", must be supported)
      if (selectedVehicle !== "all") {
        if (!loc.supportedVehicles.includes(selectedVehicle as any)) {
          return false;
        }
      }

      // Price filter
      if (loc.hourlyRate > maxHourlyPrice) {
        return false;
      }

      // Amenities filter
      if (selectedAmenities.length > 0) {
        const hasAllSelected = selectedAmenities.every((a) => {
          if (a === "EV Charging") return loc.hasEVCharging;
          if (a === "24/7 Access") return loc.openingHours.is24_7;
          if (a === "CCTV Security") return loc.hasCCTV;
          if (a === "Covered Parking") return loc.isCovered;
          if (a === "Wheelchair Accessible") return loc.isAccessible;
          return loc.amenities.includes(a);
        });
        if (!hasAllSelected) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "price_asc") return a.hourlyRate - b.hourlyRate;
      if (sortBy === "rating_desc") return b.rating - a.rating;
      if (sortBy === "slots_desc") return b.availableSlots - a.availableSlots;
      return 0;
    });
  }, [searchTerm, selectedVehicle, maxHourlyPrice, selectedAmenities, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50 py-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Header & Search Bar */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Find Parking Garages & Slots
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {arrivalDate && arrivalTime
                  ? `Availability for ${arrivalDate} (${arrivalTime} to ${departureTime || "later"}) • Vehicle: ${selectedVehicle.toUpperCase()}`
                  : "Showing real-time live availability across Metro City"}
              </p>
            </div>

            {/* List / Map View Switcher */}
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                    viewMode === "list"
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <List className="h-4 w-4" />
                  <span>List View</span>
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                    viewMode === "map"
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <MapIcon className="h-4 w-4" />
                  <span>Map View</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Search Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by facility name, landmark, street address, or district..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-900 shadow-sm placeholder-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
            />
          </div>
        </div>

        {/* Main Content: Sidebar Filters + Results */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Left Column: Filter Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
                  <h2 className="text-sm font-bold text-slate-900">Filters</h2>
                </div>
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-emerald-700 cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Vehicle Type Filter */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Vehicle Type
                  </label>
                  <span className="text-[10px] text-emerald-700 font-bold uppercase">
                    {selectedVehicle}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: "all", label: "All Types" },
                    { id: "car", label: "Car" },
                    { id: "ev", label: "EV Bay" },
                    { id: "motorcycle", label: "Motorcycle" },
                    { id: "accessible", label: "Accessible" },
                  ].map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVehicle(v.id)}
                      className={`rounded-lg py-1.5 px-2 text-xs font-medium transition-all text-center cursor-pointer ${
                        selectedVehicle === v.id
                          ? "border-2 border-emerald-600 bg-emerald-50 text-emerald-800 font-bold shadow-xs"
                          : "border-2 border-transparent bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Hourly Price Slider */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Max Price / Hour
                  </label>
                  <span className="text-sm font-bold text-emerald-700">
                    ${maxHourlyPrice}.00
                  </span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="15"
                  step="1"
                  value={maxHourlyPrice}
                  onChange={(e) => setMaxHourlyPrice(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>$3/hr</span>
                  <span>$9/hr</span>
                  <span>$15/hr</span>
                </div>
              </div>

              {/* Amenities Filter */}
              <div className="space-y-2 mb-6">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Amenities
                </label>
                <div className="space-y-2 pt-1">
                  {allAmenities.map((amenity) => {
                    const isChecked = selectedAmenities.includes(amenity);
                    return (
                      <label
                        key={amenity}
                        className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer hover:text-slate-900"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleAmenity(amenity)}
                          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>{amenity}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Sort By Options */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2 px-3 text-xs text-slate-800 focus:border-emerald-600 focus:bg-white focus:outline-none"
                >
                  <option value="rating_desc">Highest Rated</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="slots_desc">Most Available Slots</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right Column: Search Results */}
          <div className="lg:col-span-3">
            {/* Results count banner */}
            <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
              <span>
                Found <strong className="text-slate-900">{filteredLocations.length}</strong> matching parking locations
                {selectedVehicle !== "all" && (
                  <span className="text-emerald-700 font-semibold ml-1">
                    supporting {selectedVehicle.toUpperCase()}
                  </span>
                )}
              </span>
              <span>Sorted by {sortBy === "rating_desc" ? "Highest Rating" : sortBy === "price_asc" ? "Lowest Price" : "Availability"}</span>
            </div>

            {/* Empty State */}
            {filteredLocations.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-4">
                  <Search className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  No parking facilities found
                </h3>
                <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
                  No locations matched your active search filters for {selectedVehicle.toUpperCase()}. Try resetting your vehicle or price filters.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            )}

            {/* List View */}
            {viewMode === "list" && (
              <div className="space-y-4">
                {filteredLocations.map((loc) => {
                  const facilityUrl = getFacilityUrl(loc.id);
                  const isVehicleSupported = selectedVehicle === "all" || loc.supportedVehicles.includes(selectedVehicle as any);

                  return (
                    <div
                      key={loc.id}
                      className="group flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:border-slate-300 hover:shadow-md"
                    >
                      {/* Thumbnail Image */}
                      <div className="relative sm:w-64 h-48 sm:h-auto overflow-hidden bg-slate-100 shrink-0">
                        <Image
                          src={loc.image}
                          alt={loc.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, 256px"
                        />
                        {/* Live Slot Tag */}
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 shadow-2xs backdrop-blur-xs">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>{loc.availableSlots} Free</span>
                        </div>
                      </div>

                      {/* Info & Details */}
                      <div className="flex flex-1 flex-col justify-between p-5">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                                {loc.name}
                              </h3>
                              <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                <span>{loc.address}, {loc.city}</span>
                                {loc.distanceMiles !== undefined && (
                                  <span className="text-slate-400">• {loc.distanceMiles} mi away</span>
                                )}
                              </p>
                            </div>

                            {/* Rating */}
                            <div className="flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold text-amber-800 shrink-0">
                              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                              <span>{loc.rating}</span>
                              <span className="text-[10px] text-amber-600 font-normal">({loc.reviewCount})</span>
                            </div>
                          </div>

                          <p className="mt-2 text-xs text-slate-600 line-clamp-2">
                            {loc.tagline}
                          </p>

                          {/* Amenity Pills */}
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {loc.amenities.slice(0, 4).map((a) => (
                              <span
                                key={a}
                                className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                              >
                                {a}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Bottom Bar: Price & CTA */}
                        <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <span className="text-xs text-slate-400">Hourly Rate</span>
                            <div className="text-lg font-extrabold text-slate-900">
                              {formatCurrency(loc.hourlyRate)}
                              <span className="text-xs font-normal text-slate-500"> / hr</span>
                            </div>
                          </div>

                          <Link
                            href={facilityUrl}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                          >
                            <span>Select & Book Slot</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Map View Alternative */}
            {viewMode === "map" && (
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
                {/* Simulated Interactive Map Header */}
                <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapIcon className="h-5 w-5 text-emerald-400" />
                    <div>
                      <h3 className="text-sm font-bold">Interactive Metro Area Map</h3>
                      <p className="text-[11px] text-slate-400">Select any facility pin to view details and slots</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-600/30 border border-emerald-500 px-2.5 py-0.5 text-xs text-emerald-300">
                    {filteredLocations.length} Map Points Active
                  </span>
                </div>

                {/* Visual Map Canvas Grid */}
                <div className="relative h-[380px] bg-slate-100 overflow-hidden flex items-center justify-center border-b border-slate-200">
                  {/* Grid Lines */}
                  <div 
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: "linear-gradient(to right, #64748b 1px, transparent 1px), linear-gradient(to bottom, #64748b 1px, transparent 1px)",
                      backgroundSize: "40px 40px"
                    }}
                  />

                  {/* Interactive Facility Pins */}
                  {filteredLocations.map((loc, index) => {
                    const isSelected = selectedMapFacility?.id === loc.id;
                    const positions = [
                      { top: "35%", left: "42%" },
                      { top: "60%", left: "68%" },
                      { top: "75%", left: "25%" },
                      { top: "25%", left: "75%" },
                      { top: "50%", left: "50%" },
                    ];
                    const pos = positions[index % positions.length];

                    return (
                      <button
                        key={loc.id}
                        onClick={() => setSelectedMapFacility(loc)}
                        style={{ top: pos.top, left: pos.left }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all z-10 cursor-pointer`}
                      >
                        <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold shadow-lg transition-transform hover:scale-110 ${
                          isSelected
                            ? "bg-emerald-600 text-white ring-4 ring-emerald-500/30 scale-105"
                            : "bg-slate-900 text-white"
                        }`}>
                          <Car className="h-3.5 w-3.5 text-emerald-400" />
                          <span>{formatCurrency(loc.hourlyRate)}/h</span>
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap rounded bg-slate-900/90 px-1.5 py-0.5 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          {loc.name}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Map Facility Detail Preview */}
                {selectedMapFacility && (
                  <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
                    <div className="flex items-center gap-4">
                      <div className="relative h-16 w-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        <Image
                          src={selectedMapFacility.image}
                          alt={selectedMapFacility.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900">
                          {selectedMapFacility.name}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {selectedMapFacility.address} • {selectedMapFacility.availableSlots} Slots Available
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs text-slate-400">Rate</span>
                        <div className="text-base font-bold text-slate-900">
                          {formatCurrency(selectedMapFacility.hourlyRate)}/hr
                        </div>
                      </div>
                      <Link
                        href={getFacilityUrl(selectedMapFacility.id)}
                        className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
                      >
                        View Slots & Book
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ParkingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-500 text-sm">
          <div className="h-5 w-5 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
          <span>Loading available parking facilities...</span>
        </div>
      </div>
    }>
      <ParkingSearchResults />
    </Suspense>
  );
}
