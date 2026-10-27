import Link from "next/link";
import { Car, ShieldCheck, Mail, Phone, MapPin, ExternalLink, QrCode } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                <Car className="h-4 w-4 text-emerald-400" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Park<span className="text-emerald-600">Smart</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              Real-time smart parking discovery, reservation, and automated gate validation system. 
              Eliminate circling for spots, reserve in advance, and check in touchlessly with encrypted QR passes.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active Availability Engine</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/parking" className="hover:text-emerald-600 transition-colors">
                  Find Parking
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-emerald-600 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/#featured" className="hover:text-emerald-600 transition-colors">
                  Featured Facilities
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-emerald-600 transition-colors">
                  Platform Features
                </Link>
              </li>
            </ul>
          </div>

          {/* Role Dashboards */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              Role Access
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/dashboard" className="flex items-center gap-1 hover:text-emerald-600 transition-colors">
                  <span>User Dashboard</span>
                </Link>
              </li>
              <li>
                <Link href="/operator" className="flex items-center gap-1 hover:text-emerald-600 transition-colors">
                  <QrCode className="h-3.5 w-3.5 text-blue-500" />
                  <span>Operator Scanner</span>
                </Link>
              </li>
              <li>
                <Link href="/admin" className="flex items-center gap-1 hover:text-emerald-600 transition-colors">
                  <ShieldCheck className="h-3.5 w-3.5 text-purple-500" />
                  <span>Admin Console</span>
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-emerald-600 transition-colors">
                  Sign In / Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Contact */}
          <div id="contact">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              Support & Contact
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600">support@parksmart.io</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600">+1 (800) 555-PARK</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                <span className="text-slate-600">450 Financial Way, Metro City, CA</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-slate-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} ParkSmart Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security Guarantee</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
