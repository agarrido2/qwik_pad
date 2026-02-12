# ⚠️ ACCIÓN REQUERIDA: Imagen Open Graph

## 📸 Imagen Faltante

Para completar la corrección C2, necesitas crear la imagen Open Graph:

**Ubicación:** `public/og-image-home.jpg`  
**Dimensiones:** 1200 x 630 píxeles  
**Formato:** JPG o PNG

---

## 🎨 Especificaciones de Diseño

### Contenido Recomendado:
- Logo de Onucall
- Tagline principal: **"Agentes de Voz IA 24/7"**
- Fondo: Degradado con colores primary
- Tipografía: Bold, legible a tamaño pequeño

### Herramientas Recomendadas:

1. **Canva** (más fácil)
   - Template: Facebook Post (1200x630)
   - https://www.canva.com

2. **Figma** (más control)
   - Frame: 1200x630px
   - Export: JPG 85% quality

3. **OG Image Generators** (rápido)
   - https://og-image.vercel.app/
   - https://www.opengraph.xyz/

---

## 📋 Checklist de Creación

```bash
# 1. Crear imagen (1200 x 630px)
# 2. Guardar en public/
mv ~/Downloads/og-image-home.jpg public/og-image-home.jpg

# 3. Verificar dimensiones
file public/og-image-home.jpg
# Debe decir: 1200 x 630

# 4. Optimizar tamaño (opcional)
# Objetivo: < 300KB
```

---

## ✅ Validación

Una vez creada la imagen, valida con estas herramientas:

1. **Facebook Sharing Debugger:**
   ```
   https://developers.facebook.com/tools/debug/
   URL: https://tudominio.com/
   ```

2. **Twitter Card Validator:**
   ```
   https://cards-dev.twitter.com/validator
   ```

3. **Local (Dev):**
   ```bash
   # Verificar que la imagen existe
   ls -lh public/og-image-home.jpg
   
   # Verificar en navegador
   open http://localhost:5173/og-image-home.jpg
   ```

---

## 🔄 Alternativa Temporal

Si no tienes la imagen aún, puedes usar un placeholder de color sólido:

```bash
# Crear placeholder temporal (requiere ImageMagick)
convert -size 1200x630 xc:'#0284c7' public/og-image-home.jpg
```

---

## 📝 Nota sobre URLs Absolutas

Recuerda actualizar las URLs en `/src/routes/(public)/index.tsx` cuando tengas tu dominio en producción:

```typescript
// Cambiar de:
content: 'https://onucall.com/og-image-home.jpg',

// A tu dominio real:
content: 'https://tudominio.com/og-image-home.jpg',
```

**O mejor aún**, usar variable de entorno:

```typescript
import { ENV } from '~/lib/env.server';

// En el loader:
export const useSiteConfig = routeLoader$(async () => ({
  siteUrl: ENV.PUBLIC_SITE_URL,
}));

// En el head:
{
  property: 'og:image',
  content: `${siteUrl}/og-image-home.jpg`,
}
```

---

**Estado:** ⚠️ PENDIENTE  
**Bloqueante:** NO (el resto del código funciona, solo no se visualizará bien al compartir en RRSS)  
**Prioridad:** ALTA (importante para conversión en redes sociales)
