import prisma from '../../lib/prisma';

const normalizeContent = (post: any) => ({
  ...post,
  author: post.author?.username || 'Admin',
  date: post.updatedAt,
});

export const contentService = {
  getAllContent: async (options: { q?: string }) => {
    const { q } = options;
    const posts = await prisma.contentPost.findMany({
      where: q ? {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { category: { contains: q, mode: 'insensitive' } },
          { body: { contains: q, mode: 'insensitive' } },
        ],
      } : {},
      include: { author: { select: { username: true } } },
      orderBy: { updatedAt: 'desc' },
    } as any);
    return posts.map(normalizeContent);
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
