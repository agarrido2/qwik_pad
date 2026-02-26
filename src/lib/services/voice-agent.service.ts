/**
 * Voice Agent Service
 * @description Lógica de negocio para agentes multi-tenant por organización.
 *
 * Decisiones de diseño:
 * - Todas las mutaciones complejas se ejecutan en transacción para mantener
 *   consistencia entre `voice_agents` y `phone_numbers`.
 * - La asignación de número es 1:1: un número solo puede estar en un agente.
 * - `is_default` se mantiene único por organización desde este servicio.
 * - createDraft() crea un borrador referenciando un master_prompt.
 *   El usuario personaliza en el builder y publica vía Retell.
 */

import { and, asc, eq, ne, sql } from 'drizzle-orm';
import { db } from '../db/client';
import {
  masterPrompts,
  phoneNumbers,
  type PhoneNumberStatus,
  type VoiceAgentStatus,
  voiceAgents,
} from '../db/schema';

export interface VoiceAgentListItem {
  id: string;
  name: string;
  assistantName: string;
  assistantGender: 'male' | 'female';
  sector: string | null;
  status: VoiceAgentStatus;
  isActive: boolean;
  isDefault: boolean;
  retellAgentId: string | null;
  phoneNumberId: string | null;
  phoneNumber: string | null;
  phoneStatus: PhoneNumberStatus | null;
  masterPromptId: string | null;
  updatedAt: Date;
}

export interface VoiceAgentDetail extends VoiceAgentListItem {
  organizationId: string;
  description: string | null;
  friendlinessLevel: number;
  warmthLevel: number;
  businessDescription: string | null;
  promptSystem: string | null;
  welcomeMessage: string | null;
  transferPolicy: string | null;
  leadsEmail: string | null;
  webhookUrl: string | null;
  createdBy: string;
  createdAt: Date;
  /** Datos del master prompt base (null si no tiene) */
  masterPromptName: string | null;
  masterPromptSystemPrompt: string | null;
  masterPromptWelcomeDefault: string | null;
  masterPromptIcon: string | null;
  masterPromptConfig: Record<string, unknown> | null;
}

export interface CreateVoiceAgentData {
  organizationId: string;
  createdBy: string;
  name: string;
  assistantName: string;
  assistantGender: 'male' | 'female';
  sector?: string;
  friendlinessLevel: number;
  warmthLevel: number;
  isDefault?: boolean;
}

/** Datos para crear un borrador a partir de un master prompt */
export interface CreateDraftData {
  organizationId: string;
  createdBy: string;
  masterPromptId: string;
  name: string;
  sector: string;
}

export interface UpdateVoiceAgentData {
  name?: string;
  description?: string | null;
  assistantName?: string;
  assistantGender?: 'male' | 'female';
  sector?: string | null;
  friendlinessLevel?: number;
  warmthLevel?: number;
  businessDescription?: string | null;
  promptSystem?: string | null;
  welcomeMessage?: string | null;
  transferPolicy?: string | null;
  leadsEmail?: string | null;
  webhookUrl?: string | null;
  retellAgentId?: string | null;
  phoneNumberId?: string | null;
  isActive?: boolean;
  isDefault?: boolean;
  status?: VoiceAgentStatus;
}

export class VoiceAgentService {
  /**
   * Crea un agente de voz y opcionalmente lo establece como default.
   */
  static async create(data: CreateVoiceAgentData) {
    return db.transaction(async (tx) => {
      if (data.isDefault) {
        await tx
          .update(voiceAgents)
          .set({ isDefault: false, updatedAt: new Date() })
          .where(eq(voiceAgents.organizationId, data.organizationId));
      }

      const [agent] = await tx
        .insert(voiceAgents)
        .values({
          organizationId: data.organizationId,
          createdBy: data.createdBy,
          name: data.name,
          assistantName: data.assistantName,
          assistantGender: data.assistantGender,
          sector: data.sector ?? null,
          friendlinessLevel: data.friendlinessLevel,
          warmthLevel: data.warmthLevel,
          isDefault: data.isDefault ?? false,
        })
        .returning();

      return agent;
    });
  }

  /**
   * Lista todos los agentes de una organización con su número enlazado.
   * Incluye status y masterPromptId para la galería.
   */
  static async getByOrganization(organizationId: string): Promise<VoiceAgentListItem[]> {
    const rows = await db
      .select({
        id: voiceAgents.id,
        name: voiceAgents.name,
        assistantName: voiceAgents.assistantName,
        assistantGender: voiceAgents.assistantGender,
        sector: voiceAgents.sector,
        status: voiceAgents.status,
        isActive: voiceAgents.isActive,
        isDefault: voiceAgents.isDefault,
        retellAgentId: voiceAgents.retellAgentId,
        phoneNumberId: voiceAgents.phoneNumberId,
        phoneNumber: phoneNumbers.phoneNumber,
        phoneStatus: phoneNumbers.status,
        masterPromptId: voiceAgents.masterPromptId,
        updatedAt: voiceAgents.updatedAt,
      })
      .from(voiceAgents)
      .leftJoin(phoneNumbers, eq(voiceAgents.phoneNumberId, phoneNumbers.id))
      .where(eq(voiceAgents.organizationId, organizationId))
      .orderBy(asc(voiceAgents.name));

    return rows;
  }

  /**
   * Obtiene un agente por ID validando pertenencia a la organización.
   * LEFT JOIN a master_prompts para hidratar datos base del prompt.
   */
  static async getById(id: string, organizationId: string): Promise<VoiceAgentDetail | null> {
    const [row] = await db
      .select({
        id: voiceAgents.id,
        organizationId: voiceAgents.organizationId,
        name: voiceAgents.name,
        description: voiceAgents.description,
        assistantName: voiceAgents.assistantName,
        assistantGender: voiceAgents.assistantGender,
        sector: voiceAgents.sector,
        status: voiceAgents.status,
        friendlinessLevel: voiceAgents.friendlinessLevel,
        warmthLevel: voiceAgents.warmthLevel,
        businessDescription: voiceAgents.businessDescription,
        promptSystem: voiceAgents.promptSystem,
        welcomeMessage: voiceAgents.welcomeMessage,
        transferPolicy: voiceAgents.transferPolicy,
        leadsEmail: voiceAgents.leadsEmail,
        webhookUrl: voiceAgents.webhookUrl,
        retellAgentId: voiceAgents.retellAgentId,
        phoneNumberId: voiceAgents.phoneNumberId,
        phoneNumber: phoneNumbers.phoneNumber,
        phoneStatus: phoneNumbers.status,
        isActive: voiceAgents.isActive,
        isDefault: voiceAgents.isDefault,
        masterPromptId: voiceAgents.masterPromptId,
        createdBy: voiceAgents.createdBy,
        createdAt: voiceAgents.createdAt,
        updatedAt: voiceAgents.updatedAt,
        // Datos del master prompt base
        masterPromptName: masterPrompts.name,
        masterPromptSystemPrompt: masterPrompts.systemPrompt,
        masterPromptWelcomeDefault: masterPrompts.welcomeMessageDefault,
        masterPromptIcon: masterPrompts.icon,
        masterPromptConfig: masterPrompts.config,
      })
      .from(voiceAgents)
      .leftJoin(phoneNumbers, eq(voiceAgents.phoneNumberId, phoneNumbers.id))
      .leftJoin(masterPrompts, eq(voiceAgents.masterPromptId, masterPrompts.id))
      .where(and(eq(voiceAgents.id, id), eq(voiceAgents.organizationId, organizationId)))
      .limit(1);

    return (row as VoiceAgentDetail) ?? null;
  }

  /**
   * Crea un borrador de agente a partir de un master prompt.
   * Copia systemPrompt y welcomeMessage del master prompt al agente.
   */
  static async createDraft(data: CreateDraftData) {
    return db.transaction(async (tx) => {
      // Recuperar el master prompt para copiar prompt y welcome message
      const [mp] = await tx
        .select({
          systemPrompt: masterPrompts.systemPrompt,
          welcomeMessageDefault: masterPrompts.welcomeMessageDefault,
        })
        .from(masterPrompts)
        .where(eq(masterPrompts.id, data.masterPromptId))
        .limit(1);

      if (!mp) {
        throw new Error('Master prompt no encontrado');
      }

      const [agent] = await tx
        .insert(voiceAgents)
        .values({
          organizationId: data.organizationId,
          createdBy: data.createdBy,
          masterPromptId: data.masterPromptId,
          name: data.name,
          // Valores sensatos por defecto para el borrador
          assistantName: data.name,
          assistantGender: 'female',
          sector: data.sector,
          status: 'draft',
          // Copiar datos del master prompt como punto de partida
          promptSystem: mp.systemPrompt,
          welcomeMessage: mp.welcomeMessageDefault,
          friendlinessLevel: 5,
          warmthLevel: 5,
          isDefault: false,
          isActive: false,
        })
        .returning();

      return agent;
    });
  }

  /**
   * Actualiza un agente y sincroniza asignación de número si cambia.
   */
  static async update(id: string, organizationId: string, data: UpdateVoiceAgentData) {
    return db.transaction(async (tx) => {
      const [existing] = await tx
        .select({
          id: voiceAgents.id,
          phoneNumberId: voiceAgents.phoneNumberId,
        })
        .from(voiceAgents)
        .where(and(eq(voiceAgents.id, id), eq(voiceAgents.organizationId, organizationId)))
        .limit(1);

      if (!existing) {
        return null;
      }

      if (data.isDefault) {
        await tx
          .update(voiceAgents)
          .set({ isDefault: false, updatedAt: new Date() })
          .where(and(eq(voiceAgents.organizationId, organizationId), ne(voiceAgents.id, id)));
      }

      const normalizedPhoneId = data.phoneNumberId === '' ? null : data.phoneNumberId;

      if (existing.phoneNumberId && existing.phoneNumberId !== normalizedPhoneId) {
        await tx
          .update(phoneNumbers)
          .set({
            assignedToAgentId: null,
            status: 'available',
            updatedAt: new Date(),
          })
          .where(eq(phoneNumbers.id, existing.phoneNumberId));
      }

      if (normalizedPhoneId) {
        const [selectedPhone] = await tx
          .select({
            id: phoneNumbers.id,
            assignedToAgentId: phoneNumbers.assignedToAgentId,
            organizationId: phoneNumbers.organizationId,
          })
          .from(phoneNumbers)
          .where(eq(phoneNumbers.id, normalizedPhoneId))
          .limit(1);

        const phoneBelongsToOrg = selectedPhone?.organizationId === organizationId;
        const phoneAlreadyUsedByOtherAgent =
          selectedPhone?.assignedToAgentId && selectedPhone.assignedToAgentId !== id;

        if (!selectedPhone || !phoneBelongsToOrg || phoneAlreadyUsedByOtherAgent) {
          throw new Error('El número seleccionado no está disponible para esta organización.');
        }

        await tx
          .update(phoneNumbers)
          .set({
            assignedToAgentId: id,
            status: 'assigned',
            assignedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(phoneNumbers.id, normalizedPhoneId));
      }

      const [updated] = await tx
        .update(voiceAgents)
        .set({
          name: data.name,
          description: data.description,
          assistantName: data.assistantName,
          assistantGender: data.assistantGender,
          sector: data.sector,
          friendlinessLevel: data.friendlinessLevel,
          warmthLevel: data.warmthLevel,
          businessDescription: data.businessDescription,
          promptSystem: data.promptSystem,
          welcomeMessage: data.welcomeMessage,
          transferPolicy: data.transferPolicy,
          leadsEmail: data.leadsEmail,
          webhookUrl: data.webhookUrl,
          retellAgentId: data.retellAgentId,
          phoneNumberId: normalizedPhoneId,
          isActive: data.isActive,
          isDefault: data.isDefault,
          status: data.status,
          updatedAt: new Date(),
        })
        .where(and(eq(voiceAgents.id, id), eq(voiceAgents.organizationId, organizationId)))
        .returning();

      return updated;
    });
  }

  /**
   * Elimina un agente y libera su número, preservando un default si quedan agentes.
   */
  static async delete(id: string, organizationId: string) {
    return db.transaction(async (tx) => {
      const [existing] = await tx
        .select({
          id: voiceAgents.id,
          phoneNumberId: voiceAgents.phoneNumberId,
          isDefault: voiceAgents.isDefault,
        })
        .from(voiceAgents)
        .where(and(eq(voiceAgents.id, id), eq(voiceAgents.organizationId, organizationId)))
        .limit(1);

      if (!existing) {
        return { deleted: false };
      }

      if (existing.phoneNumberId) {
        await tx
          .update(phoneNumbers)
          .set({
            assignedToAgentId: null,
            status: 'available',
            updatedAt: new Date(),
          })
          .where(eq(phoneNumbers.id, existing.phoneNumberId));
      }

      await tx
        .delete(voiceAgents)
        .where(and(eq(voiceAgents.id, id), eq(voiceAgents.organizationId, organizationId)));

      if (existing.isDefault) {
        const [fallbackAgent] = await tx
          .select({ id: voiceAgents.id })
          .from(voiceAgents)
          .where(eq(voiceAgents.organizationId, organizationId))
          .orderBy(asc(voiceAgents.createdAt))
          .limit(1);

        if (fallbackAgent) {
          await tx
            .update(voiceAgents)
            .set({ isDefault: true, updatedAt: new Date() })
            .where(eq(voiceAgents.id, fallbackAgent.id));
        }
      }

      return { deleted: true };
    });
  }

  /**
   * Establece un agente como default y desmarca el resto.
   */
  static async setDefault(id: string, organizationId: string) {
    return db.transaction(async (tx) => {
      await tx
        .update(voiceAgents)
        .set({
          isDefault: sql<boolean>`CASE WHEN ${voiceAgents.id} = ${id} THEN true ELSE false END`,
          updatedAt: new Date(),
        })
        .where(eq(voiceAgents.organizationId, organizationId));

      const [updated] = await tx
        .select({ id: voiceAgents.id, isDefault: voiceAgents.isDefault })
        .from(voiceAgents)
        .where(and(eq(voiceAgents.id, id), eq(voiceAgents.organizationId, organizationId)))
        .limit(1);

      return updated ?? null;
    });
  }

  /**
   * Lista números de la organización para selector de asignación.
   */
  static async getPhoneNumbersForOrganization(organizationId: string) {
    return db
      .select({
        id: phoneNumbers.id,
        phoneNumber: phoneNumbers.phoneNumber,
        status: phoneNumbers.status,
        assignedToAgentId: phoneNumbers.assignedToAgentId,
      })
      .from(phoneNumbers)
      .where(eq(phoneNumbers.organizationId, organizationId))
      .orderBy(asc(phoneNumbers.phoneNumber));
  }
}
