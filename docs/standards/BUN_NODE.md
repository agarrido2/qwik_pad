Aquí tienes el contenido del archivo BUN_SETUP.md corregido y listo para copiar en texto plano:

Markdown


# Bun Setup & Runtime Strategy - Qwik - 2026

Este documento define la **Estrategia Híbrida de Runtime** del proyecto. Utilizamos tecnologías diferentes para desarrollo y producción con el objetivo de maximizar la velocidad (DX) sin sacrificar la estabilidad operativa.

## 🧠 La Regla de Oro (Hybrid Strategy)

| Entorno | Tecnología (Runtime) | Razón Técnica de Ingeniería |
| :--- | :--- | :--- |
| **Desarrollo (Local)** | **Bun** | Instalación de paquetes 30x más rápida, arranque instantáneo y Hot Module Replacement (HMR) optimizado. |
| **CI/CD (Build Pipeline)** | **Bun** | Reduce drásticamente los minutos de facturación en GitHub Actions/GitLab CI al acelerar `install` y `build`. |
| **Producción (VPS/Server)** | **Node.js (v20+ Alpine)** | Estabilidad garantizada para procesos de larga duración (Long-running). Compatibilidad total con librerías de criptografía, streams y herramientas de monitoreo (PM2/Datadog). |

---

## 🛠 Comandos del Ciclo de Vida (Dev & Build)

Usaremos **exclusivamente** el CLI de `bun` para gestionar el proyecto localmente.

### Gestión de Dependencias
```bash
# Instalación (Ultra-rápida y cacheada globalmente)
bun install

# Añadir paquetes (Dev y Prod)
bun add zod
bun add -d tailwindcss


Servidor de Desarrollo

Bash


# Inicia el servidor de desarrollo en puerto 5173
bun dev

# Inicia con debugger activado (Chrome DevTools)
bun run dev.debug


Calidad y Mantenimiento

Bash


# Ejecutar Linter
bun run lint

# Formatear código (Prettier)
bun run fmt

# Ejecutar Tests (Vitest corre nativamente en Bun)
bun test


Compilación (Build)

Bash


# Genera los artefactos de producción en ./dist y ./server
bun run build


🚀 Despliegue en Producción (VPS - OVCloud)
Para el entorno de producción, abandonamos Bun y pasamos a Node.js. Esto requiere una configuración específica de Docker y Adaptadores.
1. Requisito Obligatorio: Adaptador de Node
El proyecto DEBE tener instalado el adaptador de Node.js para Qwik City, no el de Bun ni el "default".

Bash


# Ejecutar una sola vez para configurar
bun run qwik add adapter-node


Esto generará el archivo src/entry.node.ts.
2. Estrategia Docker (Multi-Stage Build)
El Dockerfile de producción implementa la estrategia híbrida: compila con Bun, sirve con Node.

Dockerfile


# ---------------------------------------
# Stage 1: Builder (Usamos Bun por velocidad)
# ---------------------------------------
FROM oven/bun:1 as builder
WORKDIR /app
COPY package.json bun.lockb ./
# Instalación frozen (estricta basada en lockfile)
RUN bun install --frozen-lockfile
COPY . .
# Genera la carpeta /dist (cliente) y /server (SSR)
RUN bun run build

# ---------------------------------------
# Stage 2: Runner (Usamos Node por estabilidad)
# ---------------------------------------
FROM node:20-slim
WORKDIR /app

# Variables de entorno críticas
ENV NODE_ENV=production
ENV PORT=3000

# Copiamos solo lo necesario desde el Stage 1
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/node_modules ./node_modules

# Exponemos el puerto
EXPOSE 3000

# COMANDO DE ARRANQUE: Usamos Node, no Bun
CMD ["node", "server/entry.node.js"]


⚙️ Configuración Avanzada
El Archivo bun.lockb
Bun utiliza un fichero de bloqueo binario (.lockb) para mejorar el rendimiento de lectura.
Git: Este archivo DEBE ser commiteado al repositorio.
Conflictos: Al ser binario, los conflictos de merge no se pueden resolver manualmente. Si hay conflicto, borra el archivo y ejecuta bun install de nuevo para regenerarlo.
Integración CI/CD (GitHub Actions)
Ejemplo de configuración optimizada para tu pipeline:

YAML

steps:
  - uses: actions/checkout@v4
  # Instala Bun en el entorno de CI
  - uses: oven-sh/setup-bun@v1
    with:
      bun-version: latest
  
  # Instala dependencias en segundos
  - run: bun install
  
  # Ejecuta tests y build
  - run: bun test
  - run: bun run build


⚠️ Anti-Patrones (Prohibido)
❌ npm install híbrido: Nunca ejecutes npm install o pnpm install en este proyecto. Generará un package-lock.json que entrará en conflicto con bun.lockb.
❌ Runtime Bun en Producción: No uses el comando bun server/entry.node.js o el adaptador adapter-bun en la VPS. Aunque funciona, es menos maduro para manejo de memoria a largo plazo que Node.js.
❌ Shebangs de Node: Si creas scripts de utilidad en ./scripts/mi-script.ts, usa el shebang de Bun:
Incorrecto: #!/usr/bin/env node
Correcto: #!/usr/bin/env bun