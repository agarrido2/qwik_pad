import { z } from 'zod';

/**
 * Voice Agent Schemas
 * @description Validaciones runtime para crear/editar agentes de voz.
 */

/**
 * Nivel de personalidad permitido por producto.
 * Usamos int 1-5 para mantener consistencia con onboarding histórico.
 */
const personalityLevelSchema = z.coerce
  .number()
  .int()
  .min(1, 'El nivel mínimo es 1')
  .max(5, 'El nivel máximo es 5');

/**
 * Schema para crear agentes desde dashboard.
 */
export const CreateVoiceAgentSchema = z.object({
  name: z.string().trim().min(3, 'El nombre interno es obligatorio').max(120),
  assistantName: z.string().trim().min(2, 'El nombre del asistente es obligatorio').max(80),
  assistantGender: z.enum(['male', 'female']),
  sector: z.literal('concesionario').default('concesionario'),
  friendlinessLevel: personalityLevelSchema,
  warmthLevel: personalityLevelSchema,
  isDefault: z.coerce.boolean().optional().default(false),
});

/**
 * Schema para edición avanzada de agentes.
 */
export const UpdateVoiceAgentSchema = CreateVoiceAgentSchema.extend({
  description: z.string().trim().max(200).optional().nullable(),
  businessDescription: z.string().trim().max(600).optional().nullable(),
  promptSystem: z.string().trim().max(5000).optional().nullable(),
  transferPolicy: z.string().trim().max(600).optional().nullable(),
  leadsEmail: z.string().trim().email('Email inválido').optional().or(z.literal('')),
  webhookUrl: z.string().trim().url('URL inválida').optional().or(z.literal('')),
  phoneNumberId: z.string().uuid('Número de teléfono inválido').optional().or(z.literal('')),
  retellAgentId: z.string().trim().max(200).optional().nullable(),
  isActive: z.coerce.boolean().optional().default(false),
});

/**
 * Schema para acción de borrado.
 */
export const DeleteVoiceAgentSchema = z.object({
  id: z.string().uuid('ID de agente inválido'),
});

export type CreateVoiceAgentInput = z.infer<typeof CreateVoiceAgentSchema>;
export type UpdateVoiceAgentInput = z.infer<typeof UpdateVoiceAgentSchema>;
export type DeleteVoiceAgentInput = z.infer<typeof DeleteVoiceAgentSchema>;
