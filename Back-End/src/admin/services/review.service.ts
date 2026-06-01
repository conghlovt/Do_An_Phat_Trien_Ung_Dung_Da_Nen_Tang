import prisma from "../../login/lib/prisma";
import { Prisma } from "@prisma/client";
import { recalculateHotelRating } from "../../shared/services/lodging-sync.service";
import {
  buildListResult,
  type DateRange,
  type SortOrder,
} from "../utils/admin-query.util";

const normalizeReview = (review: any) => ({
  ...review,
  guest: review.user?.username || "Khach hang",
  property:
    review.booking?.property?.name ||
    review.booking?.room?.property?.name ||
    "N/A",
  date: review.createdAt,
});

export type AdminReviewListOptions = {
  q?: string | undefined;
  search?: string | undefined;
  status?: string | undefined;
  rating?: string | undefined;
  page?: number | undefined;
  limit?: number | undefined;
  sortBy?: string | undefined;
  sortOrder?: SortOrder | undefined;
  dateRange?: DateRange | undefined;
  paginate?: boolean | undefined;
};

const reviewSortFields = new Set([
  "createdAt",
  "updatedAt",
  "rating",
  "status",
]);

const buildReviewWhere = (
  options: AdminReviewListOptions,
): Prisma.ReviewWhereInput => {
  const query = String(options.search || options.q || "").trim();
  const where: Prisma.ReviewWhereInput = {};

  if (query) {
    where.OR = [
      { comment: { contains: query, mode: "insensitive" } },
      { user: { username: { contains: query, mode: "insensitive" } } },
      { user: { email: { contains: query, mode: "insensitive" } } },
      {
        booking: {
          property: { name: { contains: query, mode: "insensitive" } },
        },
      },
      {
        booking: {
          room: {
            property: { name: { contains: query, mode: "insensitive" } },
          },
        },
      },
    ];
  }

  if (options.status) {
    where.status = options.status as any;
  }

  if (options.rating) {
    const rating = Number(options.rating);
    if (Number.isInteger(rating) && rating >= 1 && rating <= 5) {
      where.rating = rating;
    }
  }

  if (options.dateRange?.from || options.dateRange?.to) {
    where.createdAt = {
      ...(options.dateRange.from ? { gte: options.dateRange.from } : {}),
      ...(options.dateRange.to ? { lte: options.dateRange.to } : {}),
    };
  }

  return where;
};

const buildReviewOrderBy = (
  sortBy?: string,
  sortOrder: SortOrder = "desc",
) => ({
  [reviewSortFields.has(String(sortBy || "")) ? String(sortBy) : "createdAt"]:
    sortOrder,
});

export const reviewService = {
  getAllReviews: async (options: AdminReviewListOptions = {}) => {
    const { page = 1, limit = 10, paginate = true } = options;
    const skip = (page - 1) * limit;
    const where = buildReviewWhere(options);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: { select: { username: true, email: true } },
          booking: {
            include: {
              property: { select: { id: true, name: true } },
              room: { include: { property: { select: { name: true } } } },
            },
          },
        },
        orderBy: buildReviewOrderBy(options.sortBy, options.sortOrder) as any,
        ...(paginate ? { skip, take: limit } : {}),
      } as any),
      prisma.review.count({ where }),
    ]);

    return buildListResult(
      "reviews",
      reviews.map(normalizeReview),
      page,
      limit,
      total,
    );
  },

  updateReview: async (id: string, data: any) => {
    const { rating, comment, status, reply } = data;
    const review = await prisma.$transaction(async (tx) => {
      const updated = await tx.review.update({
        where: { id },
        data: {
          ...(rating !== undefined ? { rating: Number(rating) } : {}),
          ...(comment !== undefined ? { comment } : {}),
          ...(status !== undefined ? { status: status as any } : {}),
          ...(reply !== undefined ? { reply } : {}),
        },
        include: {
          user: { select: { username: true, email: true } },
          booking: {
            include: {
              room: { include: { property: { select: { name: true } } } },
            },
          },
        },
      });

      if (updated.booking.propertyId) {
        await recalculateHotelRating(tx, updated.booking.propertyId);
      }
      return updated;
    });
    return normalizeReview(review);
  },

  deleteReview: async (id: string) => {
    await prisma.$transaction(async (tx) => {
      const review = await tx.review.findUnique({
        where: { id },
        include: { booking: { select: { propertyId: true } } },
      });
      await tx.review.delete({ where: { id } });
      if (review?.booking?.propertyId) {
        await recalculateHotelRating(tx, review.booking.propertyId);
      }
    });
  },
};
