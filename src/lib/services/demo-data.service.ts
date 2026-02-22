import {
  DEMO_DATA_BY_SECTOR,
  GENERIC_SECTOR_DEMO_TEMPLATE,
  type PredefinedSectorSlug,
} from '../utils/demo-data-templates';

/**
 * Demo Data Service - Genera datos de prueba según sector
 * Para el tier FREE (sin costos de API)
 */

export class DemoDataService {
  /**
   * Genera datos demo para una organización según su sector
   * En tier FREE esto se usa para mostrar funcionalidad sin consumir APIs reales
   */
  static async generateForSector(
    organizationId: string,
    sector: string,
  ) {
    const template = this.getTemplate(sector);

    console.log(`[DemoDataService] Generando datos para ${sector}:`, {
      organizationId,
      promptBase: template.promptBase,
      sampleCallsCount: template.sampleCalls.length,
      knowledgeBaseItems: template.knowledgeBase.length,
    });

    // TODO: En futuro, guardar en tablas dedicadas:
    // - agent_prompts (prompt base)
    // - demo_calls (llamadas de ejemplo)
    // - knowledge_base_items (base de conocimiento)
    
    // Por ahora solo log para validar flujo
    return {
      promptBase: template.promptBase,
      sampleCalls: template.sampleCalls,
      knowledgeBase: template.knowledgeBase,
    };
  }

  /**
   * Obtiene el template de datos demo (sin guardar en DB)
   */
  static getTemplate(sector: string) {
    return DEMO_DATA_BY_SECTOR[sector as PredefinedSectorSlug] ?? GENERIC_SECTOR_DEMO_TEMPLATE;
  }
}
