"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  MapPin, 
  Clock, 
  Star, 
  ShieldCheck, 
  Zap, 
  Car, 
  Bike, 
  Accessibility, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle,
  QrCode, 
  Calendar, 
  ArrowLeft,
  ChevronRight,
  Info,
  Check,
  Download,
  Printer,
  RefreshCw
} from "lucide-react";
import { 
  ParkingLocationType, 
  SlotType, 
  generateFacilitySlots 
} from "@/lib/data/sample-parking";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export interface ParkingDetailClientProps {
  facility: ParkingLocationType;
  initialVehicle?: string;
  initialArrivalDate?: string;
  initialArrivalTime?: string;
  initialDepartureDate?: string;
  initialDepartureTime?: string;
  initialSlotNumber?: string;
  initialPlateNumber?: string;
  initialVehicleModel?: string;
}

export function ParkingDetailClient({
  facility,
  initialVehicle = "car",
  initialArrivalDate,
  initialArrivalTime,
  initialDepartureDate,
  initialDepartureTime,
  initialSlotNumber,
  initialPlateNumber,
  initialVehicleModel,
}: ParkingDetailClientProps) {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string; role: string } | null>(null);

  // Helper date defaults
  const getTodayDate = () => new Date().toISOString().split("T")[0];
  const getDefaultTime = (addHours: number) => {
    const d = new Date();
    d.setHours(d.getHours() + addHours);
    return `${String(d.getHours()).padStart(2, "0")}:00`;
  };

  // Time Interval State
  const [arrivalDate, setArrivalDate] = useState(initialArrivalDate || getTodayDate());
  const [arrivalTime, setArrivalTime] = useState(initialArrivalTime || getDefaultTime(1));
  const [departureDate, setDepartureDate] = useState(initialDepartureDate || getTodayDate());
  const [departureTime, setDepartureTime] = useState(initialDepartureTime || getDefaultTime(3));

  // Vehicle Category selection state
  const validVehicleTypes = ["car", "ev", "motorcycle", "accessible"];
  const sanitizedVehicle = validVehicleTypes.includes(initialVehicle) ? initialVehicle : "car";
  const [vehicleType, setVehicleType] = useState<string>(sanitizedVehicle);

  // Floor selection
  const [activeFloor, setActiveFloor] = useState<string>("Floor 1");

  // Slots state (fetched dynamically from API or seeded sample)
  const [slots, setSlots] = useState<SlotType[]>(() => generateFacilitySlots(facility.id, 24));
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotType | null>(null);

  // Vehicle info state
  const [plateNumber, setPlateNumber] = useState(initialPlateNumber || "CA-7XYZ99");
  const [vehicleModel, setVehicleModel] = useState(initialVehicleModel || "Tesla Model 3 / Sedan");

  // Check auth state on mount
  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.authenticated && data.user) {
            setCurrentUser(data.user);
          }
        }
      } catch {
        // unauthenticated
      }
    }
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  // Reservation Dialog & Submission state
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<{
    id?: string;
    bookingReference: string;
    facilityName: string;
    facilityAddress: string;
    slotNumber: string;
    floor: string;
    vehiclePlate: string;
    vehicleModel?: string;
    vehicleType: string;
    startTime: string;
    endTime: string;
    totalAmount: number;
    qrCodeDataUrl: string;
    qrPayload?: string;
  } | null>(null);

  // Vehicle compatibility check against facility
  const isVehicleSupported = useMemo(() => {
    return facility.supportedVehicles.includes(vehicleType as any);
  }, [facility.supportedVehicles, vehicleType]);

  // Compute duration in hours
  const durationHours = useMemo(() => {
    const start = new Date(`${arrivalDate}T${arrivalTime}`);
    const end = new Date(`${departureDate}T${departureTime}`);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      return 2; // fallback default
    }
    const diffMs = end.getTime() - start.getTime();
    return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
  }, [arrivalDate, arrivalTime, departureDate, departureTime]);

  // Effective hourly rate based on facility pricing & vehicle
  const effectiveHourlyRate = useMemo(() => {
    if (facility.vehiclePricing && facility.vehiclePricing[vehicleType as keyof typeof facility.vehiclePricing]) {
      return facility.vehiclePricing[vehicleType as keyof typeof facility.vehiclePricing];
    }
    return selectedSlot ? selectedSlot.pricePerHour : facility.hourlyRate;
  }, [facility.vehiclePricing, facility.hourlyRate, vehicleType, selectedSlot]);

  // Pricing calculation
  const subtotal = durationHours * effectiveHourlyRate;
  const facilityFee = 1.50;
  const taxes = Number((subtotal * 0.08).toFixed(2));
  const totalAmount = Number((subtotal + facilityFee + taxes).toFixed(2));

  // Dynamic slot availability fetch for interval
  const fetchIntervalSlots = useCallback(async () => {
    const startIso = `${arrivalDate}T${arrivalTime}:00`;
    const endIso = `${departureDate}T${departureTime}:00`;

    setIsLoadingSlots(true);
    try {
      const res = await fetch(
        `/api/parking/${facility.id}/slots?startTime=${encodeURIComponent(startIso)}&endTime=${encodeURIComponent(endIso)}`
      );
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          setSlots(json.data);
          return;
        }
      }
    } catch (err) {
      console.warn("Failed to fetch live slots from database, using local layout", err);
    } finally {
      setIsLoadingSlots(false);
    }
  }, [facility.id, arrivalDate, arrivalTime, departureDate, departureTime]);

  // Refetch slots whenever interval changes
  useEffect(() => {
    fetchIntervalSlots();
  }, [fetchIntervalSlots]);

  // Filter slots by selected floor & vehicle type compatibility
  const displayedSlots = useMemo(() => {
    return slots.filter((slot) => {
      const matchesFloor = slot.floor === activeFloor;
      const matchesVehicle = slot.vehicleType === vehicleType;
      return matchesFloor && matchesVehicle;
    });
  }, [slots, activeFloor, vehicleType]);

  // Synchronize and revalidate selected slot when displayedSlots, interval or vehicle changes
  useEffect(() => {
    if (initialSlotNumber && slots.length > 0) {
      const match = slots.find((s) => s.slotNumber === initialSlotNumber);
      if (match) {
        setSelectedSlot(match);
        if (match.floor !== activeFloor) {
          setActiveFloor(match.floor);
        }
        return;
      }
    }
    if (selectedSlot) {
      // Find matching slot in newly filtered slots
      const currentInList = slots.find(
        (s) => (s.id === selectedSlot.id || s.slotNumber === selectedSlot.slotNumber)
      );

      if (!currentInList || currentInList.status !== "available" || currentInList.vehicleType !== vehicleType) {
        // Automatically select first available compatible slot or clear
        const firstAvail = displayedSlots.find((s) => s.status === "available");
        setSelectedSlot(firstAvail || null);
      }
    } else {
      const firstAvail = displayedSlots.find((s) => s.status === "available");
      if (firstAvail) {
        setSelectedSlot(firstAvail);
      }
    }
  }, [displayedSlots, slots, vehicleType, initialSlotNumber, activeFloor, selectedSlot]);

  const handleSelectSlot = (slot: SlotType) => {
    if (slot.status !== "available") {
      toast.error(`Slot ${slot.slotNumber} is currently ${slot.status} and cannot be reserved.`);
      return;
    }
    setSelectedSlot(slot);
    setBookingError(null);
    toast.success(`Selected Slot ${slot.slotNumber} (${slot.floor})`);
  };

  const handleConfirmReservation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setBookingError(null);

    // Validation checks
    if (!isVehicleSupported) {
      const errMsg = `This facility does not support ${vehicleType.toUpperCase()} vehicles. Please select a supported vehicle type.`;
      setBookingError(errMsg);
      toast.error(errMsg);
      return;
    }

    if (!selectedSlot) {
      const errMsg = "Please select an available parking slot from the layout first.";
      setBookingError(errMsg);
      toast.error(errMsg);
      return;
    }

    if (!plateNumber.trim()) {
      const errMsg = "Please enter a valid vehicle license plate number.";
      setBookingError(errMsg);
      toast.error(errMsg);
      return;
    }

    const start = new Date(`${arrivalDate}T${arrivalTime}`);
    const end = new Date(`${departureDate}T${departureTime}`);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      const errMsg = "Departure date and time must be strictly after arrival date and time.";
      setBookingError(errMsg);
      toast.error(errMsg);
      return;
    }

    // Authentication Check: Redirect to login preserving all booking parameters
    if (!currentUser) {
      toast.info("Please sign in to confirm your parking reservation.");
      const params = new URLSearchParams();
      if (selectedSlot) params.set("slotNumber", selectedSlot.slotNumber);
      if (vehicleType) params.set("vehicleType", vehicleType);
      if (arrivalDate) params.set("arrivalDate", arrivalDate);
      if (arrivalTime) params.set("arrivalTime", arrivalTime);
      if (departureDate) params.set("departureDate", departureDate);
      if (departureTime) params.set("departureTime", departureTime);
      if (plateNumber) params.set("plateNumber", plateNumber.trim());
      if (vehicleModel) params.set("vehicleModel", vehicleModel.trim());

      const returnPath = `/parking/${facility.id}?${params.toString()}`;
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(returnPath)}&authRequired=true`);
      return;
    }

    setIsBooking(true);

    try {
      const payload = {
        locationId: facility.id,
        slotNumber: selectedSlot.slotNumber,
        slotId: selectedSlot.id,
        vehiclePlate: plateNumber.trim().toUpperCase(),
        vehicleType,
        vehicleModel: vehicleModel.trim() || undefined,
        startTime: `${arrivalDate}T${arrivalTime}:00`,
        endTime: `${departureDate}T${departureTime}:00`,
        hourlyRate: effectiveHourlyRate,
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        toast.error("Session expired or authentication required. Please sign in.");
        const params = new URLSearchParams();
        if (selectedSlot) params.set("slotNumber", selectedSlot.slotNumber);
        if (vehicleType) params.set("vehicleType", vehicleType);
        if (arrivalDate) params.set("arrivalDate", arrivalDate);
        if (arrivalTime) params.set("arrivalTime", arrivalTime);
        if (departureDate) params.set("departureDate", departureDate);
        if (departureTime) params.set("departureTime", departureTime);
        if (plateNumber) params.set("plateNumber", plateNumber.trim());
        if (vehicleModel) params.set("vehicleModel", vehicleModel.trim());

        const returnPath = `/parking/${facility.id}?${params.toString()}`;
        router.push(`/auth/login?callbackUrl=${encodeURIComponent(returnPath)}&authRequired=true`);
        return;
      }

      const responseData = await res.json();

      if (!res.ok || !responseData.success) {
        const errorMsg =
          responseData.error ||
          (responseData.errors ? Object.values(responseData.errors).flat().join(", ") : "Failed to confirm booking.");
        setBookingError(errorMsg);
        toast.error(errorMsg);
        // Refresh slot availability to highlight the conflict
        fetchIntervalSlots();
        return;
      }

      const booking = responseData.data;
      setConfirmedBooking({
        id: booking.id,
        bookingReference: booking.bookingReference,
        facilityName: booking.facilityName || facility.name,
        facilityAddress: booking.facilityAddress || `${facility.address}, ${facility.city}`,
        slotNumber: booking.slotNumber,
        floor: booking.floor || selectedSlot.floor,
        vehiclePlate: booking.vehiclePlate,
        vehicleModel: booking.vehicleModel || vehicleModel,
        vehicleType: booking.vehicleType || vehicleType,
        startTime: booking.startTime,
        endTime: booking.endTime,
        totalAmount: booking.totalAmount,
        qrCodeDataUrl: booking.qrCodeDataUrl,
        qrPayload: booking.qrPayload,
      });

      toast.success("Parking spot successfully reserved and saved to database!");
      // Refresh slots
      fetchIntervalSlots();
    } catch (err: any) {
      console.error("Booking submission error:", err);
      const errMsg = err.message || "Network error while connecting to booking server. Please retry.";
      setBookingError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsBooking(false);
    }
  };

  const handleDownloadQr = () => {
    if (!confirmedBooking?.qrCodeDataUrl) return;
    const link = document.createElement("a");
    link.href = confirmedBooking.qrCodeDataUrl;
    link.download = `ParkSmart-Pass-${confirmedBooking.bookingReference}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("QR Pass image downloaded.");
  };

  const handlePrintPass = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb / Back Navigation */}
        <div className="mb-6 flex items-center gap-2 text-xs text-slate-500">
          <Link href="/parking" className="flex items-center gap-1 hover:text-emerald-700 font-medium">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Parking Search</span>
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <span className="text-slate-800 font-semibold">{facility.name}</span>
        </div>

        {/* Facility Header & Hero Images */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-1 bg-slate-100">
            <div className="relative h-64 lg:h-80 lg:col-span-2 overflow-hidden">
              <Image
                src={facility.image}
                alt={facility.name}
                fill
                priority
                className="object-cover"
              />
              <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-emerald-800 shadow-sm backdrop-blur-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{facility.availableSlots} Slots Available Now</span>
              </div>
            </div>

            <div className="hidden lg:grid grid-rows-2 gap-1 h-80">
              {facility.galleryImages.slice(1, 3).map((img, i) => (
                <div key={i} className="relative h-full overflow-hidden">
                  <Image
                    src={img}
                    alt={`${facility.name} photo ${i + 2}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {facility.name}
                </h1>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>{facility.address}, {facility.city}, {facility.state} {facility.postalCode}</span>
                </p>
                <p className="mt-3 text-sm text-slate-600 max-w-2xl leading-relaxed">
                  {facility.tagline}
                </p>
              </div>

              {/* Pricing Box */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-right shrink-0">
                <span className="text-xs text-slate-500">Rate for {vehicleType.toUpperCase()}</span>
                <div className="text-2xl font-black text-slate-900">
                  {formatCurrency(effectiveHourlyRate)}
                  <span className="text-xs font-normal text-slate-500"> / hr</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Daily Max: {formatCurrency(facility.dailyRate)}
                </div>
              </div>
            </div>

            {/* Amenities & Feature Chips */}
            <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 mr-2">Amenities:</span>
              {facility.amenities.map((a) => (
                <span
                  key={a}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Facility Incompatibility Alert */}
        {!isVehicleSupported && (
          <div className="mb-8 rounded-2xl border-2 border-red-300 bg-red-50 p-5 shadow-xs animate-in fade-in">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-red-900">
                  Facility Does Not Support {vehicleType.toUpperCase()} Vehicles
                </h3>
                <p className="mt-1 text-xs text-red-700 leading-relaxed">
                  <strong>{facility.name}</strong> is not configured for {vehicleType.toUpperCase()} parking.
                  Supported vehicle types are:{" "}
                  <strong className="underline">
                    {facility.supportedVehicles.map((v) => v.toUpperCase()).join(", ")}
                  </strong>
                  . Please switch to a supported vehicle type below or navigate back to select a different facility.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Interactive Booking Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Select Vehicle, Interval, & Slot Layout (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Step 1: Vehicle Type Selector */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Car className="h-4 w-4 text-emerald-600" />
                  <span>1. Choose Vehicle Type</span>
                </h2>
                <span className="text-xs font-semibold text-slate-500">
                  Active: <strong className="text-emerald-700 capitalize">{vehicleType}</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: "car", label: "Car", icon: Car, desc: "Sedan / Hatch / SUV" },
                  { id: "ev", label: "EV", icon: Zap, desc: "EV with Charging" },
                  { id: "motorcycle", label: "Moto", icon: Bike, desc: "Motorcycle / Scooter" },
                  { id: "accessible", label: "Accessible", icon: Accessibility, desc: "ADA Dedicated Bay" },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = vehicleType === item.id;
                  const isSupported = facility.supportedVehicles.includes(item.id as any);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      id={`detail-vehicle-type-${item.id}`}
                      aria-label={`Select ${item.label}`}
                      aria-pressed={isSelected}
                      onClick={() => setVehicleType(item.id)}
                      className={`relative flex flex-col items-center justify-center rounded-xl p-3 text-center transition-all cursor-pointer ${
                        isSelected
                          ? "border-2 border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-xs ring-2 ring-emerald-600/20"
                          : "border-2 border-slate-200 bg-slate-50/70 text-slate-600 hover:bg-white hover:border-slate-300"
                      }`}
                    >
                      <Icon
                        className={`h-6 w-6 mb-1.5 transition-colors ${
                          isSelected ? "text-emerald-600" : isSupported ? "text-slate-500" : "text-slate-400"
                        }`}
                      />
                      <span className="text-xs font-bold">{item.label}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">{item.desc}</span>

                      {!isSupported && (
                        <span className="mt-1 rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-semibold text-red-700">
                          Unsupported
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Time Interval Picker */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-600" />
                  <span>2. Select Parking Time Interval</span>
                </h2>
                <button
                  type="button"
                  onClick={fetchIntervalSlots}
                  className="flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-medium cursor-pointer"
                >
                  <RefreshCw className={`h-3 w-3 ${isLoadingSlots ? "animate-spin" : ""}`} />
                  <span>Refresh Availability</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Arrival Date</label>
                  <input
                    type="date"
                    value={arrivalDate}
                    onChange={(e) => setArrivalDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Arrival Time</label>
                  <input
                    type="time"
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Departure Date</label>
                  <input
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Departure Time</label>
                  <input
                    type="time"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span>Calculated Duration: <strong className="text-slate-800">{durationHours} hours</strong></span>
                <span className="text-emerald-700 font-medium">Availability calculated dynamically for this interval</span>
              </div>
            </div>

            {/* Step 3: Interactive Slot Visualizer */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    3. Select Compatible {vehicleType.toUpperCase()} Slot
                  </h2>
                  <p className="text-xs text-slate-500">
                    Displaying slots compatible with <strong>{vehicleType.toUpperCase()}</strong> vehicles
                  </p>
                </div>

                {/* Floor Switcher */}
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                  {["Floor 1", "Floor 2"].map((floor) => (
                    <button
                      key={floor}
                      onClick={() => setActiveFloor(floor)}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                        activeFloor === floor
                          ? "bg-white text-slate-900 shadow-2xs"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      {floor}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Legend */}
              <div className="mb-6 flex flex-wrap items-center gap-4 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5">
                  <span className="h-3.5 w-3.5 rounded border border-emerald-600 bg-emerald-100" />
                  <span className="text-slate-700 font-medium">Available (Click to select)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3.5 w-3.5 rounded border border-red-500 bg-red-100" />
                  <span className="text-slate-700 font-medium">Occupied</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3.5 w-3.5 rounded border border-amber-500 bg-amber-100" />
                  <span className="text-slate-700 font-medium">Reserved</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3.5 w-3.5 rounded border border-slate-400 bg-slate-200" />
                  <span className="text-slate-700 font-medium">Maintenance</span>
                </div>
              </div>

              {/* Slot Grid Layout */}
              {displayedSlots.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                  <AlertCircle className="mx-auto h-6 w-6 text-slate-400 mb-2" />
                  <p className="font-semibold text-slate-700">
                    No {vehicleType.toUpperCase()} slots found on {activeFloor}.
                  </p>
                  <p className="mt-1">
                    Please switch to {activeFloor === "Floor 1" ? "Floor 2" : "Floor 1"} to find available slots for this vehicle.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {displayedSlots.map((slot) => {
                    const isSelected = selectedSlot?.slotNumber === slot.slotNumber;
                    const isAvailable = slot.status === "available";

                    return (
                      <button
                        key={slot.id || slot.slotNumber}
                        type="button"
                        id={`slot-${slot.slotNumber}`}
                        disabled={!isAvailable}
                        onClick={() => handleSelectSlot(slot)}
                        className={`relative flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all ${
                          isSelected
                            ? "border-2 border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600 shadow-md scale-[1.02]"
                            : slot.status === "available"
                            ? "border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 hover:border-emerald-400 cursor-pointer"
                            : slot.status === "occupied"
                            ? "border-red-200 bg-red-50/60 opacity-80 cursor-not-allowed"
                            : slot.status === "reserved"
                            ? "border-amber-200 bg-amber-50/60 opacity-80 cursor-not-allowed"
                            : "border-slate-300 bg-slate-100 opacity-60 cursor-not-allowed"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-sm text-slate-900">
                            {slot.slotNumber}
                          </span>
                          <div className="flex items-center gap-1">
                            {slot.vehicleType === "ev" && <Zap className="h-3.5 w-3.5 text-emerald-600" />}
                            {slot.vehicleType === "car" && <Car className="h-3.5 w-3.5 text-slate-500" />}
                            {slot.vehicleType === "motorcycle" && <Bike className="h-3.5 w-3.5 text-blue-500" />}
                            {slot.vehicleType === "accessible" && <Accessibility className="h-3.5 w-3.5 text-purple-600" />}
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-[11px]">
                          <span className="capitalize text-slate-500 font-medium">
                            {slot.status}
                          </span>
                          <span className="font-bold text-slate-700">
                            {formatCurrency(slot.pricePerHour || effectiveHourlyRate)}/hr
                          </span>
                        </div>

                        {/* Selected checkmark badge */}
                        {isSelected && (
                          <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Checkout Summary & Vehicle Form (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md sticky top-20">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
                Reservation Summary
              </h3>

              {/* Authenticated Restored Banner */}
              {currentUser && initialSlotNumber && (
                <div className="rounded-xl border border-emerald-300 bg-emerald-50/90 p-3 mb-4 text-xs text-emerald-800 flex items-start gap-2 animate-in fade-in">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Welcome back, {currentUser.name}!</span>
                    <p className="mt-0.5 text-emerald-700">
                      Your reservation details and Slot <strong>{initialSlotNumber}</strong> have been restored. Review your details below and click Confirm to complete your booking.
                    </p>
                  </div>
                </div>
              )}

              {!currentUser && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 mb-4 text-[11px] text-slate-600 flex items-center gap-2">
                  <Info className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>You will be prompted to sign in when confirming your booking.</span>
                </div>
              )}

              {/* Selected Slot Preview */}
              {selectedSlot ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 mb-5 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
                      Selected Slot
                    </span>
                    <h4 className="text-lg font-black text-emerald-950">
                      {selectedSlot.slotNumber} ({selectedSlot.floor})
                    </h4>
                    <p className="text-xs text-emerald-700 capitalize">
                      {selectedSlot.vehicleType} Compatible
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-emerald-700">Rate</span>
                    <p className="text-sm font-bold text-emerald-950">
                      {formatCurrency(effectiveHourlyRate)}/hr
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 mb-5 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Please select a slot from the layout.</span>
                </div>
              )}

              {/* Vehicle Registration Input */}
              <div className="space-y-3 mb-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vehicle License Plate *
                  </label>
                  <input
                    type="text"
                    id="license-plate-input"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. 7XYZ99"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono font-bold tracking-wider text-slate-900 focus:border-emerald-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vehicle Model (Optional)
                  </label>
                  <input
                    type="text"
                    id="vehicle-model-input"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    placeholder="e.g. Tesla Model 3 / White Sedan"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Error Message Alert */}
              {bookingError && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
                  <span>{bookingError}</span>
                </div>
              )}

              {/* Transparent Price Breakdown */}
              <div className="space-y-2 border-t border-slate-100 pt-4 mb-6 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Parking ({durationHours} hrs × {formatCurrency(effectiveHourlyRate)})</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Facility Service Fee</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(facilityFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Taxes (8%)</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(taxes)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-3 text-sm font-black text-slate-900">
                  <span>Total Amount</span>
                  <span className="text-emerald-700 text-base">{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="button"
                id="confirm-booking-btn"
                onClick={() => handleConfirmReservation()}
                disabled={isBooking || !selectedSlot || !isVehicleSupported}
                className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md shadow-emerald-700/20 hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isBooking ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Confirming Booking...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>Confirm & Generate QR Pass</span>
                  </>
                )}
              </button>

              <p className="mt-3 text-center text-[11px] text-slate-400">
                🔒 Guaranteed space. Free cancellation up to 1 hr before arrival.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal with Digital QR Pass */}
      {confirmedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-2xl text-center max-h-[90vh] overflow-y-auto">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <h3 className="text-xl font-extrabold text-slate-900">
              Reservation Confirmed!
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Your parking slot is securely reserved in MongoDB Atlas.
            </p>

            {/* Pass Card with QR Code */}
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left space-y-3">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Booking Reference</span>
                  <p className="text-sm font-mono font-bold text-slate-900">{confirmedBooking.bookingReference}</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                  Confirmed
                </span>
              </div>

              {/* QR Image */}
              <div className="flex justify-center py-2">
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col items-center">
                  <img
                    src={confirmedBooking.qrCodeDataUrl}
                    alt={`QR Pass for ${confirmedBooking.bookingReference}`}
                    className="h-44 w-44 object-contain"
                  />
                  <span className="mt-1.5 text-[10px] text-slate-400 font-mono">
                    Scan for touchless entry
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-slate-400">Facility:</span>
                  <p className="font-semibold text-slate-800 truncate">{confirmedBooking.facilityName}</p>
                </div>
                <div>
                  <span className="text-slate-400">Slot Reserved:</span>
                  <p className="font-bold text-emerald-700">
                    {confirmedBooking.slotNumber} ({confirmedBooking.floor})
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Vehicle Plate:</span>
                  <p className="font-mono font-bold text-slate-800">{confirmedBooking.vehiclePlate}</p>
                </div>
                <div>
                  <span className="text-slate-400">Vehicle Type:</span>
                  <p className="capitalize font-semibold text-slate-800">{confirmedBooking.vehicleType}</p>
                </div>
                <div>
                  <span className="text-slate-400">Arrival:</span>
                  <p className="font-semibold text-slate-800">
                    {new Date(confirmedBooking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Departure:</span>
                  <p className="font-semibold text-slate-800">
                    {new Date(confirmedBooking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-slate-500 font-semibold">Total Paid:</span>
                  <span className="text-base font-black text-emerald-700">
                    {formatCurrency(confirmedBooking.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions: Download, Print, Close */}
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDownloadQr}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 py-2.5 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Pass</span>
              </button>

              <button
                type="button"
                onClick={handlePrintPass}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 py-2.5 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Pass</span>
              </button>
            </div>

            {/* Navigation Actions */}
            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              <Link
                href="/dashboard"
                className="flex-1 rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors text-center"
              >
                Go to My Bookings
              </Link>
              <button
                type="button"
                onClick={() => setConfirmedBooking(null)}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
