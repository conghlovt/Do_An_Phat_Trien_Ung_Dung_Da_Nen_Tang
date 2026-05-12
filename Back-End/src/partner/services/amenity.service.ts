import prisma from '../../login/lib/prisma';

export class AmenityService {
  /**
   * List all active amenities, grouped by category
   */
  async listAll() {
    const amenities = await prisma.amenity.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
    return amenities;
  }
}

export const amenityService = new AmenityService();
