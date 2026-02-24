import { CONCESIONARIO_DEMO_TEMPLATE } from '../utils/demo-data-templates';

/**
 * Demo Data Service - Genera datos de prueba para Onucall Auto
 * Vertical único: Concesionarios de Vehículos.
 */

export class DemoDataService {
  /**
   * Genera datos demo para una organización (concesionarios)
   * En tier FREE se usa para mostrar funcionalidad sin consumir APIs reales.
   */
  static async generateForConcesionario(organizationId: string) {
    const template = CONCESIONARIO_DEMO_TEMPLATE;

    console.log('[DemoDataService] Generando datos demo para concesionario:', {
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
}
