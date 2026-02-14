/**
 * Shared Components - Barrel Export
 * 
 * Componentes de composición reutilizables que forman bloques visuales
 * completos pero agnósticos al contexto de negocio.
 * 
 * Según ARQUITECTURA_FOLDER.md:
 * - Header, Footer, Hero, FeatureSection, etc.
 * - Pueden usar componentes de ui/ pero no lógica de negocio
 * - Son bloques que SE USAN en layouts/ para componer vistas
 * 
 * Diferencia con layouts/:
 * - shared/ son BLOQUES reutilizables (Header, Footer)
 * - layout/ son ORQUESTADORES estructurales (PublicLayout, DashboardLayout)
 */

export { Header } from './Header';
export { Footer } from './Footer';
export { Hero } from './Hero';
