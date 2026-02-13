# Feature Plan: Live Demo Section (Landing Page)
> Estado: 🟡 Planning → **VERSIÓN 2** (Diseño Simplificado)  
> Created: 12 de febrero de 2026  
> Updated: 12 de febrero de 2026 (cambio de diseño)  
> Architect: @QwikArchitect  
> Scope: **Solo UI estática** (interactividad en fase posterior)

---

## 🎯 Objetivo

Crear una sección "Live Demo" en la landing page ([index.tsx](src/routes/(public)/index.tsx)) con layout simplificado:

1. **Hero Section** explicando la propuesta de valor
2. **Layout 2 columnas:**
   - **Izquierda:** Grid bento con 6 tarjetas de sectores (imagen + descripción)
   - **Derecha:** Formulario simple (Nombre, Teléfono, Email)

**Cambio de Diseño (v2):**  
❌ Descartado: Wizard de pasos con esfera animada  
✅ Aprobado: Layout estático con tarjetas visuales + formulario lateral

**Contexto de Negoc (VERSIÓN 2 - Simplificada)

### Decisión Arquitectónica: Sección Inline en Landing

**Ubicación:** Implementación directa en `src/routes/(public)/index.tsx`

**Justificación:**  
Esta sección es **específica de la landing** y no se reutilizará en otras páginas. Según `ARQUITECTURA_FOLDER.md`, componentes específicos de una ruta pueden vivir inline en el archivo de ruta si no hay lógica compleja.

**Alternativa (si crece complejidad):**  
Si después añadimos interactividad pesada (selección múltiple, wizard), extraer a `src/components/shared/LiveDemoSection.tsx`.

---

### Estructura de UI (Flat Architecture)

**NO se crean sub-componentes** en esta fase. Todo inline en `index.tsx`:

```tsx
<section id="live-demo" class="...">
  {/* Hero */}
  <div class="text-center">
    <h2>Prueba nuestro agente IA ahora</h2>
    <p>Descripción...</p>
  </div>

  {/* 2 Column Layout */}
  <div class="grid lg:grid-cols-2 gap-8">
    
    {/* LEFT: Grid Bento de Sectores */}
    <div class="grid grid-cols-2 gap-4">
      {sectors.map(sector => (
        <div class="card">
          <img src={sector.image} alt={sector.name} />
          <h3>{sector.name}</h3>
          <p>{sector.description}</p>
        </div>
      ))}
    </div>

    {/* RIGHT: Formulario */}
    <div class="card">
      <h3>Solicita tu demo</h3>
      <Input label="Nombre" />
      <Input label="Teléfono" />
      <Input label="Email" />
      <Button>Solicitar llamada</Button>
    </div>

  </div>
</section>
```

**Patrón:** Presentational UI pura, sin estado reactivo en Fase 1.

---

### Estado y Reactividad (Fase 1 = NINGUNO)

**Decisión:** Formulario sin validación ni submit en esta fase.

- ❌ No usar `useSignal()` todavía (inputs no controlados)
- ❌ No usar `useStore()` todavía
- ❌ No usar `routeAction$` todavía

**Campos como HTML puro:**
```tsx
<input type="text" placeholder="Tu nombre" class="..." />
<input type="tel" placeholder="+34 600 000 000" class="..." />
<input type="email" placeholder="tu@email.com" class="..." />
```

**Botón sin funcionalidad:**
```tsx
<button type="button" class="...">Solicitar llamada</button>
{/* En Fase 2: onClick$ con validación */}
```

**Compliance:**
- ✅ Cero JS client-side (100% HTML estático)
- ✅ No viola resumability (no hay hidratación innecesaria)
- ✅ Preparado para añadir `routeAction$` en Fase 2
Step 2 (DemoContactForm) → "Get a call" → [Placeholder: mostrar Alert success]
```

**Compliance:**
- ✅ No usa `useVisibleTask$` (solo para animación del orb si es puramente CSS, mejor aún)
- ✅ No requiere `routeLoader$` (no hay datos del servidor)
- ✅ Formulario sin validación Zod en esta fase (solo UI, validación en fase 2)

---

### Integración en Landing Page

**Archivo:** `src/routes/(public)/index.tsx`

**Posición sugerida:** Después de Features Section, antes de Sectores.

```tsx
{/* Existing Hero */}
{/* Existing Features Section */}

{/* NEW */}
<LiveDemoSection />

{/* Existing Sectores */}
{/* Existing Pricing */}
```

**Decisión de theming:**
- Background: `bg-[#0a1628]` (azul oscuro tipo navy de las imágenes)
- Cards: `bg-white` con `rounded-xl` y `shadow-xl`
- Typography: `text-5xl` para título, `font-serif` si queremos el look "editorial"
- Animated Orb: Gradiente `from-violet-400 via-blue-400 to-teal-300` con blur

---

## 💾 Datos

### Base de Datos: NO REQUERIDO

**Justificación:**  
En esta faseContenido y Assets

**IMPORTANTE:** Necesitaremos imágenes para los 6 sectores. Opciones:

- [ ] **1.1** **Opción A (Placeholders):** Usar imágenes de Unsplash/Pexels temporales
- [ ] **1.2** **Opción B (Iconos SVG):** Crear iconos planos con Tailwind (sin imágenes externas)
- [ ] **1.3** **Opción C (Emoji Grande):** Usar emojis estilizados temporalmente

**Sectores con descripciones breves:**

```tsx
const sectors = [
  {
    id: 'concesionarios',
    name: 'Concesionarios de vehículos',
    description: 'Gestiona consultas de stock y agenda test drives',
    emoji: '🚗',
    image: '/images/sectors/automotive.jpg' // Placeholder
  },
  {
   Insertar en src/routes/(public)/index.tsx
// Después de Features Section, antes de Sectores

{/* Live Demo Section */}
<section id="live-demo" class="bg-gradient-to-br from-primary-50 to-white py-20">
  <div class="content-container">
    
    {/* Hero */}
    <div class="mx-auto mb-16 max-w-2xl text-center">
      <h2 class="mb-4 text-3xl font-bold text-neutral-900 md:text-4xl">
        Prueba nuestro agente de IA ahora
      </h2>
      <p class="text-lg text-neutral-600">
        Descubre cómo tu negocio puede automatizar llamadas. Selecciona tu sector 
        y solicita una demo en vivo con uno de nuestros agentes inteligentes.
      </p>
    </div>

    {/* 2 Column Layout */}
    <div class="grid gap-8 lg:grid-cols-[2fr,1fr]">
      
      {/* LEFT BLOCK: Sectores Grid Bento (2x3) */}
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {sectors.map(sector => (
          <div 
            key={sector.id}
            class="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-shadow hover:shadow-lg"
          >
            {/* Image/Icon */}
            <div class="flex h-32 items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50">
              <span class="text-5xl" aria-hidden="true">{sector.emoji}</span>
            </div>
            
            {/* Content */}
            <div class="p-4">
              <h3 class="mb-1 text-sm font-semibold text-neutral-900">
                {sector.name}
              </h3>
              <p class="text-xs text-neutral-600">
                {sector.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* RIGHT BLOCK: Formulario */}
      <div class="rounded-xl border border-neutral-200 bg-white p-6 shadow-md">
        <h3 class="mb-6 text-xl font-semibold text-neutral-900">
          Solicita tu demo
        </h3>
        
        <form class="space-y-4">
          <div>
**Checklist UI Grid Bento de Sectores:**
- [ ] **2.5** Grid de 2x3: `grid-cols-2 lg:grid-cols-3` (2 columnas en mobile, 3 en desktop)
- [ ] **2.6** Cards con hover effect: `hover:shadow-lg transition-shadow`
- [ ] **2.7** Imagen/Emoji en bloque superior con gradiente background
- [ ] **2.8** Altura consistente en el área de imagen: `h-32`
- [ ] **2.9** Texto compacto: `text-sm` para título, `text-xs` para descripción
- [ ] **2.10** Border sutil: `border-neutral-200`

**Checklist UI Formulario de Contacto:**
- [ ] **2.11** Formulario en card elevada (`shadow-md`)
- [ ] **2.12** 3 campos con `<label>` semántico (WCAG a11y)
- [ ] **2.13** Inputs con estados focus visibles: `focus:ring-2 focus:ring-primary-500/20`
- [ ] **2.14** Placeholders descriptivos pero breves
- [ ] **2.15** Botón full-width en mobile, inline en desktop
- [ ] **2.16** Disclaimer de "Sin compromiso" debajo del botón
- [ ] **2.17** Spacing consistente entre campos: `space-y-4`
- [ ] **1.4** Actualizar `src/components/shared/index.ts` con export de `LiveDemoSection`

---

### Fase 2: Implementación de UI Components

**Prioridad: Mobile First (Tailwind v4)**

#### 1. `LiveDemoSection.tsx` (Orquestador)

```tsx
// Pseudocódigo de estructura esperada
component$(() => {
  const currentStep = useSignal<1 | 2>(1);
  const selectedSector = useSignal('');

  return (
    <section class="bg-[#0a1628] py-20 text-white">
      <div class="content-container">
        {/* Hero Text */}
        <div class="mb-12 text-center">
          <h2 class="mb-4 font-serif text-5xl">Try Our Live Demo</h2>
          <p class="text-lg text-neutral-300">
            Receive a live call from our agent and discover how our AI caller transforms customer conversations.
          </p>
        </div>

        {/* 2-Column Layout: Step Card + Orb + Form Card */}
        <div class="grid gap-6 lg:grid-cols-2">
          {/* Card 1: Step Selector */}
          <div class="relative rounded-3xl bg-white p-8 text-neutral-900">
            <span class="mb-4 block text-4xl font-bold">1</span>
            {currentStep.value === 1 && (
              <DemoStepSelector 
                onSelect$={(sector) => {
                  selectedSector.value = sector;
                  currentStep.value = 2;
                }} 
              />
            )}
            {currentStep.value === 2 && <AnimatedOrb />}
          </div>

          {/* Card 2: Form */}
          <div class="relative rounded-3xl bg-white p-8 text-neutral-900">
            <span class="mb-4 block text-4xl font-bold">2</span>
            <DemoContactForm 
              sector={selectedSector.value}
              onBack$={() => (currentStep.value = 1)}
            />
          </div>
        </div>
      </div>
    </section>
  );
}); (index.tsx)

- [ ] **3.1** Definir array `sectors` con los 6 objetos (id, name, description, emoji)
- [ ] **3.2** Copiar código de la sección después de Features Section
- [ ] **3.3** Verificar orden visual: Hero → Features → **Live Demo** → Sectores → Pricing → CTA
- [ ] **3.4** Ajustar `id="live-demo"` para navegación anchor

---

### Fase 4: NO IMPLEMENTAR Interactividad (Futura)

**Decisión explícita del usuario:**  
> "Haz solo la UI para ir puliéndola y mejorandola, la interacción y la parte funcional la haremos más adelante."

**Por lo tanto, NO hacer:**
- ❌ Validación de campos
- ❌ Evento `onClick$` en botón "Solicitar llamada"
- ❌ `useSignal()` para estado de formulario
- ❌ `routeAction$` para submit
- ❌ Integración con API

**El formulario debe:**
- ✅ Verse completo visualmente
- ✅ Tener todos los atributos HTML correctos (`id`, `type`, `placeholder`)
- ✅ **No hacer nada** al hacer click en "Solicitar llamada"cas médicas", "Despachos profesionales", "Servicios SAT", "Alquiladoras de maquinaria"
- Estado activo/hover con `bg-primary-600 text-white`
- Botón "Next" opcional (auto-avanza al hacer click en sector)

```tsx
// Props esperadas
interface DemoStepSelectorProps {
  onSelect$: QRL<(sector: string) => void>;
}
```

**Checklist UI StepSelector:**
- [ ] **2.6** Grid responsive (grid-cols-2 sm:grid-cols-3)
- [ ] **2.7** Botones con estado activo (bg-primary-600 cuando seleccionado)
- [ ] **2.8** Iconos opcionales por sector (🚗, 🏠, 🏥, ⚖️, 🔧, 🚛)
- [ ] **2.9** Heading: "Select the type of call you want to receive"
- [ ] **2.10** Auto-avance a Step 2 al hacer click (emitir evento onSelect$)

---

#### 3. `DemoContactForm.tsx` (Step 2)

**Requisitos visuales:**
- 4 campos: Industry (select), Name, Phone, Email
- Botón "Back to Agent" (outline)
- Botón "Get a call" (primary, bottom-right)
- Heading: "Enter your information"

```tsx
// Props esperadas
interface DemoContactFormProps {
  sector: string; // Pre-seleccionado desde Step 1
  onBack$: QRL<() => void>;
}
```Section */
bg-gradient-to-br from-primary-50 to-white

/* Cards (Sectores, Formulario) */
bg-white
border border-neutral-200
rounded-xl
shadow-md (form), hover:shadow-lg (sectores)

/* Primary CTA */
bg-primary-600 hover:bg-primary-700

/* Imagen de Sector (placeholder background) */
bg-gradient-to-br from-primary-50 to-accent-50

/* Typography */
text-neutral-900 (headings)
text-neutral-700 (labels)
text-neutral-600 (descriptions)
```

### Tipografía

- **Section Heading:** `text-3xl md:text-4xl font-bold`
- **Section Subheading:** `text-lg text-neutral-600`
- **Form Heading:** `text-xl font-semibold`
- **Sector Card Title:** `text-sm font-semibold`
- **Sector Card Description:** `text-xs text-neutral-600`
- **Form Labels:** `text-sm font-medium text-neutral-700`
- **Disclaimer:** `text-xs text-neutral-500`

### Spacing y Layout

- Section: `py-20`
- Hero margin-bottom: `mb-16`
- 2-column grid: `lg:grid-cols-[2fr,1fr]` (sectores ocupan 2/3, form 1/3)
- Gap entre columnas: `gap-8`
- Gap entre cards de sectores: `gap-4`
- Grid de sectores: `grid-cols-2 lg:grid-cols-3` (2x3 en desktop = 6 cards total)
- Spacing form fields: `space-y-4`
- Content container: `.content-container` (clase global)blic)/index.tsx`
- [ ] **3.2** Insertar después de Features Section (antes de Sectores)
- [ ] **3.3** Verificar orden visual: Hero → Features → **Live Demo** → Sectores → Pricing → CTA

---

### Fase 4: Interactividad Placeholder

**Objetivo:** Formulario funciona visualmente, pero "Get a call" solo muestra mensaje success.

- [ ] **4.1** Botón "Get a call" → `onClick$` con Alert Component
- [ ] **4.2** Texto del Alert: "✅ Demo solicitada. En la próxima fase recibirás la llamada real."
- [ ] **4.3** Opcional: Reset form después de 3 segundos

**Nota:** NO implementar integración con Retell/API en esta fase.

---

## 🛡️ Auditoría (@QwikAuditor - Post-Implementación)

### Calidad de Código (Zero-Hydration Check)

- [ ] **A1** No usa `useVisibleTask$` excepto para animación puramente visual (AnimatedOrb)
- [ ] **A2** Usa `useSignal()` para estado primitivo (currentStep)
- [ ] **A3** Usa `useStore()` para formData (objeto)
- [ ] **A4** Eventos con `QRL` correctamente tipados (`onClick$`, `onSelect$`)
- [ ] **A5** Pasa ESLint sin errores
- [ ] **A6** Build de producción exitoso

---

### Accesibilidad y SEO

- [ ] **A7** Heading hierarchy: `<h2>` para "Try Our Live Demo"
- [ ] **A8** Formulario: Todos los `<input>` tienen `<label>` asociado (no solo placeholder)
- [ ] **A9** Botones: Texto descriptivo (no solo iconos)
- [ ] **A10** Iconos decorativos con `aria-hidden="true"`
- [ ] **A11** Navegación por teclado funcional (Tab entre campos, Enter para submit)
- [ ] **A12** Contraste de color: Texto blanco sobre azul oscuro cumple WCAG AA (4.5:1)

---

### Performance & UX

- [ ] **A13** Animación del orb no causa layout shift (CLS < 0.1)
- [ ] **A14** Transición entre steps fluida (Tailwind transitions)
- [ ] **A15** Responsive: Se ve bien en mobile (375px) y desktop (1440px)
- [ ] **A16** Loading state  (VERSIÓN 2 - Solo UI)

**Definition of Done (esta fase):**

1. ✅ Sección visible en landing page después de Features Section
2. ✅ Hero explicativo con heading + descripción
3. ✅ Grid bento de 6 sectores con imagen/emoji + texto
4. ✅ Formulario con 3 campos (Nombre, Teléfono, Email) semánticamente correctos
5. ✅ Layout 2 columnas funcional (responsive: 1 col en mobile, 2 en desktop)
6. ✅ Hover effects en tarjetas de sectores
7. ✅ Focus states visibles en inputs del formulario
8. ✅ Responsive en mobile (375px) y desktop (1440px)
9. ✅ Zero errores ESLint/TypeScript
10. ✅ Pasa auditoría de accesibilidad (labels en inputs, alt en imágenes)

**EXPLÍCITAMENTE NO requerido (Fase 2):**
- ❌ Interactividad del formulario (submit, validación)
- ❌ Selección de sector (clickeable)
- ❌ Estado reactivo con signals/store
- ❌ routeAction$ para envío de datos
- ❌ Integración con API de Retell
- ❌ Mensajes de éxito/error
/* Orb Gradient */
from-violet-400 via-blue-400 to-teal-300
blur-3xl

/* Typography */
text-white (section background)
text-neutral-900 (cards)
font-serif (heading "Try Our Live Demo")
```

### Tipografía

- **Headline:** `font-serif text-5xl md:text-6xl` (look editorial como imágenes)
- **Subheadline:** `text-lg text-neutral-300`
- **Card Numbers:** `text-4xl font-bold` (estilo dotted de las imágenes)
- **Form Labels:** `text-sm font-medium text-neutral-700`

### Spacing

- Section: `py-20` (vertical padding generoso)
- Cards: `p-8` (interno)
- Gap entre cards: `gap-6`
- Content container: Usar clase global `.content-container`

---

## 🚀 Fase 2 (Futura - NO Implementar Ahora)

Cuando la UI esté aprobada, siguientes pasos:

1. **Backend Integration:**
   - Crear `server$` function para envío de datos a Retell API
   - Validación Zod del formulario
   - Persistencia en tabla `demo_requests`

2. **Real-time Call:**
   - Integración con Retell SDK
   - Webhook para status de llamada
   - Dashboard para seguimiento de demos

3. **Analytics:**
   - Track conversion rate (% que completan formulario)
   - Track call completion rate
   - A/B testing de sectores más populares

---

## ✅ Criterios de Aceptación

**Definition of Done (esta fase):**

1. ✅ Sección visible en landing page (`/`)
2. ✅ Navegación Step 1 ↔ Step 2 funcional
3. ✅ Selección de sector persiste al pasar a Step 2
4. ✅ Formulario completo visualmente (4 campos)
5. ✅ Botón "Get a call" muestra mensaje placeholder
6. ✅ Responsive en mobile y desktop
7. ✅ Pasa auditoría de accesibilidad (A7-A12)
8. ✅ Zero errores ESLint/TypeScript
9. ✅ Diseño visual coherente con brand (Onucall theme)

**NO requerido en esta fase:**
- ❌ Validación real del formulario
- ❌ Envío de datos a backend
- ❌ Integración con API de Retell
- ❌ Email de confirmación
- ❌ Persistencia en base de datos

---

## 📚 Referencias Técnicas

- **Arquitectura:** [ARQUITECTURA_FOLDER.md](docs/standards/ARQUITECTURA_FOLDER.md)
- **Tailwind v4:** [TAILWIND_QWIK_GUIDE.md](docs/standards/TAILWIND_QWIK_GUIDE.md)
- **Forms/Inputs:** [src/components/ui/input.tsx](src/components/ui/input.tsx)
- **Buttons:** [src/components/ui/button.tsx](src/components/ui/button.tsx)
- **Theme:** [src/global.css](src/global.css) (primary, accent colors)

---

**🟢 PLAN COMPLETADO - Listo para Aprobación del Usuario**

Una vez aprobado, pasar a **@QwikBuilder** para ejecución del checklist.
