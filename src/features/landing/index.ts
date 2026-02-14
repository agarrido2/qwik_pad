/**
 * Landing Feature - Barrel export de secciones de la landing page
 * 
 * Cada sección es un component$ puro (sin lógica de negocio).
 * Se ensamblan en src/routes/(public)/index.tsx (Orchestrator Pattern).
 */

export { HeroSection } from './components/HeroSection';
export { FeaturesSection } from './components/FeaturesSection';
export { LiveDemoSection } from './components/LiveDemoSection';
export { SectorsSection } from './components/SectorsSection';
export { PricingSection } from './components/PricingSection';
export { CTASection } from './components/CTASection';
