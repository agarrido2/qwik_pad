import { z } from 'zod';

/**
 * Voice Agent Schemas
 * @description Validaciones runtime para CRUD de agentes de voz.
 *
 * Flujo:
 * 1. CreateDraft → usuario selecciona master prompt → se crea borrador
 * 2. UpdateBuilder → usuario personaliza en el builder
 * 3. Delete → elimina agente y libera recursos
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
 * Schema para crear un borrador desde el selector de master prompts.
 * Solo requiere masterPromptId y nombre; el resto se hereda del master prompt.
 */
export const CreateDraftSchema = z.object({
  masterPromptId: z.string().uuid('Master prompt inválido'),
  name: z.string().trim().min(3, 'El nombre es obligatorio').max(120),
});

/**
 * Schema legacy para crear agentes con formulario completo.
 * Se mantiene por compatibilidad; el flujo principal ahora es CreateDraft.
 */
export const CreateVoiceAgentSchema = z.object({
  name: z.string().trim().min(3, 'El nombre interno es obligatorio').max(120),
  assistantName: z.string().trim().min(2, 'El nombre del asistente es obligatorio').max(80),
  assistantGender: z.enum(['male', 'female']),
  sector: z.string().trim().min(1, 'El sector es obligatorio').max(60),
  friendlinessLevel: personalityLevelSchema,
  warmthLevel: personalityLevelSchema,
  isDefault: z.coerce.boolean().optional().default(false),
});

/**
 * Schema para el Builder: edición avanzada de agentes.
 * Incluye welcomeMessage, status y todos los campos configurables.
 */
export const UpdateVoiceAgentSchema = CreateVoiceAgentSchema.extend({
  description: z.string().trim().max(200).optional().nullable(),
  businessDescription: z.string().trim().max(600).optional().nullable(),
  promptSystem: z.string().trim().max(5000).optional().nullable(),
  welcomeMessage: z.string().trim().max(2000).optional().nullable(),
  transferPolicy: z.string().trim().max(600).optional().nullable(),
  leadsEmail: z.string().trim().email('Email inválido').optional().or(z.literal('')),
  webhookUrl: z.string().trim().url('URL inválida').optional().or(z.literal('')),
  phoneNumberId: z.string().uuid('Número de teléfono inválido').optional().or(z.literal('')),
  retellAgentId: z.string().trim().max(200).optional().nullable(),
  isActive: z.coerce.boolean().optional().default(false),
  status: z.enum(['draft', 'published', 'paused']).optional(),
});

/**
 * Schema específico del Builder visual.
 * Mantiene el payload mínimo editable desde la vista de edición rápida.
 */
export const BuilderSaveSchema = z.object({
  welcomeMessage: z.string().trim().max(2000).optional(),
  name: z.string().trim().min(3).max(120),
});

/**
 * Schema para acción de borrado.
 */
export const DeleteVoiceAgentSchema = z.object({
  id: z.string().uuid('ID de agente inválido'),
});

export type CreateDraftInput = z.infer<typeof CreateDraftSchema>;
export type CreateVoiceAgentInput = z.infer<typeof CreateVoiceAgentSchema>;
export type UpdateVoiceAgentInput = z.infer<typeof UpdateVoiceAgentSchema>;
export type BuilderSaveInput = z.infer<typeof BuilderSaveSchema>;
export type DeleteVoiceAgentInput = z.infer<typeof DeleteVoiceAgentSchema>;
