# Guía Canónica de SEO, HTML Semántico y Accesibilidad (a11y)

**Propósito**: Este documento establece los requisitos técnicos **innegociables** de SEO (Search Engine Optimization) y Accesibilidad (a11y) que todo componente y página generados en Qwik deben cumplir. El objetivo es asegurar que la aplicación sea semánticamente correcta, rastreable, performante y accesible por defecto.

---
## 1. El HTML Semántico es la Base del SEO

El uso de `<div>` para todo ("divitis") es un anti-patrón. Los motores de búsqueda y los lectores de pantalla dependen de etiquetas HTML semánticas para entender la estructura, la jerarquía y el propósito del contenido.

* **Regla 1.1 (OBLIGARIA - Estructura de Página)**:
    * **`<main>`**: Debe envolver el contenido principal único de cada página (todo excepto el header y el footer).
    * **`<section>`**: Debe usarse para agrupar secciones temáticas de contenido (ej. la sección Hero, la sección de Características, la sección de FAQ).
    * **`<nav>`**: Debe usarse **exclusivamente** para bloques de navegación principales (el Header, el Footer, menús de navegación secundarios).
    * **`<header>`/`<footer>`**: Deben usarse para sus propósitos evidentes a nivel de página o de sección.

* **Regla 1.2 (OBLIGATORIA - Jerarquía de Contenido)**:
    * **`<h1>`**: **Solo debe haber un (1) `<h1>` por página**, reservado para el título principal y más importante (ej. el titular del Hero).
    * **`<h2>` - `<h6>`**: Deben usarse para los subtítulos, siguiendo un orden jerárquico lógico (no saltes de un `<h2>` a un `<h4>`).
    * **`<p>`**: Usa párrafos para todo el contenido textual que no sea un título. No uses `<div>` o `<span>` para bloques de texto.
    * **`<ul>` / `<ol>` / `<li>`**: Usa listas para cualquier enumeración de elementos (ej. la lista de características en la sección `FeaturesSection`).

* **Regla 1.3 (Interactividad)**: Usa la etiqueta correcta para la acción.
    * **`<button>`**: Para acciones que **modifican el estado** o ejecutan una función *dentro* de la página (ej. "Enviar Formulario", "Mostrar/Ocultar Modal", "Añadir al Carrito").
    * **`<Link>` (de Qwik City)**: Para la **navegación interna** que lleva al usuario a *otra ruta* dentro de la aplicación (ej. "Ver Detalles", "Ir a Precios").
    * **`<a>`**: Para enlaces **externos** (que llevan a otro dominio) o para enlaces de anclaje (`href="#features"`) si no se usa el componente `<Link>`.

## 2. La Accesibilidad (a11y) es SEO

Una pobre accesibilidad genera señales negativas de calidad y usabilidad, que impactan indirectamente en el posicionamiento.

* **Regla 2.1 (Imágenes)**: Toda etiqueta `<img>` o componente de imagen **debe** tener un atributo `alt` descriptivo. Si una imagen es puramente decorativa (un gradiente, una forma abstracta), debe tener un `alt` vacío (`alt=""`) para que los lectores de pantalla la ignoren.

* **Regla 2.2 (Interactividad Descriptiva)**: Si un `<Link>` o `<button>` no tiene texto descriptivo (ej. es solo un icono), **es obligatorio** añadir un atributo `aria-label` que describa la acción.
    * *Correcto*: `<Link href="/carrito" aria-label="Ver carrito de compras"><IconoCarrito /></Link>`
    * *Incorrecto*: `<Link href="/carrito"><IconoCarrito /></Link>`

* **Regla 2.3 (Formularios)**: Cada `input` de un formulario **debe** estar asociado a una etiqueta `<label>` usando el atributo `for="ID_DEL_INPUT"`. No uses `placeholder` como sustituto de una `<label>`.

* **Regla 2.4 (Navegación por Teclado)**: Todos los elementos interactivos (enlaces, botones, inputs) deben ser accesibles y operables usando solo el teclado. Esto se logra usando etiquetas semánticas (`<button>`, `<Link>`) en lugar de `div` con `onClick$`.

* **Regla 2.5 (SVG Decorativos)**: Los elementos SVG puramente decorativos (iconos de fondo, formas visuales sin significado semántico) **deben** tener el atributo `aria-hidden="true"` para ser ignorados por lectores de pantalla.

## 3. Gestión del `<head>` (Metadatos Dinámicos)

Una página sin metadatos es invisible para el SEO y no se comparte bien en redes sociales.

* **Regla 3.1 (Head Canónico)**: Cada componente de página (`src/routes/.../index.tsx`) **debe** exportar una `DocumentHead`.

* **Regla 3.2 (Contenido Mínimo)**: El `head` debe contener, como mínimo, un `title` único y una `meta` etiqueta para la `description`.

* **Regla 3.3 (Datos Dinámicos)**: Para páginas de detalle (productos, artículos), el `head` **debe** ser una función que use `resolveValue` para obtener los datos del `routeLoader$` y rellenar los metadatos dinámicamente.

* **Regla 3.4 (Open Graph)**: Para que los enlaces se vean bien en redes sociales (Facebook, LinkedIn, WhatsApp), el `head` **debe** incluir meta etiquetas de Open Graph:
    * `og:title` - Título de la página
    * `og:description` - Descripción breve
    * `og:image` - URL absoluta de imagen (1200x630px recomendado)
    * `og:url` - URL canónica de la página
    * `og:type` - Tipo de contenido (website, article, product, etc.)
    * `og:image:width` y `og:image:height` - Dimensiones de la imagen

* **Regla 3.5 (Twitter Card)**: Además de Open Graph, incluir meta etiquetas específicas de Twitter:
    * `twitter:card` - Tipo de tarjeta (summary_large_image recomendado)
    * `twitter:title` - Título para Twitter
    * `twitter:description` - Descripción para Twitter
    * `twitter:image` - URL de imagen para Twitter

* **Regla 3.6 (Datos Estructurados)**: Para contenido rico (productos, FAQs, artículos), se debe inyectar un script de `application/ld+json` (Datos Estructurados de Schema.org) dentro del `head` usando el array `meta` con la propiedad `innerHTML`.
    * **FAQPage** schema para secciones de FAQ
    * **Product** schema para productos/servicios SaaS
    * **Organization** schema para información de la empresa
    * **Article** schema para contenido de blog
    
    **Patrón canónico** (siguiendo CAPITULO-17.md):
    ```tsx
    export const head: DocumentHead = {
      title: "Título de la página",
      meta: [
        // ... otros meta tags
        {
          key: "json-ld",
          property: "innerHTML",
          content: `<script type="application/ld+json">${JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "¿Pregunta?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Respuesta detallada..."
                }
              }
            ]
          })}</script>`,
        },
      ],
    };
    ```
* **Regla 3.7** (Canonical URL): Toda página pública debe declarar una URL canónica para evitar contenido duplicado.

## 4. Performance (Core Web Vitals) y Enlaces

El rendimiento de carga es un factor de ranking crítico. Qwik facilita este objetivo por diseño, pero la implementación debe seguir las reglas.

* **Regla 4.1 (Imágenes y CLS)**: **No usar la etiqueta `<img>` estándar**. Para evitar el CLS (Cumulative Layout Shift) y optimizar el LCP (Largest Contentful Paint), todas las imágenes deben usar los patrones de Qwik:
    * Imágenes estáticas (locales): `import MyImage from '.../img.png?jsx'`.
    * Imágenes dinámicas (CMS/API): Usar el componente `<Image>` de `@unpic/qwik`.

* **Regla 4.2 (Fuentes)**: Las fuentes deben estar auto-alojadas (self-hosted) en `public/fonts` y cargadas en el CSS con la directiva `font-display: swap` para optimizar el LCP.

* **Regla 4.3 (Navegación Interna)**: **Siempre** usar el componente `<Link>` de `@builder.io/qwik-city` para navegar entre las páginas de la aplicación. No usar `<a>`. Esto mantiene el estado de la aplicación y habilita el *prefetching* del Service Worker.

* **Regla 4.4 (Navegación Externa)**: Usar la etiqueta `<a>` estándar **solo** para enlaces que llevan a un dominio diferente. En estos casos, añadir `target="_blank"` y `rel="noopener noreferrer"` por seguridad.

* **Regla 4.5 (Scripts de Terceros)**: Scripts como Google Analytics **deben** ser implementados usando Partytown (`type="text/partytown"`) para mover su ejecución del hilo principal a un web worker, protegiendo el INP (Interaction to Next Paint).

## 5. Archivos de Rastreo (`robots.txt` y `sitemap.xml`)

* **Regla 5.1 (`robots.txt`)**: Se debe crear un archivo `robots.txt` en el directorio `public/`. Este archivo debe incluir un enlace al `sitemap.xml`.

* **Regla 5.2 (`sitemap.xml`)**: El sitemap **debe** generarse dinámicamente para incluir todas las rutas públicas (incluyendo las dinámicas de la base de datos). Esto se implementa creando un endpoint de API en `src/routes/sitemap.xml/index.ts` que consulta la base de datos y devuelve el XML con headers de caché apropiados.

    **Implementación recomendada**:
    ```tsx
    import type { RequestHandler } from '@builder.io/qwik-city';

    export const onGet: RequestHandler = async ({ send, url }) => {
      const baseUrl = url.origin;
      
      // URLs estáticas
      const staticUrls = [
        { loc: `${baseUrl}/`, priority: '1.0' },
        // ... más URLs
      ];
      
      // TODO: Añadir URLs dinámicas de la base de datos
      
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${staticUrls.map(url => `  <url>
        <loc>${url.loc}</loc>
        <changefreq>weekly</changefreq>
        <priority>${url.priority}</priority>
      </url>`).join('\n')}
    </urlset>`;
      
      send(new Response(xml, {
        status: 200,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=3600', // Cache de 1 hora
        },
      }));
    };
    ```

---

## 6. Checklist de Implementación

Esta checklist es obligatoria para cualquier PR que afecte a rutas públicas.

### Página Nueva (Cualquier Ruta)
- [ ] Envolver contenido principal en `<main>`
- [ ] Usar `<section>` para agrupar contenido temático
- [ ] Solo un `<h1>` por página
- [ ] Jerarquía de headings lógica (`<h2>`, `<h3>`, etc.)
- [ ] Exportar `DocumentHead` con `title` y `description`
- [ ] Incluir metadatos Open Graph completos
- [ ] Incluir metadatos Twitter Card
- [ ] SVG decorativos con `aria-hidden="true"`

### Componentes Interactivos
- [ ] `<button>` para acciones, `<Link>` para navegación
- [ ] `aria-label` en botones/enlaces sin texto visible
- [ ] Navegación por teclado funcional
- [ ] Focus states visibles (`:focus-visible`)

### Formularios
- [ ] Cada `<input>` asociado a un `<label>` con `for`
- [ ] Validación con Zod en `routeAction$`
- [ ] Estados de error accesibles
- [ ] Mensajes de error descriptivos

### Imágenes y Media
- [ ] Atributo `alt` en todas las imágenes
- [ ] `alt=""` para imágenes decorativas
- [ ] Usar `import img from '...?jsx'` para estáticas
- [ ] Usar `<Image>` de `@unpic/qwik` para dinámicas

### SEO Avanzado (Landing Pages)
- [ ] `robots.txt` creado en `public/`
- [ ] Endpoint `sitemap.xml` implementado
- [ ] Datos estructurados (Schema.org) para contenido rico
- [ ] OG image creada (1200x630px)

---

## 7. Ejemplos de Implementación

### Ejemplo 1: Landing Page Completa
```tsx
// src/routes/index.tsx
import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <main>
      <section id="hero">
        <h1>Título Principal de la Página</h1>
        <p>Descripción del producto o servicio</p>
      </section>
      
      <section id="features">
        <h2>Características</h2>
        {/* Contenido */}
      </section>
    </main>
  );
});

export const head: DocumentHead = {
  title: "Título SEO - Marca",
  meta: [
    {
      name: "description",
      content: "Descripción SEO optimizada (150-160 caracteres)",
    },
    // Open Graph
    {
      property: "og:title",
      content: "Título SEO - Marca",
    },
    {
      property: "og:description",
      content: "Descripción SEO optimizada",
    },
    {
      property: "og:image",
      content: "https://dominio.com/og-image.png",
    },
    {
      property: "og:url",
      content: "https://dominio.com",
    },
    {
      property: "og:type",
      content: "website",
    },
    // Twitter Card
    {
      name: "twitter:card",
      content: "summary_large_image",
    },
    {
      name: "twitter:title",
      content: "Título SEO - Marca",
    },
    {
      name: "twitter:description",
      content: "Descripción SEO optimizada",
    },
    {
      name: "twitter:image",
      content: "https://dominio.com/og-image.png",
    },
  ],
};
```

### Ejemplo 2: Botón con Icono Accesible
```tsx
// ❌ INCORRECTO
<button onClick$={handleClick}>
  <IconoCarrito />
</button>

// ✅ CORRECTO
<button onClick$={handleClick} aria-label="Añadir al carrito">
  <IconoCarrito />
</button>
```

### Ejemplo 3: SVG Decorativo
```tsx
// ❌ INCORRECTO
<svg class="decoration">
  <circle />
</svg>

// ✅ CORRECTO
<svg aria-hidden="true" class="decoration">
  <circle />
</svg>
```

### Ejemplo 4: Datos Estructurados (FAQ)
```tsx
export const head: DocumentHead = {
  title: "FAQ - Preguntas Frecuentes",
  meta: [
    // ... metadatos básicos
    {
      key: "json-ld-faq",
      property: "innerHTML",
      content: `<script type="application/ld+json">${JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "¿Cómo funciona el producto?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Respuesta detallada..."
            }
          }
        ]
      })}</script>`,
    },
  ],
};
```

---

## 8. Referencias

### Documentación Interna (Capa 1)

Estos documentos complementan y amplían los conceptos de esta guía:

- **[QUALITY_STANDARDS.md](./QUALITY_STANDARDS.md)** - Estándares de Calidad  
  Pilar "Accesible" con métricas y checklist de a11y. Complementa la Sección 2 de este documento.

- **[UX_GUIDE.md](./UX_GUIDE.md)** - Guía de UX/UI  
  Principios de diseño, accesibilidad por defecto y HTML semántico. Base teórica de las Secciones 1 y 2.

- **[ARQUITECTURA_FOLDER.md](./ARQUITECTURA_FOLDER.md)** - Arquitectura Canónica  
  Estructura de componentes y separación de dominios que facilita el SEO y la mantenibilidad.

### Documentación Externa

Recursos oficiales para validar y profundizar en los estándares:

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - Directrices de accesibilidad web
- [Schema.org Documentation](https://schema.org/) - Datos estructurados para SEO
- [Open Graph Protocol](https://ogp.me/) - Meta tags para redes sociales
- [Google Search Central - SEO](https://developers.google.com/search/docs) - Guía oficial de Google
- [Core Web Vitals](https://web.dev/vitals/) - Métricas de rendimiento de Google
- [Qwik City - Document Head](https://qwik.dev/docs/components/overview/#document-head) - Documentación oficial de Qwik

---

**Nota Final**: Este documento es parte de la **Capa 1** del conocimiento canónico del proyecto. Todas las implementaciones **deben** cumplir estas reglas. Las desviaciones solo son aceptables si están explícitamente justificadas y documentadas.