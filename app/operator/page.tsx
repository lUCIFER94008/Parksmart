"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  QrCode, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Car, 
  Clock, 
  ShieldCheck, 
  ShieldAlert,
  ArrowRight, 
  Wrench,
  Camera,
  LogOut,
  LogIn,
  Loader2
} from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

interface VerifiedBooking {
  reference: string;
  facility: string;
  slotNumber: string;
  driverName: string;
  vehiclePlate: string;
  status: "confirmed" | "checked_in" | "completed" | "cancelled";
  timeWindow: string;
  amount: number;
}

export default function OperatorPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [assignedFacility, setAssignedFacility] = useState("Downtown Metro Central Garage");
  const [referenceInput, setReferenceInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedRecord, setVerifiedRecord] = useState<VerifiedBooking | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.push("/auth/login?callbackUrl=/operator&authRequired=true");
          return;
        }
        const data = await res.json();
        if (!data.authenticated || !data.user) {
          router.push("/auth/login?callbackUrl=/operator&authRequired=true");
          return;
        }
        if (isMounted) {
          setCurrentUser(data.user);
        }
      } catch (err) {
        router.push("/auth/login?callbackUrl=/operator&authRequired=true");
      } finally {
        if (isMounted) setIsLoadingAuth(false);
      }
    }
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, [router]);

  // Active checked-in vehicles at this facility
  const [activeSessions, setActiveSessions] = useState([
    {
      id: "s-1",
      reference: "PK-20261024-4821",
      slotNumber: "A-04",
      vehiclePlate: "CA-7XYZ99",
      checkInTime: "14:02 PM",
      driver: "Alex Morgan",
    },
    {
      id: "s-2",
      reference: "PK-20261024-8192",
      slotNumber: "A-07",
      vehiclePlate: "CA-8NMK21",
      checkInTime: "13:45 PM",
      driver: "Sarah Chen",
    },
  ]);

  // Handle Lookup or QR Scan
  const handleVerify = (refQuery?: string) => {
    const query = (refQuery || referenceInput).trim();
    if (!query) {
      toast.error("Please enter a booking reference or scan a QR pass.");
      return;
    }

    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      // Simulated server validation
      if (query.toUpperCase().includes("CANCEL")) {
        toast.error("Security Alert: This booking was cancelled. Entry denied.");
        setVerifiedRecord(null);
        return;
      }

      const match: VerifiedBooking = {
        reference: query.toUpperCase(),
        facility: assignedFacility,
        slotNumber: "A-04",
        driverName: "Alex Morgan",
        vehiclePlate: "CA-7XYZ99",
        status: activeSessions.some((s) => s.reference === query.toUpperCase())
          ? "checked_in"
          : "confirmed",
        timeWindow: "Today, 02:00 PM - 05:00 PM",
        amount: 21.06,
      };

      setVerifiedRecord(match);
      toast.success("QR Pass verified successfully!");
    }, 500);
  };

  const handleCheckIn = () => {
    if (!verifiedRecord) return;
    if (activeSessions.some((s) => s.reference === verifiedRecord.reference)) {
      toast.error("Duplicate Check-in Alert: Vehicle is already checked in.");
      return;
    }

    const newSession = {
      id: `s-${Date.now()}`,
      reference: verifiedRecord.reference,
      slotNumber: verifiedRecord.slotNumber,
      vehiclePlate: verifiedRecord.vehiclePlate,
      checkInTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      driver: verifiedRecord.driverName,
    };

    setActiveSessions([newSession, ...activeSessions]);
    setVerifiedRecord({ ...verifiedRecord, status: "checked_in" });
    toast.success(`Check-In recorded for Slot ${verifiedRecord.slotNumber}. Gate opened.`);
  };

  const handleCheckOut = (reference: string) => {
    setActiveSessions((prev) => prev.filter((s) => s.reference !== reference));
    if (verifiedRecord?.reference === reference) {
      setVerifiedRecord({ ...verifiedRecord, status: "completed" });
    }
    toast.success(`Check-Out recorded for ${reference}. Slot now available.`);
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-3" />
        <p className="text-sm font-medium text-slate-600">Verifying operator credentials...</p>
      </div>
    );
  }

  // Access Denied if regular user
  if (currentUser && currentUser.role !== "operator" && currentUser.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-red-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 mb-4">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Access Denied</h2>
          <p className="mt-2 text-sm text-slate-600">
            Parking Operator access required. Your account (<strong className="font-mono text-slate-800">{currentUser.email}</strong>) is a Driver account and cannot access the Gate Validation Scanner.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link
              href="/dashboard"
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
            >
              Return to Driver Dashboard
            </Link>
            <Link
              href="/auth/login?callbackUrl=/operator"
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Sign In with Operator Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Operator Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                Operator Station
              </span>
              <span className="text-xs text-slate-400">
                • {currentUser?.name || "Operator Gate 1"} ({currentUser?.email || "operator@parksmart.io"})
              </span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900">
              Parking Gate & QR Validation Console
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Assigned Facility: <strong className="text-slate-800">{assignedFacility}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Gate Camera Online</span>
            </span>
          </div>
        </div>

        {/* Scanner & Manual Lookup Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Scanner Simulation (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Camera className="h-5 w-5 text-emerald-600" />
              <span>Live Gate Scanner & QR Validation</span>
            </h2>

            {/* Simulated Live Camera Feed Viewfinder */}
            <div className="relative rounded-2xl bg-slate-950 h-64 overflow-hidden flex flex-col items-center justify-center text-white border-2 border-slate-800">
              {/* Scan target viewfinder */}
              <div className="relative h-44 w-44 rounded-xl border-2 border-dashed border-emerald-400/80 flex items-center justify-center animate-pulse">
                <QrCode className="h-20 w-20 text-emerald-400/50" />
                <span className="absolute bottom-2 text-[10px] uppercase font-mono tracking-widest text-emerald-400">
                  Align QR Code
                </span>
              </div>

              {/* Quick test scan button */}
              <button
                type="button"
                onClick={() => handleVerify("PK-20261024-4821")}
                className="absolute bottom-3 right-3 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-emerald-500 transition-colors"
              >
                Scan Test Pass (PK-20261024-4821)
              </button>
            </div>

            {/* Manual Reference Fallback Form */}
            <div className="mt-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Manual Reference Lookup Fallback
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Enter Reference (e.g. PK-20261024-4821)"
                    value={referenceInput}
                    onChange={(e) => setReferenceInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 text-xs font-mono font-bold tracking-wider text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleVerify()}
                  disabled={isVerifying}
                  className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors disabled:opacity-60"
                >
                  {isVerifying ? "Verifying..." : "Verify Pass"}
                </button>
              </div>
            </div>
          </div>

          {/* Validation Result Card (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <span>Pass Security Verification</span>
            </h2>

            {verifiedRecord ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-slate-900">
                      {verifiedRecord.reference}
                    </span>
                    <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white">
                      Valid Pass
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500">Reserved Slot:</span>
                      <p className="text-base font-black text-emerald-800">{verifiedRecord.slotNumber}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Vehicle Plate:</span>
                      <p className="text-base font-mono font-bold text-slate-900">{verifiedRecord.vehiclePlate}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Driver Name:</span>
                      <p className="font-semibold text-slate-800">{verifiedRecord.driverName}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Status:</span>
                      <p className="font-bold text-emerald-700 capitalize">{verifiedRecord.status.replace("_", " ")}</p>
                    </div>
                  </div>
                </div>

                {/* Gate Control Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleCheckIn}
                    disabled={verifiedRecord.status === "checked_in"}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white hover:bg-emerald-700 transition-colors disabled:opacity-40"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Open Entry Gate</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCheckOut(verifiedRecord.reference)}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-3 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Record Check-Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-56 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center p-6 text-center text-slate-400">
                <QrCode className="h-10 w-10 text-slate-300 mb-2" />
                <p className="text-xs">Scan customer QR pass or lookup reference to display gate verification details.</p>
              </div>
            )}
          </div>
        </div>

        {/* Active Checked-In Sessions Table */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Currently Checked-In Vehicles ({activeSessions.length})
              </h3>
              <p className="text-xs text-slate-500">
                Real-time active occupancy inside {assignedFacility}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Slot</th>
                  <th className="py-3 px-4">Plate Number</th>
                  <th className="py-3 px-4">Driver</th>
                  <th className="py-3 px-4">Check-In Time</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{session.reference}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700">{session.slotNumber}</td>
                    <td className="py-3.5 px-4 font-mono">{session.vehiclePlate}</td>
                    <td className="py-3.5 px-4">{session.driver}</td>
                    <td className="py-3.5 px-4">{session.checkInTime}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleCheckOut(session.reference)}
                        className="rounded-lg border border-slate-300 px-3 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Check-Out & Exit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
