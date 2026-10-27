"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  ShieldAlert,
  MapPin, 
  Car, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Download, 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertTriangle,
  Settings,
  Filter,
  Loader2
} from "lucide-react";
import { SAMPLE_LOCATIONS } from "@/lib/data/sample-parking";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "facilities" | "bookings" | "users">("overview");

  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.push("/auth/login?callbackUrl=/admin&authRequired=true");
          return;
        }
        const data = await res.json();
        if (!data.authenticated || !data.user) {
          router.push("/auth/login?callbackUrl=/admin&authRequired=true");
          return;
        }
        if (isMounted) {
          setCurrentUser(data.user);
        }
      } catch (err) {
        router.push("/auth/login?callbackUrl=/admin&authRequired=true");
      } finally {
        if (isMounted) setIsLoadingAuth(false);
      }
    }
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, [router]);

  // Metrics
  const totalFacilities = SAMPLE_LOCATIONS.length;
  const totalSlots = SAMPLE_LOCATIONS.reduce((acc, curr) => acc + curr.totalSlots, 0);
  const totalAvailable = SAMPLE_LOCATIONS.reduce((acc, curr) => acc + curr.availableSlots, 0);
  const totalOccupied = SAMPLE_LOCATIONS.reduce((acc, curr) => acc + curr.occupiedSlots, 0);
  const totalRevenue = 14820.50;

  // Bookings state for admin
  const [bookings, setBookings] = useState([
    {
      id: "b-1",
      reference: "PK-20261024-4821",
      facility: "Downtown Metro Central Garage",
      user: "Alex Morgan (driver@parksmart.io)",
      slot: "A-04",
      amount: 21.06,
      status: "Checked In",
      date: "Today, 14:02",
    },
    {
      id: "b-2",
      reference: "PK-20261025-1093",
      facility: "SkyHarbor Airport Express Deck",
      user: "Alex Morgan (driver@parksmart.io)",
      slot: "B-12",
      amount: 72.00,
      status: "Confirmed",
      date: "Tomorrow, 08:00",
    },
    {
      id: "b-3",
      reference: "PK-20261024-8192",
      facility: "Downtown Metro Central Garage",
      user: "Sarah Chen (sarah@example.com)",
      slot: "A-07",
      amount: 19.50,
      status: "Checked In",
      date: "Today, 13:45",
    },
    {
      id: "b-4",
      reference: "PK-20261023-4412",
      facility: "Tech Plaza Smart Bay",
      user: "David Miller (david@example.com)",
      slot: "A-02",
      amount: 15.00,
      status: "Completed",
      date: "Yesterday, 16:30",
    },
  ]);

  // Users state for admin
  const [users, setUsers] = useState([
    { id: "u-1", name: "System Admin", email: "admin@parksmart.io", role: "admin", status: "active" },
    { id: "u-2", name: "Operator Gate 1", email: "operator@parksmart.io", role: "operator", status: "active" },
    { id: "u-3", name: "Alex Morgan", email: "driver@parksmart.io", role: "user", status: "active" },
    { id: "u-4", name: "Sarah Chen", email: "sarah@example.com", role: "user", status: "active" },
  ]);

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Reference,Facility,User,Slot,Amount,Status,Date"]
        .concat(
          bookings.map(
            (b) =>
              `"${b.reference}","${b.facility}","${b.user}","${b.slot}",${b.amount},"${b.status}","${b.date}"`
          )
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `parksmart-bookings-report-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Bookings CSV report exported successfully!");
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-3" />
        <p className="text-sm font-medium text-slate-600">Verifying administrator credentials...</p>
      </div>
    );
  }

  // Access Denied if non-admin
  if (currentUser && currentUser.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-red-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 mb-4">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Access Denied</h2>
          <p className="mt-2 text-sm text-slate-600">
            Administrator privileges required. Your account (<strong className="font-mono text-slate-800">{currentUser.email}</strong>) does not have permission to view the Super Admin Console.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link
              href={currentUser.role === "operator" ? "/operator" : "/dashboard"}
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
            >
              Return to {currentUser.role === "operator" ? "Operator Station" : "Driver Dashboard"}
            </Link>
            <Link
              href="/auth/login?callbackUrl=/admin"
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Sign In with Admin Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Admin Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800">
                Super Admin Console
              </span>
              <span className="text-xs text-slate-400">
                • {currentUser?.name || "System Admin"} ({currentUser?.email || "admin@parksmart.io"})
              </span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900">
              Platform Overview & Management
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage parking facilities, slot allocations, live revenue, and access control.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV Report</span>
            </button>
          </div>
        </div>

        {/* KPI Metric Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400">Total Facilities</span>
              <MapPin className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="mt-3 text-3xl font-black text-slate-900">{totalFacilities}</p>
            <p className="mt-1 text-xs text-emerald-700 font-medium">Across Metro City zones</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400">Total Slots</span>
              <Car className="h-5 w-5 text-blue-600" />
            </div>
            <p className="mt-3 text-3xl font-black text-slate-900">{totalSlots}</p>
            <p className="mt-1 text-xs text-slate-500">{totalAvailable} Free / {totalOccupied} Occupied</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400">Current Occupancy</span>
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
            <p className="mt-3 text-3xl font-black text-slate-900">
              {Math.round((totalOccupied / totalSlots) * 100)}%
            </p>
            <p className="mt-1 text-xs text-amber-700 font-medium">Optimal turnover rate</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400">Recorded Revenue</span>
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="mt-3 text-3xl font-black text-slate-900">{formatCurrency(totalRevenue)}</p>
            <p className="mt-1 text-xs text-emerald-700 font-medium">+18.4% this month</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="mb-6 flex items-center gap-2 border-b border-slate-200 pb-3">
          {[
            { id: "overview", label: "Facilities & Occupancy" },
            { id: "bookings", label: "All Reservations" },
            { id: "users", label: "User & Operator Access" },
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

        {/* Tab 1: Facilities Table */}
        {activeTab === "overview" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Monitored Parking Facilities ({SAMPLE_LOCATIONS.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Facility Name</th>
                    <th className="py-3 px-4">Address</th>
                    <th className="py-3 px-4">Total Slots</th>
                    <th className="py-3 px-4">Available</th>
                    <th className="py-3 px-4">Hourly Rate</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {SAMPLE_LOCATIONS.map((loc) => (
                    <tr key={loc.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{loc.name}</td>
                      <td className="py-3.5 px-4">{loc.address}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{loc.totalSlots}</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-700">{loc.availableSlots}</td>
                      <td className="py-3.5 px-4 font-semibold">{formatCurrency(loc.hourlyRate)}/hr</td>
                      <td className="py-3.5 px-4">
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          Active Operational
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Bookings */}
        {activeTab === "bookings" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">
                System Bookings Master Record
              </h3>
              <button
                onClick={handleExportCSV}
                className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export Filtered CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4">Facility</th>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Slot</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{b.reference}</td>
                      <td className="py-3.5 px-4 font-medium">{b.facility}</td>
                      <td className="py-3.5 px-4 text-slate-500">{b.user}</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-700">{b.slot}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{formatCurrency(b.amount)}</td>
                      <td className="py-3.5 px-4">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          b.status === "Checked In" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Users */}
        {activeTab === "users" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Registered Accounts & Access Permissions
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Account Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{u.name}</td>
                      <td className="py-3.5 px-4 font-mono">{u.email}</td>
                      <td className="py-3.5 px-4">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          u.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : u.role === "operator"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-slate-100 text-slate-800"
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
