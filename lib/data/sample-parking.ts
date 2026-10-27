export interface ParkingLocationType {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  lat: number;
  lng: number;
  distanceMiles?: number;
  image: string;
  galleryImages: string[];
  hourlyRate: number;
  dailyRate: number;
  vehiclePricing: {
    car: number;
    motorcycle: number;
    ev: number;
    accessible: number;
  };
  totalSlots: number;
  availableSlots: number;
  occupiedSlots: number;
  reservedSlots: number;
  rating: number;
  reviewCount: number;
  openingHours: {
    open: string;
    close: string;
    is24_7: boolean;
  };
  amenities: string[];
  supportedVehicles: ('car' | 'motorcycle' | 'ev' | 'accessible')[];
  featured: boolean;
  securityStaff: boolean;
  hasCCTV: boolean;
  hasEVCharging: boolean;
  isCovered: boolean;
  isAccessible: boolean;
  cancellationPolicy: string;
}

export interface SlotType {
  id: string;
  slotNumber: string;
  floor: string;
  vehicleType: 'car' | 'motorcycle' | 'ev' | 'accessible';
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  pricePerHour: number;
}

export const SAMPLE_LOCATIONS: ParkingLocationType[] = [
  {
    id: "loc-downtown-metro",
    name: "Downtown Metro Central Garage",
    slug: "downtown-metro-central",
    tagline: "Multilevel automated parking in the central business district",
    address: "450 Financial Way, Downtown",
    city: "Metro City",
    state: "CA",
    postalCode: "90014",
    lat: 34.0489,
    lng: -118.2518,
    distanceMiles: 0.4,
    image: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1000&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=1000&q=80"
    ],
    hourlyRate: 6.50,
    dailyRate: 35.00,
    vehiclePricing: {
      car: 6.50,
      motorcycle: 3.50,
      ev: 8.00,
      accessible: 6.50
    },
    totalSlots: 120,
    availableSlots: 42,
    occupiedSlots: 68,
    reservedSlots: 10,
    rating: 4.8,
    reviewCount: 340,
    openingHours: {
      open: "00:00",
      close: "23:59",
      is24_7: true
    },
    amenities: ["24/7 Access", "CCTV Security", "EV Charging", "Covered Parking", "Elevator Access", "Valet Option"],
    supportedVehicles: ["car", "motorcycle", "ev", "accessible"],
    featured: true,
    securityStaff: true,
    hasCCTV: true,
    hasEVCharging: true,
    isCovered: true,
    isAccessible: true,
    cancellationPolicy: "Free cancellation up to 1 hour before scheduled arrival."
  },
  {
    id: "loc-tech-plaza",
    name: "Tech Plaza Smart Bay",
    slug: "tech-plaza-smart-bay",
    tagline: "High-speed EV charging hub with touchless license plate recognition",
    address: "880 Innovation Parkway",
    city: "Metro City",
    state: "CA",
    postalCode: "90021",
    lat: 34.0322,
    lng: -118.2394,
    distanceMiles: 1.1,
    image: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1000&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1000&q=80"
    ],
    hourlyRate: 5.00,
    dailyRate: 28.00,
    vehiclePricing: {
      car: 5.00,
      motorcycle: 3.00,
      ev: 7.00,
      accessible: 5.00
    },
    totalSlots: 85,
    availableSlots: 28,
    occupiedSlots: 50,
    reservedSlots: 7,
    rating: 4.9,
    reviewCount: 215,
    openingHours: {
      open: "06:00",
      close: "23:00",
      is24_7: false
    },
    amenities: ["Level 3 EV Charging", "Covered Parking", "Security Patrol", "Contactless QR Entry", "Wheelchair Accessible"],
    supportedVehicles: ["car", "ev", "accessible"],
    featured: true,
    securityStaff: true,
    hasCCTV: true,
    hasEVCharging: true,
    isCovered: true,
    isAccessible: true,
    cancellationPolicy: "Free cancellation up to 2 hours before arrival."
  },
  {
    id: "loc-airport-express",
    name: "SkyHarbor Airport Express Deck",
    slug: "skyharbor-airport-deck",
    tagline: "Secure long-term and short-term parking with free 5-minute shuttle",
    address: "1200 Terminal Boulevard",
    city: "Metro City",
    state: "CA",
    postalCode: "90045",
    lat: 33.9416,
    lng: -118.4085,
    distanceMiles: 4.8,
    image: "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=1000&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1000&q=80"
    ],
    hourlyRate: 8.00,
    dailyRate: 24.00,
    vehiclePricing: {
      car: 8.00,
      motorcycle: 4.00,
      ev: 9.50,
      accessible: 8.00
    },
    totalSlots: 250,
    availableSlots: 94,
    occupiedSlots: 135,
    reservedSlots: 21,
    rating: 4.7,
    reviewCount: 680,
    openingHours: {
      open: "00:00",
      close: "23:59",
      is24_7: true
    },
    amenities: ["Airport Shuttle", "24/7 Security", "Luggage Assistance", "CCTV", "Car Wash Available"],
    supportedVehicles: ["car", "motorcycle", "ev", "accessible"],
    featured: true,
    securityStaff: true,
    hasCCTV: true,
    hasEVCharging: true,
    isCovered: true,
    isAccessible: true,
    cancellationPolicy: "Free cancellation up to 6 hours before scheduled flight arrival."
  },
  {
    id: "loc-harbor-bay",
    name: "Harbor Bay Pier Parking",
    slug: "harbor-bay-pier",
    tagline: "Open-air scenic parking adjacent to the boardwalk, marina and dining",
    address: "210 Marina Promenade",
    city: "Metro City",
    state: "CA",
    postalCode: "90401",
    lat: 34.0101,
    lng: -118.4961,
    distanceMiles: 3.2,
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1000&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1000&q=80"
    ],
    hourlyRate: 4.50,
    dailyRate: 22.00,
    vehiclePricing: {
      car: 4.50,
      motorcycle: 2.50,
      ev: 6.00,
      accessible: 4.50
    },
    totalSlots: 90,
    availableSlots: 15,
    occupiedSlots: 65,
    reservedSlots: 10,
    rating: 4.6,
    reviewCount: 190,
    openingHours: {
      open: "06:00",
      close: "00:00",
      is24_7: false
    },
    amenities: ["Boardwalk Access", "Motorcycle Bays", "CCTV", "Accessible Ramps"],
    supportedVehicles: ["car", "motorcycle", "accessible"],
    featured: false,
    securityStaff: false,
    hasCCTV: true,
    hasEVCharging: false,
    isCovered: false,
    isAccessible: true,
    cancellationPolicy: "Free cancellation up to 1 hour before scheduled arrival."
  },
  {
    id: "loc-medical-arts",
    name: "Medical Arts Center Dedicated Deck",
    slug: "medical-arts-deck",
    tagline: "Accessible priority hospital and clinical complex parking with heated lifts",
    address: "710 Healthcare Blvd",
    city: "Metro City",
    state: "CA",
    postalCode: "90033",
    lat: 34.0622,
    lng: -118.2045,
    distanceMiles: 2.0,
    image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1000&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1000&q=80"
    ],
    hourlyRate: 4.00,
    dailyRate: 18.00,
    vehiclePricing: {
      car: 4.00,
      motorcycle: 2.00,
      ev: 5.50,
      accessible: 3.50
    },
    totalSlots: 110,
    availableSlots: 54,
    occupiedSlots: 46,
    reservedSlots: 10,
    rating: 4.9,
    reviewCount: 410,
    openingHours: {
      open: "00:00",
      close: "23:59",
      is24_7: true
    },
    amenities: ["Wheelchair Accessible", "Elevators", "Hospital Direct Bridge", "CCTV", "Security Escort"],
    supportedVehicles: ["car", "motorcycle", "ev", "accessible"],
    featured: false,
    securityStaff: true,
    hasCCTV: true,
    hasEVCharging: true,
    isCovered: true,
    isAccessible: true,
    cancellationPolicy: "Free cancellation anytime prior to check-in."
  }
];

// Helper to generate simulated slot layout for visualization
export function generateFacilitySlots(locationId: string, count: number = 24): SlotType[] {
  const slots: SlotType[] = [];
  const floors = ["Floor 1", "Floor 2"];
  const types: ('car' | 'motorcycle' | 'ev' | 'accessible')[] = ['car', 'car', 'ev', 'accessible', 'motorcycle', 'car'];
  const statuses: ('available' | 'occupied' | 'reserved' | 'maintenance')[] = [
    'available', 'available', 'occupied', 'available', 'reserved', 'available', 'occupied', 'available'
  ];

  for (let i = 1; i <= count; i++) {
    const floor = i <= count / 2 ? floors[0] : floors[1];
    const vehicleType = types[(i - 1) % types.length];
    // Deterministic status based on index and location
    const statusIndex = (i + locationId.length) % statuses.length;
    const status = i === 1 ? 'available' : statuses[statusIndex];
    
    slots.push({
      id: `${locationId}-slot-${i}`,
      slotNumber: `${floor.startsWith("Floor 1") ? "A" : "B"}-${String(i).padStart(2, "0")}`,
      floor,
      vehicleType,
      status,
      pricePerHour: vehicleType === 'ev' ? 8.00 : vehicleType === 'motorcycle' ? 3.50 : 6.00
    });
  }

  return slots;
}
