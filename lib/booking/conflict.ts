/**
 * Checks whether two time intervals overlap.
 *
 * Conflict Condition:
 * `requestStart < existingEnd && requestEnd > existingStart`
 *
 * When requestEnd === existingStart or requestStart === existingEnd,
 * they touch at the exact boundary and are NOT conflicting (unless a turnover buffer is configured).
 */
export function hasIntervalOverlap(
  requestStart: Date,
  requestEnd: Date,
  existingStart: Date,
  existingEnd: Date,
  turnoverBufferMinutes: number = 0
): boolean {
  const reqStartMs = requestStart.getTime();
  const reqEndMs = requestEnd.getTime();
  const bufferMs = turnoverBufferMinutes * 60 * 1000;

  const existStartMs = existingStart.getTime() - bufferMs;
  const existEndMs = existingEnd.getTime() + bufferMs;

  return reqStartMs < existEndMs && reqEndMs > existStartMs;
}

export interface ExistingReservation {
  id?: string;
  slotId: string;
  startTime: Date;
  endTime: Date;
  status: "pending" | "confirmed" | "checked_in" | "completed" | "cancelled" | "expired";
}

/**
 * Validates whether a slot is free from overlapping active reservations.
 */
export function isSlotAvailableForInterval(
  slotId: string,
  requestStart: Date,
  requestEnd: Date,
  existingReservations: ExistingReservation[],
  turnoverBufferMinutes: number = 0
): boolean {
  // Only reservations that are active lock the slot
  const activeStatuses = ["pending", "confirmed", "checked_in"];

  for (const res of existingReservations) {
    if (res.slotId !== slotId) continue;
    if (!activeStatuses.includes(res.status)) continue;

    if (hasIntervalOverlap(requestStart, requestEnd, res.startTime, res.endTime, turnoverBufferMinutes)) {
      return false; // Conflict found
    }
  }

  return true; // No conflict, slot is available
}
