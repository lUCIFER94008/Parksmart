"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Car, 
  Calendar, 
  Clock, 
  MapPin, 
  QrCode, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Printer, 
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Search,
  ExternalLink,
  User as UserIcon,
  LogOut,
  Loader2
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface BookingItem {
  id: string;
  reference: string;
  facilityName: string;
  address: string;
  slotNumber: string;
  vehiclePlate: string;
  vehicleType: string;
  startTime: string;
  endTime: string;
  amount: number;
  status: "active" | "upcoming" | "completed" | "cancelled";
  qrUrl: string;
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isUnauthorized = searchParams.get("error") === "unauthorized";

  const [activeTab, setActiveTab] = useState<"bookings" | "vehicles" | "history">("bookings");
  const [selectedPass, setSelectedPass] = useState<BookingItem | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // User Bookings state
  const [bookings, setBookings] = useState<BookingItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function initDashboard() {
      try {
        const authRes = await fetch("/api/auth/me");
        if (!authRes.ok) {
          router.push("/auth/login?callbackUrl=/dashboard&authRequired=true");
          return;
        }
        const authData = await authRes.json();
        if (!authData.authenticated || !authData.user) {
          router.push("/auth/login?callbackUrl=/dashboard&authRequired=true");
          return;
        }
        if (isMounted) {
          setCurrentUser(authData.user);
        }

        // Fetch user's real bookings from MongoDB Atlas
        const bookingsRes = await fetch("/api/bookings");
        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          if (isMounted && bookingsData.data && Array.isArray(bookingsData.data)) {
            const mapped: BookingItem[] = bookingsData.data.map((b: any) => ({
              id: b._id || b.id,
              reference: b.bookingReference,
              facilityName: b.facilityName || "ParkSmart Garage",
              address: b.facilityAddress || "Metro City",
              slotNumber: b.slotNumber,
              vehiclePlate: b.vehiclePlate,
              vehicleType: b.vehicleType,
              startTime: new Date(b.startTime).toLocaleString([], { dateStyle: "short", timeStyle: "short" }),
              endTime: new Date(b.endTime).toLocaleString([], { dateStyle: "short", timeStyle: "short" }),
              amount: b.totalAmount,
              status: b.status === "confirmed" ? "upcoming" : b.status,
              qrUrl: b.qrCodeDataUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${b.bookingReference}`,
            }));
            setBookings(mapped);
          }
        }
      } catch (err) {
        console.error("Dashboard init error:", err);
      } finally {
        if (isMounted) setIsLoadingAuth(false);
      }
    }
    initDashboard();
    return () => {
      isMounted = false;
    };
  }, [router]);

  // Sample Vehicles
  const [vehicles, setVehicles] = useState([
    {
      id: "v-1",
      plateNumber: "CA-7XYZ99",
      make: "Tesla",
      model: "Model 3 Long Range",
      color: "Pearl White",
      vehicleType: "EV",
      isDefault: true,
    },
    {
      id: "v-2",
      plateNumber: "NY-4BBD81",
      make: "Honda",
      model: "CR-V Hybrid",
      color: "Modern Steel",
      vehicleType: "Car",
      isDefault: false,
    },
  ]);

  // New vehicle form state
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [newPlate, setNewPlate] = useState("");
  const [newMake, setNewMake] = useState("");
  const [newModel, setNewModel] = useState("");

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlate || !newMake || !newModel) {
      toast.error("Please fill in all vehicle details");
      return;
    }
    const created = {
      id: `v-${Date.now()}`,
      plateNumber: newPlate.toUpperCase(),
      make: newMake,
      model: newModel,
      color: "Black",
      vehicleType: "Car",
      isDefault: vehicles.length === 0,
    };
    setVehicles([...vehicles, created]);
    setShowAddVehicle(false);
    setNewPlate("");
    setNewMake("");
    setNewModel("");
    toast.success("Vehicle registered successfully!");
  };

  const handleCancelBooking = (id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))
    );
    toast.success("Booking cancelled. Availability restored.");
  };

  const activeBooking = bookings.find((b) => b.status === "active");

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-3" />
        <p className="text-sm font-medium text-slate-600">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Unauthorized Access Notification */}
        {isUnauthorized && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-center gap-3 text-amber-900 shadow-xs">
            <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0" />
            <div className="text-xs">
              <p className="font-bold">Access Restricted</p>
              <p className="text-amber-700">You do not have permission to access the requested portal. Your account is only authorized for the Driver Dashboard.</p>
            </div>
          </div>
        )}

        {/* User Welcome Banner */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 capitalize">
                {currentUser?.role || "Driver"} Account
              </span>
              <span className="text-xs text-slate-400">• {currentUser?.email || "driver@parksmart.io"}</span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900">
              Welcome back, {currentUser?.name || "Driver"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your active reservations, digital entry passes, and registered vehicles.
            </p>
          </div>

          <Link
            href="/parking"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors shrink-0"
          >
            <Search className="h-4 w-4" />
            <span>Find & Reserve Spot</span>
          </Link>
        </div>

        {/* Active Parking Session Alert if applicable */}
        {activeBooking && (
          <div className="mb-8 rounded-2xl border border-emerald-300 bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 text-white shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-xs px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                  <span>Active Parking Session</span>
                </div>
                <h2 className="mt-2 text-xl sm:text-2xl font-bold">
                  Currently Parked at {activeBooking.facilityName}
                </h2>
                <p className="mt-1 text-xs text-emerald-100">
                  Reserved Slot: <strong className="text-white text-sm">{activeBooking.slotNumber}</strong> • Vehicle Plate: <strong className="text-white text-sm">{activeBooking.vehiclePlate}</strong>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedPass(activeBooking)}
                  className="rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-emerald-800 shadow-sm hover:bg-emerald-50 transition-colors flex items-center gap-2"
                >
                  <QrCode className="h-4 w-4 text-emerald-600" />
                  <span>Show Gate QR Pass</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-6 flex items-center gap-2 border-b border-slate-200 pb-3">
          {[
            { id: "bookings", label: "Upcoming & Active" },
            { id: "history", label: "Completed History" },
            { id: "vehicles", label: "My Vehicles" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Bookings (Active & Upcoming) */}
        {activeTab === "bookings" && (
          <div className="space-y-4">
            {bookings
              .filter((b) => b.status === "active" || b.status === "upcoming")
              .map((b) => (
                <div
                  key={b.id}
                  className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all hover:border-slate-300"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400">
                        {b.reference}
                      </span>
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        b.status === "active"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {b.status === "active" ? "In Progress" : "Confirmed Upcoming"}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">
                      {b.facilityName}
                    </h3>
                    <p className="flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{b.address}</span>
                    </p>

                    <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                      <span>Slot: <strong className="text-emerald-700 font-bold">{b.slotNumber}</strong></span>
                      <span>Vehicle: <strong className="text-slate-900 font-mono">{b.vehiclePlate}</strong></span>
                      <span>Time: <strong>{b.startTime} - {b.endTime}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                    <div className="text-right mr-2 hidden sm:block">
                      <span className="text-[11px] text-slate-400">Paid Total</span>
                      <p className="text-base font-bold text-slate-900">{formatCurrency(b.amount)}</p>
                    </div>

                    <button
                      onClick={() => setSelectedPass(b)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <QrCode className="h-4 w-4 text-emerald-600" />
                      <span>View Pass</span>
                    </button>

                    {b.status === "upcoming" && (
                      <button
                        onClick={() => handleCancelBooking(b.id)}
                        className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Tab 2: History */}
        {activeTab === "history" && (
          <div className="space-y-4">
            {bookings
              .filter((b) => b.status === "completed" || b.status === "cancelled")
              .map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-400">{b.reference}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        b.status === "completed" ? "bg-slate-100 text-slate-700" : "bg-red-50 text-red-700"
                      }`}>
                        {b.status}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-800 mt-1">{b.facilityName}</h4>
                    <p className="text-xs text-slate-500">{b.startTime} • Slot {b.slotNumber} • Plate {b.vehiclePlate}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-800">{formatCurrency(b.amount)}</span>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Tab 3: Vehicles */}
        {activeTab === "vehicles" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-900">Registered Vehicles</h3>
                <p className="text-xs text-slate-500">Fast one-click slot reservation with saved vehicle plates</p>
              </div>
              <button
                onClick={() => setShowAddVehicle(!showAddVehicle)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Vehicle</span>
              </button>
            </div>

            {/* Add Vehicle Form */}
            {showAddVehicle && (
              <form onSubmit={handleAddVehicle} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">New Vehicle</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">License Plate *</label>
                    <input
                      type="text"
                      placeholder="e.g. 7XYZ99"
                      value={newPlate}
                      onChange={(e) => setNewPlate(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2 text-xs font-mono uppercase"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Make *</label>
                    <input
                      type="text"
                      placeholder="e.g. Tesla"
                      value={newMake}
                      onChange={(e) => setNewMake(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2 text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Model *</label>
                    <input
                      type="text"
                      placeholder="e.g. Model Y"
                      value={newModel}
                      onChange={(e) => setNewModel(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2 text-xs"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddVehicle(false)}
                    className="rounded-xl border border-slate-300 px-4 py-1.5 text-xs text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                  >
                    Save Vehicle
                  </button>
                </div>
              </form>
            )}

            {/* Vehicles List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {vehicles.map((v) => (
                <div key={v.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                      <Car className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-black text-slate-900">{v.plateNumber}</span>
                        {v.isDefault && (
                          <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{v.make} {v.model} ({v.color})</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setVehicles(vehicles.filter((item) => item.id !== v.id));
                      toast.info("Vehicle removed");
                    }}
                    className="text-slate-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal: View Digital QR Pass */}
        {selectedPass && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-center">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Digital Parking Pass
                </span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                  Valid Entry
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs inline-block mb-4">
                <img
                  src={selectedPass.qrUrl}
                  alt="QR Pass"
                  className="h-48 w-48 object-contain mx-auto"
                />
              </div>

              <p className="font-mono text-sm font-black text-slate-900">{selectedPass.reference}</p>
              <h4 className="text-base font-bold text-slate-800 mt-1">{selectedPass.facilityName}</h4>
              <p className="text-xs text-slate-500">{selectedPass.address}</p>

              <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 text-xs text-left">
                <div>
                  <span className="text-slate-400">Slot Reserved:</span>
                  <p className="font-extrabold text-emerald-700">{selectedPass.slotNumber}</p>
                </div>
                <div>
                  <span className="text-slate-400">Vehicle:</span>
                  <p className="font-mono font-bold text-slate-800">{selectedPass.vehiclePlate}</p>
                </div>
                <div className="col-span-2 border-t border-slate-200/60 pt-2">
                  <span className="text-slate-400">Valid Time Window:</span>
                  <p className="font-medium text-slate-800">{selectedPass.startTime} to {selectedPass.endTime}</p>
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print Pass</span>
                </button>
                <button
                  onClick={() => setSelectedPass(null)}
                  className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UserDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-3" />
          <p className="text-sm font-medium text-slate-600">Loading your dashboard...</p>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
