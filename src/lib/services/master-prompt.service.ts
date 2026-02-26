/**
 * Master Prompt Service
 * @description Lógica de lectura de plantillas de agente curadas por Onucall.
 *
 * Los master_prompts son solo lectura para el usuario final.
 * Se filtran por sector (derivado de la organización del usuario)
 * y se muestran en el selector al crear un nuevo agente.
 */

import { and, asc, eq } from 'drizzle-orm';
import { db } from '../db/client';
import { masterPrompts } from '../db/schema';

/** Estructura ligera para la galería/selector (sin system_prompt completo) */
export interface MasterPromptListItem {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string;
  sector: string;
}

/** Estructura completa para el builder (incluye system_prompt + config) */
export interface MasterPromptDetail extends MasterPromptListItem {
  systemPrompt: string;
  welcomeMessageDefault: string | null;
  config: Record<string, unknown>;
}

export class MasterPromptService {
  /**
   * Lista los master prompts activos de un sector, ordenados por sortOrder.
   * Se usa en /agents/new para mostrar las plantillas disponibles.
   */
  static async getBySector(sector: string): Promise<MasterPromptListItem[]> {
    return db
      .select({
        id: masterPrompts.id,
        slug: masterPrompts.slug,
        name: masterPrompts.name,
        description: masterPrompts.description,
        icon: masterPrompts.icon,
        sector: masterPrompts.sector,
      })
      .from(masterPrompts)
      .where(
        and(
          eq(masterPrompts.sector, sector),
          eq(masterPrompts.isActive, true),
        ),
      )
      .orderBy(asc(masterPrompts.sortOrder), asc(masterPrompts.name));
  }

  /**
   * Obtiene el detalle completo de un master prompt por ID.
   * Se usa al crear el borrador: el builder necesita el system_prompt y config.
   */
  static async getById(id: string): Promise<MasterPromptDetail | null> {
    const [row] = await db
      .select({
        id: masterPrompts.id,
        slug: masterPrompts.slug,
        name: masterPrompts.name,
        description: masterPrompts.description,
        icon: masterPrompts.icon,
        sector: masterPrompts.sector,
        systemPrompt: masterPrompts.systemPrompt,
        welcomeMessageDefault: masterPrompts.welcomeMessageDefault,
        config: masterPrompts.config,
      })
      .from(masterPrompts)
      .where(eq(masterPrompts.id, id))
      .limit(1);

    if (!row) return null;

    return {
      ...row,
      config: (row.config ?? {}) as Record<string, unknown>,
    };
  }
}
