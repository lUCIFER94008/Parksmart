import { notFound } from "next/navigation";
import { SAMPLE_LOCATIONS } from "@/lib/data/sample-parking";
import { ParkingDetailClient } from "./ParkingDetailClient";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const facility = SAMPLE_LOCATIONS.find((loc) => loc.id === id || loc.slug === id);
  if (!facility) {
    return { title: "Facility Not Found — ParkSmart" };
  }
  return {
    title: `${facility.name} — Live Slots & Reservation — ParkSmart`,
    description: `Book a guaranteed parking spot at ${facility.name}. Real-time slots, EV charging, and instant QR pass.`,
  };
}

export default async function ParkingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const facility = SAMPLE_LOCATIONS.find((loc) => loc.id === id || loc.slug === id);

  if (!facility) {
    notFound();
  }

  const initialVehicle =
    typeof resolvedSearchParams.vehicleType === "string" ? resolvedSearchParams.vehicleType : "car";
  const initialArrivalDate =
    typeof resolvedSearchParams.arrivalDate === "string" ? resolvedSearchParams.arrivalDate : undefined;
  const initialArrivalTime =
    typeof resolvedSearchParams.arrivalTime === "string" ? resolvedSearchParams.arrivalTime : undefined;
  const initialDepartureDate =
    typeof resolvedSearchParams.departureDate === "string" ? resolvedSearchParams.departureDate : undefined;
  const initialDepartureTime =
    typeof resolvedSearchParams.departureTime === "string" ? resolvedSearchParams.departureTime : undefined;
  const initialSlotNumber =
    typeof resolvedSearchParams.slotNumber === "string" ? resolvedSearchParams.slotNumber : undefined;
  const initialPlateNumber =
    typeof resolvedSearchParams.plateNumber === "string" ? resolvedSearchParams.plateNumber : undefined;
  const initialVehicleModel =
    typeof resolvedSearchParams.vehicleModel === "string" ? resolvedSearchParams.vehicleModel : undefined;

  return (
    <ParkingDetailClient
      facility={facility}
      initialVehicle={initialVehicle}
      initialArrivalDate={initialArrivalDate}
      initialArrivalTime={initialArrivalTime}
      initialDepartureDate={initialDepartureDate}
      initialDepartureTime={initialDepartureTime}
      initialSlotNumber={initialSlotNumber}
      initialPlateNumber={initialPlateNumber}
      initialVehicleModel={initialVehicleModel}
    />
  );
}
