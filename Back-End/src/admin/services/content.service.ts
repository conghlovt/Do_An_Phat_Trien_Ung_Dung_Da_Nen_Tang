import prisma from '../../login/lib/prisma';
import { Prisma } from '@prisma/client';
import { buildListResult, type DateRange, type SortOrder } from '../utils/admin-query.util';

const normalizeContent = (post: any) => ({
  ...post,
  author: post.author?.username || 'Admin',
  date: post.updatedAt,
});

export type AdminContentListOptions = {
  q?: string | undefined;
  search?: string | undefined;
  status?: string | undefined;
  category?: string | undefined;
  page?: number | undefined;
  limit?: number | undefined;
  sortBy?: string | undefined;
  sortOrder?: SortOrder | undefined;
  dateRange?: DateRange | undefined;
  paginate?: boolean | undefined;
};

const contentSortFields = new Set(['createdAt', 'updatedAt', 'title', 'category', 'status', 'views']);

const buildContentWhere = (options: AdminContentListOptions): Prisma.ContentPostWhereInput => {
  const query = String(options.search || options.q || '').trim();
  const where: Prisma.ContentPostWhereInput = {};

  if (query) {
    where.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { category: { contains: query, mode: 'insensitive' } },
      { body: { contains: query, mode: 'insensitive' } },
      { status: { equals: query as any } },
    ];
  }

  if (options.status) where.status = options.status as any;
  if (options.category) where.category = { contains: options.category, mode: 'insensitive' };
  if (options.dateRange?.from || options.dateRange?.to) {
    where.createdAt = {
      ...(options.dateRange.from ? { gte: options.dateRange.from } : {}),
      ...(options.dateRange.to ? { lte: options.dateRange.to } : {}),
    };
  }

  return where;
};

const buildContentOrderBy = (sortBy?: string, sortOrder: SortOrder = 'desc') => ({
  [contentSortFields.has(String(sortBy || '')) ? String(sortBy) : 'updatedAt']: sortOrder,
});

export const contentService = {
  getAllContent: async (options: AdminContentListOptions = {}) => {
    const { page = 1, limit = 10, paginate = true } = options;
    const skip = (page - 1) * limit;
    const where = buildContentWhere(options);

    const [posts, total] = await Promise.all([
      prisma.contentPost.findMany({
      where,
      include: { author: { select: { username: true } } },
      orderBy: buildContentOrderBy(options.sortBy, options.sortOrder) as any,
      ...(paginate ? { skip, take: limit } : {}),
    } as any),
      prisma.contentPost.count({ where }),
    ]);

    return buildListResult('content', posts.map(normalizeContent), page, limit, total);
  },

  createContent: async (data: any, requesterId?: string) => {
    const { title, category, excerpt, body, status, authorId, thumbnail } = data;
    const post = await prisma.contentPost.create({
      data: {
        title,
        category,
        excerpt,
        body,
        thumbnail,
        status: (status || 'DRAFT') as any,
        authorId: authorId || requesterId || null,
      },
      include: { author: { select: { username: true } } },
    });
    return normalizeContent(post);
  },

  updateContent: async (id: string, data: any) => {
    const { title, category, excerpt, body, status, thumbnail } = data;
    const post = await prisma.contentPost.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(excerpt !== undefined ? { excerpt } : {}),
        ...(body !== undefined ? { body } : {}),
        ...(thumbnail !== undefined ? { thumbnail } : {}),
        ...(status !== undefined ? { status: status as any } : {}),
      },
      include: { author: { select: { username: true } } },
    });
    return normalizeContent(post);
  },

  deleteContent: async (id: string) => {
    await prisma.contentPost.delete({ where: { id } });
  },
};
