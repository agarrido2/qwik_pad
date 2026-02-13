
/**
 * Database Module - Barrel Export
 * @description Punto de entrada único para el módulo de base de datos
 */

// Schema
// Seguridad: el barrel export NO debe exponer helpers de DB runtime (getDb/createDbClient)
// para reducir el riesgo de import accidental desde componentes cliente.
export * from './schema';
