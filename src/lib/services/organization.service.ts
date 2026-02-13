import { db } from '../db/client';
import { organizations, organizationMembers } from '../db/schema';
import { eq } from 'drizzle-orm';

/**
 * Organization Service - Maneja operaciones de organizaciones
 */

export class OrganizationService {
  /**
   * Crea una nueva organización
   */
  static async createOrganization(data: {
    name: string;
    slug: string;
    phone?: string;
    industry?: string;
    businessDescription?: string;
    assistantName?: string;
    assistantGender?: 'male' | 'female';
    assistantKindnessLevel?: number;
    assistantFriendlinessLevel?: number;
  }) {
    const [org] = await db
      .insert(organizations)
      .values({
        name: data.name,
        slug: data.slug,
        phone: data.phone,
        industry: data.industry,
        businessDescription: data.businessDescription,
        assistantName: data.assistantName,
        assistantGender: data.assistantGender,
        assistantKindnessLevel: data.assistantKindnessLevel,
        assistantFriendlinessLevel: data.assistantFriendlinessLevel,
        subscriptionTier: 'free',
        subscriptionStatus: 'active',
      })
      .returning();

    return org;
  }

  /**
   * Añade un usuario a una organización con rol específico
   */
  static async addUserToOrganization(
    userId: string,
    organizationId: string,
    role: 'owner' | 'admin' | 'member' = 'owner',
  ) {
    const [member] = await db
      .insert(organizationMembers)
      .values({
        userId,
        organizationId,
        role,
      })
      .returning();

    return member;
  }

  /**
   * Obtiene todas las organizaciones de un usuario
   */
  static async getUserOrganizations(userId: string) {
    const result = await db
      .select({
        id: organizations.id,
        name: organizations.name,
        slug: organizations.slug,
        subscriptionTier: organizations.subscriptionTier,
        industry: organizations.industry,
        role: organizationMembers.role,
      })
      .from(organizationMembers)
      .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
      .where(eq(organizationMembers.userId, userId));

    return result;
  }

  /**
   * Verifica si un slug está disponible
   */
  static async isSlugAvailable(slug: string): Promise<boolean> {
    const [existing] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.slug, slug))
      .limit(1);

    return !existing;
  }
}
