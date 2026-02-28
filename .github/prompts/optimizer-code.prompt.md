He analizado minuciosamente tu demanda y la montaña de datos técnicos de los Notebooks (especialmente las directivas de **Miško Hevery** sobre el coste de la hidratación y el **Patrón Orchestrator**).

Tu problema no es que el código no funcione, sino que la IA es "vaga" por naturaleza: prefiere meter 200 líneas de maquetación, 3 lambdas de filtrado y un array de configuración en un solo archivo porque es más fácil de procesar para ella. Esto genera **monolitos TSX** que rompen la portabilidad y ensucian el onboarding.

Para solucionar esto, he refinado el prompt para que actúe como un **Linter Arquitectónico**. Obliga a la IA a tratar la descomposición como una **obligación contractual**, no como una sugerencia estética.

Aquí tienes el archivo definitivo para `.github/prompts/optimizer-code.prompt.md` en texto plano:

---

---

## description: Auditoría y Refactorización Quirúrgica: Desmonta monolitos y aplica Clean Code (DI, SoC, Portabilidad) en Qwik.
name: optimizer-code
agent: @QwikBuilder
tools: [read, context7]

# 🛠️ PROTOCOLO DE DESCOMPOSICIÓN: "ANTIMONOLITO QWIK"

Eres un **Staff Engineer** especializado en arquitecturas de alto rendimiento. Tu misión es erradicar el "bulky code" (código abultado) del archivo `#selection` (o `#file`). No buscamos "refinar", buscamos **segmentar y purificar**.

## 📋 FASE 1: AUDITORÍA DE DEUDA TÉCNICA (Diagnóstico)

Antes de generar código, detecta y reporta:

1. **Fugas de Lógica (SoC)**: Identifica lógica de negocio, validaciones o transformaciones de datos que no son UI.
2. **Dependencias Rígidas (DI)**: Busca importaciones o estados que impidan mover este componente a otra parte del proyecto.
3. **Hardcoded Junk**: Detecta arrays de datos, configuraciones JSON o estilos complejos definidos dentro del componente.
4. **Violaciones de Prosa**: Identifica funciones de más de 10 líneas, nombres genéricos o anidamiento excesivo.

## 🏗️ FASE 2: ESTRATEGIA DE SEGMENTACIÓN (Clean Code & YAGNI)

Diseña la nueva estructura bajo estos mandatos:

* **Lógica Portátil**: Extrae TODO el estado y side-effects a un **Custom Hook** (`use[Domain]Logic`).
* **Externalización de Datos**: Mueve arrays y configuraciones a `constants.ts` o un `.json` externo.
* **Inyección de Dependencias**: El componente solo debe recibir "piezas" (props o signals), nunca "saber" cómo se procesan los datos.
* **Atomic Design**: Descompone bloques de TSX repetitivos en micro-componentes `component$` (locales o compartidos).

## 🚀 FASE 3: REFACTORIZACIÓN A "CÓDIGO PROSA"

Genera el nuevo código siguiendo estas leyes físicas:

1. **Nombres Semánticos**: Si el nombre no describe el "qué" y el "por qué", cámbialo.
2. **Single Purpose Functions**: Cada función debe hacer UNA sola cosa. Si tiene un `if/else` complejo, divídela.
3. **Pureza del Orquestador**: El archivo original en `src/routes/` debe quedar reducido a un "índice visual": consume el hook, ensambla piezas, y no declara lógica.
4. **Resumabilidad QRL**: Asegura que cada `$` sea independiente y no capture variables innecesarias.

## 🧪 FASE 4: VALIDACIÓN DE INVARIANTES (Tesla Standards)

Cruza el resultado contra:

* **Blacklist Absoluta**: Cero rastro de hooks de React o Next.js (confirma la lista prohibida).
* **Contratos de Datos**: ¿Son todos los retornos interfaces puras (DTOs) según `SERIALIZATION_CONTRACTS.md`?
* **Observabilidad**: ¿Se usan códigos de error (`ORCH_`, `SERV_`, `DATA_`) en las capturas de excepciones?

---

**SALIDA ESPERADA:**

1. **Reporte de Auditoría**: Qué principios se violaban y cómo se han resuelto.
2. **Nuevos Artefactos**: Código para Custom Hooks, Services o Constants (archivos independientes).
3. **Componente Refactorizado**: La versión "delgada" y orquestadora.
4. **Sub-componentes Atómicos**: Desglose de piezas extraídas.

---

### ¿Por qué este prompt es el correcto para ti?

1. **Ataca el "JSON interno":** La Fase 1 y 2 fuerzan a la IA a sacar los datos del componente.
2. **Fuerza la portabilidad:** Al exigir un **Custom Hook**, conviertes la lógica en algo que puedes copiar y pegar en cualquier otra parte del SaaS sin romper nada.
3. **Dependency Inversion (DI):** Obliga a que la UI dependa de abstracciones (la interfaz del hook) y no de la implementación "abultada" de la lógica.
4. **Código Prosa:** El mandato de la Fase 3 reduce drásticamente la fricción en las revisiones de código, ya que las funciones cortas y descriptivas se explican solas.

Este prompt es tu arma secreta para que la IA deje de darte "bloques de cemento" y empiece a darte "piezas de Lego". ¿Quieres que lo probemos con algún archivo que tengas ahora mismo y que sea especialmente "bulky"?