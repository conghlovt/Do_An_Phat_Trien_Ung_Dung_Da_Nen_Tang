type BookingRangeInput = {
  checkIn?: string;
  checkOut?: string;
};

export type BookingRange = {
  checkIn: Date;
  checkOut: Date;
};

const getActivePaymentFilter = () => ({
  OR: [
    { status: "PAID" },
    {
      status: "PENDING",
      OR: [{ method: "PAY_AT_HOTEL" }, { graceExpiresAt: { gt: new Date() } }],
    },
  ],
});

const parseBookingDate = (value?: string) => {
  if (!value) return null;

  const isoDate = new Date(value);
  if (!Number.isNaN(isoDate.getTime())) return isoDate;

  const fallbackYear = new Date().getFullYear();
  const match = value.match(
    /(\d{1,2}):(\d{2}).*?(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/,
  );

  if (!match) return null;

  const [, hourText, minuteText, dayText, monthText, yearText] = match;
  const date = new Date(
    Number(yearText || fallbackYear),
    Number(monthText) - 1,
    Number(dayText),
    Number(hourText),
    Number(minuteText),
    0,
    0,
  );

  return Number.isNaN(date.getTime()) ? null : date;
};

export const parseBookingRange = (
  input: BookingRangeInput,
): BookingRange | null => {
  const checkIn = parseBookingDate(input.checkIn);
  const checkOut = parseBookingDate(input.checkOut);

  if (!checkIn || !checkOut || checkOut <= checkIn) return null;
  return { checkIn, checkOut };
};

export const countReservedRooms = async (
  client: any,
  roomTypeId: string,
  range: BookingRange,
) => {
  return client.booking.count({
    where: {
      roomTypeId,
      status: { in: ["PENDING", "CONFIRMED"] },
      checkIn: { lt: range.checkOut },
      checkOut: { gt: range.checkIn },
      payments: {
        some: getActivePaymentFilter(),
      },
    },
  });
};

export const getRemainingRooms = async (
  client: any,
  roomTypeId: string,
  totalUnits: number,
  range: BookingRange | null,
) => {
  if (!range) return totalUnits;

  const reservedRooms = await countReservedRooms(client, roomTypeId, range);
  return Math.max(0, totalUnits - reservedRooms);
};
