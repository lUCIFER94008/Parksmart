"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Car, 
  Menu, 
  X, 
  Search, 
  ShieldCheck, 
  QrCode, 
  LayoutDashboard, 
  User as UserIcon, 
  LogOut
} from "lucide-react";
import { toast } from "sonner";

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "operator" | "admin";
}

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Check auth status on mount and pathname change
  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            if (data.authenticated && data.user) {
              setCurrentUser(data.user);
            } else {
              setCurrentUser(null);
            }
          }
        }
      } catch (err) {
        if (isMounted) setCurrentUser(null);
      }
    }
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setCurrentUser(null);
      toast.success("Signed out successfully.");
      router.push("/");
      router.refresh();
    } catch (err) {
      toast.error("Failed to sign out.");
    }
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Find Parking", href: "/parking" },
    { name: "How It Works", href: "/#how-it-works" },
    { name: "Features", href: "/#features" },
    { name: "Contact", href: "/#contact" },
  ];

  const getDashboardLink = () => {
    if (!currentUser) return null;
    switch (currentUser.role) {
      case "admin":
        return {
          href: "/admin",
          label: "Admin Console",
          icon: ShieldCheck,
          color: "border-purple-600/30 bg-purple-50 text-purple-700 hover:bg-purple-100",
        };
      case "operator":
        return {
          href: "/operator",
          label: "Scanner",
          icon: QrCode,
          color: "border-blue-600/30 bg-blue-50 text-blue-700 hover:bg-blue-100",
        };
      default:
        return {
          href: "/dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
          color: "border-emerald-600/30 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
        };
    }
  };

  const dashboardInfo = getDashboardLink();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link 
          href="/" 
          className="group flex items-center gap-2.5 transition-transform hover:scale-[1.01]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm ring-1 ring-slate-900/10 transition-colors group-hover:bg-emerald-600">
            <Car className="h-5 w-5 text-emerald-400 group-hover:text-white transition-colors" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Park<span className="text-emerald-600">Smart</span>
            </span>
            <span className="text-[10px] -mt-1 font-medium text-slate-500 uppercase tracking-wider">
              Smart Availability
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links - Centered & Balanced */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? "bg-slate-100 text-slate-950 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Items */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Search Slots CTA */}
          <Link
            href="/parking"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <Search className="h-4 w-4 text-emerald-600" />
            <span>Search Slots</span>
          </Link>

          {/* If Authenticated: Show authorized dashboard button & Sign Out */}
          {currentUser && dashboardInfo ? (
            <div className="flex items-center gap-2.5">
              <Link
                href={dashboardInfo.href}
                className={`flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-semibold transition-colors ${dashboardInfo.color}`}
              >
                <dashboardInfo.icon className="h-4 w-4" />
                <span>{dashboardInfo.label}</span>
              </Link>

              <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
                <span className="text-xs font-semibold text-slate-800 max-w-[120px] truncate" title={currentUser.name}>
                  {currentUser.name.split(" ")[0]}
                </span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                  aria-label="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Unauthenticated: Sign In & Get Started */
            <div className="flex items-center gap-2.5">
              <Link
                href="/auth/login"
                className="rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                Sign In
              </Link>

              <Link
                href="/auth/register"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link
            href="/parking"
            className="rounded-lg bg-emerald-600 p-2 text-white"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-100 cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white px-4 pt-2 pb-6 lg:hidden animate-in slide-in-from-top-2 duration-150">
          <div className="space-y-1 pb-3 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-4">
            {currentUser && dashboardInfo ? (
              <div className="space-y-2">
                <div className="px-3 py-1 flex items-center justify-between text-xs text-slate-500">
                  <span>Signed in as <strong className="text-slate-900">{currentUser.name}</strong></span>
                  <span className="capitalize rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700">
                    {currentUser.role}
                  </span>
                </div>
                <Link
                  href={dashboardInfo.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-center gap-2 w-full rounded-lg border py-2.5 text-center text-sm font-semibold transition-colors ${dashboardInfo.color}`}
                >
                  <dashboardInfo.icon className="h-4 w-4" />
                  <span>{dashboardInfo.label}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="flex items-center justify-center gap-2 w-full rounded-lg border border-slate-300 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full rounded-lg border border-slate-300 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full rounded-lg bg-emerald-600 py-2.5 text-center text-sm font-semibold text-white shadow hover:bg-emerald-700"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
