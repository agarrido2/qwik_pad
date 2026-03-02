# ONUCALL
## White Paper Técnico, Estratégico y Comercial
### Plataforma de Inteligencia Comercial con IA de Voz
### Vertical: Concesionarios y Vendedores de Vehículos en España

---

**Versión:** 1.0 (Documento Vivo)
**Fecha de inicio:** 23 de febrero de 2026
**Autor:** Fundador y Arquitecto de Producto
**Estado:** En elaboración activa. Este documento se actualiza
de forma continua a medida que se completa el ciclo de vida
del producto.
**Confidencialidad:** Documento interno. Uso estrictamente
restringido al equipo fundador.

---

> Este documento es un White Paper vivo. Cada sección se
> completa y se revisa a medida que el producto evoluciona.
> No debe considerarse una versión final en ninguna de sus
> etapas intermedias. Su propósito es servir como referencia
> técnica, estratégica y comercial completa para el desarrollo,
> posicionamiento y comercialización de Onucall.

---

## ÍNDICE GENERAL

### PARTE I: CONTEXTO Y PROBLEMA
- 1. Resumen Ejecutivo
- 2. El Mercado de la Venta de Vehículos en España
- 3. La Realidad del Día a Día en un Concesionario
- 4. El Problema Central: Lo que Nadie Ha Resuelto Todavía

### PARTE II: LA SOLUCIÓN
- 5. Qué es Onucall
- 6. El Agente de Voz Configurable
- 7. Cómo Funciona una Llamada Real

### PARTE III: LA ARQUITECTURA DEL SISTEMA
- 8. La Jerarquía del Sistema
- 9. El Sistema de Calendarios Laborales
- 10. El Motor de Agendamiento de Citas

### PARTE IV: LEADS, CITAS Y GESTIÓN COMERCIAL
- 11. Qué es una Cita en Onucall
- 12. Los Tipos de Lead
- 13. El Radar de Intención
- 14. La Agenda del Vendedor
- 15. Las Notificaciones del Sistema

### PARTE V: LOS MÓDULOS DEL PRODUCTO
- 16. CRM de Leads
- 17. Catálogo de Vehículos: Mis Vehículos
- 18. Base de Conocimientos
- 19. BI Conversacional
- 20. Portal Web

### PARTE VI: LA INTELIGENCIA DEL SISTEMA
- 21. El RAG Híbrido de Tres Capas
- 22. El Campo Annotation y el Enriquecimiento con IA
- 23. El Sistema de Casos de Uso

### PARTE VII: LAS INTEGRACIONES
- 24. Integración con Retell AI
- 25. Integración con Zadarma
- 26. n8n como Orquestador de Procesos

### PARTE VIII: PRIVACIDAD, SEGURIDAD Y ROLES
- 27. Marco Legal: RGPD y LOPD-GDD
- 28. Control de Acceso por Roles
- 29. Grabaciones, Transcripciones y Resúmenes

### PARTE IX: MERCADO, NEGOCIO Y FUTURO
- 30. Análisis Competitivo
- 31. A Quién Va Dirigido
- 32. Qué Nos Hace Diferentes
- 33. Modelo de Negocio y Precios
- 34. El ROI para el Cliente
- 35. Proyección Financiera
- 36. Riesgos y Mitigaciones
- 37. Hoja de Ruta
- 38. Conclusión

---

## PARTE I: CONTEXTO Y PROBLEMA

---

## 1. RESUMEN EJECUTIVO

Onucall es una plataforma SaaS de inteligencia comercial con
inteligencia artificial de voz, diseñada específicamente para
el sector de venta de vehículos en España. Su propuesta de
valor es directa y radical: ninguna oportunidad comercial
vuelve a perderse por una llamada no atendida,
independientemente del día, la hora o la situación operativa
interna del concesionario.

Onucall no es un contestador automático. No es un chatbot de
texto. No es un CRM convencional adaptado al sector de la
automoción. Es una plataforma completa que integra en un único
panel de control los siguientes componentes: un agente de
inteligencia artificial de voz totalmente configurable, un
sistema de gestión de leads con pipeline comercial visual, un
catálogo inteligente de vehículos conectado en tiempo real con
el agente de voz, una base de conocimientos vectorizada que
permite al agente responder preguntas técnicas con precisión
documental, un motor de inteligencia de negocio conversacional
en lenguaje natural, un sistema de agendamiento automático de
citas con calendarios laborales jerarquizados, y un portal web
opcional alimentado automáticamente por el catálogo de
vehículos del concesionario.

La arquitectura del sistema está construida sobre Supabase y
PostgreSQL como capa de datos, Qwik como framework de frontend,
Retell AI como infraestructura de voz, Zadarma como proveedor
de números de teléfono, n8n como orquestador de procesos
automatizados, y un sistema RAG híbrido de tres capas que
combina datos estructurados en tiempo real, documentos
vectorizados y fuentes externas de mercado para entregar al
agente de voz y al motor de inteligencia el contexto más
completo y preciso posible en cada interacción.

El mercado objetivo en España supera los once mil puntos de
venta de vehículos activos entre concesionarios oficiales,
vendedores multimarca de ocasión, distribuidores de
motocicletas, concesionarios de caravanas y autocaravanas,
distribuidores de embarcaciones y concesionarios de maquinaria
agrícola. La competencia directa con inteligencia artificial de
voz especializada en español para este sector es prácticamente
inexistente a fecha de febrero de 2026. La ventana de
oportunidad para establecerse como el referente indiscutible
de este nicho en España es de entre doce y dieciocho meses.

---

## 2. EL MERCADO DE LA VENTA DE VEHÍCULOS EN ESPAÑA

España es uno de los mercados de automoción más dinámicos y
voluminosos de Europa. Los datos oficiales de cierre del
ejercicio 2025 confirman que el sector se encuentra en plena
fase expansiva, con crecimientos sostenidos en todos los
segmentos relevantes para Onucall.

### 2.1 Turismos Nuevos

El mercado de turismos nuevos cerró 2025 con 1.148.650
unidades vendidas, lo que representa un crecimiento del 12,9%
respecto al ejercicio anterior y el segundo año consecutivo
superando la barrera del millón de unidades matriculadas.
Según datos de ANFAC, Faconauto y GANVAM, el precio medio de
un turismo nuevo en concesionario oficial alcanzó los 44.419
euros al cierre de 2025, un 45,6% más que en 2019. Este
encarecimiento sostenido del vehículo nuevo ha tenido un efecto
directo en el auge del mercado de ocasión, donde el comprador
que no puede acceder al nuevo encuentra alternativas de alto
valor a precios más accesibles.

### 2.2 Vehículos de Ocasión

El mercado de vehículos de ocasión es el segmento más
relevante para Onucall desde el punto de vista operativo,
porque es el que genera mayor volumen de llamadas entrantes
urgentes y el que tiene el mayor porcentaje de ventas perdidas
por falta de respuesta telefónica inmediata.

En 2025 se vendieron en España 2.218.824 vehículos de ocasión,
un 4,2% más que en 2024, según datos de GANVAM. Por cada
coche nuevo vendido en España se vendieron 1,9 coches de
ocasión. Andalucía fue la comunidad autónoma con mayor volumen
de venta de vehículos de ocasión de todo el país, con 410.084
unidades vendidas en 2025, lo que la convierte en el mercado
más accesible y estratégico para el lanzamiento inicial de
Onucall desde Huelva.

El margen neto estimado por vehículo de ocasión vendido oscila
entre 500 y 1.500 euros dependiendo del modelo, la antigüedad,
el canal de venta y el nivel de equipamiento. Este margen,
aunque aparentemente modesto por unidad, multiplica su impacto
cuando se analiza en el contexto de un concesionario que vende
entre quince y cuarenta vehículos al mes.

### 2.3 Motocicletas y Vehículos Ligeros

El sector de la motocicleta cerró 2025 con 265.220
matriculaciones, el mejor dato desde 2008, con un crecimiento
del 7% respecto al año anterior según datos de ANESDOR. España
se consolidó como el segundo mercado europeo por crecimiento
en este segmento, por detrás únicamente de Italia. La edad
media del parque de motos en España se sitúa en los 17,9 años,
lo que indica un potencial muy elevado de renovación del parque
en los próximos ejercicios.

### 2.4 Caravanas, Autocaravanas y Campers

El sector del caravaning alcanzó las 7.146 unidades
matriculadas en 2025 entre autocaravanas, campers y caravanas,
según datos de ASEICAR. Las autocaravanas fueron el segmento
más dinámico, con un crecimiento del 19% respecto a 2024. El
precio medio de una autocaravana nueva oscila entre 55.000 y
90.000 euros, lo que convierte cada venta en una operación de
alto valor con márgenes netos de entre 2.000 y 6.000 euros.

### 2.5 Embarcaciones de Recreo

El mercado náutico cerró 2025 con 4.992 matriculaciones de
embarcaciones de recreo según datos de ANEN, con una
estabilización respecto al año anterior. Los barcos a motor
lideraron las matriculaciones con 2.066 unidades, seguidos de
las motos de agua con 1.394 registros. Baleares, Barcelona,
Murcia y Alicante concentran la mayor actividad del sector
náutico, un mercado de alto valor unitario donde cada operación
puede generar márgenes de entre 1.500 y 8.000 euros.

### 2.6 Maquinaria Agrícola y Tractores

Las ventas de tractores nuevos crecieron un 23,75% en los
primeros cinco meses de 2025 respecto al mismo período de 2024,
según datos del Ministerio de Agricultura, Pesca y
Alimentación. Andalucía lideró la compra de tractores nuevos
a nivel nacional con 248 unidades solo en el mes de mayo, lo
que convierte a esta comunidad en el mercado más relevante para
este segmento. El precio medio de un tractor nuevo oscila entre
40.000 y 120.000 euros, con márgenes que pueden superar los
8.000 euros por operación.

### 2.7 Facturación Total del Sector Concesionarios

Según datos de DBK Datamonitor y Faconauto, los ingresos
totales del sector concesionarios superaron los 51.600
millones de euros en 2025, con una facturación media por
concesionario oficial de 22,43 millones de euros. La
rentabilidad media sobre facturación se situó en el 1,38%.
La venta de vehículos nuevos y de ocasión representa el 84,2%
de esa facturación, siendo la actividad principal y casi
exclusiva del negocio desde el punto de vista de generación
de volumen.

### 2.8 La Predisposición del Sector hacia la IA

Un dato especialmente relevante para el posicionamiento
comercial de Onucall es que el 81% de los concesionarios
españoles ya planificaba incrementar su inversión en
inteligencia artificial durante 2025, según el informe The
2025 State of AI Adoption in Car Dealerships publicado por
Bumper. Más significativo aún: el 100% de los concesionarios
que ya habían implementado soluciones de inteligencia
artificial reportaron un incremento en sus ingresos desde
el inicio de su uso. El 95% de los responsables de
concesionarios considera que la inteligencia artificial será
clave para el éxito futuro de su negocio.

Estos datos confirman que el mercado no necesita ser convencido
de que la inteligencia artificial existe ni de que puede ser
útil. El mercado ya lo sabe y ya está buscando soluciones.
Onucall llega en el momento exacto en que la demanda existe
pero la oferta especializada en español para este sector
prácticamente no existe.

---

## 3. LA REALIDAD DEL DÍA A DÍA EN UN CONCESIONARIO

Para entender con precisión por qué Onucall existe y qué
problema resuelve, es imprescindible abandonar la perspectiva
tecnológica y adoptar la perspectiva operativa de un
concesionario mediano en España. No la perspectiva de los
grandes grupos de distribución con call centers propios y
departamentos de marketing digital, sino la de los miles de
concesionarios independientes y multimarca que forman el grueso
del mercado.

### 3.1 La Jornada Típica del Vendedor

Un comercial de un concesionario de vehículos de ocasión en
Sevilla, Huelva, Málaga o cualquier capital de provincia
española comienza su jornada gestionando los mensajes de
WhatsApp que llegaron durante la noche desde Wallapop y
Milanuncios. A las 9:30 recibe la primera llamada del día.
A las 10:15 está enseñando un coche a un cliente en el patio.
El teléfono suena tres veces durante esa visita. Nadie lo coge.

A las 13:45, justo cuando el equipo se prepara para salir a
comer, suena el teléfono. Es alguien que ha visto el BMW Serie
3 azul publicado ayer en AutoScout24. El contestador automático
responde que el concesionario está atendiendo otros clientes
y que le llamarán en breve. El cliente cuelga y llama al
siguiente anuncio de la lista. Esa llamada era una venta
potencial de 900 euros de margen neto que acaba de evaporarse.

El viernes por la tarde, cuando la mayoría de los concesionarios
cierran a las 14:00 o a las 15:00, es el momento de mayor
actividad en los portales de anuncios. Los clientes
particulares terminan su semana laboral, navegan por Coches.net
o AutoScout24 en el sofá de su casa, encuentran el coche que
les interesa y llaman. El concesionario está cerrado. El 
sábado por la mañana algunos concesionarios abren, pero muchos
no. El sábado por la tarde prácticamente ninguno. El domingo
es territorio de nadie. Y sin embargo los portales de anuncios
no descansan nunca. Los anuncios siguen activos, los clientes
siguen navegando y las llamadas siguen llegando a un teléfono
que nadie coge.

El lunes por la mañana el vendedor encuentra en el registro
de llamadas perdidas del teléfono del concesionario entre
ocho y quince llamadas no atendidas del fin de semana. De esas
llamadas, estadísticamente entre cuatro y siete ya compraron
en otro concesionario durante el fin de semana. El resto
puede que aún esté disponible, pero la ventana de oportunidad
se ha enfriado considerablemente.

Esta situación no es excepcional. Es la norma. Y el
concesionario la ha normalizado como algo inevitable porque
hasta ahora no existía una solución accesible, asequible y
especializada que la resolviera.

### 3.2 El Perfil del Comprador de Vehículo de Ocasión

El comprador de un vehículo de ocasión en España tiene un
comportamiento muy específico que es crítico para entender el
valor de Onucall. Cuando este cliente llama, ya ha tomado
entre el 60% y el 70% de su decisión de compra. Ha comparado
el vehículo en varios portales, ha visto las fotos, conoce el
precio aproximado de mercado para ese modelo y kilometraje,
y tiene una idea clara de lo que quiere. Llama para confirmar
disponibilidad, resolver una o dos dudas concretas y, si todo
encaja, acordar una visita.

Su proceso de decisión se mide en horas, no en días. Si el
concesionario al que llama no le responde en los primeros
minutos, llama al siguiente de la lista. No espera. No deja
mensaje. No vuelve a llamar al día siguiente. La urgencia del
comprador de vehículo de ocasión es el factor más determinante
en la ecuación de ventas perdidas de cualquier concesionario
mediano en España, y es también el mayor aliado comercial de
Onucall.

Los estudios del sector confirman que entre el 35% y el 50%
de las ventas de vehículos van al proveedor que responde
primero, y que contactar a un lead en los primeros cinco
minutos desde que realiza su consulta aumenta hasta un 100%
las posibilidades de conversión respecto a contactarle
pasados treinta minutos.

### 3.3 El Perfil del Comprador de Vehículo Nuevo

El comprador de vehículo nuevo tiene un proceso de decisión
más largo, que puede extenderse entre varios días y varias
semanas. Compara modelos en las webs de los fabricantes,
lee comparativas en medios especializados, consulta foros de
propietarios, pide presupuestos a varios concesionarios y
evalúa las condiciones de financiación disponibles. Cuando
llama a un concesionario en esta fase, quiere información
sobre disponibilidad de versiones, colores y motorizaciones,
condiciones de financiación y descuentos aplicables al modelo
de su interés.

Para este perfil, el agente de voz actúa como el primer filtro
de cualificación del proceso comercial. Recoge las preferencias
exactas del cliente (modelo, versión, color, presupuesto,
forma de pago prevista), le informa de las unidades disponibles
en el stock actual y le agenda una visita con el comercial
especializado. La calidad de la información que el agente
transmite al CRM en tiempo real convierte al vendedor en un
consultor preparado que llega a la cita con el contexto
completo del cliente, en lugar de un vendedor que empieza
desde cero cada vez.

### 3.4 El Vendedor Particular que Quiere Vender su Vehículo

Existe un tercer perfil de llamada frecuente en los
concesionarios multimarca de ocasión: el particular que quiere
vender su vehículo y llama para saber si el concesionario está
interesado en comprárselo o en aceptarlo como parte del pago
de otro vehículo. Este tipo de llamada tiene un valor comercial
directo porque el vehículo que trae el particular puede
enriquecer el stock del concesionario, y el hecho de que esté
buscando un cambio indica que puede estar también en proceso
de compra.

El agente de voz gestiona esta llamada recogiendo los datos
básicos del vehículo que el cliente quiere vender o entregar
(marca, modelo, año de matriculación, kilómetros aproximados,
estado general), los registra como un lead de compra en el
sistema y genera una notificación para el responsable de
tasaciones del concesionario para que evalúe el interés en
el vehículo y contacte con el cliente.

### 3.5 El Cliente que Ha Visitado el Concesionario Físicamente

Existe una casuística frecuente en los concesionarios que
trabajan con stock de ocasión que no está completamente
digitalizado: el cliente que ha pasado físicamente por el
concesionario, ha visto un vehículo en el patio o en la nave
que le ha llamado la atención, y llama posteriormente para
preguntar por ese vehículo concreto. La dificultad es que ese
vehículo puede no estar aún en el catálogo digital del
concesionario ni en los portales de anuncios.

Cuando esto ocurre, el agente de voz detecta la discrepancia
entre la descripción del vehículo que da el cliente y el
catálogo disponible en el sistema, registra el lead con la
máxima información posible sobre el vehículo mencionado, y
el sistema genera automáticamente una notificación urgente
para todos los usuarios con rol de administrador de esa
organización, alertando de que existe un cliente interesado
en un vehículo que no está catalogado en el sistema. Esta
notificación es de tipo urgente porque representa
simultáneamente una oportunidad comercial activa y un fallo
operativo del concesionario que debe corregirse de inmediato.

---

## 4. EL PROBLEMA CENTRAL: LO QUE NADIE HA RESUELTO TODAVÍA

El problema central del sector de venta de vehículos en España
no es la falta de leads. Los portales de anuncios especializados
(Coches.net, AutoScout24, Wallapop, Milanuncios, Motor.es)
generan un volumen constante y creciente de llamadas y mensajes
para cualquier concesionario que publique su stock con fotos
de calidad y precios competitivos. El problema es la gestión
de esos leads en el momento exacto en que se producen, con la
información precisa que el cliente necesita, sin importar la
hora ni la situación operativa del concesionario.

Existen tres brechas específicas y bien delimitadas que Onucall
cierra de forma definitiva.

### 4.1 La Brecha Horaria

Los leads llegan a cualquier hora del día y de la noche, los
siete días de la semana, incluyendo festivos nacionales,
locales y los períodos vacacionales del equipo comercial. Los
concesionarios atienden en horario comercial. Entre esos dos
mundos existe una brecha temporal que en la práctica supone
que una parte muy significativa de las llamadas entrantes
se produce fuera del horario en que hay alguien disponible
para atenderlas.

Las franjas horarias de mayor abandono son las tardes después
de las 20:00, la hora de la comida entre las 14:00 y las
17:00, los sábados por la tarde, los domingos en su totalidad
y los festivos. Estas franjas coinciden precisamente con los
momentos en que el cliente particular tiene tiempo libre para
buscar coche, navegar por los portales y llamar. Onucall
elimina esta brecha proporcionando atención de calidad las
24 horas del día, los 365 días del año, sin excepciones y
sin coste adicional por llamada fuera de horario.

### 4.2 La Brecha de Capacidad

Incluso dentro del horario comercial, cuando el equipo de
vendedores está completo y trabajando, se produce
frecuentemente una situación de saturación en la que todas
las líneas están ocupadas o todos los vendedores están
atendiendo clientes presenciales o realizando pruebas de
conducción. El cliente que llama en ese momento no espera.
La estadística del sector es contundente: más del 60% de
los clientes que llaman a un negocio y no reciben respuesta
inmediata no vuelven a llamar.

Onucall actúa como una capacidad de atención ilimitada que
nunca se satura. Independientemente del número de llamadas
simultáneas que reciba el concesionario, el sistema puede
atenderlas todas en paralelo sin que ningún cliente reciba
una señal de ocupado ni espere en cola.

### 4.3 La Brecha de Conocimiento

Cuando un cliente llama con preguntas técnicas específicas
sobre un vehículo concreto (consumo real en ciudad, capacidad
del maletero, versiones disponibles con ese nivel de
equipamiento, historial de mantenimiento, tipo de garantía
incluida, compatibilidad con remolque, sistemas de asistencia
a la conducción disponibles), la respuesta habitual por parte
de un vendedor que no tiene ese vehículo delante o que no
conoce el modelo en profundidad es: "Déjeme que lo miro y
le llamo". Ese "le llamo" muchas veces no llega, llega
demasiado tarde, o llega con información incompleta.

Onucall elimina esta brecha porque el agente de voz tiene
acceso en tiempo real no solo al catálogo de vehículos sino
también a la Base de Conocimientos del concesionario, donde
pueden estar almacenados los manuales técnicos de los modelos
en stock, las fichas de equipamiento por versión y cualquier
documentación técnica o comercial que el concesionario haya
subido al sistema. Si la información está en el sistema, el
agente la entrega con precisión durante la llamada. Si no
está, informa al cliente de que un especialista le contactará
con esa información específica, sin generar falsas
expectativas ni dar datos incorrectos.

### 4.4 La Brecha de Continuidad Operativa

Los concesionarios, especialmente los medianos e independientes,
son negocios con equipos reducidos donde la ausencia de una
persona clave puede paralizar parte de la operación. Si el
único vendedor que trabaja las tardes está de baja, las
llamadas de tarde quedan sin atender. Si el responsable de
asignación de leads está de vacaciones, los nuevos contactos
se acumulan sin seguimiento. Si la recepcionista es quien
coge el teléfono y ese día no está, el teléfono suena en el
vacío.

Onucall elimina esta dependencia del factor humano individual
mediante un sistema de jerarquías de fallback que garantiza
que cada llamada es atendida, cada lead es registrado y cada
cita es gestionada independientemente de quién esté o no esté
disponible en cada momento. La operación comercial del
concesionario funciona siempre, no solo cuando el equipo
está completo.

---

## PARTE II: LA SOLUCIÓN

---

## 5. QUÉ ES ONUCALL

Onucall es una plataforma de inteligencia comercial
conversacional construida desde cero para el sector de venta
de vehículos en España. No es una herramienta genérica de
inteligencia artificial adaptada al sector. Es un producto
especializado donde cada decisión de diseño, cada flujo de
datos y cada funcionalidad ha sido pensada específicamente
para los retos operativos y comerciales de un concesionario
o vendedor de vehículos.

La plataforma se articula en torno a tres pilares
fundamentales que trabajan de forma integrada y coordinada.

### 5.1 El Pilar de la Atención: El Agente de Voz

El primer pilar es el agente de inteligencia artificial de
voz, que actúa como el punto de entrada de cada interacción
comercial telefónica del concesionario. El agente recibe
las llamadas entrantes, gestiona la conversación de forma
natural en español, accede en tiempo real a toda la
información del negocio disponible en el sistema, capta los
datos del cliente, cualifica su intención de compra y ejecuta
la acción más adecuada según las instrucciones configuradas
por el administrador del concesionario. El agente opera de
forma completamente autónoma las 24 horas del día, los 365
días del año, sin necesidad de supervisión humana continua.

### 5.2 El Pilar de los Datos: El Motor de Información

El segundo pilar es el conjunto de bases de datos
estructuradas y vectoriales que almacenan y organizan toda
la información del negocio: el catálogo de vehículos, el
historial de interacciones con cada cliente, las citas
agendadas, los calendarios laborales, la configuración de
cada departamento y el corpus de documentos técnicos y
comerciales de la Base de Conocimientos. Este pilar es el
que garantiza que el agente de voz nunca trabaja con
información desactualizada o inventada, y que el motor de
inteligencia de negocio puede responder cualquier consulta
del gestor con datos reales y precisos.

### 5.3 El Pilar de la Inteligencia: El RAG Híbrido

El tercer pilar es el sistema de Retrieval Augmented
Generation de tres capas que combina los datos estructurados
del motor de información, los documentos vectorizados de la
Base de Conocimientos y las fuentes externas de datos de
mercado en tiempo real. Este sistema es el que permite tanto
al agente de voz responder preguntas técnicas complejas
durante una llamada como al motor de BI Conversacional del
dashboard responder preguntas de negocio en lenguaje natural
con información cruzada de múltiples fuentes.

### 5.4 Los Siete Módulos Funcionales

Sobre estos tres pilares se construyen los siete módulos
funcionales de la plataforma que el usuario gestiona desde
el dashboard:

El primer módulo es el Agente de Voz Configurable, que
incluye la configuración del nombre, género, nivel de
amabilidad y casos de uso del agente, así como el historial
de llamadas y el acceso a resúmenes y transcripciones según
el rol del usuario.

El segundo módulo es el CRM de Leads, que incluye el pipeline
comercial visual tipo Kanban, la ficha completa de cada lead,
el sistema de asignación de vendedores, el Radar de Intención
y las tareas de seguimiento.

El tercer módulo es el Catálogo de Vehículos, denominado Mis
Vehículos en el dashboard, que incluye la ficha completa de
cada vehículo, la gestión de fotos, el control de estados de
disponibilidad, el campo de anotación enriquecible con IA y
el endpoint API público para alimentar la web del cliente.

El cuarto módulo es la Base de Conocimientos, que incluye la
gestión de documentos técnicos y comerciales, su vinculación a vehículos
concretos del catálogo, el procesamiento automático de
embeddings y los límites de almacenamiento por plan.

El quinto módulo es el BI Conversacional, que permite al
gestor del concesionario interrogar su negocio en lenguaje
natural, obtener análisis de stock, de leads, de rendimiento
comercial y de inteligencia de mercado en tiempo real, sin
necesidad de conocimientos técnicos ni de informes
predefinidos.

El sexto módulo es la Agenda y el Calendario Laboral, que
incluye la configuración de los tres niveles de calendario
jerárquico (organización, departamento y vendedor), la
gestión de excepciones puntuales, el motor de agendamiento
automático de citas y la agenda individual de cada vendedor.

El séptimo módulo es el Portal Web, un addon de pago que
proporciona al concesionario una web pública profesional
alimentada automáticamente por su catálogo de vehículos,
con subdominio propio o dominio personalizado, template de
diseño profesional optimizado para el sector y formulario
de contacto integrado con el CRM.

---

## 6. EL AGENTE DE VOZ CONFIGURABLE

El agente de voz es el componente más visible de Onucall
para el cliente final del concesionario, pero desde el punto
de vista del concesionario como usuario del SaaS, es también
el componente más configurable y personalizable de la
plataforma. El nombre Elena no es un nombre fijo del
producto. Es el nombre que el equipo fundador de Onucall
ha utilizado durante el proceso de diseño y documentación
como referencia interna. En la plataforma real, el
concesionario elige el nombre, el género y las
características de comportamiento de su agente de voz.

### 6.1 Configuración del Nombre y el Género

El administrador del concesionario puede elegir libremente
el nombre de su agente de voz desde el panel de
configuración del dashboard. Un concesionario de vehículos
de lujo en Marbella puede llamar a su agente Sofía y
configurarla con voz femenina y tono sofisticado. Un
concesionario de vehículos industriales en Zaragoza puede
llamar a su agente Carlos y configurarlo con voz masculina
y tono directo y profesional. Un distribuidor de motos en
Valencia puede llamar a su agente Marta y configurarla con
un registro más cercano y desenfadado. La identidad del
agente es completamente propiedad del concesionario.

### 6.2 El Nivel de Amabilidad y Acercamiento

El sistema de configuración del comportamiento conversacional
del agente se articula mediante una escala del 1 al 5 que
el administrador ajusta desde el dashboard sin necesidad de
conocimientos técnicos de prompt engineering. Esta escala
abstrae la complejidad técnica de la configuración del
modelo de lenguaje en un parámetro intuitivo y comprensible
para cualquier usuario.

El nivel 1 corresponde a un estilo de comunicación formal,
directo y estrictamente profesional. El agente va al grano,
no usa expresiones coloquiales, mantiene una distancia
cortés con el interlocutor y prioriza la eficiencia de la
conversación sobre cualquier otro aspecto. Este nivel es
adecuado para concesionarios de vehículos de alta gama,
vehículos industriales o cualquier contexto donde el cliente
espera un trato formal y preciso.

El nivel 3 corresponde a un equilibrio entre la
profesionalidad y la cercanía. El agente es amable sin ser
excesivamente informal, usa el nombre del cliente cuando
lo conoce, introduce pequeñas expresiones de empatía cuando
son apropiadas y mantiene un tono cálido sin perder la
orientación comercial. Este nivel es el más versátil y el
más adecuado para la mayoría de los concesionarios medianos.

El nivel 5 corresponde al máximo de cercanía y calidez
en la comunicación. El agente usa un lenguaje coloquial
pero siempre respetuoso, trata al cliente con la misma
familiaridad que tendría un vendedor que lleva años en
el concesionario, introduce humor suave cuando el contexto
lo permite y hace que la conversación se sienta como una
charla con una persona cercana y de confianza. Este nivel
es adecuado para concesionarios de segunda mano con un
perfil de cliente joven y habituado a la informalidad, o
para distribuidores de motos y vehículos de ocio donde la
comunidad y la cercanía son valores importantes.

Los niveles 2 y 4 son puntos intermedios entre los
extremos descritos, que permiten al administrador calibrar
el comportamiento del agente con mayor precisión según
las características específicas de su negocio y de su
clientela habitual.

### 6.3 Las Instrucciones Específicas del Agente

Además de los parámetros básicos de nombre, género y nivel
de amabilidad, el administrador puede proporcionar al agente
instrucciones específicas en lenguaje natural sobre aspectos
concretos del comportamiento que desea. Puede indicar al
agente que siempre mencione la garantía de dos años que
ofrece el concesionario cuando un cliente pregunta por un
vehículo de ocasión. Puede indicarle que nunca discuta
precios por teléfono y que siempre invite al cliente a
visitar el concesionario para negociar en persona. Puede
indicarle que cuando detecte que el cliente habla en inglés
o en otro idioma cambie automáticamente al idioma del
cliente si tiene capacidad para ello. Puede indicarle que
en el caso de que un cliente mencione a un competidor
concreto responda siempre destacando tres ventajas del
concesionario frente a ese competidor. Estas instrucciones
forman parte del sistema de casos de uso que se detalla
en profundidad en la sección 23 de este documento.

### 6.4 La Identificación del Cliente al Inicio de la Llamada

Uno de los elementos más diferenciadores del agente de voz
de Onucall respecto a cualquier otra solución de atención
telefónica automatizada es la capacidad de identificar al
cliente antes de que la conversación comience. Esta
funcionalidad se implementa mediante una integración con
n8n que actúa en los primeros milisegundos de cada llamada,
antes de que el agente pronuncie su primer saludo.

Cuando una llamada entra al sistema, n8n recibe el número
de teléfono del llamante y lanza inmediatamente una consulta
al CRM de Onucall buscando si ese número está registrado
como lead o como cliente en la base de datos de esa
organización. El resultado de esa consulta determina dos
flujos de conversación completamente distintos.

Si el número no está en el CRM, el agente inicia la
conversación como si el cliente fuera nuevo, sin hacer
suposiciones sobre su identidad ni su historial, y procede
a recoger sus datos durante la conversación de forma natural.

Si el número está en el CRM, el agente recibe antes de
pronunciar su primer saludo un contexto completo sobre ese
cliente: su nombre, los vehículos por los que ha preguntado
anteriormente, el estado de su proceso comercial en el
pipeline, si tiene alguna cita programada y cualquier nota
relevante que el vendedor haya registrado en su ficha. Con
este contexto, el agente puede personalizar la conversación
desde el primer segundo. En lugar de empezar con un genérico
"Buenos días, en qué puedo ayudarle", el agente puede decir
"Buenos días Sr. Martínez, ¿llama por el Golf GTI que estuvo
viendo la semana pasada o hay algo más en lo que pueda
ayudarle?". Esta experiencia no tiene precedente en la
atención telefónica de los concesionarios medianos en España
y genera un impacto inmediato en la percepción de calidad
del servicio por parte del cliente.

---

## 7. CÓMO FUNCIONA UNA LLAMADA REAL

Esta sección detalla los flujos de conversación más
representativos que el agente de voz gestiona en el contexto
de un concesionario de vehículos, desde el inicio de la
llamada hasta el registro del resultado en el sistema.

### 7.1 Flujo 1: Cliente Nuevo Interesado en un Vehículo de Ocasión Concreto

Este es el flujo más frecuente y el de mayor impacto en
los resultados comerciales del concesionario. El cliente
ha visto un vehículo concreto en un portal de anuncios y
llama para obtener información y posiblemente acordar una
visita.

El Sr. Martínez llama un domingo por la tarde porque ha
visto en AutoScout24 un Volkswagen Golf GTI del año 2022
con 45.000 kilómetros publicado por el concesionario. El
concesionario está cerrado y el teléfono hubiera quedado
sin respuesta sin Onucall.

En los primeros milisegundos de la llamada, n8n busca el
número del Sr. Martínez en el CRM. No lo encuentra. El
agente inicia la conversación presentándose con el nombre
configurado por el concesionario y preguntando en qué puede
ayudar al cliente.

El Sr. Martínez dice que llama por el Golf GTI del anuncio.
El agente consulta en tiempo real el catálogo de vehículos
del concesionario, localiza el Golf GTI del año 2022 con
45.000 kilómetros, confirma que su estado es Disponible y
facilita al cliente los datos exactos del vehículo: precio
de venta, kilómetros exactos, año de matriculación, color,
tipo de combustible, transmisión, equipamiento destacado,
estado de la ITV y si dispone de garantía incluida.

El Sr. Martínez pregunta si el vehículo tiene el control
de crucero adaptativo. El agente consulta la Base de
Conocimientos del concesionario. Si el concesionario ha
subido la ficha técnica o el catálogo de equipamiento del
Golf GTI 2022, el agente encuentra la respuesta en los
documentos vectorizados y la confirma con precisión. Si
no hay documentación disponible sobre ese punto concreto,
el agente informa al cliente de que verificará ese detalle
y se lo confirmará, registrando la pregunta como una tarea
pendiente en el CRM.

El Sr. Martínez pregunta si el concesionario acepta su
Seat León como parte del pago. El agente confirma que el
concesionario trabaja con vehículos de entrada y le informa
de que el equipo de tasación se pondrá en contacto con él
para valorar su vehículo.

El agente pregunta si el Sr. Martínez desea concertar una
visita para ver el Golf GTI en persona. El cliente dice
que sí, que el lunes o el martes por la mañana le viene
bien. El agente consulta en tiempo real el calendario del
departamento correspondiente del concesionario, cruzando
los tres niveles de jerarquía de calendarios, y ofrece
los huecos disponibles: lunes a las 10:00 o a las 11:30,
martes a las 9:00 o a las 10:30.

El Sr. Martínez elige el lunes a las 10:00. El agente
confirma la cita, solicita el nombre completo y el número
de teléfono de contacto del cliente, le informa de que
recibirá un WhatsApp de confirmación con todos los detalles
de la cita y se despide de forma cordial.

La llamada dura tres minutos y cuarenta segundos. En ese
tiempo, sin intervención humana alguna y en domingo por
la tarde, Onucall ha atendido a un cliente interesado,
le ha proporcionado información precisa sobre el vehículo,
ha resuelto sus dudas, ha gestionado su solicitud sobre
el vehículo de entrada, ha agendado una visita presencial
para el lunes y ha registrado todo el proceso en el CRM.

El lunes por la mañana, cuando el vendedor asignado llega
al concesionario, encuentra en su agenda de Onucall la
cita del Sr. Martínez a las 10:00, con su nombre, su
teléfono, el resumen de la conversación generado por la
IA (vehículo de interés, preguntas realizadas, solicitud
de tasación de su Seat León, nivel de interés detectado:
alto), y el tiempo que lleva el vehículo en el sistema.
Llega a la cita preparado.

### 7.2 Flujo 2: Cliente con Búsqueda Abierta por Rango de Precio

Este flujo corresponde al cliente que no tiene un vehículo
concreto en mente sino unos criterios de búsqueda
(presupuesto, tipo de vehículo, antigüedad máxima) y quiere
explorar las opciones disponibles en el stock del
concesionario.

La Sra. López llama porque quiere comprar un coche pero
no sabe exactamente cuál. Le dice al agente que busca
un coche de unos tres años de antigüedad, que no valga
más de treinta mil euros y que sea un SUV. El agente
consulta el catálogo del concesionario con esos filtros
y le presenta las opciones disponibles que encajan con
sus criterios: un Seat Ateca del año 2022 a 24.900 euros,
un Volkswagen T-Roc del año 2023 a 28.500 euros y un
Hyundai Tucson del año 2022 a 27.800 euros.

El agente describe brevemente cada opción destacando los
puntos más relevantes de cada vehículo (kilómetros,
equipamiento principal, garantía) y pregunta a la Sra.
López si alguno de estos vehículos le genera más interés
que los demás. La Sra. López dice que el Tucson le llama
la atención. El agente profundiza en ese vehículo,
responde las preguntas adicionales que la clienta hace,
y le propone concertar una visita para verlo en persona.
La Sra. López acepta y el agente gestiona el agendamiento
siguiendo el mismo flujo descrito en el caso anterior.

### 7.3 Flujo 3: Cliente Conocido del CRM

Este flujo ilustra la capacidad de personalización que
proporciona la identificación del cliente al inicio de
la llamada mediante la integración con n8n.

El Sr. García llamó hace cinco días preguntando por un
BMW Serie 3. El vendedor asignado habló con él, le envió
información adicional, pero el Sr. García dijo que
necesitaba pensarlo. Hoy el Sr. García vuelve a llamar.

En los primeros milisegundos de la llamada, n8n detecta
el número del Sr. García en el CRM. Recupera su ficha:
nombre, historial de interacciones, vehículo de interés
(BMW Serie 3 azul, matrícula identificada, precio 32.500
euros), estado en el pipeline (Contactado, pendiente de
decisión), nota del vendedor (cliente interesado pero
indeciso por el precio, está comparando con otro concesionario), nivel de
interés detectado en la llamada anterior (alto).

El agente recibe todo ese contexto antes de pronunciar
su primer saludo y personaliza la conversación desde el
primer segundo: "Buenos días Sr. García, me alegra que
vuelva a llamarnos. ¿Ha podido decidirse sobre el BMW
Serie 3 que estuvo viendo la semana pasada?".

El Sr. García confirma que sigue interesado pero que ha
encontrado uno similar en otro concesionario a 31.000
euros. El agente, siguiendo las instrucciones configuradas
por el administrador en los casos de uso, destaca los
elementos diferenciadores del vehículo del concesionario
(garantía adicional de doce meses, revisión reciente
realizada, historial de mantenimiento completo disponible)
y le ofrece la posibilidad de que el responsable comercial
le llame para hablar de las condiciones. El Sr. García
acepta. El agente registra la solicitud de callback en
el CRM con máxima prioridad, genera una notificación
urgente para el vendedor asignado y se despide informando
al Sr. García de que le llamarán en las próximas horas.

7.4 Flujo 4: Llamada sin Recorrido Comercial
No todas las llamadas que recibe un concesionario tienen
valor comercial. Algunas son llamadas equivocadas, spam
automatizado, proveedores que buscan al responsable de
compras, o clientes que llaman para preguntar algo que
no tiene relación con la compra de un vehículo. El agente
gestiona también estos casos de forma eficiente.

Cuando el agente detecta en los primeros intercambios de
la conversación que la llamada no tiene recorrido
comercial, la gestiona de la forma más breve y cortés
posible, proporciona la información o la redirección que
corresponda si es factible, y registra la llamada en el
sistema como sin recorrido comercial con una nota
descriptiva del motivo. Este registro es importante para
el análisis posterior de la calidad de los leads entrantes
y para identificar patrones de llamadas no deseadas que
puedan filtrarse en el futuro.

7.5 Lo que el Agente Nunca Hace
Es tan importante definir el comportamiento del agente
como delimitar lo que el agente nunca hará bajo ninguna
circunstancia, independientemente de cómo esté configurado
o de lo que el cliente le pida durante la llamada.

El agente nunca realiza llamadas salientes por iniciativa
propia. Su función es exclusivamente inbound: recibir y
gestionar las llamadas que entran.

El agente nunca envía emails, SMS ni mensajes de WhatsApp
por su propia decisión. Cualquier comunicación de ese tipo
que se produzca como consecuencia de una llamada (la
confirmación de cita por WhatsApp que mencionamos en el
flujo anterior) es ejecutada por n8n como proceso
automatizado en segundo plano, no por el agente
directamente.

El agente nunca toma decisiones que impliquen compromisos
económicos en nombre del concesionario. No confirma precios
de tasación, no acepta ofertas de compra, no aplica
descuentos y no hace promesas sobre condiciones de
financiación específicas sin que esas instrucciones hayan
sido explícitamente configuradas por el administrador.

El agente nunca proporciona información que no esté
disponible en el sistema. Si un cliente pregunta algo
sobre lo que no hay datos en el catálogo, la Base de
Conocimientos ni los casos de uso configurados, el agente
informa honestamente de que esa información no está
disponible en ese momento y ofrece que un especialista
del equipo contacte con el cliente para resolverlo.

PARTE III: LA ARQUITECTURA DEL SISTEMA
8. LA JERARQUÍA DEL SISTEMA
Onucall está construido sobre una arquitectura jerárquica
de tres niveles que refleja la estructura organizativa
real de cualquier negocio de venta de vehículos, desde
una pequeña empresa con un único punto de venta hasta
un grupo empresarial con múltiples concesionarios
distribuidos geográficamente.

8.1 Nivel 1: La Organización
La organización es el nivel más alto de la jerarquía y
representa al concesionario como entidad empresarial. En
términos técnicos, la organización es el tenant dentro
de la arquitectura multi-tenant de Onucall. Cada
organización tiene su propia base de datos de vehículos,
su propio CRM de leads, su propia configuración del agente
de voz, sus propios departamentos, sus propios vendedores
y su propio calendario laboral de apertura y cierre.

Los datos de una organización son completamente opacos
para cualquier otra organización. Un concesionario de
Huelva nunca puede ver los datos de un concesionario de
Sevilla, aunque ambos usen Onucall. Esta separación se
garantiza técnicamente mediante Row Level Security en
Supabase, que actúa como una barrera de acceso a nivel
de base de datos.

Una organización puede corresponder a un único
concesionario con un solo punto de venta, o puede
corresponder a un grupo empresarial que opera varios
concesionarios bajo distintas razones sociales pero que
desea gestionarlos todos desde un único panel de control.
En el segundo caso, cada concesionario del grupo se
configura como una organización separada dentro del plan
Business, y el administrador del grupo puede navegar entre
organizaciones desde el dashboard con un simple cambio
de contexto.

8.2 Nivel 2: El Departamento
El departamento es el nivel intermedio de la jerarquía
y representa un área funcional específica del
concesionario dedicada a un tipo concreto de servicio
de venta. Un concesionario puede tener tantos
departamentos como áreas de negocio quiera gestionar
de forma diferenciada.

Los ejemplos más comunes de departamentos en un
concesionario de vehículos son el departamento de ventas
de vehículos de ocasión, el departamento de ventas de
vehículos nuevos, el departamento de pruebas de
conducción, el departamento de financiación y seguros,
el departamento de ventas de vehículos industriales y
comerciales, el departamento de tasaciones y compra de
vehículos a particulares, y el departamento de grandes
cuentas o renting empresarial.

Cada departamento tiene su propia configuración
independiente que define las reglas matemáticas y
operativas de cómo se gestionan las citas en ese servicio
específico. Esta configuración incluye la duración estándar
de cada cita en minutos, el tiempo de margen entre citas
consecutivas (denominado buffer) necesario para que el
vendedor pueda prepararse para el siguiente cliente o
para que el vehículo de demostración vuelva y esté
disponible, el número máximo de citas simultáneas que
puede gestionar el departamento en el mismo horario
(relevante cuando hay varios vendedores disponibles al
mismo tiempo), la antelación mínima con la que el agente
puede ofrecer una cita (para evitar que se agende una
visita para dentro de diez minutos cuando el vendedor
no está preparado), y el número máximo de días hacia el
futuro en que el agente puede ofrecer disponibilidad.

Cada departamento tiene también asignados uno o varios
vendedores que lo componen, un administrador responsable
de la gestión de las asignaciones de leads y citas, y
su propio calendario laboral con horarios específicos
que pueden diferir del horario general del concesionario.

8.3 Nivel 3: El Vendedor
El vendedor, denominado en la terminología interna de
Onucall como member, es el nivel más granular de la
jerarquía y representa a la persona física del equipo
comercial del concesionario. Cada vendedor tiene su perfil
individual en el sistema con su nombre, su información
de contacto, su rol, los departamentos a los que pertenece
y su propio calendario laboral personal.

Un vendedor puede pertenecer a uno o varios departamentos.
Un especialista en vehículos de alta gama puede pertenecer
únicamente al departamento de vehículos nuevos. Un
comercial polivalente puede pertenecer simultáneamente
al departamento de vehículos nuevos y al de vehículos
de ocasión. Un director comercial puede pertenecer a
todos los departamentos como responsable de supervisión.

El calendario individual del vendedor refleja su
disponibilidad real: sus turnos habituales, sus días
de descanso, sus períodos de vacaciones y cualquier
excepción puntual como una baja médica o un día de
formación. Este calendario es el nivel más granular del
sistema de disponibilidad y es el que determina en última
instancia si un vendedor concreto puede recibir una cita
en un momento dado.

8.4 La Jerarquía Excluyente
La característica más importante de esta arquitectura
jerárquica es que los tres niveles son excluyentes de
mayor a menor. Esto significa que ningún nivel inferior
puede superar los límites establecidos por un nivel
superior.

El calendario de la organización es el techo absoluto
del sistema. Si el concesionario está marcado como cerrado
el 6 de enero por ser festivo nacional, ningún departamento
ni ningún vendedor puede tener citas ese día,
independientemente de lo que digan sus calendarios
individuales. Es la ley máxima del sistema.

El calendario del departamento opera dentro de los límites
que permite el calendario de la organización. Si el
departamento de pruebas de conducción está configurado
para operar únicamente de lunes a viernes de 9:00 a 14:00,
ningún vendedor de ese departamento puede recibir una
cita de prueba de conducción fuera de esa franja, aunque
su calendario personal indique que está disponible los
sábados.

El calendario del vendedor opera dentro de los límites
que permite el calendario de su departamento. Si un
vendedor trabaja habitualmente también los sábados por
la mañana pero su departamento no opera los sábados, sus
citas de ese departamento no pueden agendarse en sábado.
Si ese mismo vendedor pertenece a otro departamento que
sí opera los sábados, puede recibir citas de ese segundo
departamento en sábado.

Esta jerarquía excluyente garantiza que el sistema nunca
genera una cita en un momento en que alguno de los
recursos necesarios no está disponible, eliminando los
conflictos de agenda, los malentendidos con los clientes
y los fallos de planificación que son frecuentes en los
sistemas de agendamiento manual.

8.5 El Fallback Jerárquico: Ninguna Llamada se Pierde
La jerarquía no solo define quién puede atender una cita
sino también qué ocurre cuando la persona idealmente
responsable de gestionar una interacción no está disponible.
Onucall implementa un sistema de fallback jerárquico que
garantiza que ninguna llamada queda sin atender y ningún
lead queda sin registrar.

Cuando un cliente llama y el agente de voz gestiona la
conversación y detecta la intención de agendar una cita
o de ser contactado por un vendedor, el sistema determina
la disponibilidad en tiempo real. Si hay vendedores
disponibles en el departamento correspondiente, el sistema
agenda la cita o asigna el lead directamente. Si no hay
ningún vendedor disponible en ese momento, la cita se
vincula al departamento como entidad, no a un vendedor
específico, y el administrador del departamento recibe
una notificación para realizar la asignación manualmente
cuando sea posible.

Si el administrador del departamento ha activado el modo
de asignación autónoma, que se describe en detalle en la
sección del motor de agendamiento, el sistema asigna
directamente el lead o la cita al vendedor más adecuado
según el algoritmo configurado, sin esperar la
intervención del administrador.

En ningún escenario posible una llamada queda sin registrar,
un lead queda sin crear en el CRM ni una cita queda sin
confirmar al cliente. La operación comercial del
concesionario funciona siempre, independientemente de
quién esté o no esté disponible en cada momento.

9. EL SISTEMA DE CALENDARIOS LABORALES
El sistema de calendarios laborales de Onucall es el
componente técnico más sofisticado de la plataforma desde
el punto de vista de la ingeniería de datos. Está diseñado
con un objetivo principal: garantizar que el número de
peticiones a la base de datos necesarias para calcular la
disponibilidad real de cualquier recurso en cualquier
período de tiempo sea absolutamente mínimo, manteniendo
al mismo tiempo la máxima precisión y flexibilidad en la
gestión de los horarios.

9.1 El Patrón de Diseño: Horario Base Semanal más Excepciones
El sistema se basa en un patrón de diseño que evita el
error más común en los sistemas de calendario de SaaS:
almacenar físicamente en la base de datos cada uno de
los 365 días del año para cada entidad del sistema.
Ese enfoque genera tablas enormes, consultas lentas y
un coste de almacenamiento creciente que no escala bien.

Onucall utiliza en su lugar el patrón denominado Horario
Base Semanal más Excepciones. La idea es elegante en su
simplicidad: en lugar de describir qué ocurre cada día
del año, el sistema describe el comportamiento repetitivo
semanal (que cubre el 95% de los casos) y registra
únicamente los días que se desvían de ese comportamiento
habitual.

La tabla de horarios base almacena para cada entidad
(organización, departamento o vendedor) un único registro
que contiene en formato JSON los horarios correspondientes
a cada día de la semana, usando los números del uno al
siete para representar de lunes a domingo según el
estándar ISODOW de PostgreSQL. Un lunes activo con horario
partido se representa como un objeto con inicio a las
nueve y fin a las catorce y otro objeto con inicio a las
diecisiete y fin a las veinte. Un sábado cerrado se
representa como un array vacío.

La tabla de excepciones almacena únicamente los días que
se desvían del comportamiento base: festivos locales,
cierres por inventario, apertura especial en horario
reducido por navidad, o cualquier modificación puntual
que el administrador registre desde el panel del
calendario visual. Cada excepción almacena la fecha
exacta, si ese día está completamente cerrado o si tiene
un horario especial, y si tiene horario especial cuáles
son las franjas horarias activas de ese día concreto.
Incluye también un campo de descripción donde el
administrador indica el motivo de la excepción, que
sirve para el registro interno y la auditoría de cambios.

9.2 El Motor de Cálculo de Disponibilidad
Cuando el agente de voz necesita conocer la disponibilidad
real de un departamento para los próximos días, o cuando
el dashboard muestra la agenda de un vendedor para la
semana siguiente, el sistema ejecuta una función almacenada
en PostgreSQL que realiza todo el cálculo internamente
en una única transacción.

Esta función recibe como parámetos el tipo de entidad a consultar (organización,
departamento o vendedor), el identificador único de esa
entidad, la fecha de inicio y la fecha de fin del período
que se quiere consultar, y la duración en minutos de la
cita que se quiere agendar.

Internamente, la función genera en memoria una lista de
todos los días del período solicitado utilizando la función
nativa generate_series de PostgreSQL, que crea esa
secuencia de fechas directamente en la RAM del servidor
sin necesidad de tener una tabla física con los días del
año almacenados. Para cada día generado, extrae el número
de día de la semana correspondiente mediante la función
EXTRACT con el parámetro ISODOW, y busca en la tabla de
horarios base el horario habitual para ese número de día.
Simultáneamente, para cada fecha generada, comprueba si
existe algún registro en la tabla de excepciones que
coincida con esa fecha exacta y con el identificador de
la entidad consultada.

La regla de resolución que aplica la función sigue una
prioridad clara. Si existe una excepción para esa fecha
y esa excepción indica que el día está completamente
cerrado, el resultado para ese día es un array vacío
independientemente de lo que diga el horario base. Si
existe una excepción con horario especial, ese horario
especial sustituye completamente al horario base para
ese día. Si no existe ninguna excepción, se aplica el
horario base correspondiente al día de la semana.

Una vez que tiene el horario efectivo para cada día del
período, la función aplica las reglas matemáticas del
departamento (duración de la cita y buffer entre citas)
para calcular los slots de tiempo disponibles y los divide
en los bloques horarios que el agente puede ofrecer al
cliente. Finalmente, cruza esos slots con las citas ya
confirmadas en la tabla de appointments, eliminando los
bloques que ya están ocupados o que se solapan con citas
existentes.

El resultado es un único objeto JSON que contiene para
cada día del período consultado la lista de horas
disponibles para agendar una cita. Este JSON se entrega
al agente de voz o al dashboard en una única petición
a la base de datos, con una latencia en producción de
entre cinco y quince milisegundos para períodos de hasta
treinta días.

La eficiencia de este diseño es la que permite que el
agente de voz pueda ofrecer disponibilidad al cliente
en tiempo real durante una conversación telefónica sin
ningún silencio perceptible ni latencia que interrumpa
el flujo natural de la conversación.

9.3 Los Índices de Rendimiento
Para garantizar que las consultas al sistema de calendarios
sean siempre instantáneas independientemente del número
de organizaciones, departamentos y vendedores que haya
en la plataforma, el sistema mantiene índices específicos
sobre las tablas de calendarios.

La tabla de horarios base tiene un índice compuesto sobre
el tipo de entidad y el identificador de la entidad, que
permite localizar el horario base de cualquier recurso
en tiempo constante independientemente del tamaño total
de la tabla.

La tabla de excepciones tiene un índice compuesto sobre
el identificador de la entidad y la fecha de la excepción,
que permite localizar instantáneamente si existe alguna
excepción para una entidad específica en una fecha
específica sin escanear toda la tabla.

La tabla de citas confirmadas tiene un índice sobre el
identificador del departamento y el rango de tiempo de
la cita, que permite calcular los solapamientos de forma
eficiente cuando la función de disponibilidad necesita
eliminar los slots ya ocupados.

10. EL MOTOR DE AGENDAMIENTO DE CITAS
El motor de agendamiento es la capa operativa que se
construye sobre el sistema de calendarios y que gestiona
todo el ciclo de vida de una cita, desde que el agente
de voz detecta la intención del cliente hasta que la cita
queda confirmada, asignada a un vendedor y comunicada
a todas las partes implicadas.

10.1 La Duración de la Cita y el Buffer
La duración estándar de cada tipo de cita y el tiempo de
buffer asociado se configuran a nivel de departamento,
no a nivel de vendedor ni de organización. Esta decisión
de diseño refleja la realidad operativa del sector: es el
tipo de servicio que presta el departamento (y no el
vendedor individual ni el concesionario en general) el
que determina cuánto tiempo requiere cada interacción
con un cliente.

Una visita para ver un vehículo de ocasión en el patio
puede configurarse con una duración de treinta minutos
y un buffer de diez minutos, lo que significa que el
sistema reserva cuarenta minutos en total por cada cita
de ese tipo. Una prueba de conducción puede configurarse
con cuarenta y cinco minutos de duración y treinta
minutos de buffer para que el vehículo de demostración
vuelva, se revise y esté preparado para el siguiente
cliente. Una reunión de financiación puede configurarse
con sesenta minutos de duración y sin buffer porque el
comercial de financiación puede atender al siguiente
cliente inmediatamente al terminar.

El motor de agendamiento usa la suma de la duración y
el buffer como el bloque de tiempo mínimo que debe estar
libre en el calendario para que un slot sea considerado
disponible y pueda ser ofrecido al cliente. Si un bloque
de cuarenta minutos (treinta de visita más diez de buffer)
no cabe completo dentro de la franja horaria disponible
antes del cierre, ese slot no se genera y no se ofrece.

10.2 La Protección contra el Doble Agendamiento
En un concesionario activo con varios vehículos de alto
interés publicados en múltiples portales, es frecuente
que dos clientes distintos intenten reservar el mismo
slot de tiempo para el mismo vehículo o con el mismo
vendedor de forma simultánea. Esta situación, conocida
como doble agendamiento o double booking, genera
conflictos operativos y experiencias negativas para los
clientes afectados.

Onucall implementa una protección nativa contra el doble
agendamiento mediante un mecanismo de bloqueo
transaccional en PostgreSQL. En el momento exacto en que
el agente de voz va a confirmar una cita, la función de
registro de la cita comprueba atómicamente si el slot
seleccionado sigue disponible y lo bloquea para cualquier
otra escritura simultánea durante el tiempo que dura la
transacción. Si el slot sigue libre, la cita se confirma
y el slot queda marcado como ocupado de forma inmediata.
Si el slot ya fue ocupado por otra transacción simultánea
en el instante anterior, la función devuelve un error
estructurado que el agente de voz procesa
automáticamente, se disculpa brevemente con el cliente
y le ofrece el siguiente slot disponible sin interrumpir
el flujo natural de la conversación.

10.3 La Asignación de la Cita al Vendedor
Cuando el agente de voz confirma una cita con un cliente,
esa cita se vincula inicialmente al departamento, no a
un vendedor específico. Esta separación entre el
agendamiento y la asignación es una decisión de diseño
deliberada que refleja la realidad operativa de muchos
concesionarios donde el agente de voz no debe (ni puede)
tomar decisiones sobre qué vendedor específico atiende
a qué cliente.

La asignación de la cita a un vendedor concreto es una
responsabilidad del administrador del departamento, que
recibe una notificación en el dashboard indicando que
hay una nueva cita pendiente de asignación. El
administrador revisa la información del lead, evalúa
la disponibilidad y las características de cada vendedor
de su equipo, y asigna la cita al más adecuado. Esta
asignación genera automáticamente una notificación para
el vendedor seleccionado, que ve la cita aparecer en su
agenda con todos los detalles del cliente y la conversación.

10.4 El Modo de Asignación Autónoma
El modo de asignación autónoma es una funcionalidad
específicamente diseñada para garantizar la continuidad
operativa del concesionario cuando el administrador del
departamento no está disponible para realizar las
asignaciones manualmente.

El administrador del departamento puede activar este modo
desde su perfil en el dashboard mediante un checkbox
claramente visible. Cuando el modo está activado, el
sistema no espera la intervención del administrador para
asignar las nuevas citas y leads a un vendedor. En su
lugar, el propio motor de Onucall realiza la asignación
automáticamente según el algoritmo configurado para ese
departamento.

El algoritmo de asignación por defecto es el Round Robin,
que distribuye las nuevas citas y leads de forma equitativa
y rotativa entre todos los vendedores activos del
departamento, garantizando que la carga de trabajo se
reparte de forma justa y que ningún vendedor recibe una
concentración desproporcionada de nuevos contactos.

El administrador puede también configurar el algoritmo
de asignación por disponibilidad inmediata, que asigna
la cita al vendedor que tiene el mayor número de huecos
libres en su agenda en las próximas horas, priorizando
así la rapidez de atención sobre la equidad en la
distribución. Este algoritmo es especialmente útil en
períodos de alta demanda donde la velocidad de respuesta
al cliente es el factor más crítico.

En el futuro, está previsto implementar un algoritmo de
asignación por rendimiento histórico que analice el ratio
de conversión de cada vendedor en los últimos treinta días
y asigne los nuevos leads preferentemente a los vendedores
con mayor tasa de cierre, optimizando los resultados
comerciales del departamento en lugar de simplemente
distribuir la carga de trabajo.

El modo de asignación autónoma puede desactivarse en
cualquier momento desde el dashboard, volviendo
inmediatamente al modo de asignación manual. El
administrador puede activar y desactivar este modo tantas
veces como sea necesario, sin necesidad de contactar con
soporte ni de realizar ninguna reconfiguración adicional
del sistema.

PARTE IV: LEADS, CITAS Y GESTIÓN COMERCIAL
11. QUÉ ES UNA CITA EN ONUCALL
En el contexto de Onucall, el concepto de cita tiene un
significado más amplio que en la definición convencional
de una entrada en un calendario con fecha y hora. Una
cita en Onucall es cualquier compromiso de interacción
futura que el agente de voz establece con un cliente
durante una llamada, independientemente de si esa
interacción implica presencia física, contacto telefónico
o envío de información.

Esta definición ampliada es necesaria porque la realidad
de las conversaciones que el agente gestiona con los
clientes de un concesionario no siempre termina con el
cliente fijando una visita presencial. En muchos casos
el resultado de la llamada es que el cliente quiere que
le llamen, o que le envíen información, o que le avisen
cuando llegue un vehículo con características específicas.
Todas estas situaciones generan un compromiso de acción
que debe ser gestionado y seguido con la misma
rigurosidad que una visita presencial.

11.1 Tipos de Cita
La Cita Presencial es la forma más tradicional de
cita en el sector de la venta de vehículos. El cliente
viene al concesionario en un día y hora acordados para
ver un vehículo, realizar una prueba de conducción, hablar
de financiación o cerrar la operación. Este tipo de cita
bloquea tiempo en el calendario del vendedor asignado y,
si el departamento así lo requiere, en los recursos físicos
asociados como el vehículo de demostración o la sala de
reuniones de financiación.

La Cita Telefónica o Callback es el compromiso de
que un vendedor del concesionario llamará al cliente en
una franja horaria acordada. Este tipo de cita es frecuente
cuando el cliente no puede o no quiere desplazarse al
concesionario en ese momento, pero quiere continuar la
conversación con un especialista humano para tratar
aspectos que van más allá de lo que el agente de voz
puede gestionar, como la negociación de precio, las
condiciones específicas de financiación o los detalles
de una tasación. La cita telefónica bloquea tiempo en el
calendario del vendedor pero no requiere recursos físicos
adicionales.

La Cita de Información Digital es el compromiso de
enviar al cliente información específica por email, SMS
o WhatsApp. Este tipo de cita no bloquea tiempo en el
calendario de forma estricta en el sentido convencional,
pero genera una tarea con fecha y hora límite de ejecución
asignada al vendedor responsable. El cliente ha pedido
algo concreto (las fotos adicionales del vehículo, la
ficha técnica completa, el contrato de garantía, el
informe de historial del vehículo) y ese envío debe
producirse en el plazo acordado.

12. LOS TIPOS DE LEAD
Un lead en Onucall es cualquier persona que ha tenido
algún tipo de contacto telefónico con el concesionario
a través del agente de voz, independientemente del
resultado de esa interacción y del nivel de interés
que haya manifestado. La clasificación de los leads por
tipo y por temperatura comercial es fundamental para
que el equipo de ventas pueda priorizar su gestión y
dedicar el tiempo y la energía correctos a cada
oportunidad según su potencial real.

12.1 Clasificación por Temperatura Comercial
Lead Frío es aquel cuya llamada no tiene recorrido
comercial actual. Incluye las llamadas equivocadas, el
spam telefónico, los proveedores que llaman buscando
al responsable de compras, y los clientes que están en
una fase tan inicial de exploración que no tienen ningún
horizonte temporal ni ningún criterio de compra definido.
El lead frío se registra en el sistema para mantener el
historial completo de interacciones, pero no genera
tareas de seguimiento activo inmediato.

Lead Tibio es aquel que tiene intención de compra
identificable pero con uno o varios frenos que impiden
avanzar en el proceso comercial en el corto plazo. Los
frenos más comunes son de naturaleza económica (el cliente
no dispone aún del importe necesario o está esperando
la resolución de una financiación externa), de naturaleza
informacional (el cliente no tiene claro exactamente qué
tipo de vehículo necesita o quiere comparar más opciones
antes de decidirse), o de naturaleza temporal (el cliente
necesita un vehículo pero no de forma inmediata, puede
ser dentro de uno o dos meses). El lead tibio tiene valor
comercial real y debe mantenerse activo en el sistema con
seguimientos periódicos porque el freno puede resolverse
y el lead puede calentarse en cualquier momento.

Lead Caliente es aquel que sabe lo que quiere, tiene
capacidad real para comprarlo y solo necesita dar un
paso más para tomar la decisión. Ha identificado uno
o varios vehículos concretos de su interés, tiene el presupuesto disponible o la financiación
prácticamente resuelta, y su proceso de decisión se mide
en horas o en pocos días. Necesita probar el vehículo,
resolver una duda técnica específica, hablar de las
condiciones finales con un vendedor o simplemente ver
el coche en persona para confirmar lo que ya casi ha
decidido. Este tipo de lead requiere atención prioritaria
y respuesta en el menor tiempo posible porque la ventana
de oportunidad es corta.

Lead Comprador es aquel que ha tomado la decisión
de compra y solo necesita ejecutarla. El proceso de
evaluación ha terminado, el vehículo está elegido, las
condiciones están aceptadas y el cliente quiere cerrar
la operación. Este lead requiere atención inmediata y
la máxima prioridad en la agenda del vendedor.

12.2 Clasificación por Comportamiento
Además de la temperatura comercial, los leads se
clasifican también por patrones de comportamiento que
el sistema detecta automáticamente y que aportan
información adicional sobre el nivel de interés real
del cliente.

Lead de Primera Llamada es aquel que ha tenido un
único contacto con el concesionario. Es el estado inicial
de cualquier lead y no permite extraer conclusiones sobre
el nivel de interés más allá de lo que el propio cliente
haya manifestado durante la llamada.

Lead Recurrente es aquel que ha llamado al
concesionario en más de una ocasión. La recurrencia de
llamadas sin que el cliente haya llegado a concretar una
cita o una compra es en sí misma una señal significativa
de interés que el sistema detecta y destaca en el CRM.
Un cliente que llama tres veces en dos semanas sin concretar
está claramente en un proceso activo de decisión, aunque
no haya verbalmente expresado un compromiso. El sistema
identifica automáticamente este patrón y eleva el nivel
de prioridad del lead en el Radar de Intención.

Lead Referenciado es aquel que llama mencionando
explícitamente a un vendedor concreto del concesionario
con quien quiere hablar. Este comportamiento indica una
relación previa o una recomendación de terceros que
añade un contexto de confianza al lead. El sistema
registra esta preferencia y la tiene en cuenta en el
proceso de asignación.

12.3 Los Escenarios de Llamada Más Frecuentes
Para ilustrar la diversidad de situaciones que el sistema
debe gestionar, se enumeran a continuación los escenarios
de llamada más frecuentes en un concesionario de vehículos,
con su clasificación correspondiente y el flujo de acción
que genera en el sistema.

El cliente que llama equivocado o como spam es registrado
como sin recorrido comercial y no genera ninguna acción
de seguimiento. Si el número está en listas negras
conocidas, el sistema puede marcarlo para filtrado futuro.

El cliente que busca algo pero no lo tiene claro es
registrado como lead tibio con la información parcial
disponible (rango de precio si lo mencionó, tipo de
vehículo aproximado si lo indicó) y entra en el Radar
de Intención sin cita asociada.

El cliente interesado en un vehículo concreto que tras
la conversación descubre que no cumple sus expectativas
es registrado como lead tibio con la nota de que el
vehículo inicial no encajó y los motivos si los mencionó.
El sistema puede sugerirle alternativas del stock durante
la llamada y si ninguna le interesa entra en el Radar
de Intención para seguimiento posterior.

El cliente interesado en un vehículo pero con freno
económico o de financiación es registrado como lead
tibio con el freno específico anotado y una fecha
estimada de seguimiento. Entra en el Radar de Intención
con visibilidad para el vendedor asignado.

El cliente que pide al agente que le presente opciones
por rango de precio es registrado como lead caliente
si durante la conversación muestra interés real por
alguna de las opciones presentadas, o como lead tibio
si ninguna opción le convence plenamente. Si acepta
una cita para ver alguno de los vehículos presentados,
sube directamente a la Agenda del vendedor con cita
presencial confirmada.

El cliente que quiere el vehículo que ha visto en la
web o en el portal y quiere probarlo es registrado como
lead caliente y genera directamente una cita presencial
de prueba de conducción en la Agenda del vendedor
asignado.

El cliente que quiere el vehículo pero necesita más
información para decidirse es registrado como lead
caliente y genera una cita de información digital con
una tarea de envío de documentación específica asignada
al vendedor, más una cita telefónica de seguimiento
programada para confirmar si la información recibida
ha resuelto sus dudas.

El cliente que quiere que le llame un vendedor concreto
es registrado como lead caliente con la preferencia de
vendedor anotada y genera una cita telefónica de
callback asignada específicamente al vendedor
referenciado, respetando esa preferencia en el proceso
de asignación.

El cliente que ha visitado físicamente el concesionario
y pregunta por un vehículo que no está en el catálogo
digital es registrado como lead caliente en el Radar de
Intención con nota de alta prioridad, y el sistema genera
una notificación urgente para todos los administradores
de la organización indicando que existe un cliente
interesado en un vehículo no catalogado. Esta situación
se describe en detalle en la sección de notificaciones
del sistema.

13. EL RADAR DE INTENCIÓN
El Radar de Intención es el segundo espacio de gestión
comercial del vendedor en Onucall, complementario a la
Agenda. Mientras la Agenda contiene exclusivamente las
citas confirmadas con fecha y hora, el Radar de Intención
es el espacio donde viven los leads que han mostrado
señales de interés en la compra de un vehículo pero que
no han llegado a concretar ningún compromiso de
interacción con fecha específica.

La existencia del Radar de Intención como espacio
diferenciado de la Agenda responde a una necesidad real
del proceso comercial de un concesionario que los sistemas
de CRM convencionales no resuelven bien. Un lead que no
tiene cita no significa un lead sin valor. Puede ser un
cliente que está en proceso de decisión, que tiene un
freno temporal superable, o que simplemente no estuvo
listo para comprometerse en el momento de la llamada
pero que puede estar listo unos días después. Perder ese
lead en el ruido de un CRM genérico es perder una
oportunidad comercial real.

13.1 Qué Aparece en el Radar de Intención
El Radar de Intención muestra todos los leads activos
que cumplen al menos una de las siguientes condiciones.

Primera condición: el lead ha tenido una o más
interacciones con el concesionario y el agente de voz
ha detectado un nivel de interés medio o alto durante
alguna de esas conversaciones, pero el lead no ha
concretado ninguna cita ni ha dado suficientes datos
para un seguimiento directo.

Segunda condición: el lead ha llamado al concesionario
en más de una ocasión sin concretar ninguna cita. La
recurrencia de llamadas es en sí misma una señal de
interés que el sistema reconoce y destaca.

Tercera condición: el lead tiene un freno identificado
(económico, informacional o temporal) que impide
avanzar en el proceso comercial en el momento actual,
pero existe una expectativa razonable de que ese freno
pueda resolverse en el futuro próximo.

Cuarta condición: el lead es un cliente conocido del
CRM que ha vuelto a llamar después de un período de
inactividad, lo que puede indicar que sus circunstancias
han cambiado y que el proceso de compra puede reactivarse.

13.2 Cómo se Organiza el Radar de Intención
Los leads en el Radar de Intención se organizan y
priorizan según múltiples criterios que el vendedor puede
combinar y ajustar según su criterio comercial.

La temperatura del lead es el criterio de ordenación
principal. Los leads calientes aparecen siempre en la
parte superior del Radar, seguidos de los tibios y
finalmente de los fríos, que pueden ocultarse para
reducir el ruido visual si el vendedor lo prefiere.

La actividad reciente es el segundo criterio. Un lead
que ha llamado ayer tiene más urgencia comercial que
uno que llamó hace tres semanas. El sistema ordena
los leads por fecha de última interacción dentro de
cada temperatura.

El número de interacciones totales es el tercer
criterio. Un lead que ha llamado cuatro veces merece
más atención proactiva que uno que solo ha llamado
una vez, aunque ambos tengan la misma temperatura
y la misma fecha de última llamada.

El tipo de vehículo de interés es un criterio de
filtrado opcional que permite al vendedor ver
únicamente los leads interesados en vehículos de
su especialidad o en los vehículos de mayor valor
del stock.

13.3 La Gestión Proactiva desde el Radar
El Radar de Intención no es un archivo pasivo donde
los leads esperan que ocurra algo. Es un espacio de
gestión activa que el vendedor debe revisar
regularmente para identificar oportunidades de
contacto proactivo que pueden convertir un lead
tibio en una cita confirmada.

Desde el Radar, el vendedor puede realizar las
siguientes acciones sobre cada lead. Puede convertir
el lead en una cita registrando manualmente una
interacción que ha ocurrido fuera del sistema (por
ejemplo, el vendedor encontró por casualidad al cliente
en el concesionario y acordaron una visita). Puede
programar una tarea de seguimiento con fecha y hora
de recordatorio para volver a contactar con el cliente
en un momento específico. Puede actualizar la
temperatura del lead manualmente si tiene información
nueva sobre la situación del cliente. Puede archivar
el lead si tiene evidencia de que el cliente ya compró
en otro concesionario o que definitivamente no tiene
intención de compra. Y puede generar una nota interna
sobre el lead que queda registrada en su historial
para cualquier miembro del equipo que consulte esa
ficha en el futuro.

14. LA AGENDA DEL VENDEDOR
La Agenda es el espacio de trabajo principal del
vendedor en Onucall durante su jornada laboral diaria.
Es el lugar donde aparecen todas las citas confirmadas
con fecha y hora, organizadas de forma cronológica y
visual para que el vendedor pueda planificar su día
con la máxima claridad y llegar a cada interacción
con el cliente perfectamente preparado.

14.1 Qué Aparece en la Agenda
La Agenda del vendedor contiene exclusivamente las
citas confirmadas que le han sido asignadas. Una cita
no aparece en la Agenda de un vendedor hasta que ha
sido asignada específicamente a él, ya sea por el
administrador del departamento de forma manual o por
el motor de asignación autónoma cuando ese modo está
activo.

Cada entrada en la Agenda muestra el tipo de cita
(presencial, telefónica o digital), la hora y la
duración estimada, el nombre del cliente y su número
de teléfono, el vehículo o vehículos de su interés
con el estado actual en el catálogo, el resumen
generado por la IA de la conversación que originó
la cita, el nivel de interés detectado durante la
llamada, y cualquier nota específica relevante para
esa interacción.

La información que el vendedor tiene disponible antes
de cada cita le permite llegar preparado a cada
interacción. Sabe quién es el cliente, qué vehículo
le interesa, qué preguntas hizo durante la llamada,
si tiene un freno identificado (como un vehículo
para entregar como parte del pago) y cuál es su
nivel de interés estimado. Esta preparación convierte
al vendedor en un consultor informado en lugar de
un vendedor que empieza desde cero en cada interacción.

14.2 La Vista de la Agenda
La Agenda presenta dos vistas principales que el
vendedor puede alternar según sus preferencias y
necesidades del momento.

La vista de día muestra todas las citas del día actual
en formato de línea de tiempo, indicando claramente
los bloques de tiempo ocupados y los bloques libres.
Esta vista es la más útil durante la jornada laboral
para gestionar el día en curso.

La vista de semana muestra el conjunto de citas de
la semana en un formato de calendario semanal clásico,
que permite al vendedor planificar con perspectiva
y detectar días especialmente cargados o días con
disponibilidad amplia. Esta vista es especialmente
útil al principio de la semana para organizar la
jornada y al final de la semana para preparar la
siguiente.

14.3 La Relación entre la Agenda y el Radar
La Agenda y el Radar de Intención son los dos espacios
complementarios del espacio de trabajo del vendedor
en Onucall. En el diseño del dashboard, se presentan
como dos vistas accesibles desde el mismo panel
mediante un mecanismo de cambio simple, respetando
el principio de minimalismo visual que guía toda la
interfaz de la plataforma.

La lógica de trabajo del vendedor durante su jornada
es la siguiente. Por la mañana, al iniciar la jornada,
revisa la Agenda para conocer las citas confirmadas
del día y prepararse para cada una. Durante los
intervalos entre citas, consulta el Radar de Intención
para identificar leads que merecen seguimiento proactivo
y realiza las llamadas o acciones correspondientes.
Al final de la jornada, actualiza el estado de los
leads gestionados durante el día y programa las
tareas de seguimiento para los días siguientes.

Este flujo de trabajo convierte a Onucall en el sistema
operativo de la jornada comercial del vendedor, no en
una herramienta adicional que debe consultar por
obligación.

15. LAS NOTIFICACIONES DEL SISTEMA
El sistema de notificaciones de Onucall es el mecanismo
mediante el cual la plataforma comunica a los usuarios
los eventos relevantes que requieren su atención,
organizados por nivel de urgencia y por rol del
destinatario. Las notificaciones aparecen en el
dashboard de cada usuario como un indicador numérico
en el icono de notificaciones de la barra de navegación,
que al pulsarse despliega el listado de notificaciones
pendientes con su detalle y las acciones disponibles
para cada una.

15.1 Tipos de Notificación por Urgencia
Notificación Urgente es el nivel más alto de
prioridad. Se utiliza para eventos que requieren atención
inmediata porque implican una oportunidad comercial
activa en riesgo o un fallo operativo del sistema que
debe corregirse sin demora. Las notificaciones urgentes
se presentan visualmente de forma destacada respecto
al resto y generan además una alerta activa en el
dispositivo del usuario si tiene las notificaciones
del navegador habilitadas.

**Notificación Informativa** es el nivel estándar de
notificación. Se utiliza para eventos que el usuario
debe conocer pero que no requieren acción inmediata.
Nueva cita asignada, nuevo lead registrado, resumen
diario de actividad del agente de voz, o confirmación
de que un proceso automatizado ha completado su
ejecución correctamente son ejemplos de notificaciones
informativas.

Notificación de Tarea Pendiente es el nivel de
notificación que recuerda al usuario que tiene una
acción programada que debe ejecutar en un plazo
determinado. El envío de información a un cliente
antes de las 18:00, la llamada de seguimiento
programada para mañana a las 10:00, o la revisión
de un lead que lleva más de cinco días sin actualizar
son ejemplos de notificaciones de tarea pendiente.

15.2 Distribución de Notificaciones por Rol
El sistema distribuye las notificaciones de forma
selectiva según el rol del usuario, garantizando que
cada persona recibe únicamente la información relevante
para sus responsabilidades sin verse abrumada por
eventos que no le corresponde gestionar.

El usuario con rol de administrador de organización
recibe todas las notificaciones urgentes relacionadas
con la organización, los resúmenes de actividad global,
las alertas de sistema relacionadas con la configuración
de la plataforma y las notificaciones de facturación
y uso del plan contratado.

El usuario con rol de administrador de departamento
recibe las notificaciones urgentes relacionadas con
su departamento, las notificaciones de nuevas citas
pendientes de asignación, las alertas de vendedores
de su equipo con tareas vencidas sin completar y los
resúmenes de actividad de su departamento.

El usuario con rol de vendedor recibe las
notificaciones de nuevas citas asignadas a su agenda,
los recordatorios de tareas pendientes de seguimiento,
las actualizaciones de estado de los leads que tiene
asignados y las notificaciones de respuesta del cliente
a comunicaciones enviadas.

15.3 La Notificación Urgente por Bug Empresarial
La notificación urgente por bug empresarial es un
tipo específico de notificación urgente que el sistema
genera automáticamente cuando detecta una discrepancia
entre la realidad operativa del concesionario y los
datos registrados en el sistema.

El caso más claro de bug empresarial es el descrito
anteriormente: un cliente llama mencionando un
vehículo que existe físicamente en el concesionario
pero que no está catalogado en el sistema de Onucall.
Esta situación implica simultáneamente una oportunidad
comercial activa (hay un cliente interesado en ese
vehículo ahora mismo) y un fallo operativo (hay un
activo del negocio que no está generando ninguna
oportunidad comercial digital porque nadie lo conoce
fuera del concesionario).

Cuando el agente de voz detecta esta situación durante
una llamada, el sistema ejecuta de forma inmediata y
simultánea las siguientes acciones. Registra el lead
con toda la información disponible sobre el cliente
y sobre el vehículo descrito, incluyendo la descripción
que el cliente ha dado del vehículo durante la llamada.
Coloca el lead en el Radar de Intención con temperatura
caliente y prioridad máxima. Genera una notificación
urgente de tipo bug empresarial y la envía a todos
los usuarios con rol de administrador de esa
organización, tanto de organización como de
departamento. La notificación incluye el resumen de
la conversación, los datos del cliente, la descripción
del vehículo no catalogado, y un acceso directo al
formulario de alta de vehículo nuevo para que el
administrador pueda catalogar el vehículo de inmediato.

Pueden existir otras casuísticas que generen notificaciones
urgentes por bug empresarial. Un cliente que menciona
un precio diferente al que figura en el catálogo del
sistema puede indicar que el precio del anuncio en un
portal no ha sido actualizado. Un cliente que afirma
que el vehículo ya ha sido vendido cuando en el sistema
figura como disponible indica que se ha producido una
venta que no ha sido registrada correctamente en el
catálogo. Un cliente que menciona un servicio que el
concesionario ofrece pero que no está configurado en
ningún departamento del sistema indica una carencia
en la configuración de la plataforma que limita la
capacidad del agente de voz para gestionar ese tipo
de consultas. En todos estos casos el comportamiento
del sistema es consistente: registrar el máximo de
información posible, alertar a los administradores
con carácter urgente y proporcionar el acceso directo
a la acción correctiva correspondiente.

PARTE V: LOS MÓDULOS DEL PRODUCTO
16. CRM DE LEADS
El CRM de Leads de Onucall es el módulo que centraliza
la gestión de todas las relaciones comerciales del
concesionario con sus clientes potenciales. No es un
CRM genérico adaptado al sector. Es un sistema diseñado
desde cero para el flujo comercial específico de la
venta de vehículos, con los estados, la terminología
y los flujos de trabajo que el sector reconoce y utiliza
de forma natural.

16.1 La Ficha del Lead
Cada lead en el sistema tiene una ficha completa que
centraliza toda la información disponible sobre esa
persona y su proceso de compra. La ficha del lead
contiene el nombre completo del cliente si ha sido
facilitado, su número de teléfono, su email si ha sido
proporcionado, su método de contacto preferido entre
llamada telefónica, email, SMS o WhatsApp, y el origen
del lead indicando si fue captado por el agente de voz,
si llegó a través del formulario de contacto de la web,
si fue registrado manualmente por un vendedor o si fue
referido por otro cliente.

La ficha incluye también el historial completo de
interacciones con el concesionario: cada llamada gestionada
por el agente de voz con su fecha, duración y resumen
generado por la IA, cada contacto realizado por un
vendedor con sus notas, cada cita programada y su
resultado, y cada comunicación enviada al cliente.

El vehículo o los vehículos de interés del lead están
vinculados directamente a las fichas de vehículos del
catálogo, de forma que cualquier cambio en el estado
de un vehículo vinculado (por ejemplo, si pasa de
disponible a reservado) genera automáticamente una
notificación para el vendedor asignado a ese lead.

La ficha incluye el nivel de temperatura del lead
(frío, tibio, caliente o comprador), el vendedor
asignado, el estado actual en el pipeline y un campo
de notas internas donde los miembros del equipo
pueden registrar observaciones que no son visibles
para el cliente pero que son relevantes para la gestión
interna del proceso de venta.

16.2 El Pipeline Comercial Visual
El pipeline comercial es la vista principal del CRM
y presenta todos los leads activos en un tablero visual
de tipo Kanban donde cada columna representa una fase
del proceso de venta. El vendedor o el administrador
puede mover los leads entre columnas arrastrándolos
a medida que avanzan en su proceso de compra.

Las columnas del pipeline son las siguientes en orden
secuencial. Nuevo corresponde a los leads recién
captados por el agente de voz o registrados manualmente
que aún no han sido contactados por ningún vendedor.
Contactado corresponde a los leads con los que ya ha
habido un primer contacto humano por parte del equipo
de ventas. Visita Programada corresponde a los leads
que tienen una cita confirmada en la Agenda. Visita
Realizada corresponde a los leads que han completado
su cita presencial y están en proceso de evaluación
o negociación. En Negociación corresponde a los leads
que están activamente discutiendo las condiciones de
la operación con un vendedor. Vendido corresponde a
las operaciones cerradas con éxito. Descartado
corresponde a los leads que definitivamente no van a
comprar en este concesionario, ya sea porque compraron
en otro lugar, porque descartaron la compra o porque
no han respondido a ningún intento de contacto en un
período prolongado.

16.3 La Asignación de Vendedores y las Tareas
Cada lead tiene asignado un vendedor responsable que
es el punto de contacto principal del concesionario
para ese cliente. La asignación puede ser realizada
manualmente por el administrador del departamento,
puede ser resultado del modo de asignación autónoma
del motor de agendamiento, o puede ser realizada
directamente por el vendedor si el lead le llega
por un canal que no pasa por el agente de voz.

El sistema de tareas del CRM permite al vendedor y al
administrador programar acciones de seguimiento con
fecha y hora específicas. Una tarea puede ser llamar
al cliente el jueves a las 11:00, enviarle la
documentación adicional antes del viernes, o revisar
su ficha en dos semanas para ver si su situación
económica ha cambiado. Las tareas vencidas que no
han sido completadas generan notificaciones de tarea
pendiente que se acumulan en el panel de notificaciones
del usuario responsable.

16.4 La Analítica Básica del Pipeline
El administrador del departamento y el administrador
de la organización tienen acceso a una vista de
analítica básica del pipeline que muestra en tiempo
real las métricas más relevantes para la supervisión
del rendimiento comercial del equipo.

Las métricas disponibles incluyen el número de leads
en cada fase del pipeline, el tiempo medio que los
leads pasan en cada fase antes de avanzar a la
siguiente, el ratio de conversión de cada vendedor
calculado como el porcentaje de leads asignados que
alcanzan el estado de vendido, los vehículos que
generan más leads activos en el pipeline, y la
comparación del volumen de leads generados en el
período actual respecto al período anterior.

Esta analítica básica está diseñada para ser consumida
directamente desde el dashboard sin necesidad de
configuración ni de conocimientos técnicos. Para
consultas más complejas o personalizadas, el módulo
de BI Conversacional descrito en la sección 19
proporciona la capacidad de interrogar los datos
del CRM en lenguaje natural con cualquier nivel de
detalle o combinación de criterios.

17. CATÁLOGO DE VEHÍCULOS: MIS VEHÍCULOS
El módulo Mis Vehículos es el repositorio central de
todos los vehículos que el concesionario tiene en su
stock, tanto disponibles como reservados, vendidos o
en preparación. Es simultáneamente el catálogo interno
del negocio, la fuente de datos que alimenta al agente
de voz en tiempo real durante las llamadas, y el origen
de los datos que pueden exponerse públicamente a través
del endpoint API para la web del concesionario.

17.1 La Ficha del Vehículo
Cada vehículo en el catálogo tiene una ficha completa
que incluye todos los datos relevantes para la gestión
interna y para la información al cliente.

Los datos de identificación incluyen la marca, el
modelo, la versión o acabado específico, el año de
matriculación, el número de matrícula, el número de
bastidor o VIN, y el código de referencia interno
que el concesionario utiliza en sus propios sistemas.

Los datos comerciales incluyen el precio de venta
al público, el precio de coste visible únicamente
para los usuarios con roles de administrador, el
precio mínimo de negociación si el concesionario
quiere establecer un suelo por debajo del cual el
vendedor no puede bajar sin autorización expresa,
y las condiciones de financiación disponibles
específicamente para ese vehículo si difieren de
las condiciones generales del concesionario.

Los datos técnicos incluyen el tipo de vehículo
(turismo, todoterreno, furgoneta, camión, motocicleta,
ciclomotor, caravana, autocaravana, embarcación, moto
acuática, tractor u otro), la condición del vehículo
(nuevo, vehículo de ocasión, kilómetros cero o
demostración), el kilometraje, el tipo de combustible,
el tipo de transmisión, la potencia en caballos, el
número de plazas, el número de puertas, el color
exterior, el color interior, el certificado de
eficiencia energética, el estado de la ITV con su
fecha de vencimiento, y el estado de la garantía
con sus condiciones y fecha de vencimiento.

Los datos de equipamiento se recogen mediante el
campo de anotación descrito en la sección 22, que
permite almacenar una descripción rica y detallada
del equipamiento específico del vehículo, los
extras incluidos y cualquier característica
diferencial que sea relevante para el cliente o
para el agente de voz.

Las imágenes del vehículo se gestionan en una
galería asociada a la ficha con soporte para
múltiples fotos, designación de una foto principal
o de portada, texto alternativo para cada imagen
y orden de aparición configurable.

17.2 Los Estados del Vehículo
El estado del vehículo es el campo más crítico de
la ficha desde el punto de vista operativo porque
determina directamente el comportamiento del agente
de voz cuando un cliente pregunta por ese vehículo
durante una llamada.

El estado Disponible indica que el vehículo está
en el stock activo del concesionario, listo para
ser mostrado y vendido. El agente de voz menciona
activamente este vehículo cuando es relevante para
la consulta del cliente.

El estado Reservado indica que el vehículo tiene
una operación en curso con otro cliente pero que
la venta aún no está cerrada. El agente de voz
informa al cliente de que ese vehículo está en
este momento reservado pendiente de cierre de
operación, pero que si la operación no se confirma
quedará disponible nuevamente. El agente puede
ofrecer al cliente la posibilidad de quedar en
lista de espera para ese vehículo específico.

El estado Vendido indica que el vehículo ha sido
vendido y ya no está disponible. El agente de voz
no menciona este vehículo en sus respuestas y si
el cliente pregunta específicamente por él le
informa de que ya ha sido vendido y le ofrece
alternativas similares del stock disponible.

El estado En Preparación indica que el vehículo
ha llegado al concesionario pero aún no está listo
para ser mostrado o vendido porque está siendo
revisado, reparado o acondicionado. El agente de
voz puede mencionar este vehículo como próximamente
disponible si el cliente muestra interés en un
modelo con esas características.

El estado Oculto indica que el vehículo existe en
el sistema pero que el concesionario no quiere que
sea mencionado por el agente de voz ni que aparezca
en el endpoint público. Es un estado temporal que
el administrador puede usar cuando necesita retirar
un vehículo del catálogo activo sin borrarlo del
sistema.

17.3 El Endpoint API Público
Cada organización que tiene activo el addon del
Portal Web o que ha contratado el acceso a la API dispondrá de un
endpoint público que expone en formato JSON los
vehículos con estado Disponible de su catálogo.
Este endpoint puede ser consumido por la web del
concesionario, por aplicaciones móviles de terceros,
por integraciones con portales de anuncios o por
cualquier otro sistema externo que el concesionario
quiera conectar con su catálogo de Onucall.

El endpoint responde a peticiones GET con parámetros
opcionales de filtrado que permiten al sistema
consumidor solicitar únicamente los vehículos que
cumplen ciertos criterios. Los parámetros de filtrado
disponibles incluyen el tipo de vehículo, la condición
(nuevo o de ocasión), el rango de precio, el rango
de año de matriculación, el tipo de combustible y
el estado de disponibilidad. La respuesta incluye
para cada vehículo todos los campos públicos de su
ficha incluyendo las URLs de sus imágenes almacenadas
en Supabase Storage.

El endpoint respeta la seguridad multi-tenant de la
plataforma. Cada organización tiene su propia URL
de endpoint que incluye un identificador único de
la organización, y el sistema garantiza que una
petición a ese endpoint nunca puede devolver datos
de otra organización. No es posible que el catálogo
de un concesionario sea visible desde el endpoint
de otro.

La autenticación del endpoint público funciona
mediante una clave de API que el administrador de
la organización genera desde el dashboard y que
debe incluirse en las cabeceras de cada petición.
Esta clave puede ser regenerada en cualquier momento
si el administrador sospecha que ha sido comprometida,
y la regeneración invalida inmediatamente la clave
anterior.

18. BASE DE CONOCIMIENTOS
La Base de Conocimientos es el módulo que transforma
a Onucall de una plataforma de gestión de leads con
agente de voz en una plataforma de inteligencia
comercial real. Permite al concesionario digitalizar
y vectorizar su conocimiento documental para que
ese conocimiento quede disponible de forma inmediata
para el agente de voz durante las llamadas y para
el motor de BI Conversacional en el dashboard.

18.1 Qué se Puede Almacenar en la Base de Conocimientos
La Base de Conocimientos acepta documentos en formato
PDF, que es el formato estándar en el que se distribuye
la documentación técnica y comercial del sector de
la automoción. Los tipos de documentos que tienen
mayor valor en el contexto de un concesionario de
vehículos son los siguientes.

Los manuales técnicos de los modelos en stock son
el tipo de documento de mayor impacto para la
calidad de las respuestas del agente de voz. Cuando
el concesionario sube el manual oficial de un modelo
y lo vincula a los vehículos de ese modelo que tiene
en su catálogo, el agente puede responder preguntas
técnicas detalladas sobre ese vehículo durante las
llamadas con la misma precisión que un técnico
especializado: intervalos de mantenimiento, tipos
de aceite recomendados, capacidades de remolque,
sistemas de asistencia a la conducción incluidos,
compatibilidad con accesorios específicos y cualquier
otra información que esté recogida en el manual.

Las fichas técnicas y los catálogos de equipamiento
por versión permiten al agente responder preguntas
sobre las diferencias de equipamiento entre distintas
versiones de un mismo modelo, cuáles son los extras
de serie en cada acabado y qué opcionales están
disponibles para cada versión.

Las políticas internas de precios y descuentos
permiten configurar el comportamiento del agente
respecto a la negociación de precio, indicando qué
márgenes de descuento puede mencionar, en qué
circunstancias debe escalar la negociación a un
vendedor humano y qué condiciones especiales están
vigentes en cada período.

Las condiciones de garantía propias del concesionario
permiten al agente informar con precisión sobre
los términos exactos de la garantía que el
concesionario ofrece sobre sus vehículos de ocasión,
diferenciando entre la garantía legal mínima y
cualquier garantía adicional que el concesionario
proporcione como diferenciador comercial.

Los procedimientos de tasación y compra de vehículos
a particulares permiten al agente gestionar con
más precisión las llamadas de clientes que quieren
vender su vehículo, informándoles sobre el proceso,
los documentos necesarios y los plazos habituales.

La información general sobre el concesionario como
empresa, incluyendo su historia, sus valores, las
marcas con las que trabaja, los servicios adicionales
que ofrece y cualquier información que el concesionario
quiera que el agente conozca y pueda comunicar cuando
sea relevante en una conversación.

18.2 La Vinculación de Documentos a Vehículos
Cada documento de la Base de Conocimientos puede
vincularse a uno o varios vehículos concretos del
catálogo. Esta vinculación es especialmente relevante
para los manuales técnicos y las fichas de equipamiento,
porque permite que cuando el agente de voz está
gestionando una llamada sobre un vehículo específico,
el sistema de RAG priorice en su búsqueda los fragmentos
de los documentos vinculados a ese vehículo sobre
cualquier otro documento de la Base de Conocimientos.

Si el concesionario tiene en stock tres Renault Captur
del año 2025 y ha subido el manual oficial del Captur
2025 vinculándolo a esos tres vehículos, cuando un
cliente llame preguntando por cualquiera de esos tres
Captur, el agente tendrá acceso priorizado al contenido
de ese manual para responder sus preguntas técnicas.

Un documento puede también existir en la Base de
Conocimientos sin vinculación a ningún vehículo
específico. En ese caso se considera conocimiento
general de la organización y está disponible para
todas las conversaciones del agente con igual
prioridad.

18.3 El Procesamiento Automático de Documentos
Cuando el administrador sube un documento a la Base
de Conocimientos desde el dashboard, el sistema inicia
automáticamente en segundo plano un proceso de
preparación del documento que lo hace disponible
para el agente de voz y para el motor de BI en menos
de un minuto para documentos de hasta veinte páginas,
y en menos de cinco minutos para documentos de hasta
doscientas páginas.

El proceso consta de varias etapas secuenciales
orquestadas por n8n. En la primera etapa, el sistema
extrae el texto del PDF utilizando herramientas de
procesamiento de documentos que preservan la
estructura semántica del contenido incluyendo
encabezados, listas y tablas. En la segunda etapa,
el texto extraído se divide en fragmentos de tamaño
óptimo de entre quinientos y ochocientos tokens cada
uno, con un solapamiento de entre ochenta y cien tokens
entre fragmentos consecutivos para garantizar que
el contexto no se pierde en los puntos de corte.
En la tercera etapa, cada fragmento se envía a la
API de embeddings configurada en el sistema para
obtener su representación vectorial numérica, que
captura el significado semántico del fragmento en
un espacio de alta dimensionalidad. En la cuarta y
última etapa, cada fragmento junto con su vector
de embedding y sus metadatos (identificador del
documento, número de página, sección a la que
pertenece, identificador de la organización y si
está vinculado a algún vehículo específico) se
almacena en la tabla de chunks vectorizados de la
base de datos de Supabase con la extensión pgvector.

Una vez completado este proceso, el documento está
disponible para su uso sin ninguna acción adicional
por parte del administrador. No hay configuración
adicional, no hay aprobación manual y no hay tiempo
de espera adicional más allá del procesamiento.

18.4 Los Límites por Plan
Para garantizar la sostenibilidad económica del
servicio considerando que el procesamiento y
almacenamiento de embeddings tiene un coste real
en infraestructura, cada plan de Onucall incluye
límites específicos sobre el uso de la Base de
Conocimientos.

El plan Starter permite almacenar hasta cinco
documentos con un tamaño máximo de cinco megabytes
cada uno, y un máximo de cincuenta consultas
mensuales al motor de BI Conversacional que utilicen
el contenido de la Base de Conocimientos.

El plan Professional permite almacenar hasta
veinticinco documentos con un tamaño máximo de
veinte megabytes cada uno, consultas ilimitadas
al motor de BI Conversacional y acceso completo
al agente de voz con conocimiento documental en
todas las llamadas.

El plan Business permite almacenar hasta cien
documentos con un tamaño máximo de cincuenta
megabytes cada uno, todo lo incluido en el plan
Professional y la capacidad de compartir documentos
entre múltiples organizaciones del mismo grupo
empresarial cuando sea relevante para todas ellas.

19. BI CONVERSACIONAL
El módulo de Business Intelligence Conversacional
es el diferenciador más disruptivo de Onucall respecto
a cualquier CRM sectorial existente en el mercado
español. Permite al gestor del concesionario interrogar
su propio negocio en lenguaje natural, exactamente
como si tuviera a su disposición un analista de datos
experto disponible en todo momento, sin necesidad de
conocimientos técnicos, sin informes predefinidos con
filtros limitados y sin esperar al cierre del mes para
tener visibilidad sobre el rendimiento del negocio.

19.1 Cómo Funciona el BI Conversacional
El motor de BI Conversacional combina las tres capas
del sistema RAG híbrido descrito en la sección 21
de este documento para responder cualquier pregunta
sobre el negocio del concesionario. Cuando el gestor
escribe una pregunta en lenguaje natural en el panel
de BI del dashboard, el sistema analiza la intención
de la pregunta, determina qué fuentes de datos son
necesarias para responderla y ejecuta las consultas
o búsquedas correspondientes en cada capa del sistema,
para finalmente sintetizar toda la información
recuperada en una respuesta coherente y accionable
en lenguaje natural.

La primera capa de datos, los datos estructurados de
la base de datos relacional, se consulta mediante
un mecanismo de traducción de lenguaje natural a SQL
que el LLM ejecuta internamente. Cuando el gestor
pregunta cuántos leads de Cartaya se han interesado
por el SEAT Ateca en el último mes, el sistema genera
internamente la consulta SQL necesaria para obtener
ese dato exacto de las tablas de leads y vehículos
del concesionario, ejecuta la consulta y presenta
el resultado en lenguaje natural.

La segunda capa de datos, los documentos vectorizados
de la Base de Conocimientos, se consulta mediante
búsqueda semántica por similitud cuando la pregunta
requiere información que está en los documentos
almacenados pero no en la base de datos estructurada.
Cuando el gestor pregunta cuál es el intervalo de
mantenimiento recomendado para el Renault Captur que
tiene en stock, el sistema busca en los fragmentos
vectorizados de la Base de Conocimientos los más
semánticamente relevantes para esa pregunta y usa
su contenido para construir la respuesta.

La tercera capa de datos, las fuentes externas de
mercado en tiempo real, se consulta cuando la pregunta
requiere información sobre el entorno competitivo
o el mercado que no está disponible en los datos
internos del concesionario. Cuando el gestor pregunta
si el precio al que tiene el Volkswagen Tiguan
matrícula 0011ABC está en consonancia con el mercado
actual en Huelva, el sistema combina el precio interno
del catálogo con los precios de vehículos comparables
en los principales portales de anuncios de la zona
para dar una respuesta contextualizada y accionable.

19.2 Tipos de Preguntas que el BI Conversacional Puede Responder
Las preguntas que el gestor puede hacer al motor de
BI Conversacional se agrupan en cuatro categorías
principales.

Las preguntas sobre el stock permiten al gestor
obtener visibilidad completa sobre su catálogo de
vehículos desde cualquier ángulo. Puede preguntar
qué vehículos llevan más de sesenta días en el stock
sin recibir ninguna llamada de interés, cuáles son
los tres vehículos con mayor número de leads activos
asociados que todavía no se han vendido, cuántos
vehículos eléctricos o híbridos tiene disponibles
y a qué precio medio, qué modelos han generado más
consultas en el último mes, o cuántos vehículos
tiene con precio superior a cuarenta mil euros y
cuántos leads ha generado cada uno.

Las preguntas sobre leads y actividad comercial
permiten al gestor y a los administradores de
departamento monitorizar el rendimiento del equipo
comercial en tiempo real. Puede preguntar cuántos
leads nuevos ha captado el agente de voz esta semana
respecto a la semana pasada, cuántos clientes de
Cartaya han llamado este mes y qué vehículos les
interesan, cuál es el vendedor con mayor ratio de
conversión en los últimos treinta días, cuántos
leads están en fase de negociación sin haber avanzado
desde hace más de siete días, o cuántas citas
presenciales tiene agendadas el equipo para la
próxima semana desglosadas por departamento.

Las preguntas de inteligencia de mercado permiten
al gestor tomar decisiones comerciales basadas en
datos reales del mercado en lugar de en intuición.
Puede preguntar si el precio al que tiene un vehículo
concreto está alineado con el mercado de su zona,
qué modelos de la competencia local compiten
directamente con los SUVs de su stock, cuál es el
precio medio de mercado para vehículos con
características similares a los que tiene en su
catálogo, o qué modelos están teniendo mayor demanda
en los portales de anuncios de su provincia en este
momento.

Las preguntas técnicas sobre vehículos permiten al
gestor y a los vendedores resolver dudas técnicas
específicas sobre los modelos del stock utilizando
la información de la Base de Conocimientos. Puede
preguntar cuál es la capacidad de carga del Renault
Trafic que tiene en stock, qué sistemas de seguridad
activa incluye de serie el Volkswagen Tiguan del
año 2023, cuál es el consumo homologado en carretera
del Seat Ateca con motor gasolina de 150 caballos,
o qué diferencia de equipamiento existe entre la
versión Style y la versión FR del mismo modelo.

19.3 El Valor Económico del BI Conversacional
El acceso a este nivel de inteligencia de negocio
en tiempo real y en lenguaje natural representa
para un concesionario mediano un valor económico
muy significativo. Un analista de datos junior en
España tiene un coste de entre veinticinco mil y
treinta y cinco mil euros anuales en nómina, sin contar la seguridad social,
los beneficios sociales ni el tiempo de formación
necesario para que ese perfil conozca el negocio
con suficiente profundidad para ser productivo.
Las herramientas de business intelligence
profesionales como Power BI, Tableau o Looker
requieren entre uno y tres meses de implementación,
formación específica del personal para su uso
efectivo, y un coste de licencia de entre veinte
y cien euros por usuario al mes, más el coste del
consultor que configura los informes y los mantiene.

Onucall proporciona el equivalente funcional de un
analista de datos siempre disponible, con conocimiento
profundo del negocio del concesionario, accesible
en lenguaje natural sin formación técnica, y con
la capacidad adicional de cruzar los datos internos
del negocio con información del mercado externo en
tiempo real. Todo esto está incluido en el plan
Professional a trescientos noventa y nueve euros
al mes, sin coste adicional de implementación,
sin tiempo de formación y disponible desde el
primer día de uso de la plataforma.

20. PORTAL WEB
El Portal Web es el módulo opcional de pago de
Onucall que permite al concesionario disponer de
una presencia web profesional alimentada
automáticamente por su catálogo de vehículos, sin
necesidad de contratar un diseñador web, sin costes
de desarrollo personalizado y sin actualizaciones
manuales del contenido.

20.1 El Concepto del Portal Web como Extensión del Catálogo
El Portal Web no es una web independiente que hay
que mantener por separado del resto de la plataforma.
Es una extensión pública del catálogo de Mis Vehículos
que transforma automáticamente los datos privados
del catálogo interno en una web pública accesible
para cualquier comprador potencial.

Cuando el administrador sube un vehículo nuevo al
catálogo y le asigna el estado Disponible, ese
vehículo aparece automáticamente en la web pública
del concesionario con todas sus fotos, su precio,
sus características técnicas y la descripción
generada por el campo de anotación. Cuando el
vehículo se vende y su estado cambia a Vendido,
desaparece de la web en tiempo real sin que el
administrador tenga que hacer ninguna acción
adicional. La web siempre refleja exactamente el
estado actual del catálogo sin ningún esfuerzo
manual de mantenimiento.

20.2 La Infraestructura Técnica del Portal Web
Desde el punto de vista técnico, el Portal Web
funciona como una aplicación Qwik con renderizado
del lado del servidor que consume el endpoint API
público del catálogo de Onucall para obtener los
datos de los vehículos en tiempo real. Al estar
construido con Qwik y SSR, el portal tiene tiempos
de carga extremadamente rápidos, lo que mejora
tanto la experiencia del usuario como el
posicionamiento en los resultados de búsqueda de
Google.

Cada organización que activa el Portal Web recibe
automáticamente un subdominio en el formato
nombredelconcesionario.onucall.es. Si el
concesionario tiene ya un dominio propio que quiere
usar, el equipo de Onucall configura gratuitamente
la redirección DNS para que el dominio propio
apunte al portal alojado en la infraestructura de
Onucall. El proceso de vinculación del dominio
propio es transparente para el concesionario y
no requiere ningún conocimiento técnico por su
parte.

20.3 El Template de Diseño
El Portal Web incluye un template de diseño
profesional específicamente diseñado para el sector
de la venta de vehículos, optimizado para dispositivos
móviles y con SEO técnico básico configurado de
fábrica. El template presenta el catálogo de
vehículos con filtros de búsqueda por tipo de
vehículo, precio, año y combustible, una ficha
individual para cada vehículo con galería de fotos,
características técnicas y un formulario de contacto
directo, información de contacto y ubicación del
concesionario, e integración con el número de
teléfono de Onucall para que los visitantes puedan
llamar directamente al agente de voz desde la web
con un solo toque en dispositivos móviles.

El formulario de contacto del Portal Web está
integrado directamente con el CRM de Onucall. Cuando
un visitante de la web rellena el formulario
expresando interés en un vehículo concreto, ese
contacto se registra automáticamente como un nuevo
lead en el CRM, vinculado al vehículo de interés
y con el origen identificado como formulario web,
diferenciándolo de los leads captados por el agente
de voz.

20.4 El Modelo de Negocio del Portal Web
El Portal Web se ofrece como un addon de pago sobre
cualquiera de los planes base de Onucall a un precio
de setenta y nueve euros adicionales al mes. Esta
decisión de pricing refleja el valor real que el
módulo aporta: el concesionario que activa el Portal
Web deja de necesitar el servicio de mantenimiento
web que habitualmente contrata a una agencia o a
un autónomo por entre cien y trescientos euros al
mes, y obtiene además una web que se actualiza sola
en tiempo real conectada a su catálogo de inventario,
algo que ninguna web estática puede ofrecer.

PARTE VI: LA INTELIGENCIA DEL SISTEMA
21. EL RAG HÍBRIDO DE TRES CAPAS
El sistema de Retrieval Augmented Generation híbrido
de tres capas es la arquitectura tecnológica que
sustenta la inteligencia de Onucall. Es el componente
que diferencia a la plataforma de cualquier solución
basada en un LLM genérico o en una base de datos
convencional, y es el que hace posible que tanto
el agente de voz como el motor de BI Conversacional
respondan con precisión, contexto y relevancia a
cualquier consulta relacionada con el negocio del
concesionario.

RAG son las siglas de Retrieval Augmented Generation,
que en español se traduce como Generación Aumentada
por Recuperación. El concepto fundamental es que
en lugar de confiar exclusivamente en el conocimiento
estático con el que fue entrenado el modelo de
lenguaje, que puede ser incorrecto, desactualizado
o simplemente no contener información específica
del negocio del concesionario, el sistema recupera
activamente información relevante y actualizada de
fuentes específicas antes de generar cada respuesta.
El modelo de lenguaje no inventa ni supone. Responde
basándose en los datos reales que el sistema le
proporciona en cada consulta.

21.1 La Capa 1: Los Datos Estructurados
La primera capa del sistema RAG es la base de datos
relacional de Supabase donde viven todos los datos
operativos del concesionario en formato estructurado.
Esta capa es la fuente de verdad para cualquier
información que cambia frecuentemente y que debe
ser exacta en todo momento: el catálogo de vehículos
con sus estados de disponibilidad actuales, el
historial completo de leads y sus interacciones,
las citas agendadas y sus estados, los calendarios
laborales activos y las excepciones vigentes, y
la configuración de los departamentos y los
vendedores.

Cuando una consulta requiere datos de esta capa,
el sistema utiliza un mecanismo de traducción de
lenguaje natural a SQL denominado Text-to-SQL. El
LLM analiza la pregunta del usuario o la consulta
del agente de voz, genera internamente la query
SQL más apropiada para obtener los datos necesarios,
ejecuta esa query contra la base de datos del
concesionario y usa los resultados como contexto
para generar la respuesta final.

Este mecanismo garantiza que las respuestas basadas
en datos operativos sean siempre exactas y estén
siempre actualizadas, porque se obtienen directamente
de la fuente de verdad del negocio en el momento
exacto en que se hace la consulta, sin caché
intermedios que puedan estar desactualizados.

21.2 La Capa 2: Los Documentos Vectorizados
La segunda capa del sistema RAG es la base de
conocimiento documental vectorizada que se construye
a partir de los documentos que el concesionario
sube a la Base de Conocimientos. Esta capa es la
fuente de información para consultas que requieren
conocimiento semántico que no está en la base de
datos estructurada: especificaciones técnicas de
vehículos, diferencias de equipamiento entre
versiones, condiciones detalladas de garantía,
procedimientos operativos internos del concesionario
o cualquier otra información contenida en los
documentos subidos.

El mecanismo de consulta de esta capa es la búsqueda
vectorial por similitud semántica. Cuando el sistema
necesita información de esta capa, genera un vector
de embedding de la consulta utilizando el mismo
modelo de embeddings que se usó para vectorizar
los documentos, y busca en la base de datos vectorial
los fragmentos cuyos vectores son semánticamente
más similares al vector de la consulta. Los fragmentos
más similares se recuperan y se utilizan como contexto
para la respuesta.

La búsqueda vectorial tiene una ventaja fundamental
sobre la búsqueda por palabras clave tradicional:
encuentra información relevante aunque las palabras
exactas de la consulta no coincidan con las palabras
del documento. Si un cliente pregunta por el consumo
de gasolina de un vehículo y el manual del fabricante
habla de eficiencia energética y litros por cada cien
kilómetros, la búsqueda vectorial encuentra esa
sección del manual porque reconoce la equivalencia
semántica entre los dos conceptos, mientras que una
búsqueda por palabras clave no la encontraría.

21.3 La Capa 3: Las Fuentes Externas en Tiempo Real
La tercera capa del sistema RAG es la que conecta
a Onucall con el mundo exterior y proporciona
inteligencia de mercado que ningún sistema basado
exclusivamente en datos internos puede ofrecer.
Cuando una consulta requiere información sobre el
entorno competitivo, los precios de mercado, la
demanda actual de determinados modelos o cualquier
otro dato externo al concesionario, el sistema lanza
consultas en tiempo real a fuentes de datos externas
para obtener esa información antes de generar la
respuesta.

Las fuentes externas que el sistema puede consultar
incluyen los principales portales de anuncios de
vehículos de ocasión en España para obtener precios
de mercado por modelo, año, kilometraje y zona
geográfica, fuentes de datos de matriculaciones para
obtener información sobre tendencias de demanda por
modelo y segmento, y fuentes de información técnica
pública sobre modelos y versiones para complementar
la información de la Base de Conocimientos cuando
esta no está disponible.

Esta capa es la que hace posible respuestas de alto
valor como la comparación del precio de un vehículo
del catálogo con el precio de mercado en la zona,
o la identificación de los modelos de la competencia
que compiten directamente con los vehículos del
stock del concesionario. Ningún CRM convencional
ni ningún agente de voz genérico puede proporcionar
este nivel de inteligencia contextualizada porque
requiere la combinación de datos internos del negocio
con datos externos del mercado en tiempo real.

21.4 La Orquestación de las Tres Capas
Cuando el agente de voz o el motor de BI
Conversacional recibe una consulta, el sistema
determina automáticamente qué capas son necesarias
para responderla y ejecuta las consultas
correspondientes en paralelo cuando es posible
para minimizar la latencia total de la respuesta.

Una consulta sobre el precio de un vehículo concreto
del catálogo requiere únicamente la Capa 1. Una
consulta sobre las especificaciones técnicas de un
modelo puede requerir únicamente la Capa 2 si el
manual está disponible en la Base de Conocimientos,
o la Capa 3 si no lo está. Una consulta sobre si
el precio de un vehículo está alineado con el
mercado requiere la Capa 1 para obtener el precio
interno y la Capa 3 para obtener los precios de
mercado comparables. Una consulta sobre el nivel
de interés que ha generado un vehículo combinado
con su posición de precio respecto al mercado
requiere las tres capas simultáneamente.

El LLM actúa como orquestador de este proceso,
determinando qué fuentes consultar, sintetizando
la información recuperada de cada capa y generando
una respuesta coherente, precisa y accionable que
el usuario o el cliente recibe como una respuesta
natural en lenguaje conversacional.

22. EL CAMPO ANNOTATION Y EL ENRIQUECIMIENTO CON IA
El campo de anotación es uno de los elementos más
innovadores del módulo de Mis Vehículos de Onucall,
porque introduce la inteligencia artificial directamente
en el flujo de trabajo de catalogación de vehículos
del concesionario, reduciendo drásticamente el tiempo
que el equipo dedica a describir y documentar cada
nuevo vehículo que entra en el stock.

22.1 Qué es el Campo Annotation
El campo de anotación es un campo de texto largo y
libre asociado a la ficha de cada vehículo del
catálogo. Su propósito es almacenar una descripción
rica, detallada y estructurada del vehículo que
va más allá de los campos técnicos estandarizados
de la ficha. Incluye los extras y opcionales
específicos de ese vehículo concreto, las
características diferenciales que lo hacen
especialmente atractivo para cierto perfil de
comprador, el estado de conservación detallado,
el historial de propietarios si se conoce, cualquier
trabajo de acondicionamiento reciente realizado,
y cualquier otro detalle que el concesionario
considere relevante para que el agente de voz
pueda hablar de ese vehículo con el máximo nivel
de detalle y conocimiento durante las llamadas.

Este campo es el que el agente de voz consulta
en primera instancia cuando un cliente hace una
pregunta específica sobre un vehículo que no está
cubierta por los campos estandarizados de la ficha.
Si un cliente pregunta si el vehículo tiene tapicería
de cuero, si las llantas son de fábrica o de
aftermarket, si tiene el techo solar o si lleva
los neumáticos de invierno montados, el agente
encuentra esa información en el campo de anotación
si el concesionario la ha introducido correctamente.

22.2 El Enriquecimiento Automático con IA
Mantener el campo de anotación actualizado y completo
para cada vehículo del stock puede ser una tarea
manual significativa, especialmente en concesionarios
con alto volumen de rotación de stock. Para reducir
este trabajo al mínimo, Onucall integra una
funcionalidad de enriquecimiento automático con inteligencia
artificial que permite al administrador generar el
contenido del campo de anotación de forma automática
con un solo clic desde la ficha del vehículo.

Cuando el administrador pulsa el botón de
enriquecimiento con IA en la ficha de un vehículo,
el sistema lanza un proceso que combina varias fuentes
de información para construir la anotación más
completa y precisa posible. El sistema accede a la
web del fabricante del modelo correspondiente para
obtener la información oficial de equipamiento y
extras disponibles para ese año y versión específicos.
Si el vehículo tiene un anuncio publicado en portales
de anuncios con una URL registrada en el sistema,
accede también a ese anuncio para extraer detalles
adicionales que el propio concesionario haya incluido
previamente. Cruza toda esa información con los
datos técnicos ya registrados en los campos
estandarizados de la ficha para evitar duplicidades.
Y finalmente genera un texto descriptivo coherente,
bien estructurado y optimizado para ser leído tanto
por el agente de voz durante una llamada como por
un comprador potencial que visite la web del
concesionario.

El resultado es una anotación de entre doscientas
y quinientas palabras que el administrador puede
revisar, editar y confirmar antes de guardar. En
ningún caso el sistema sobrescribe automáticamente
el campo sin confirmación del usuario. El
enriquecimiento con IA es siempre una propuesta
que el administrador acepta, modifica o rechaza.

22.3 El Coste en Tokens y su Gestión
El proceso de enriquecimiento automático con IA
implica un consumo real de tokens del modelo de
lenguaje que tiene un coste para la infraestructura
de Onucall. Este coste es transparente para el
usuario del dashboard, que ve antes de ejecutar
el enriquecimiento una estimación del número de
tokens que consumirá la operación y su equivalente
en créditos del plan contratado.

Cada plan de Onucall incluye un número de
enriquecimientos de vehículos con IA por mes.
El plan Starter incluye diez enriquecimientos
mensuales. El plan Professional incluye cincuenta
enriquecimientos mensuales. El plan Business
incluye enriquecimientos ilimitados. Los usuarios
que necesiten más enriquecimientos de los incluidos
en su plan pueden adquirir packs adicionales como
addon de pago.

Esta gestión explícita del consumo de tokens tiene
un propósito adicional más allá del control de
costes: educa al usuario sobre el valor real de
la inteligencia artificial integrada en la
plataforma, haciendo visible que cada respuesta
del agente de voz, cada análisis del BI
Conversacional y cada enriquecimiento de ficha
tiene un coste computacional real que Onucall
gestiona de forma eficiente en nombre del
concesionario.

22.4 El Campo Annotation como Fuente del RAG
Una vez que el campo de anotación de un vehículo
ha sido completado, ya sea manualmente por el
administrador o mediante el proceso de
enriquecimiento automático con IA, su contenido
se vectoriza automáticamente y se incorpora a la
Capa 2 del sistema RAG de la organización. Esto
significa que el contenido del campo de anotación
está disponible no solo para el agente de voz
cuando gestiona llamadas sobre ese vehículo
específico, sino también para el motor de BI
Conversacional cuando el gestor hace preguntas
que requieren información detallada sobre los
vehículos del stock.

Esta integración crea un flujo virtuoso: cuanto
más completo y preciso es el campo de anotación
de cada vehículo, más preciso y útil es el agente
de voz en las llamadas y más potente es el motor
de BI Conversacional en sus respuestas. El
concesionario que invierte tiempo en mantener
bien documentado su catálogo obtiene directamente
una mejora medible en la calidad de la atención
al cliente y en la inteligencia de negocio
disponible.

23. EL SISTEMA DE CASOS DE USO
El sistema de casos de uso es el módulo de
configuración del comportamiento del agente de voz
y representa el puente técnico y operativo entre
el mundo del dashboard, donde el administrador
configura su negocio, y el mundo del agente de voz,
donde Elena necesita instrucciones concretas sobre
cómo actuar ante cada situación que puede presentarse
en una llamada real.

23.1 El Problema que Resuelve el Sistema de Casos de Uso
Cuando el administrador de un concesionario crea un
nuevo departamento en Onucall, por ejemplo el
departamento de Ventas de Vehículos Industriales y
Comerciales, ese departamento existe en la base de
datos con su calendario, sus vendedores y sus reglas
de agendamiento. Pero el agente de voz no sabe nada
de ese departamento todavía. No sabe que existe, no
sabe para qué sirve y no sabe cuándo debe derivar
a un cliente hacia él.

El sistema de casos de uso cierra esa brecha
proporcionando al administrador una interfaz para
escribir en lenguaje natural las instrucciones de
comportamiento que el agente debe seguir. Estas
instrucciones se inyectan dinámicamente en el prompt
del agente cada vez que recibe una llamada,
garantizando que el agente tiene siempre el contexto
completo y actualizado del negocio y sabe exactamente
cómo actuar ante cada tipo de situación.

23.2 Qué es un Caso de Uso
Un caso de uso en Onucall es una instrucción de
comportamiento en lenguaje natural que define cómo
debe actuar el agente cuando detecta una situación
específica durante una llamada. Cada caso de uso
tiene tres componentes fundamentales.

El disparador es la condición o situación que activa
la instrucción. Puede ser el tipo de vehículo que
menciona el cliente, el tipo de servicio que solicita,
una combinación de condiciones, o cualquier otra
señal conversacional que el administrador quiera
que el agente reconozca y a la que quiera que
responda de una manera determinada. El disparador
se describe en lenguaje natural y el LLM del agente
se encarga de reconocerlo durante la conversación
sin necesidad de palabras clave exactas.

La acción es lo que el agente debe hacer cuando
detecta el disparador. Puede ser derivar al cliente
a un departamento específico, proporcionar una
información concreta, hacer una pregunta adicional
de cualificación, mencionar una promoción vigente,
escalar la llamada a un vendedor humano disponible,
o cualquier otra instrucción de comportamiento que
el administrador quiera programar.

El departamento de destino es el departamento al
que se vincula la cita o el lead cuando el caso de
uso se activa, si la acción implica agendar una
cita o asignar el lead a un equipo específico.

23.3 Ejemplos de Casos de Uso en un Concesionario
Para ilustrar la potencia y la flexibilidad del
sistema de casos de uso, se detallan a continuación
varios ejemplos representativos de instrucciones
que el administrador de un concesionario podría
configurar.

El primer ejemplo es la derivación por tipo de
vehículo. El administrador configura el siguiente
caso de uso: si el cliente menciona que está
interesado en una furgoneta, un camión, un
semirremolque, un vehículo de carga o cualquier
vehículo de uso comercial o industrial, debes
derivarle al departamento de Ventas de Vehículos
Industriales y Comerciales para gestionar su
consulta. Desde ese momento, cada vez que un
cliente llame mencionando alguno de esos tipos
de vehículos, el agente lo deriva automáticamente
al departamento correcto sin necesidad de que el
administrador intervenga.

El segundo ejemplo es la gestión de la competencia.
El administrador configura el siguiente caso de uso:
si el cliente menciona que ha visto un vehículo
similar en el concesionario XYZ o en cualquier otro
competidor, destaca siempre nuestros tres puntos
de diferenciación principales: la garantía de
dieciocho meses incluida en todos los vehículos
de ocasión, la revisión técnica realizada por
nuestros técnicos antes de la venta, y la
posibilidad de financiación sin entrada desde el
primer día. No menciones precios de la competencia
ni hagas comparaciones directas de precio. Desde
ese momento el agente gestiona esas conversaciones
de forma consistente y alineada con la estrategia
comercial del concesionario.

El tercer ejemplo es la promoción mensual. El
administrador configura el siguiente caso de uso:
durante el mes de marzo, si el cliente pregunta
por las condiciones de financiación, infórmale de
que tenemos una promoción especial con el tres
por ciento TAE sin comisiones de apertura para
vehículos de ocasión de hasta tres años de
antigüedad. Este caso de uso es temporal y el
administrador lo desactiva al finalizar el mes
de marzo sin necesidad de modificar ninguna otra
configuración del sistema.

El cuarto ejemplo es la escalada a vendedor humano.
El administrador configura el siguiente caso de uso:
si el cliente solicita explícitamente hablar con
una persona y no con un asistente automático,
infórmale de que vamos a poner en contacto con
él a uno de nuestros especialistas en los próximos
minutos, recoge su nombre y su teléfono de contacto
si no los tenemos ya en el sistema, regístralo como
lead con solicitud de callback urgente y notifica
al vendedor disponible más próximo. Este caso de
uso garantiza que la plataforma nunca genera
fricción con los clientes que prefieren la atención
humana.

23.4 La Asistencia de IA para Crear Casos de Uso
El administrador de un concesionario no es un experto
en prompt engineering ni en inteligencia artificial.
Pedirle que escriba instrucciones técnicas precisas
para un modelo de lenguaje sería una barrera de
adopción inaceptable para un producto dirigido a
pymes del sector de la automoción.

Para eliminar esta barrera, el módulo de casos de
uso incluye un asistente de IA que ayuda al
administrador a crear instrucciones bien estructuradas
a partir de descripciones en lenguaje coloquial.
El flujo es el siguiente.

El administrador accede al módulo de casos de uso
en el dashboard y pulsa el botón de crear nuevo caso
de uso. El sistema le presenta un campo de texto
libre donde puede describir en sus propias palabras
lo que quiere que haga el agente. El administrador
escribe algo como quiero que cuando alguien llame
preguntando por motos o ciclomotores lo mande al
departamento de dos ruedas que tenemos.

El asistente de IA procesa esa descripción y genera
automáticamente un caso de uso bien estructurado
con el disparador correctamente definido (el cliente
menciona interés en motocicletas, ciclomotores,
motos de cualquier tipo, scooters o vehículos de
dos ruedas), la acción correspondiente (derivar al
departamento de Ventas de Vehículos de Dos Ruedas),
y el departamento de destino seleccionado
automáticamente si el nombre del departamento
coincide con el disponible en el sistema.

El administrador revisa la propuesta generada, puede
editarla si considera que falta algún tipo de vehículo
en el disparador o si quiere ajustar la acción, y
la activa con un clic. Desde ese momento el caso
de uso está operativo en el agente.

23.5 La Inyección Dinámica en el Prompt del Agente
Cuando el agente de voz recibe una llamada, el sistema
construye en tiempo real un prompt dinámico que
contiene toda la información que el agente necesita
para gestionar esa conversación específica. Este
prompt se compone de varias capas de información
que se ensamblan en el momento de la llamada.

La primera capa es la identidad del agente: su nombre
configurado por el concesionario, su género, su nivel
de amabilidad y sus instrucciones generales de
comportamiento.

La segunda capa es el contexto del negocio: el nombre
del concesionario, su ubicación, los departamentos
activos en ese momento con sus horarios disponibles
para los próximos días, y si la llamada proviene de
un número conocido del CRM, el resumen del historial
de ese cliente.

La tercera capa es el contexto del stock: un resumen
de los vehículos disponibles en el catálogo con sus
datos más relevantes, organizado para que el agente
pueda encontrar rápidamente los vehículos más
adecuados para cada tipo de consulta.

La cuarta y última capa son los casos de uso
configurados: todas las instrucciones de
comportamiento específicas que el administrador ha
definido para ese concesionario, presentadas en un
formato que el LLM puede interpretar y aplicar de
forma contextual durante la conversación.

El resultado es un agente que en cada llamada tiene
acceso completo al conocimiento del negocio, las
instrucciones comerciales vigentes y el historial
del cliente, y que actúa de forma coherente con la
estrategia comercial del concesionario en todo
momento.

PARTE VII: LAS INTEGRACIONES
24. INTEGRACIÓN CON RETELL AI
Retell AI es la infraestructura de inteligencia
artificial de voz sobre la que se construye el agente
de voz de Onucall. Proporciona las capacidades de
reconocimiento de voz en tiempo real, la síntesis
de voz natural de baja latencia, y el motor de
conversación que permite al agente mantener diálogos
fluidos y contextualizados en español.

24.1 Por Qué Retell AI
La elección de Retell AI como infraestructura de voz
para Onucall responde a varios factores técnicos y
operativos. Retell AI ofrece latencias de respuesta
de voz de entre setecientos y novecientos milisegundos
en condiciones óptimas, lo que es suficientemente
rápido para que la conversación se sienta natural
sin pausas incómodas que delaten la naturaleza
artificial del interlocutor. Soporta el español con
alta calidad tanto en el reconocimiento de voz como
en la síntesis, incluyendo variantes regionales y
acentos del español peninsular. Permite la
configuración de agentes mediante prompts dinámicos
que pueden actualizarse en tiempo real sin interrumpir
el servicio. Y proporciona una API completa que
permite a Onucall controlar todos los aspectos del
agente desde su propio sistema sin necesidad de que
el usuario interactúe directamente con la plataforma
de Retell AI.

24.2 El Modelo de Integración
La integración entre Onucall y Retell AI funciona
mediante la API de Retell AI, que el backend de
Onucall consume para gestionar todos los aspectos
del ciclo de vida del agente de voz de cada
concesionario.

Cuando el administrador de un concesionario configura
su agente de voz en el dashboard de Onucall por
primera vez, el sistema realiza automáticamente
una llamada a la API de Retell AI para crear un
nuevo agente con los parámetros configurados: el
nombre del agente, el modelo de voz seleccionado
según el género configurado, la velocidad y el tono
de la voz en función del nivel de amabilidad, y
el prompt inicial con la identidad base del agente.
Desde ese momento, el agente existe en la
infraestructura de Retell AI como una entidad
identificada por un identificador único que Onucall
almacena en su base de datos asociado a la
organización del concesionario.

Cada vez que el administrador modifica cualquier
aspecto de la configuración del agente en el
dashboard de Onucall, ya sea el nombre, el nivel
de amabilidad, un caso de uso o cualquier otra
instrucción, el sistema realiza automáticamente
una llamada a la API de Retell AI para actualizar
el agente correspondiente con los nuevos parámetros.
Esta actualización es instantánea y no requiere
ningún tiempo de reinicio ni de propagación. La
próxima llamada que reciba el agente ya incorporará
los cambios.

24.3 El Prompt Dinámico en Cada Llamada
La característica más importante de la integración
con Retell AI desde el punto de vista arquitectónico
es la capacidad de actualizar el prompt del agente
en el momento exacto en que comienza cada llamada,
antes de que el agente pronuncie su primer saludo.

Retell AI soporta un mecanismo denominado prompt
injection que permite al sistema externo, en este
caso el backend de Onucall, proporcionar un contexto
adicional al agente en el inicio de cada llamada
que complementa o sobreescribe parcialmente el
prompt base del agente. Onucall utiliza este
mecanismo para inyectar en cada llamada el contexto
dinámico específico de esa interacción: el estado
actual del catálogo de vehículos, los casos de uso
vigentes, la disponibilidad del calendario para
los próximos días, y si el número llamante está
en el CRM, el historial resumido de ese cliente.

Este mecanismo garantiza que el agente siempre
trabaja con información actualizada sin necesidad
de actualizar el prompt base del agente cada vez
que cambia algo en el negocio del concesionario.
El prompt base contiene la identidad y las
instrucciones permanentes del agente. El contexto
dinámico se inyecta en cada llamada con la
información más reciente.

24.4 Los Webhooks de Retell AI
Retell AI notifica a Onucall sobre los eventos
relevantes de cada llamada mediante webhooks, que
son notificaciones HTTP que Retell AI envía al
servidor de Onucall en tiempo real cuando ocurren
eventos específicos.

El webhook de inicio de llamada notifica a Onucall
que una nueva llamada ha comenzado, incluyendo el
número de teléfono del llamante y el identificador
de la llamada. Onucall responde a este webhook
con el contexto dinámico que debe inyectarse en
el prompt del agente para esa llamada específica,
incluyendo el historial del cliente si está en el
CRM, el estado del catálogo y los casos de uso
activos.

El webhook de fin de llamada notifica a Onucall
que la llamada ha terminado e incluye la
transcripción completa de la conversación, la
duración de la llamada, y el resumen generado
automáticamente por el LLM de Retell AI. Onucall
procesa este webhook para registrar el resultado
de la llamada en el sistema, crear o actualizar
el lead correspondiente en el CRM, registrar la
cita si fue agendada durante la llamada, y
desencadenar cualquier proceso automatizado que
corresponda según el resultado de la conversación.

El webhook de evento de función notifica a Onucall
cuando el agente ha ejecutado una de sus funciones
de herramienta durante la llamada, como consultar
la disponibilidad del calendario o buscar un
vehículo en el catálogo. Onucall responde a estos
webhooks con los datos solicitados por el agente
en tiempo real durante la conversación.

24.5 Las Funciones de Herramienta del Agente
Retell AI soporta un mecanismo denominado tool
calling que permite al agente de voz ejecutar
funciones externas durante la conversación para
obtener datos en tiempo real que no están en su
prompt base. Onucall define un conjunto de funciones
de herramienta que el agente puede invocar durante
las llamadas según las necesidades de la conversación.

La función de búsqueda de vehículos permite al
agente consultar el catálogo del concesionario con
parámetros específicos para encontrar vehículos
que encajen con los criterios del cliente. El agente
invoca esta función cuando el cliente describe el
tipo de vehículo que busca y necesita presentarle
las opciones disponibles del stock.

La función de consulta de disponibilidad permite
al agente obtener los slots de tiempo disponibles
para un departamento específico en un rango de
fechas determinado. El agente invoca esta función
cuando el cliente quiere concertar una cita y
necesita presentarle las opciones de horario reales.

La función de registro de cita permite al agente
confirmar y registrar en el sistema una cita que
el cliente ha acordado durante la llamada. El agente
invoca esta función cuando el cliente ha elegido
un horario y es necesario bloquear ese slot en el
calendario y crear el registro de la cita en el
sistema antes de confirmarla verbalmente al cliente.

La función de búsqueda en la Base de Conocimientos
permite al agente consultar los documentos
vectorizados cuando necesita información técnica
o documental específica que no está en su prompt
base. El agente invoca esta función cuando el
cliente hace una pregunta técnica sobre un vehículo
para la que necesita acceder al contenido de los
manuales o fichas técnicas almacenados.

La función de identificación de cliente permite
al agente consultar el CRM con el número de
teléfono del llamante para determinar si es un
cliente conocido y obtener su historial. Esta
función se ejecuta automáticamente al inicio de
cada llamada sin necesidad de que el agente la
invoque explícitamente, orquestada por n8n antes
de que la conversación comience.

25. INTEGRACIÓN CON ZADARMA
Zadarma es el proveedor de servicios de telefonía
sobre IP que proporciona los números de teléfono
que los clientes marcan para hablar con el agente
de voz de cada concesionario. La integración de
Zadarma en Onucall está diseñada para ser
completamente transparente para el usuario del
dashboard, que gestiona sus números de teléfono
directamente desde la plataforma de Onucall sin
necesidad de acceder nunca al panel de control
de Zadarma.

25.1 Por Qué Zadarma
La elección de Zadarma como proveedor de telefonía
para Onucall responde a varios factores relevantes
para el mercado español. Zadarma tiene una presencia
sólida en España con números virtuales disponibles
en todas las provincias españolas, incluyendo
prefijos locales que permiten al concesionario tener
un número con el prefijo de su ciudad, lo que genera
mayor confianza en el cliente al llamar. Zadarma
dispone de una API completa que permite gestionar
números, configurar redirecciones y acceder al
historial de llamadas de forma programática. Sus
precios son competitivos en el mercado europeo y
su infraestructura tiene alta disponibilidad con
redundancia en múltiples centros de datos.

25.2 El Proceso de Adquisición de un Número
Cuando un concesionario contrata Onucall y necesita
un número de teléfono para su agente de voz, el
proceso de adquisición y configuración del número
se realiza íntegramente desde el dashboard de Onucall
en menos de dos minutos sin necesidad de ninguna
gestión manual por parte del equipo de Onucall.

El administrador accede a la sección de configuración
del teléfono en el dashboard y selecciona la provincia
española en la que desea que el número tenga prefijo
local. El sistema muestra los números disponibles
con ese prefijo que Zadarma tiene en su inventario
en ese momento. El administrador selecciona el número
de su preferencia y confirma la adquisición.

En ese momento, el backend de Onucall ejecuta
automáticamente mediante la API de Zadarma la
adquisición del número, la configuración de la
redirección de llamadas hacia el agente de Retell
AI correspondiente a esa organización, y el registro
del número en la base de datos de Onucall asociado
a la organización del concesionario.

Desde ese momento, cualquier llamada entrante a
ese número es recibida por Zadarma, que la redirige
inmediatamente a Retell AI, que activa el agente
de voz correspondiente con el contexto dinámico
que Onucall proporciona en tiempo real.

25.3 La Gestión de Múltiples Números
Un concesionario puede tener más de un número de
teléfono activo en Onucall, lo que es especialmente
útil para los grupos empresariales con varios
concesionarios o para los concesionarios con
departamentos que tienen líneas de atención
diferenciadas. Cada número adicional se adquiere
siguiendo el mismo proceso descrito anteriormente
y puede configurarse para activar el mismo agente
o un agente con configuración diferente según las
necesidades del concesionario.

El coste de cada número adicional más allá del
incluido en el plan base se refleja como un addon
de cuarenta y nueve euros al mes por número,
que cubre tanto el coste de la línea en Zadarma
como los costes de infraestructura asociados a
la gestión de ese número adicional en el sistema.

25.4 El Historial de Llamadas y la Facturación
Zadarma proporciona a Onucall mediante su API el
historial detallado de todas las llamadas realizadas
a través de cada número, incluyendo la fecha y hora
de cada llamada, la duración, el número del llamante
y si la llamada fue contestada o no. Onucall
sincroniza periódicamente este historial mediante
n8n y lo incorpora al registro de actividad de cada
organización para que el administrador tenga
visibilidad completa sobre el volumen de llamadas
gestionadas.

La facturación de los costes de telefonía se realiza
de forma transparente: Onucall incluye en cada plan
una cantidad de minutos de llamada, y el consumo
real se calcula sobre la base del historial de
Zadarma. Los excesos sobre la cantidad incluida en
el plan se facturan al final de cada mes según las
tarifas de uso adicional indicadas en los términos
del servicio.

26. N8N COMO ORQUESTADOR DE PROCESOS
n8n es la herramienta de automatización de flujos
de trabajo que actúa como el sistema nervioso de
Onucall, coordinando todos los procesos que ocurren
en segundo plano y que son invisibles para el usuario
del dashboard pero que son esenciales para el
funcionamiento correcto y eficiente de toda la
plataforma.

26.1 Por Qué n8n
La elección de n8n como orquestador de procesos
responde a varias razones técnicas y estratégicas.
n8n es una herramienta de automatización de código
abierto que puede desplegarse en infraestructura
propia (self-hosted), lo que garantiza que los datos
del proceso nunca pasan por servidores de terceros
no controlados. Tiene conectores nativos para
Supabase, para APIs HTTP genéricas y para múltiples
servicios de comunicación incluyendo WhatsApp,
email y SMS. Su modelo de flujos visuales facilita
el mantenimiento y la modificación de los procesos
automatizados sin necesidad de modificar código de
la aplicación principal. Y su modelo de licencia
de código abierto elimina los costes de licencia
para el despliegue en infraestructura propia.

26.2 Los Flujos Principales Orquestados por n8n
El flujo de identificación del cliente al inicio
de la llamada es el proceso más crítico en términos
de latencia y uno de los más importantes para la
experiencia del cliente final. Cuando Retell AI
notifica a Onucall el inicio de una nueva llamada
mediante el webhook de inicio, n8n recibe ese evento
e inmediatamente lanza en paralelo dos operaciones.
La primera es la consulta al CRM de Onucall para
buscar el número de teléfono del llamante y obtener
su historial si existe. La segunda es la construcción
del contexto dinámico del prompt que incluye el
estado actualizado del catálogo, los casos de uso
vigentes y la disponibilidad del calendario. Ambas
operaciones se ejecutan en paralelo para minimizar
la latencia total y el resultado se devuelve a
Retell AI en tiempo real para que el agente pueda
personalizar su primer saludo si el cliente es
conocido.

El flujo de procesamiento del fin de llamada
es el proceso que transforma el resultado de una
conversación gestionada por el agente de voz en
acciones concretas en el sistema. Cuando Retell AI
notifica el fin de una llamada mediante el webhook
correspondiente, n8n recibe la transcripción
completa, la duración y el resumen generado por
el LLM, y ejecuta una secuencia de acciones según
el contenido del resumen. Si el resumen indica que
se agendó una cita, n8n verifica que el registro
de la cita fue creado correctamente en el sistema
y si no lo fue lo crea en ese momento. Si el
resumen indica que el cliente proporcionó sus datos
de contacto, n8n crea o actualiza el lead en el
CRM con esa información. Si el resultado de la
llamada activa algún caso de uso que requiere una
acción de comunicación, como el envío de un WhatsApp
de confirmación de cita, n8n ejecuta esa comunicación
a través del canal correspondiente. Y si la llamada
generó alguna notificación para el equipo del
concesionario, n8n la crea en el sistema y la envía
a los usuarios correspondientes según su rol.

El flujo de procesamiento de documentos de la
Base de Conocimientos es el proceso que convierte
un documento PDF subido por el administrador en
fragmentos vectorizados disponibles para el sistema
RAG. Cuando el administrador sube un documento
desde el dashboard, Supabase notifica a n8n mediante
un webhook que un nuevo documento ha sido añadido
al storage de la organización. n8n inicia entonces
el proceso de extracción de texto del PDF, su
división en fragmentos semánticos, la generación
de embeddings para cada fragmento mediante la API
correspondiente, y la inserción de los fragmentos
vectorizados en la tabla de chunks de la base de
datos. Al completarse el proceso, n8n actualiza
el estado del documento en la Base de Conocimientos
de disponible a procesado y genera una notificación
informativa para el administrador indicando que el
documento ya está disponible para el agente de voz y para el motor de BI Conversacional.

El flujo de envío de comunicaciones al cliente
gestiona todos los mensajes que deben enviarse a
los clientes como consecuencia de las interacciones
gestionadas por el agente de voz. El más frecuente
es el envío del WhatsApp de confirmación de cita
que el agente promete al cliente al final de la
conversación cuando una cita ha sido agendada. Este
mensaje incluye el nombre del concesionario, la
fecha y hora de la cita, el tipo de cita, la
dirección del concesionario si es una visita
presencial, el nombre del agente de voz con quien
habló el cliente, y un enlace para cancelar o
reprogramar la cita si fuera necesario. n8n gestiona
el envío de este mensaje a través de la API de
WhatsApp Business correspondiente y registra en
el historial del lead que la comunicación fue
enviada correctamente.

El flujo de sincronización del historial de
llamadas de Zadarma ejecuta periódicamente la
sincronización del historial de llamadas de Zadarma
con el registro de actividad de cada organización
en Onucall. n8n lanza esta sincronización cada
hora mediante un trigger de tiempo, consulta la
API de Zadarma para obtener las llamadas del último
período, las cruza con los registros existentes en
Onucall para identificar si hay llamadas no
registradas, y si encuentra alguna la procesa
siguiendo el mismo flujo que el webhook de fin de
llamada de Retell AI.

El flujo de detección de anomalías y bugs
empresariales analiza el contenido de cada
conversación finalizada en busca de señales que
indiquen discrepancias entre la realidad del
negocio y los datos del sistema. n8n procesa el
resumen de cada llamada buscando menciones a
vehículos que no existen en el catálogo, a precios
que no coinciden con los registrados, a servicios
no configurados en ningún departamento o a cualquier
otra señal de inconsistencia. Cuando detecta una
de estas señales, genera la notificación urgente
correspondiente y la distribuye a los administradores
según las reglas descritas en la sección de
notificaciones del sistema.

El flujo de recordatorios de tareas pendientes
revisa periódicamente las tareas programadas en
el CRM y envía notificaciones de recordatorio a
los vendedores responsables cuando una tarea está
próxima a su fecha límite o cuando ya ha vencido
sin ser completada. Este flujo ejecuta su revisión
cada treinta minutos durante el horario laboral
configurado para cada organización y garantiza
que ninguna tarea de seguimiento queda olvidada
por falta de visibilidad.

PARTE VIII: PRIVACIDAD, SEGURIDAD Y ROLES
27. MARCO LEGAL: RGPD Y LOPD-GDD
La grabación de conversaciones telefónicas y el
tratamiento de los datos personales de los clientes
que llaman al concesionario a través del agente de
voz de Onucall está sujeta en España a dos marcos
normativos que el sistema debe respetar de forma
rigurosa desde el primer día de operación.

27.1 El Reglamento General de Protección de Datos
El Reglamento General de Protección de Datos de la
Unión Europea, de aplicación directa en España,
establece los principios fundamentales que regulan
el tratamiento de datos personales. Los principios
más relevantes para el funcionamiento de Onucall
son los siguientes.

El principio de licitud, lealtad y transparencia
exige que el tratamiento de los datos del cliente
se realice de forma lícita, leal y transparente.
En el contexto de Onucall, esto implica que el
cliente debe ser informado de que la llamada está
siendo grabada antes de que la conversación comience.
El agente de voz incluye obligatoriamente en su
mensaje de bienvenida una fórmula de información
sobre la grabación de la llamada con fines de
calidad y gestión comercial. Esta fórmula no es
opcional ni configurable en ningún plan de Onucall.
Es un elemento fijo del comportamiento del agente
que no puede ser eliminado por el administrador
del concesionario.

El principio de limitación de la finalidad establece
que los datos recogidos durante la llamada solo
pueden usarse para los fines declarados en el
momento de su recogida. Los datos personales del
cliente (nombre, teléfono, intereses comerciales)
y la grabación de la llamada solo pueden usarse
para la gestión comercial del proceso de venta en
el que el cliente ha mostrado interés y para la
mejora de la calidad del servicio. No pueden usarse
para prospección no solicitada ni para cederlos
a terceros sin consentimiento explícito.

El principio de minimización de datos establece
que solo deben recogerse los datos estrictamente
necesarios para la finalidad declarada. El agente
de voz solo solicita al cliente los datos que son
necesarios para gestionar su consulta y su cita.
No solicita información que no tiene relevancia
comercial directa.

El principio de exactitud establece que los datos
deben mantenerse actualizados y ser corregidos o
eliminados cuando sean inexactos. El CRM de Onucall
permite a los vendedores y administradores actualizar
los datos de los clientes en cualquier momento.

El principio de limitación del plazo de conservación
establece que los datos no pueden conservarse
indefinidamente. Onucall implementa una política
de retención automática que elimina las grabaciones
de audio y las transcripciones literales de las
llamadas transcurrido el período de retención
configurado por el administrador, con un máximo
de noventa días por defecto y un mínimo de treinta
días. Los resúmenes generados por la IA, que no
contienen datos de voz ni transcripciones literales,
pueden conservarse durante el período que el
concesionario establezca como necesario para la
gestión comercial.

27.2 La Ley Orgánica de Protección de Datos y Garantía de los Derechos Digitales
La LOPD-GDD adapta y complementa el RGPD en el
ordenamiento jurídico español. Sus disposiciones
más relevantes para Onucall están relacionadas con
el derecho de los interesados y con las obligaciones
de los responsables y encargados del tratamiento.

En el modelo de Onucall, el concesionario es el
responsable del tratamiento de los datos de sus
clientes. Onucall actúa como encargado del
tratamiento, procesando esos datos en nombre del
concesionario para prestarle el servicio contratado.
Esta distinción tiene implicaciones contractuales
directas: Onucall debe firmar con cada concesionario
cliente un contrato de encargado del tratamiento,
denominado Data Processing Agreement o DPA, que
establece las condiciones bajo las cuales Onucall
trata los datos de los clientes del concesionario.
Este contrato forma parte de los términos de servicio
de Onucall y se acepta automáticamente al contratar
cualquier plan de la plataforma.

27.3 El Derecho de Supresión
El RGPD reconoce a los ciudadanos el derecho a
solicitar la eliminación de todos sus datos
personales en poder de una organización, conocido
como el derecho al olvido. Onucall implementa una
funcionalidad específica en el dashboard que permite
al administrador del concesionario ejercer este
derecho en nombre de un cliente cuando este lo
solicita.

Cuando el administrador activa la supresión de un
cliente desde el CRM, el sistema elimina de forma
completa y auditable todos los datos personales
del cliente incluyendo el audio de las llamadas,
la transcripción literal, el resumen generado por
la IA, los datos de contacto, el historial de
interacciones y cualquier otro dato que permita
identificar directamente a esa persona. La
eliminación es irreversible y el sistema genera
un registro de auditoría de la acción que el
administrador puede descargar como evidencia del
cumplimiento de la solicitud.

27.4 Las Sanciones de la AEPD
La Agencia Española de Protección de Datos tiene
la potestad de imponer sanciones de hasta veinte
millones de euros o el cuatro por ciento de la
facturación anual global por infracciones graves
del RGPD. Este contexto hace que el cumplimiento
normativo no sea una opción sino una obligación
operativa que Onucall asume como propia desde su
arquitectura, no como un parche posterior. El
diseño del sistema de control de acceso, las
políticas de retención automática de datos y la
funcionalidad de supresión de clientes están
implementados desde el primer día precisamente
para que el concesionario pueda demostrar el
cumplimiento normativo en cualquier momento.

28. CONTROL DE ACCESO POR ROLES
El sistema de control de acceso de Onucall define
con precisión qué información puede ver y qué
acciones puede realizar cada usuario de la
plataforma según su rol. Este sistema está diseñado
para proteger tanto la privacidad de los clientes
del concesionario como los intereses operativos
del negocio, garantizando que cada persona tiene
acceso exactamente a la información que necesita
para realizar su trabajo y no más.

28.1 Los Roles del Sistema
Administrador de Organización es el rol de
máximo nivel dentro de una organización. Corresponde
al propietario del concesionario o al director
general del grupo empresarial. Tiene acceso completo
a todos los módulos de la plataforma: puede ver
y gestionar todos los departamentos, todos los
vendedores, todos los leads y todas las citas.
Puede acceder a la analítica global de la
organización, gestionar la configuración del agente
de voz, administrar la Base de Conocimientos, y
acceder con registro de auditoría a las
transcripciones y grabaciones de las llamadas.

Administrador de Departamento es el rol de
nivel intermedio. Corresponde al responsable de
un área comercial específica del concesionario.
Tiene acceso completo a los leads, las citas y
los vendedores de su departamento. Puede asignar
leads a los vendedores de su equipo, acceder a
la analítica de su departamento, y acceder con
registro de auditoría a las transcripciones de
las llamadas gestionadas en su departamento.
No tiene acceso a los datos de otros departamentos
ni a la configuración global de la organización.

Vendedor es el rol operativo básico. Corresponde
al comercial que gestiona leads y atiende a los
clientes. Tiene acceso a su propia agenda de citas,
al Radar de Intención con los leads que le han
sido asignados o que han sido generados por el
agente de voz, y a las fichas de los leads y los
vehículos asociados a su actividad. No tiene acceso
a los datos de otros vendedores, a la configuración
del sistema ni a las grabaciones de las llamadas.

28.2 La Matriz de Acceso a los Recursos de las Llamadas
El recurso más sensible del sistema desde el punto
de vista de la privacidad y la legalidad es el
conjunto de información generado por cada llamada:
el audio grabado, la transcripción literal y el
resumen generado por la IA.

El acceso a cada uno de estos recursos está
controlado por la siguiente matriz que combina el
rol del usuario con el tipo de recurso.

El resumen generado por la IA de la llamada es
accesible para todos los roles sin restricción.
El resumen contiene exclusivamente la información
comercialmente relevante de la conversación y no
incluye datos de voz ni transcripciones literales.
Es el recurso que el vendedor consulta para
prepararse para una cita y que el administrador
usa para supervisar la calidad del agente.

La transcripción literal de la llamada es accesible
únicamente para los administradores de departamento
y de organización. Cada acceso a una transcripción
queda registrado en el log de auditoría del sistema
con la identidad del usuario que accedió, la fecha
y hora del acceso y el identificador de la llamada
consultada. Este log es descargable por el
administrador de organización para auditorías
internas o para responder a requerimientos legales.

El audio grabado de la llamada es accesible
únicamente para el administrador de organización
de forma directa. El administrador de departamento
puede solicitar acceso a un audio específico a
través de un flujo de solicitud justificada en el
que debe indicar el motivo del acceso. Esta
solicitud queda registrada en el sistema y el
acceso se concede automáticamente si la justificación
es aceptable según los criterios configurados.
En ningún caso el vendedor tiene acceso al audio
de las llamadas.

Los metadatos de la llamada como la duración, la
fecha y hora, el número del llamante enmascarado
y el resultado general de la conversación son
accesibles para todos los roles con las restricciones
de visibilidad de departamento aplicables.

29. GRABACIONES, TRANSCRIPCIONES Y RESÚMENES
La gestión correcta de los tres tipos de registro
generados por cada llamada es uno de los aspectos
más críticos de la operación de Onucall desde el
punto de vista legal, operativo y ético.

29.1 La Grabación de Audio
La grabación de audio es la representación más
fiel de la conversación real entre el agente de
voz y el cliente. Su valor operativo es alto porque
permite resolver cualquier disputa sobre qué se
dijo durante la llamada y porque puede usarse para
auditar la calidad del agente y detectar áreas de
mejora en su comportamiento conversacional.

Sin embargo, su valor operativo no justifica una
retención indefinida. Las grabaciones de audio se
almacenan en Supabase Storage en un bucket privado
con acceso controlado por las políticas de RLS.
Su retención está limitada al período configurado
por el administrador, con un máximo de noventa
días y un mínimo de treinta. Al finalizar el período
de retención, el sistema elimina automáticamente
los archivos de audio sin posibilidad de recuperación.

La eliminación automática es gestionada por un
proceso automatizado de n8n que ejecuta diariamente
una revisión de los archivos de audio almacenados
y elimina los que han superado su período de
retención. Este proceso genera un registro de
auditoría de cada archivo eliminado que queda
almacenado durante un año adicional como evidencia
del cumplimiento de la política de retención.

29.2 La Transcripción Literal
La transcripción literal es la representación
textual completa de la conversación, generada
automáticamente por el sistema de reconocimiento
de voz de Retell AI. Su valor operativo es moderado
porque contiene el mismo nivel de detalle que la
grabación de audio pero en formato textual, que
puede ser buscado y analizado de forma programática.

La transcripción literal comparte el período de
retención de la grabación de audio. Cuando la
grabación se elimina, la transcripción se elimina
simultáneamente. Ambos recursos tienen el mismo
ciclo de vida y las mismas restricciones de acceso.

29.3 El Resumen Generado por la IA

El resumen generado por la IA es el recurso de
mayor valor operativo de los tres porque sintetiza
en lenguaje natural los puntos más relevantes de
la conversación en un formato conciso y accionable
para el equipo comercial. Es el recurso que más
se consulta en el día a día del concesionario y
el que más impacto tiene en la calidad del trabajo
del vendedor.

El resumen incluye de forma estructurada los
siguientes elementos. La identificación del cliente
con los datos que haya facilitado durante la
llamada. El vehículo o vehículos por los que ha
mostrado interés con los detalles específicos
mencionados. El tipo de interacción resultante de
la llamada indicando si se agendó una cita presencial,
una cita telefónica, una solicitud de información
digital o si la llamada quedó sin compromiso
concreto. Los frenos o condicionantes identificados
durante la conversación como la necesidad de
financiación, un vehículo de entrada, una decisión
pendiente de consultar con el cónyuge o cualquier
otro factor que el cliente haya mencionado como
condicionante de su decisión de compra. El nivel
de interés estimado por el LLM durante la
conversación. Y cualquier acción pendiente que
deba ejecutarse como consecuencia de la llamada
como el envío de información adicional o la
preparación de una ficha de tasación para el
vehículo de entrada.

A diferencia de la grabación y la transcripción,
el resumen no contiene datos de voz ni transcripciones
literales de la conversación. Su contenido es
información comercial estructurada que el sistema
ha extraído de la conversación. Por este motivo,
el resumen puede conservarse durante un período
más largo que la grabación y la transcripción. El
período de retención del resumen es configurable
por el administrador de organización con un máximo
de dos años, que es el período habitual de un ciclo
de compra de vehículo en el mercado de ocasión.

29.4 El Proceso de Generación del Resumen
El resumen de cada llamada es generado automáticamente
por el LLM de Retell AI al finalizar la conversación.
Retell AI envía el resumen a Onucall mediante el
webhook de fin de llamada junto con la transcripción
completa. Onucall almacena el resumen en el registro
de la llamada en su base de datos y lo asocia al
lead correspondiente en el CRM. Este proceso es
completamente automático y ocurre en los segundos
inmediatamente posteriores al fin de la llamada,
de modo que cuando el vendedor abre el CRM a la
mañana siguiente para revisar los leads de la noche
anterior, todos los resúmenes están ya disponibles.

La calidad del resumen generado automáticamente
depende de la calidad del reconocimiento de voz
durante la llamada y de la claridad de la conversación.
En casos donde el reconocimiento de voz ha tenido
dificultades por ruido ambiental o por una
pronunciación poco clara, el resumen puede contener
imprecisiones. Por este motivo, el sistema muestra
siempre junto al resumen un indicador de confianza
que refleja la calidad del reconocimiento de voz
durante esa llamada, permitiendo al usuario valorar
adecuadamente la fiabilidad del resumen antes de
actuar sobre él.

PARTE IX: MERCADO, NEGOCIO Y FUTURO
30. ANÁLISIS COMPETITIVO
El análisis de la competencia para Onucall debe
realizarse en dos niveles diferenciados. El primer
nivel es el de los competidores directos, es decir,
las soluciones que ofrecen inteligencia artificial
de voz conversacional para el sector de venta de
vehículos en español. El segundo nivel es el de
los competidores indirectos, es decir, las
herramientas que resuelven parcialmente alguno
de los problemas que Onucall resuelve de forma
integral.

30.1 Competidores Directos
A fecha de febrero de 2026, no existe en España
ningún SaaS de agente de voz con inteligencia
artificial especializado en venta de vehículos
que combine las capacidades de atención telefónica
conversacional en español, gestión de leads,
catálogo de stock, base de conocimientos
vectorizada e inteligencia de negocio conversacional
en una única plataforma. Esta ausencia de
competencia directa especializada representa la
mayor ventaja competitiva de Onucall en el corto
plazo y define la ventana de oportunidad de entre
doce y dieciocho meses durante la cual Onucall
puede establecerse como el referente del sector
antes de que aparezcan competidores relevantes.

Las soluciones más cercanas a Onucall en el mercado
global son plataformas de agentes de voz genéricos
de origen anglosajón como Bland AI, Retell AI en
su versión de producto final dirigido a usuarios
no técnicos, Synthflow y VoiceFlow. Todas estas
soluciones presentan las mismas limitaciones para
el mercado español: están diseñadas
fundamentalmente para el inglés, carecen de
especialización sectorial en la venta de vehículos,
no incluyen CRM ni catálogo de stock, no tienen
Base de Conocimientos vectorizada y no ofrecen
inteligencia de negocio conversacional. Además,
su modelo de negocio está orientado a equipos
técnicos que construyen sus propios agentes, no
a los gestores de concesionarios medianos que
son el cliente objetivo de Onucall.

En el mercado español existe una solución denominada
Caleida Autopilot que genera leads para concesionarios
mediante inteligencia artificial, pero su enfoque
es de generación de leads salientes y no de atención
de llamadas entrantes, por lo que no compite
directamente con Onucall en el caso de uso principal
de la plataforma.

30.2 Competidores Indirectos
Los competidores indirectos son las herramientas
que los concesionarios ya utilizan hoy para resolver
parcialmente alguno de los problemas que Onucall
aborda de forma integral. Conocerlos en profundidad
es esencial tanto para el posicionamiento comercial
de Onucall como para entender las integraciones
que pueden ser relevantes en el futuro.

ApexCRM es un CRM específicamente diseñado para
concesionarios que ofrece gestión de inventario,
pipeline de ventas, publicación en portales y firma
digital. Su precio oscila entre noventa y ciento
noventa y nueve euros al mes. Resuelve la gestión
del stock y el pipeline comercial pero no ofrece
agente de voz, no tiene Base de Conocimientos ni
BI Conversacional.

MaxterAuto es un CRM para el sector del motor que
ofrece gestión de vehículos nuevos y de ocasión,
publicación en portales y gestión de leads. Su
precio oscila entre cien y doscientos euros al mes.
Tiene funcionalidades similares a ApexCRM con mayor
integración con los DMS de los concesionarios
oficiales, pero tampoco ofrece agente de voz ni
inteligencia artificial integrada.

Dealcar es una plataforma de gestión de leads y
presupuestos para concesionarios. Su precio oscila
entre ochenta y ciento cincuenta euros al mes.
Se centra en la cualificación y seguimiento de
leads pero carece de las capacidades de atención
telefónica automatizada y de inteligencia artificial
que caracterizan a Onucall.

El posicionamiento de Onucall frente a estos
competidores no es de sustitución sino de
complemento y superación. Onucall no pide al
concesionario que abandone las herramientas que
ya usa y en las que ya ha invertido tiempo de
formación. En el mediano plazo, Onucall puede
ofrecer integraciones con los CRMs sectoriales
más utilizados para que los leads captados por
el agente de voz se sincronicen automáticamente
con el sistema que el concesionario ya tiene.
En el corto plazo, el argumento es directo: Witei
y ApexCRM organizan los leads que ya tienes.
Onucall capta los leads que estás perdiendo.

31. A QUIÉN VA DIRIGIDO
31.1 El Cliente Ideal Principal
El cliente ideal principal de Onucall en su fase
de lanzamiento es el concesionario de vehículos
de ocasión independiente o multimarca de tamaño
mediano. Sus características típicas son las
siguientes. Tiene entre dos y quince personas en
el equipo comercial. Gestiona un stock activo de
entre veinte y ciento cincuenta vehículos. Publica
sus anuncios en Coches.net, AutoScout24, Wallapop
y Milanuncios de forma activa. Puede tener una
web propia básica o directamente depender de los
portales para su presencia digital. Usa WhatsApp
como principal herramienta de comunicación con
clientes y puede tener un CRM básico o trabajar
con hojas de cálculo. Ha normalizado la pérdida
de llamadas fuera de horario como algo inevitable.
Tiene entre uno y cinco años de antigüedad en el
sector y ha sobrevivido a los ciclos del mercado
con un modelo de negocio estable pero con margen
de mejora significativo en la captación y gestión
de leads. Su ubicación geográfica puede ser
cualquier capital de provincia española o ciudad
de más de cincuenta mil habitantes con actividad
económica y parque de vehículos relevante.

31.2 El Cliente Ideal Secundario
El cliente ideal secundario es el concesionario
oficial de una o varias marcas de tamaño mediano.
Sus características diferenciales respecto al
cliente principal son que tiene mayor estructura
organizativa con departamentos diferenciados de
vehículos nuevos, vehículos de ocasión y
financiación, que puede tener ya un DMS implementado
con el que Onucall deberá integrarse en el futuro,
y que su proceso de decisión de compra de nuevas
herramientas es más largo y requiere validación
por parte de más personas. Sin embargo, su volumen
de llamadas entrantes es mayor y su capacidad
de pago para herramientas de productividad es
más alta, lo que justifica planes de precio
superiores al estándar.

31.3 El Cliente Ideal Terciario
El cliente ideal terciario es el distribuidor
especializado en categorías de vehículos distintas
del turismo convencional. Incluye los distribuidores
de motocicletas y vehículos de dos ruedas, los
concesionarios de caravanas y autocaravanas, los
distribuidores de embarcaciones de recreo y motos
acuáticas, los distribuidores de maquinaria
agrícola y tractores, y los concesionarios de
camiones y vehículos industriales. Estos negocios
comparten con los concesionarios de turismos el
problema de las llamadas perdidas fuera de horario
y el valor alto por operación, pero añaden la
dimensión de la alta especialización técnica de
sus productos, que hace especialmente valioso el
módulo de Base de Conocimientos para que el agente
de voz pueda responder preguntas técnicas complejas
que en estos sectores son la norma y no la
excepción.

31.4 El Cliente que NO es el Objetivo
Los vendedores particulares sin estructura comercial,
los grandes grupos de distribución con más de
doscientos empleados que ya tienen infraestructura
tecnológica propia y call centers internos, los
concesionarios que operan exclusivamente en canales
digitales sin atención telefónica, y los negocios
de reparación y taller que no tienen actividad de
venta de vehículos no son el objetivo de Onucall
en su fase actual. Esto no significa que no puedan
usar la plataforma, sino que la propuesta de valor
de Onucall no está optimizada para sus necesidades
específicas y el proceso de venta requeriría
adaptaciones significativas que no son prioritarias
en la hoja de ruta actual.

32. QUÉ NOS HACE DIFERENTES
La diferenciación de Onucall respecto a cualquier
alternativa disponible en el mercado español se
articula en cinco dimensiones que se refuerzan
mutuamente y que en conjunto crean una propuesta
de valor que ningún competidor actual puede replicar
de forma inmediata.

32.1 La Especialización Sectorial Total
Onucall no es una herramienta genérica de
inteligencia artificial a la que se le ha añadido
una capa de personalización para el sector de la
automoción. Es una plataforma construida desde
cero para los retos operativos y comerciales
específicos de un concesionario de vehículos en
España. El agente de voz sabe qué es un vehículo
kilómetro cero, sabe qué implica la entrada de
un vehículo como parte del pago, sabe gestionar
la urgencia de un comprador de ocasión, sabe qué
preguntas hace un cliente interesado en un turismo
nuevo versus uno de ocasión, y sabe cuándo debe
escalar la conversación a un vendedor humano y
cuándo puede resolverla completamente de forma
autónoma.

32.2 La Integración Total de los Módulos
Todos los módulos de Onucall comparten la misma
base de datos en tiempo real. Cuando el agente de
voz confirma una cita durante una llamada, esa
cita aparece inmediatamente en la agenda del
vendedor asignado. Cuando el administrador actualiza
el precio de un vehículo en el catálogo, el agente
de voz usa ese nuevo precio en la próxima llamada
que reciba sobre ese vehículo. Cuando el vendedor
actualiza el estado de un lead en el CRM, el agente
de voz tiene acceso a esa actualización en la
siguiente llamada de ese cliente. Esta integración
elimina los silos de información que caracterizan
a la mayoría de los concesionarios que usan múltiples
herramientas desconectadas.

32.3 El RAG Híbrido con Documentación Propia
La capacidad de subir manuales técnicos, fichas
de equipamiento y documentación propia del
concesionario a la Base de Conocimientos y que
esa documentación quede disponible para el agente
de voz en tiempo real durante las llamadas no tiene
equivalente en ningún CRM sectorial del mercado
español. Esta capacidad convierte al agente en una
comercial que conoce técnicamente los productos
del concesionario con mayor profundidad que
cualquier vendedor humano recién incorporado al
equipo.

32.4 El BI Conversacional en Lenguaje Natural
La posibilidad de preguntar al sistema en lenguaje
natural cualquier cosa sobre el negocio y obtener
una respuesta precisa y contextualizada en segundos
no existe en ningún CRM sectorial del mercado
español a esta fecha. Los gestores de concesionarios
medianos no tienen analistas de datos, no tienen
tiempo para configurar dashboards complejos y no
tienen formación en herramientas de business
intelligence. Onucall les proporciona el equivalente
funcional de un analista de datos siempre disponible
sin ninguna de esas barreras.

32.5 El Precio Versus el Valor Entregado

La suma de las herramientas que Onucall sustituye
o complementa en un concesionario mediano supera
con creces el coste de la plataforma. Una
recepcionista o telefonista a tiempo parcial tiene
un coste de entre ochocientos y mil doscientos
euros al mes en España, sin contar la seguridad
social ni los beneficios sociales, y no puede
atender llamadas fuera de su jornada laboral. Un
CRM sectorial como ApexCRM o MaxterAuto cuesta
entre cien y doscientos euros al mes. El
mantenimiento de una web profesional con un
freelance o una agencia cuesta entre cien y
trescientos euros al mes. Un analista de datos
que pueda responder preguntas de negocio en tiempo
real costaría entre dos mil y tres mil euros al
mes incluso en régimen de consultoría externa.
La suma total de estas herramientas supera los
tres mil euros mensuales para un concesionario
que quiera cubrirlas todas. Onucall entrega una
solución integrada que las cubre todas en el plan
Professional a trescientos noventa y nueve euros
al mes.

33. MODELO DE NEGOCIO Y PRECIOS
Onucall opera bajo un modelo de negocio de
suscripción mensual recurrente con tres planes
base y un sistema de addons que permite a cada
cliente personalizar su contratación según sus
necesidades específicas.

33.1 Los Planes Base
Plan Starter a ciento noventa y nueve euros al
mes está diseñado para el vendedor de vehículos
de ocasión individual o el pequeño concesionario
con uno o dos comerciales que quiere dar el primer
paso hacia la automatización de la atención
telefónica sin comprometer un presupuesto elevado.
Incluye un agente de voz configurable con hasta
doscientas llamadas al mes, un CRM básico con
capacidad para hasta cien leads activos, un
catálogo de vehículos con hasta cincuenta unidades,
una Base de Conocimientos con hasta cinco documentos
de cinco megabytes máximo, diez enriquecimientos
de fichas de vehículos con IA al mes, el sistema
de agenda y calendario laboral completo, y el
endpoint API público del catálogo. No incluye el
BI Conversacional ni el Portal Web.

Plan Professional a trescientos noventa y nueve
euros al mes es el plan diseñado para el
concesionario mediano con entre cuatro y quince
comerciales que quiere la solución completa de
inteligencia comercial. Incluye todo lo del plan
Starter más llamadas ilimitadas, un CRM completo
sin límite de leads activos, un catálogo de
vehículos ilimitado, una Base de Conocimientos
con hasta veinticinco documentos de hasta veinte
megabytes, cincuenta enriquecimientos de fichas
con IA al mes, el módulo de BI Conversacional con
acceso completo a las tres capas del RAG híbrido,
y soporte prioritario con tiempo de respuesta
garantizado inferior a cuatro horas en días
laborables.

Plan Business a seiscientos noventa y nueve euros
al mes está diseñado para los grupos empresariales
con varios concesionarios o puntos de venta que
necesitan gestionar múltiples organizaciones desde
un único panel de control con visibilidad
consolidada. Incluye todo lo del plan Professional
más hasta cinco organizaciones simultáneas, la
capacidad de BI Conversacional entre organizaciones
que permite hacer preguntas que cruzan datos de
varios concesionarios del grupo, una Base de
Conocimientos con hasta cien documentos de hasta
cincuenta megabytes, enriquecimientos de fichas
con IA ilimitados, el Portal Web incluido para
todas las organizaciones del plan, informes
automáticos semanales generados por IA enviados
al responsable del grupo, y un SLA de soporte
con tiempo de respuesta garantizado inferior a
dos horas en días laborables y soporte de urgencia
los fines de semana para incidencias críticas.

33.2 Los Addons
Los addons son módulos opcionales de pago que
pueden añadirse sobre cualquier plan base para
personalizar la contratación según las necesidades
específicas de cada concesionario.

El addon de Portal Web a setenta y nueve euros
al mes proporciona al concesionario el módulo
completo de presencia web descrito en la sección
veinte, con subdominio automático o dominio propio,
template de diseño profesional y formulario de
contacto integrado con el CRM. Este addon ya está
incluido en el plan Business.

El addon de número de teléfono adicional a cuarenta
y nueve euros al mes por número permite al
concesionario tener más de una línea de atención
activa en la plataforma, útil para concesionarios
con varios departamentos con números diferenciados
o con puntos de venta en distintas ubicaciones.

El addon de organización adicional a ciento cuarenta
y nueve euros al mes por organización permite a
los planes Starter y Professional ampliar el número
de organizaciones gestionadas más allá de la incluida
en el plan base, sin necesidad de subir al plan
Business completo.

El addon de pack de enriquecimientos adicionales
a diecinueve euros por pack de diez enriquecimientos
permite a los usuarios que agotan su cuota mensual
de enriquecimientos de fichas con IA adquirir
capacidad adicional sin necesidad de cambiar de
plan.

33.3 La Estructura de Precios y el Mercado
La estructura de precios de Onucall está diseñada
para ser percibida como accesible por el cliente
objetivo mientras mantiene los márgenes necesarios
para la sostenibilidad del negocio. El plan
Professional a trescientos noventa y nueve euros
al mes representa aproximadamente el veinte por
ciento del coste de las herramientas que sustituye,
lo que genera un ROI percibido desde el primer mes
de uso que elimina la resistencia al precio en el
proceso de venta.

El precio del plan Starter a ciento noventa y nueve
euros al mes está deliberadamente posicionado por
encima del precio de los CRMs sectoriales básicos
del mercado, que oscilan entre ochenta y ciento
cincuenta euros al mes, para reflejar el valor
adicional del agente de voz. Sin embargo, está
suficientemente por debajo del plan Professional
para que exista una escalera de upsell natural
cuando el cliente percibe el valor de las
funcionalidades premium.

34. EL ROI PARA EL CLIENTE
El retorno sobre la inversión de Onucall para un
concesionario mediano es uno de los argumentos
comerciales más poderosos de la plataforma y el
que más eficazmente elimina la resistencia al
precio durante el proceso de venta.

34.1 El Cálculo del ROI para un Concesionario de V.O.
Un concesionario de vehículos de ocasión mediano
en España recibe según las estadísticas del sector
entre treinta y sesenta llamadas entrantes semanales,
de las cuales entre el veinte y el treinta por
ciento llegan fuera del horario comercial o cuando
todos los vendedores están ocupados y no pueden
atenderlas. Sobre un volumen de cincuenta llamadas
semanales, esto implica entre diez y quince llamadas
perdidas por semana.

Aplicando la estadística de conversión del sector,
que establece que entre el quince y el veinte por
ciento de los leads cualificados que llaman a un
concesionario terminan comprando si reciben
atención, y considerando un margen neto de
novecientos euros por vehículo de ocasión vendido
como valor central del rango de quinientos a mil
quinientos euros, el cálculo del coste de las
llamadas perdidas es el siguiente.

Sobre quince llamadas perdidas semanales, asumiendo
que el setenta por ciento son leads cualificados
reales, tenemos aproximadamente once leads
cualificados perdidos por semana. Aplicando un
quince por ciento de conversión, esto implica
que el concesionario pierde entre una y dos ventas
potenciales por semana solo por llamadas no
atendidas. A novecientos euros de margen neto por
venta, esto representa entre novecientos y mil
ochocientos euros de margen neto perdido cada
semana, o entre tres mil seiscientos y siete mil
doscientos euros al mes.

Onucall al plan Professional cuesta trescientos
noventa y nueve euros al mes. Para justificar
económicamente la inversión, Onucall solo necesita
rescatar menos de la mitad de una venta al mes,
es decir, que una sola llamada que antes se perdía
y que con Onucall se atiende y se convierte en
cita termine en venta. En la práctica, los
concesionarios que implementan sistemas de atención
telefónica automatizada reportan una recuperación
de entre el cuarenta y el sesenta por ciento de
las llamadas que antes perdían, lo que implica
que el ROI real de Onucall para un concesionario
mediano se sitúa entre el trescientos y el
seiscientos por ciento mensual.

34.2 El ROI Adicional del BI Conversacional
Más allá del ROI directo de las llamadas rescatadas,
el módulo de BI Conversacional aporta un ROI
adicional difícil de cuantificar pero igualmente
real. El gestor del concesionario que puede
identificar en segundos los vehículos que llevan
demasiado tiempo en el stock puede ajustar su
estrategia de precios o de promoción para acelerar
su rotación, evitando la depreciación progresiva
del vehículo. El que puede ver en tiempo real qué
modelos generan más interés puede optimizar sus
decisiones de compra de stock futuro. El que puede
comparar el precio de sus vehículos con el mercado
de su zona puede identificar vehículos sobrepreciados
que están frenando ventas o infrapreciados que
están dejando margen sobre la mesa. Cada una de
estas mejoras en la toma de decisiones tiene un
impacto económico real que se acumula mes a mes.

35. PROYECCIÓN FINANCIERA
La proyección financiera de Onucall se basa en
los datos reales del mercado accesible de
concesionarios en España, en el análisis de los
patrones de adopción de SaaS verticales en mercados
similares, y en un modelo de crecimiento conservador
que no asume publicidad pagada ni equipo de ventas
externo en los primeros doce meses.

35.1 El Mercado Accesible
El mercado accesible de Onucall en España, aplicando
los filtros de tamaño mínimo de negocio, presencia
digital activa y volumen de llamadas suficiente
para que el ROI sea visible, se estima en
aproximadamente once mil puntos de venta de
vehículos activos entre todas las categorías de
vehículos descritas en la sección dos de este
documento. Andalucía, por ser la comunidad autónoma
con mayor volumen de venta de vehículos de ocasión
de España, representa aproximadamente el dieciocho
por ciento de ese mercado accesible, lo que supone
alrededor de dos mil potenciales clientes en el
entorno geográfico más próximo al equipo fundador.

35.2 Los Hitos Financieros Proyectados
El primer hito crítico es el break-even operativo,
es decir, el momento en que los ingresos mensuales
recurrentes superan los costes fijos de
infraestructura de la plataforma. Considerando
unos costes de infraestructura de aproximadamente
tres mil quinientos euros al mes para los primeros
cien clientes, que incluyen Supabase, Retell AI,
Zadarma, n8n auto-hospedado, dominios y herramientas
de desarrollo, el break-even se alcanza con
aproximadamente nueve clientes en el plan
Professional a trescientos noventa y nueve euros
al mes. Este hito es alcanzable en el tercer o
cuarto mes de operación con una estrategia de
venta directa activa en el mercado andaluz.

El segundo hito es alcanzar un ingreso mensual
recurrente que permita al fundador dedicarse a
tiempo completo al negocio sin necesidad de
ingresos alternativos. Con cuarenta clientes a
un ticket medio de doscientos ochenta euros al
mes, el MRR es de once mil doscientos euros y el
beneficio neto mensual tras costes de infraestructura
se sitúa en torno a siete mil setecientos euros,
equivalente a un salario neto anual de
aproximadamente noventa y dos mil euros. Este
hito es alcanzable entre el quinto y el séptimo
mes con una cadencia de captación de entre seis
y ocho nuevos clientes por mes.

La tabla de proyección financiera detallada por
mes es la siguiente.

En el mes uno el objetivo es incorporar los dos
primeros clientes pagando, generando un MRR de
quinientos euros y un beneficio neto negativo de
menos tres mil euros por los costes de
infraestructura.

En el mes dos el objetivo es llegar a seis clientes,
generando un MRR de mil quinientos euros y un
beneficio neto negativo de menos dos mil euros.

En el mes tres el objetivo es llegar a doce clientes,
generando un MRR de dos mil novecientos euros y
un beneficio neto negativo de menos seiscientos
euros.

En el mes cuatro el objetivo es llegar a diecinueve
clientes, generando un MRR de cuatro mil setecientos
euros y un beneficio neto positivo de mil doscientos
euros. Este es el primer mes en positivo.

En el mes seis el objetivo es llegar a cuarenta
clientes entre Onucars y Onucall, generando un
MRR de diez mil setecientos euros y un beneficio
neto de siete mil doscientos euros mensuales.

En el mes doce el objetivo es llegar a ciento
treinta y cinco clientes entre ambas plataformas,
generando un MRR de treinta y ocho mil seiscientos
euros y un beneficio neto de treinta y tres mil
euros mensuales.

En el mes veinticuatro el objetivo es llegar a
cuatrocientos cincuenta clientes, generando un
MRR de ciento sesenta mil euros y un beneficio
neto de ciento cincuenta y cuatro mil euros
mensuales, con una valoración estimada del negocio
aplicando el múltiplo estándar de cinco veces el
ARR de aproximadamente nueve millones seiscientos
mil euros.

En el mes treinta y seis el objetivo es llegar a
ochocientos cincuenta clientes entre todas las
plataformas y verticales activos, generando un
MRR de trescientos cincuenta y dos mil euros y
un beneficio neto de trescientos cuarenta y cuatro
mil euros mensuales, con una valoración estimada
del negocio de aproximadamente veintiún millones
de euros.

36. RIESGOS Y MITIGACIONES
36.1 Riesgo de Entrada de un Competidor Grande
La mayor amenaza para Onucall en el mediano plazo
es que un actor grande del sector, ya sea un portal
de anuncios como Coches.net o AutoScout24, o un CRM
sectorial establecido como ApexCRM o MaxterAuto,
decida integrar un agente de voz en su plataforma
existente y lance una solución competidora
aprovechando su base de clientes actual.

La probabilidad de que esto ocurra en el corto
plazo es media. Los grandes actores del sector
suelen moverse con lentitud en la adopción de
nuevas tecnologías y sus ciclos de desarrollo de
producto son de entre doce y veinticuatro meses
desde la decisión de construir hasta el lanzamiento
de una funcionalidad nueva. Esto da a Onucall una
ventana de entre uno y dos años para establecer
una base de clientes sólida y una reputación en
el sector antes de que la competencia llegue.

La mitigación principal contra este riesgo es la
velocidad de ejecución en los primeros meses y
la profundidad de la especialización. Un portal
de anuncios que añade un agente de voz genérico
a su plataforma no puede competir con la
profundidad funcional de Onucall, que combina
agente de voz, CRM, Base de Conocimientos, BI
Conversacional y Portal Web en una plataforma
diseñada específicamente para el sector. La
especialización profunda es la mejor defensa
frente a los competidores con mayor escala pero
menor foco.

La segunda mitigación es la construcción activa
de efectos de red. Cuanto más tiempo lleva un
concesionario usando Onucall, más datos históricos
tiene en el sistema, más completa es su Base de
Conocimientos y más preciso es el BI Conversacional.
Este efecto de acumulación de valor con el tiempo
genera costes de cambio reales que hacen más
difícil que un cliente satisfecho abandone la
plataforma por una alternativa nueva aunque sea
de un competidor con mayor reconocimiento de marca.

36.2 Riesgo de Resistencia Cultural del Sector
El sector de la venta de vehículos en España tiene
una cultura comercial arraigada en las relaciones
personales y en la venta presencial. Algunos
gestores de concesionarios pueden percibir el
agente de voz como una amenaza a la calidad del
trato personal que consideran su principal ventaja
competitiva, o pueden desconfiar de que una
inteligencia artificial pueda gestionar con eficacia
las conversaciones complejas que implica la venta
de un vehículo.

La probabilidad de encontrar esta resistencia es
alta, especialmente entre los gestores de mayor
edad o con menor exposición a herramientas
tecnológicas. Sin embargo, su impacto real es
limitado porque la demostración en vivo del producto
es el argumento más efectivo para superarla.

La mitigación principal es el proceso de demostración
comercial. Mostrarle al gestor del concesionario
en una llamada de cinco minutos cómo el agente
de voz atiende una llamada de prueba, responde
preguntas sobre un vehículo concreto del catálogo
y agenda una cita es infinitamente más persuasivo
que cualquier presentación de PowerPoint o
argumento verbal. La demostración en vivo elimina
la abstracción y hace tangible el valor del producto
de forma inmediata.

La segunda mitigación es el encuadre correcto del
producto en el discurso de venta. Onucall no
sustituye al vendedor humano. Onucall capta los
leads que el vendedor hubiera perdido por estar
ocupado, fuera de horario o de vacaciones, y los
entrega al vendedor cualificados y con toda la
información necesaria para que la conversación
humana sea más eficiente y tenga más probabilidades
de cerrar.

36.3 Riesgo de Costes de Infraestructura Crecientes
El coste de la infraestructura de Onucall, que
incluye los costes de los modelos de lenguaje por
token consumido, los costes de la infraestructura
de voz de Retell AI, los costes de las líneas
telefónicas de Zadarma y los costes de almacenamiento
y procesamiento de Supabase, crece con el volumen
de uso de la plataforma. Si el crecimiento del
número de clientes y del volumen de llamadas supera
las proyecciones iniciales, los costes de
infraestructura pueden crecer más rápido que los
ingresos, comprometiendo los márgenes.

La probabilidad de que este riesgo se materialice
es baja en las fases iniciales porque los límites
de uso de cada plan están diseñados para que el
coste de infraestructura por cliente sea siempre
inferior al veinte por ciento del precio del plan.
Sin embargo, a medida que la plataforma crece y
el volumen de procesamiento de LLM aumenta, es
necesario monitorizar activamente los costes de
infraestructura y ajustar los precios o los límites
de uso de los planes si los márgenes se comprimen
por debajo del umbral de sostenibilidad.

La mitigación principal es la monitorización
proactiva del coste por cliente con alertas
automáticas que notifiquen al equipo fundador cuando
el coste de infraestructura de un cliente específico
supere el umbral definido para su plan. Esta
monitorización permite identificar clientes de
alto consumo que pueden necesitar un plan superior
antes de que su coste de servicio erosione
significativamente los márgenes.

36.4 Riesgo de Churn Elevado
El churn o tasa de cancelación de suscripciones
es el factor más determinante para la sostenibilidad
financiera de cualquier SaaS a largo plazo. Un
churn mensual del tres por ciento implica que en
un año se pierde aproximadamente el treinta y seis
por ciento de la base de clientes, lo que obliga
a captar continuamente nuevos clientes solo para
mantener el nivel de ingresos, sin crecer.

La probabilidad de un churn elevado en los primeros
meses es media porque los nuevos clientes que no
ven resultados rápidos tienden a cancelar antes
de los tres meses. La mitigación principal es un
proceso de onboarding estructurado y activo que
garantice que cada nuevo cliente tiene el agente
configurado correctamente, el catálogo de vehículos
al día y los primeros casos de uso funcionando en
menos de cuarenta y ocho horas desde la contratación.
El objetivo del onboarding es que el cliente vea
el agente atender su primera llamada real y generar
su primer lead en el CRM dentro de la primera
semana de uso. Ese momento de valor inicial es el
que más eficazmente reduce el churn en los primeros
meses.

La segunda mitigación es el dashboard de ROI visible
que permite al cliente ver en cualquier momento
cuántas llamadas ha gestionado el agente, cuántos
leads ha captado y cuántas citas ha agendado. Cuando
el cliente puede ver directamente en el dashboard
que el agente gestionó quince llamadas el fin de
semana mientras el concesionario estaba cerrado
y de esas quince generó cuatro citas para la semana
siguiente, la decisión de mantener la suscripción
es trivial.

37. HOJA DE RUTA
La hoja de ruta de Onucall se estructura en cuatro
fases que cubren los primeros treinta y seis meses
desde el lanzamiento del producto. Cada fase tiene
objetivos de producto, objetivos comerciales y
objetivos de infraestructura claramente definidos.

37.1 Fase 1: MVP y Validación (Meses 1 a 4)
El objetivo principal de esta fase es construir
el producto mínimo viable de Onucall con las
funcionalidades esenciales para demostrar el valor
de la plataforma a los primeros clientes reales
y obtener feedback que permita iterar antes de
escalar.

Las funcionalidades del MVP incluyen el agente de
voz configurable con nombre, género y nivel de
amabilidad, el catálogo de vehículos con los campos
esenciales y el control de estados, el CRM básico
con el pipeline Kanban y la ficha de lead, el
sistema de calendarios laborales con los tres
niveles jerárquicos y el motor de disponibilidad,
el módulo de casos de uso con el asistente de IA
para su creación, la integración completa con
Retell AI y Zadarma mediante la API de ambas
plataformas, los flujos principales de n8n incluyendo
la identificación del cliente al inicio de la
llamada y el procesamiento del fin de llamada, y
el sistema de notificaciones básico con los niveles
de urgencia definidos.

El objetivo comercial de esta fase es alcanzar
entre quince y veinte clientes pagando, concentrados
en el mercado andaluz donde la proximidad geográfica
facilita las demostraciones presenciales y el
soporte inicial. La estrategia de captación es
la venta directa mediante prospección telefónica
y visitas presenciales a concesionarios del entorno
de Huelva, Sevilla, Cádiz y Málaga.

37.2 Fase 2: Crecimiento y Segunda Marca (Meses 5 a 12)
El objetivo principal de esta fase es consolidar
el crecimiento de Onucall para el sector de
vehículos, incorporar las funcionalidades de mayor
valor diferencial que no estaban en el MVP, y
lanzar la segunda marca comercial Onucall para
el sector inmobiliario aprovechando el mismo motor
técnico.

Las funcionalidades incorporadas en esta fase
incluyen el módulo completo de Base de Conocimientos
con procesamiento automático de PDFs y vectorización,
el módulo de BI Conversacional con las tres capas
del RAG híbrido, el campo de anotación de vehículos
con el botón de enriquecimiento automático con IA,
el modo de asignación autónoma del motor de
agendamiento, el Radar de Intención con todas las
funcionalidades de clasificación y seguimiento de
leads, y el addon del Portal Web.

El objetivo comercial de esta fase es alcanzar
ciento treinta y cinco clientes totales entre
ambas plataformas al final del mes doce, con un
MRR de treinta y ocho mil euros y un beneficio
neto mensual de treinta y tres mil euros.

37.3 Fase 3: Consolidación Nacional (Meses 13 a 24)
El objetivo principal de esta fase es expandir la
presencia de Onucall a nivel nacional, especialmente
en los mercados de Madrid, Cataluña y la Comunidad
Valenciana, y añadir las integraciones con los
DMS y CRMs sectoriales más utilizados para facilitar
la adopción en los concesionarios oficiales medianos
que ya tienen infraestructura tecnológica propia.

Las funcionalidades incorporadas en esta fase
incluyen las integraciones con los principales
portales de anuncios para sincronización automática
del catálogo de vehículos, las integraciones con
los DMS más utilizados en el sector, la analítica
avanzada de rendimiento comercial por departamento
y por vendedor, los informes automáticos generados
por IA para administradores de organización, y
la funcionalidad de cross-organización del BI
Conversacional para los grupos empresariales del
plan Business.

El objetivo comercial de esta fase es alcanzar
cuatrocientos cincuenta clientes totales al final
del mes veinticuatro con un MRR de ciento sesenta
mil euros y una valoración estimada del negocio
de aproximadamente nueve millones seiscientos mil
euros.

37.4 Fase 4: Liderazgo y Expansión de Verticales (Meses 25 a 36)
El objetivo principal de esta fase es consolidar
a Onucall como el referente indiscutible de la
inteligencia comercial con IA de voz para el sector
de la venta de vehículos en España, y abrir los
verticales de abogados y despachos y de clínicas
médicas como nuevas líneas de negocio construidas
sobre el mismo motor técnico con prompts y módulos
específicos para cada sector.

Las funcionalidades incorporadas en esta fase
incluyen los módulos específicos para los nuevos
verticales, la funcionalidad de multiidioma del
agente de voz para concesionarios en zonas
turísticas con alta afluencia de clientes
extranjeros, el sistema de valoración automática
de vehículos que cruzará los datos del catálogo
con las fuentes de precios de mercado para sugerir
al administrador el precio óptimo de venta de cada
vehículo basándose en los precios actuales del
mercado en su zona geográfica, y el módulo de
automatización de campañas de reactivación de
leads fríos que utilizará el historial del CRM
para identificar clientes con potencial de recompra
y generar comunicaciones personalizadas para
reactivar su interés.

El objetivo comercial de esta fase es alcanzar
ochocientos cincuenta clientes totales al final
del mes treinta y seis, con un MRR de trescientos
cincuenta y dos mil euros y una valoración estimada
del negocio de aproximadamente veintiún millones
de euros.

38. CONCLUSIÓN
Onucall no es un producto más en el mercado de
herramientas para concesionarios. Es la primera
plataforma de inteligencia comercial conversacional
diseñada desde cero para el sector de la venta de
vehículos en España, que resuelve de forma integral
los tres problemas más costosos que enfrenta
cualquier concesionario mediano: las llamadas
perdidas fuera de horario, la falta de continuidad
operativa cuando el equipo humano no está disponible,
y la ausencia de inteligencia de negocio en tiempo
real para tomar decisiones comerciales informadas.

La arquitectura técnica de la plataforma está
construida sobre las tecnologías más robustas y
eficientes disponibles en 2026: Supabase y
PostgreSQL como capa de datos con soporte nativo
para vectores mediante pgvector, Qwik como framework
de frontend con rendimiento máximo, Retell AI como
infraestructura de voz de baja latencia en español,
Zadarma como proveedor de telefonía con presencia
en todas las provincias españolas, y n8n como
orquestador de procesos automatizados con despliegue
en infraestructura propia. Esta arquitectura
garantiza la escalabilidad, la seguridad multi-tenant
y la eficiencia operativa necesarias para crecer
desde los primeros veinte clientes hasta los
ochocientos cincuenta proyectados en el mes treinta
y seis sin necesidad de rediseñar ningún componente
fundamental del sistema.

La propuesta de valor de Onucall se puede resumir
en una sola frase que cualquier gestor de
concesionario entiende inmediatamente: ninguna
llamada vuelve a perderse, el agente conoce cada
coche del stock mejor que cualquier vendedor, y
el gestor puede preguntar cualquier cosa sobre
su negocio en lenguaje natural y obtener la
respuesta en segundos.

El mercado está preparado. El sector de la automoción
español tiene el ochenta y uno por ciento de sus
concesionarios dispuestos a invertir en inteligencia
artificial. La competencia directa en español
prácticamente no existe. La ventana de oportunidad de entre doce y dieciocho
meses sin competencia relevante está abierta ahora
mismo. Y la arquitectura técnica, la estrategia
de producto y el modelo de negocio están definidos
con el nivel de detalle necesario para ejecutar
sin ambigüedades desde el primer día.

Lo único que falta es escribir la primera línea
de código de Onucall.

***

## APÉNDICES

***

### APÉNDICE A: GLOSARIO DE TÉRMINOS

**Agente de Voz:** Sistema de inteligencia artificial
que mantiene conversaciones telefónicas naturales
en lenguaje humano, capaz de entender el contexto,
responder preguntas y ejecutar acciones como
consultar bases de datos o agendar citas.

**ARR (Annual Recurring Revenue):** Ingreso anual
recurrente. Métrica financiera de los negocios
de suscripción que representa la suma de todos
los ingresos mensuales recurrentes multiplicada
por doce.

**Base de Conocimientos:** Repositorio de documentos
técnicos y comerciales del concesionario que se
vectoriza automáticamente y queda disponible para
el agente de voz y el motor de BI Conversacional.

**BI Conversacional:** Módulo de inteligencia de
negocio que permite al gestor del concesionario
interrogar los datos de su negocio en lenguaje
natural sin necesidad de conocimientos técnicos
ni de informes predefinidos.

**Buffer:** Tiempo de margen entre citas consecutivas
en el calendario de un departamento. Se usa para
permitir al vendedor prepararse para el siguiente
cliente o para que un recurso compartido como un
vehículo de demostración esté disponible para la
siguiente cita.

**Callback:** Tipo de cita en la que un vendedor
del concesionario se compromete a llamar al cliente
en una franja horaria acordada.

**Churn:** Tasa de cancelación de suscripciones
en un período determinado. Expresada en porcentaje
mensual, indica qué proporción de los clientes
activos cancela su suscripción cada mes.

**CRM (Customer Relationship Management):** Sistema
de gestión de relaciones con clientes. En Onucall,
el módulo que centraliza todos los leads, sus
interacciones y su avance en el proceso de venta.

**DMS (Dealer Management System):** Sistema de
gestión integral para concesionarios que incluye
gestión de inventario, taller, recambios y
contabilidad. Es el sistema de back-office estándar
de los concesionarios oficiales.

**Double Booking:** Situación en la que dos clientes
reservan simultáneamente el mismo slot de tiempo
en el calendario de un recurso. Onucall previene
esta situación mediante bloqueo transaccional en
PostgreSQL.

**Embedding:** Representación numérica vectorial
de un fragmento de texto que captura su significado
semántico en un espacio matemático de alta
dimensionalidad. Se usa en el sistema RAG para
encontrar fragmentos de documentos semánticamente
similares a una consulta.

**Fallback Jerárquico:** Mecanismo del sistema de
Onucall que garantiza que cuando la persona o
recurso principal no está disponible para gestionar
una interacción, el sistema escala automáticamente
al siguiente nivel de la jerarquía para garantizar
que ninguna llamada quede sin atender.

**ISODOW:** Estándar de numeración de los días de
la semana en PostgreSQL donde el 1 corresponde
al lunes y el 7 al domingo. Usado en el motor de
calendario de Onucall para convertir fechas en
días de la semana sin almacenar los 365 días del
año.

**Jerarquía Excluyente:** Principio de diseño del
sistema de calendarios de Onucall que establece
que ningún nivel inferior de la jerarquía puede
superar los límites establecidos por un nivel
superior. El calendario de la organización es el
techo absoluto que ningún departamento ni vendedor
puede sobrepasar.

**Lead:** Persona que ha tenido algún tipo de
contacto con el concesionario y que representa
una oportunidad comercial potencial, independientemente
de su nivel de intención de compra en el momento
del contacto.

**LLM (Large Language Model):** Modelo de lenguaje
de gran escala. Sistema de inteligencia artificial
entrenado en grandes volúmenes de texto que puede
generar, comprender y razonar sobre el lenguaje
natural. Es el cerebro del agente de voz y del
motor de BI Conversacional de Onucall.

**LOPD-GDD:** Ley Orgánica 3/2018 de Protección
de Datos Personales y Garantía de los Derechos
Digitales. Normativa española que adapta y
complementa el RGPD en el ordenamiento jurídico
nacional.

**MRR (Monthly Recurring Revenue):** Ingreso mensual
recurrente. Suma de todas las suscripciones activas
en un mes determinado. Es la métrica financiera
principal para evaluar el crecimiento de un SaaS.

**Multi-Tenant:** Arquitectura de software en la
que una única instancia de la aplicación sirve
simultáneamente a múltiples clientes (tenants)
manteniendo sus datos completamente aislados entre
sí. Onucall usa esta arquitectura con Row Level
Security en Supabase para garantizar el aislamiento
de datos entre concesionarios.

**n8n:** Herramienta de automatización de flujos
de trabajo de código abierto que actúa como
orquestador de todos los procesos automatizados
de Onucall. Se despliega en infraestructura propia
para garantizar que los datos del proceso no pasan
por servidores de terceros no controlados.

**Onboarding:** Proceso de incorporación de un
nuevo cliente a la plataforma. Incluye la
configuración inicial del agente de voz, la carga
del catálogo de vehículos, la configuración de
los departamentos y los casos de uso, y la
verificación de que el sistema está funcionando
correctamente antes de considerarlo operativo.

**pgvector:** Extensión de PostgreSQL que permite
almacenar y consultar vectores de alta dimensionalidad
directamente en la base de datos relacional.
Elimina la necesidad de una base de datos vectorial
externa para el sistema RAG de Onucall.

**Pipeline:** Representación visual del proceso
de venta como una secuencia de fases por las que
avanza cada lead desde el primer contacto hasta
el cierre de la operación o el descarte.

**Prompt:** Instrucciones en lenguaje natural que
se proporcionan a un modelo de lenguaje para
definir su comportamiento, su identidad y el
contexto en el que debe operar. En Onucall, el
prompt del agente de voz es dinámico y se construye
en tiempo real al inicio de cada llamada.

**Prompt Injection:** Mecanismo de Retell AI que
permite a Onucall inyectar contexto adicional y
dinámico en el prompt del agente al inicio de cada
llamada, sin necesidad de modificar el prompt base
del agente.

**RAG (Retrieval Augmented Generation):** Arquitectura
de inteligencia artificial que combina la capacidad
generativa de un LLM con la recuperación de
información relevante de fuentes externas antes
de generar cada respuesta. Garantiza que el sistema
responde basándose en datos reales y actualizados
en lugar de en el conocimiento estático del modelo.

**Radar de Intención:** Espacio del dashboard de
Onucall donde se gestionan los leads que han
mostrado señales de interés en la compra de un
vehículo pero que no han concretado ningún
compromiso de interacción con fecha específica.
Complementa la Agenda del vendedor con una vista
de las oportunidades comerciales en curso que
requieren seguimiento proactivo.

**RGPD:** Reglamento General de Protección de Datos
de la Unión Europea. Marco normativo de aplicación
directa en España que establece los principios
y obligaciones para el tratamiento de datos
personales.

**RLS (Row Level Security):** Mecanismo de seguridad
de PostgreSQL que permite definir políticas de
acceso a los datos a nivel de fila, garantizando
que cada usuario o tenant solo puede acceder a
los datos que le corresponden según las reglas
definidas.

**Round Robin:** Algoritmo de asignación equitativa
que distribuye las nuevas citas o leads de forma
rotativa entre todos los vendedores disponibles,
garantizando que la carga de trabajo se reparte
de forma justa sin favorecer ni perjudicar a ningún
miembro del equipo.

**RPC (Remote Procedure Call):** Función almacenada
en la base de datos de Supabase que puede ser
invocada remotamente por el cliente como si fuera
un endpoint de API. Onucall usa RPCs para encapsular
la lógica de cálculo de disponibilidad y registro
de citas directamente en PostgreSQL, minimizando
la latencia y el tráfico de red.

**SaaS (Software as a Service):** Modelo de negocio
de software en el que el producto se ofrece como
un servicio de suscripción accesible a través de
internet, sin necesidad de instalación local.

**Slot:** Bloque de tiempo disponible en el calendario
de un departamento o vendedor que puede ser ofrecido
al cliente para agendar una cita. Se calcula
automáticamente por el motor de disponibilidad
de Onucall en función del horario laboral, las
excepciones y las citas ya confirmadas.

**Text-to-SQL:** Mecanismo de traducción de consultas
en lenguaje natural a queries SQL que el LLM de
Onucall ejecuta internamente para responder
preguntas sobre los datos estructurados del negocio
sin necesidad de que el usuario conozca el lenguaje
de consulta de bases de datos.

**Tool Calling:** Mecanismo de Retell AI que permite
al agente de voz invocar funciones externas durante
la conversación para obtener datos en tiempo real.
Onucall define un conjunto de funciones de
herramienta que el agente puede invocar según las
necesidades de cada conversación.

**Vectorización:** Proceso de conversión de un
fragmento de texto en su representación vectorial
numérica mediante un modelo de embeddings. Los
vectores resultantes se almacenan en la base de
datos y se usan para la búsqueda semántica por
similitud en el sistema RAG.

**V.N. (Vehículo Nuevo):** Vehículo que nunca ha
sido matriculado y que se vende directamente desde
el concesionario oficial de la marca con todas
las garantías del fabricante.

**V.O. (Vehículo de Ocasión):** Vehículo que ha
sido previamente matriculado y usado por uno o
más propietarios antes de su venta por un
concesionario o un particular.

**Webhook:** Mecanismo de notificación HTTP en el
que un sistema externo envía automáticamente una
notificación al servidor de Onucall cuando ocurre
un evento específico, como el inicio o el fin de
una llamada en Retell AI.

***

### APÉNDICE B: STACK TECNOLÓGICO COMPLETO

| Componente | Tecnología | Versión | Rol en el Sistema |
| :--- | :--- | :--- | :--- |
| Frontend y Dashboard | Qwik + QwikCity | Última estable | SSR, routing, componentes UI |
| Estilos | Tailwind CSS | v4 | Sistema de diseño |
| Backend y Base de Datos | Supabase | Cloud | Auth, DB, Storage, RPCs, RLS |
| Motor de Base de Datos | PostgreSQL | 16+ | Datos relacionales y vectoriales |
| Búsqueda Vectorial | pgvector | 0.7+ | Embeddings y búsqueda semántica |
| Infraestructura de Voz | Retell AI | API v2 | Agente de voz conversacional |
| Telefonía | Zadarma | API REST | Números de teléfono y VoIP |
| LLM Principal | Claude 3.5 Sonnet | API | Razonamiento y generación |
| LLM Alternativo | GPT-4o | API | Respaldo y comparación |
| Embeddings | text-embedding-3-small | API OpenAI | Vectorización de documentos |
| Automatización | n8n | Self-hosted | Orquestación de procesos |
| Lenguaje Principal | TypeScript | 5+ | Frontend y Edge Functions |
| Lenguaje de BD | SQL / PL/pgSQL | PostgreSQL | RPCs y lógica de negocio en BD |
| Despliegue Frontend | Vercel o Fly.io | — | Hosting serverless |
| Almacenamiento de Archivos | Supabase Storage | — | Audios, PDFs, fotos de vehículos |

***

### APÉNDICE C: ESTRUCTURA DE ROLES Y PERMISOS

| Recurso | Vendedor | Admin Dpto. | Admin Org. |
| :--- | :--- | :--- | :--- |
| Su propia agenda | Lectura y escritura | Lectura y escritura | Lectura y escritura |
| Agenda de otros vendedores de su dpto. | No | Lectura | Lectura |
| Radar de Intención (leads propios) | Lectura y escritura | Lectura y escritura | Lectura y escritura |
| Leads de otros vendedores de su dpto. | No | Lectura y escritura | Lectura y escritura |
| Leads de otros departamentos | No | No | Lectura y escritura |
| Catálogo de vehículos (precios públicos) | Lectura | Lectura y escritura | Lectura y escritura |
| Catálogo de vehículos (precio de coste) | No | Lectura | Lectura y escritura |
| Base de Conocimientos | Lectura | Lectura y escritura | Lectura y escritura |
| BI Conversacional | Limitado (datos propios) | Completo (su dpto.) | Completo (toda la org.) |
| Resumen IA de llamadas | Sí | Sí | Sí |
| Transcripción literal de llamadas | No | Sí (con registro) | Sí (con registro) |
| Audio grabado de llamadas | No | Solicitud justificada | Sí (con registro) |
| Configuración del agente de voz | No | No | Lectura y escritura |
| Casos de uso | No | No | Lectura y escritura |
| Configuración de departamentos | No | Lectura | Lectura y escritura |
| Configuración de calendarios | Su propio calendario | Calendario de su dpto. | Todos los calendarios |
| Gestión de vendedores | No | Su departamento | Toda la organización |
| Notificaciones urgentes | No recibe | Recibe las de su dpto. | Recibe todas |
| Facturación y plan | No | No | Lectura y escritura |
| Supresión de clientes (RGPD) | No | No | Sí |

***

### APÉNDICE D: ESTADO ACTUAL DEL DOCUMENTO

Este documento es un White Paper vivo que se
actualiza de forma continua a medida que el
producto evoluciona y se completa el ciclo de vida
de Onucall. Las secciones marcadas como pendientes
en el índice serán completadas en versiones
posteriores de este documento a medida que los
componentes correspondientes del producto sean
diseñados, desarrollados y validados con clientes
reales.

Las secciones actualmente completadas cubren el
contexto de mercado, la definición del problema,
la descripción completa de la solución, la
arquitectura del sistema de calendarios y
agendamiento, la gestión de leads y citas, todos
los módulos del producto, la arquitectura RAG
híbrida, el sistema de casos de uso, las
integraciones con Retell AI y Zadarma, el marco
legal de privacidad y protección de datos, el
control de acceso por roles, el análisis competitivo,
el modelo de negocio y precios, el ROI para el
cliente, la proyección financiera, los riesgos y
mitigaciones, y la hoja de ruta a treinta y seis
meses.

Las secciones que serán incorporadas en versiones
futuras de este documento incluyen:

- La documentación técnica detallada de la API
  pública de Onucall para integraciones externas
  con DMS, portales de anuncios y CRMs sectoriales.
- El manual de configuración del proceso de
  onboarding para nuevos clientes, incluyendo
  los pasos exactos desde la contratación hasta
  la primera llamada gestionada por el agente.
- Los playbooks de ventas con los argumentarios
  completos, las respuestas estructuradas a las
  objeciones más frecuentes del sector de la
  automoción, y los guiones de demostración en
  vivo para el proceso de captación comercial.
- La documentación completa de todos los flujos
  de n8n implementados, incluyendo los diagramas
  de cada flujo, los nodos utilizados, las
  condiciones de activación y los casos de error
  gestionados.
- Los términos del servicio completos de Onucall
  y el contrato de encargado del tratamiento de
  datos (Data Processing Agreement) que cada
  concesionario cliente debe aceptar al contratar
  la plataforma para cumplir con el RGPD.
- La política de privacidad pública de Onucall
  dirigida a los clientes finales de los
  concesionarios que interactúan con el agente
  de voz.
- La documentación del vertical inmobiliario
  cuando Onucall para Inmobiliarias sea diseñado
  en la fase dos del desarrollo.
- La documentación de los verticales de abogados
  y despachos y de clínicas médicas cuando sean
  diseñados en las fases tres y cuatro del
  desarrollo.
- El manual de configuración avanzada del sistema
  de casos de uso con ejemplos exhaustivos por
  tipo de concesionario y por categoría de
  vehículo.
- La documentación de la integración con los
  principales DMS del mercado español incluyendo
  los mapas de campos de datos y los flujos de
  sincronización bidireccional.
- El estudio de usabilidad del dashboard con
  los principios de diseño minimalista aplicados
  a cada módulo y las decisiones de UX documentadas
  con sus justificaciones.

---

### APÉNDICE E: DECISIONES DE DISEÑO Y SUS JUSTIFICACIONES

Este apéndice documenta las decisiones de diseño
más relevantes tomadas durante el proceso de
definición del producto, con la justificación
técnica o estratégica de cada una. Su propósito
es preservar el razonamiento detrás de cada
decisión para que futuras iteraciones del producto
puedan evaluarlas en su contexto original antes
de modificarlas o descartarlas.

**Decisión 1: Patrón de calendario Horario Base
Semanal más Excepciones en lugar de almacenamiento
de días individuales.**

Justificación: Almacenar los 365 días del año
para cada organización, departamento y vendedor
generaría tablas con decenas de miles de registros
por cliente que crecen linealmente con el número
de años de uso de la plataforma. El patrón elegido
almacena un único registro de siete claves JSON
por entidad para el comportamiento semanal repetitivo
y solo registros adicionales para los días que
se desvían de ese comportamiento. El impacto en
el rendimiento de las consultas es dramáticamente
mejor y el coste de almacenamiento es despreciable.

**Decisión 2: Un único procedimiento almacenado
RPC para el cálculo de disponibilidad en lugar
de múltiples consultas desde el servidor de
aplicación.**

Justificación: Cada consulta adicional al servidor
de base de datos desde el servidor de aplicación
añade entre dos y ocho milisegundos de latencia
de red. Para el agente de voz, que necesita
responder en tiempo real durante una conversación
telefónica, la latencia acumulada de múltiples
consultas puede superar el umbral perceptible de
silencio en la conversación. Encapsular toda la
lógica de cálculo en un único RPC de PostgreSQL
reduce la latencia total de disponibilidad a entre
cinco y quince milisegundos independientemente
de la complejidad del cálculo.

**Decisión 3: Separación entre el agendamiento
(vinculado al departamento) y la asignación (al
vendedor) como dos pasos distintos.**

Justificación: En la operativa real de un
concesionario mediano, la persona que gestiona
las llamadas (o en este caso el agente de voz)
raramente tiene el criterio ni la información
necesaria para decidir qué vendedor específico
es el más adecuado para cada cliente. Esa decisión
requiere conocimiento del estado actual de cada
vendedor, sus especialidades, su carga de trabajo
y su relación previa con el cliente si existe.
Separar los dos pasos respeta la estructura de
decisión real del negocio y evita errores de
asignación que podrían generar conflictos internos
en el equipo.

**Decisión 4: Almacenamiento de los vectores de
embeddings en pgvector dentro de Supabase en lugar
de una base de datos vectorial dedicada como
Pinecone o Weaviate.**

Justificación: Usar una base de datos vectorial
externa añade complejidad operativa (un servicio
adicional que mantener), coste adicional de
suscripción, latencia adicional por la consulta
a un sistema externo, y un vector de riesgo
adicional en la cadena de disponibilidad del
servicio. pgvector como extensión de PostgreSQL
dentro de Supabase mantiene todos los datos en
una única infraestructura gestionada, con la
ventaja adicional de que las consultas vectoriales
pueden cruzarse con datos relacionales en la
misma transacción SQL, algo que ninguna base de
datos vectorial dedicada puede ofrecer de forma
nativa.

**Decisión 5: El campo annotation como texto
libre en lugar de campos estructurados de
equipamiento.**

Justificación: El equipamiento de un vehículo
es extremadamente heterogéneo entre marcas,
modelos, años y versiones. Intentar estructurar
ese equipamiento en campos específicos (tiene
techo solar: sí/no, tiene navegador: sí/no)
generaría una tabla con centenares de columnas
de las que la mayoría estarían vacías para
cualquier vehículo concreto. Un campo de texto
libre enriquecible con IA es más flexible, más
fácil de mantener y más útil para el sistema
RAG porque el texto fluido tiene más valor
semántico para la búsqueda vectorial que una
lista de booleanos.

**Decisión 6: n8n self-hosted en lugar de
Zapier, Make o cualquier otro servicio de
automatización en la nube.**

Justificación: Los datos que fluyen por los
procesos automatizados de Onucall incluyen
transcripciones de llamadas, datos de contacto
de clientes y resúmenes de conversaciones. Pasar
estos datos por la infraestructura de un tercero
como Zapier o Make añade un riesgo de privacidad
que es difícil de justificar ante los clientes
y ante los reguladores. n8n self-hosted mantiene
todos los datos del proceso dentro de la
infraestructura controlada de Onucall, elimina
el coste de licencia por operación que tienen
Zapier y Make, y proporciona mayor flexibilidad
para implementar lógica compleja sin las
limitaciones de los planes de consumo de los
servicios en la nube.

**Decisión 7: Acceso del vendedor únicamente
al resumen IA de la llamada, sin acceso a la
transcripción ni al audio.**

Justificación: Esta decisión responde
simultáneamente a tres motivaciones distintas
que se refuerzan mutuamente. La primera es legal:
el principio de minimización de acceso del RGPD
establece que los datos personales solo deben
ser accesibles para quienes tengan una necesidad
legítima y proporcional. El vendedor necesita
saber qué quiere el cliente, no escuchar su voz
ni leer cada palabra que dijo. La segunda es
operativa: el resumen generado por la IA contiene
toda la información comercialmente relevante en
un formato más conciso y útil que la transcripción
literal. El vendedor que lee el resumen en treinta
segundos llega igual de preparado a la cita que
el que escucha la grabación completa de tres
minutos. La tercera es de gestión de riesgos:
el acceso irrestricto a grabaciones de clientes
por parte de todo el equipo comercial puede
generar situaciones de uso inapropiado difíciles
de controlar y potencialmente dañinas para la
reputación del concesionario.

**Decisión 8: Prompt dinámico construido en
tiempo real en cada llamada en lugar de un
prompt estático actualizado periódicamente.**

Justificación: Un prompt estático que se actualiza
cada hora o cada día no puede reflejar cambios
en el stock del concesionario que ocurren en
tiempo real. Si un vehículo pasa de disponible
a reservado a las 14:37 porque el agente de
voz acaba de confirmar una cita sobre ese
vehículo, el siguiente cliente que llame a las
14:38 preguntando por ese mismo vehículo debe
recibir la información actualizada. Un prompt
construido en tiempo real en cada llamada
garantiza que el agente siempre trabaja con el
estado más actual del negocio sin necesidad de
procesos de sincronización periódica.

**Decisión 9: La jerarquía de calendarios
con tres niveles excluyentes en lugar de un
único calendario por vendedor.**

Justificación: La realidad operativa de un
concesionario tiene tres niveles de restricción
de disponibilidad que son independientes entre
sí pero que deben intersectarse para determinar
la disponibilidad real. El concesionario puede
estar cerrado por un festivo local aunque el
departamento y el vendedor estén configurados
como activos. El departamento puede no operar
los sábados aunque el concesionario abra y el
vendedor trabaje los sábados en otro departamento.
El vendedor puede estar de vacaciones aunque el
concesionario y el departamento estén activos.
Un único calendario por vendedor no puede capturar
esta complejidad de forma mantenible. Tres tablas
de calendario con una jerarquía excluyente sí
pueden hacerlo con mínimo impacto en el rendimiento.

**Decisión 10: El modelo de pricing basado en
suscripción mensual con planes por capas en
lugar de pricing por uso o por llamada.**

Justificación: El cliente objetivo de Onucall,
el gestor de un concesionario mediano en España,
tiene una aversión alta a los costes variables
e impredecibles. Un modelo de pricing por llamada
o por minuto puede ser más justo en teoría pero
genera ansiedad en el cliente que no puede
predecir su factura mensual y que por lo tanto
tiende a limitar el uso del sistema para controlar
el coste, lo que reduce el valor que obtiene y
aumenta el churn. Un modelo de suscripción mensual
fija da al cliente la certeza de su coste,
elimina la fricción de uso y permite al equipo
de Onucall proyectar ingresos con mayor precisión.

---

### APÉNDICE F: MÉTRICAS DE SEGUIMIENTO DEL NEGOCIO

Este apéndice define las métricas clave que el
equipo fundador de Onucall debe monitorizar de
forma regular para evaluar la salud del negocio
y tomar decisiones informadas sobre el producto,
las ventas y la infraestructura.

**Métricas de Crecimiento**

El MRR o Monthly Recurring Revenue es la métrica
principal de crecimiento. Se calcula como la suma
de todas las suscripciones activas en el mes.
Debe monitorizarse semanalmente y compararse
con el mes anterior y con la proyección del plan
de negocio. Una desviación negativa sostenida
de más del diez por ciento respecto a la proyección
durante dos semanas consecutivas debe activar
una revisión de la estrategia de captación.

El número de nuevos clientes por semana es el
indicador más temprano del ritmo de crecimiento.
El objetivo en la fase uno es incorporar entre
seis y ocho nuevos clientes por mes, lo que
equivale a entre uno y dos cierres semanales.

El ticket medio ponderado es la media del precio
mensual de todas las suscripciones activas. Una
tendencia decreciente en el ticket medio indica
que los nuevos clientes están eligiendo planes
inferiores a los existentes, lo que puede señalar
un problema de posicionamiento del plan Professional
o un desajuste entre el plan Starter y las
expectativas del cliente.

**Métricas de Retención**

El churn mensual bruto es el porcentaje de clientes
que cancelan su suscripción cada mes. El objetivo
es mantenerlo por debajo del dos por ciento mensual.
Superado el tres por ciento durante dos meses
consecutivos, debe lanzarse un proceso de análisis
de las razones de cancelación y un programa de
intervención proactiva con los clientes en riesgo.

El Net Revenue Retention o NRR mide si los ingresos
de la base de clientes existente crecen o decrecen
mes a mes, considerando tanto las cancelaciones
como los upsells y los upgrades de plan. Un NRR
superior al cien por ciento indica que la base
de clientes existente crece en ingresos incluso
sin captar nuevos clientes, lo que es la señal
más clara de un producto con fuerte propuesta
de valor.

El tiempo hasta el primer valor o Time to First
Value mide cuántos días tarda un nuevo cliente
desde la contratación hasta el momento en que
el agente de voz atiende su primera llamada real
y genera su primer lead en el CRM. El objetivo
es que este tiempo sea inferior a cuarenta y
ocho horas. Los clientes que no alcanzan ese
primer valor en la primera semana tienen una
probabilidad de churn en el primer mes
significativamente mayor que los que lo alcanzan antes de las cuarenta y
ocho horas. Este indicador es el que más
directamente se puede mejorar mediante un proceso
de onboarding estructurado y activo.

**Métricas de Uso del Producto**

El número de llamadas gestionadas por cliente
al mes mide el nivel de uso real del agente de
voz. Un cliente del plan Professional que gestiona
menos de veinte llamadas al mes puede estar usando
el agente de forma marginal, lo que indica un
riesgo de churn elevado porque no está obteniendo
el ROI completo de la plataforma. El equipo de
Onucall debe identificar estos clientes y contactar
proactivamente para ayudarles a optimizar la
configuración del sistema.

El ratio de leads captados por llamada mide la
eficacia del agente de voz en la conversión de
llamadas en leads registrados en el CRM. Un ratio
inferior al cuarenta por ciento puede indicar
que el agente no está realizando correctamente
las preguntas de cualificación o que los casos
de uso no están bien configurados para el tipo
de llamadas que recibe ese concesionario.

El número de citas agendadas por semana por cliente
es el indicador más directo del ROI que el
concesionario está obteniendo del sistema. Un
cliente con alta actividad de llamadas pero bajo
número de citas agendadas puede indicar que el
proceso de cierre del agente necesita ajustes
en los casos de uso.

El uso del BI Conversacional medido por el número
de consultas realizadas al mes indica el nivel
de adopción del módulo de inteligencia de negocio.
Un cliente que no usa el BI Conversacional después
de tres meses puede no conocer la funcionalidad
o no haber comprendido su valor. El equipo de
soporte debe hacer una llamada proactiva con esos
clientes para mostrarles casos de uso prácticos
relevantes para su negocio.

El número de documentos subidos a la Base de
Conocimientos por cliente indica el nivel de
comprensión del cliente sobre el valor del sistema
RAG. Un cliente que no ha subido ningún documento
después de dos meses está usando Onucall sin
aprovechar uno de sus diferenciadores más potentes.

**Métricas de Infraestructura**

El coste de infraestructura por cliente al mes
es la métrica más crítica para la sostenibilidad
del margen bruto. Se calcula dividiendo el coste
total mensual de infraestructura entre el número
de clientes activos. El objetivo es mantener este
coste por debajo del veinte por ciento del precio
del plan medio. Cuando un cliente individual tiene
un coste de infraestructura que supera el treinta
por ciento de su precio de plan durante dos meses
consecutivos, el sistema debe generar una alerta
para evaluar si ese cliente necesita un plan
superior o si hay una ineficiencia en el uso de
los recursos.

La latencia media del RPC de disponibilidad mide
el rendimiento del motor de calendario. El objetivo
es mantener la latencia media por debajo de los
veinte milisegundos para períodos de hasta treinta
días. Una latencia sostenida por encima de ese
umbral puede indicar que los índices de la base
de datos necesitan ser revisados o que el volumen
de datos ha superado el umbral óptimo para la
configuración actual de Supabase.

La tasa de éxito de los webhooks de Retell AI
mide el porcentaje de webhooks recibidos que son
procesados correctamente por n8n. Una tasa de
éxito inferior al noventa y nueve por ciento
durante más de una hora debe activar una alerta
de infraestructura porque los webhooks fallidos
pueden implicar leads no registrados o citas no
creadas en el sistema.

***

### APÉNDICE G: PROCESO DE ONBOARDING

Este apéndice define el proceso estándar de
incorporación de un nuevo cliente a la plataforma
de Onucall. El objetivo del proceso es que el
cliente alcance el primer valor, definido como
el agente atendiendo su primera llamada real y
generando su primer lead en el CRM, en menos de
cuarenta y ocho horas desde la activación de su
cuenta.

**Día 0: Activación de la Cuenta**

Inmediatamente después de que el concesionario
completa el proceso de contratación y pago, el
sistema activa automáticamente su cuenta en
Onucall y envía al email del administrador un
mensaje de bienvenida con las credenciales de
acceso al dashboard, un enlace al video de inicio
rápido de diez minutos, y un enlace para programar
la sesión de onboarding asistido con el equipo
de Onucall si el plan contratado lo incluye.

Simultáneamente, n8n ejecuta el proceso de
aprovisionamiento automático que crea la organización
del cliente en la base de datos con todos los
parámetros por defecto, genera el agente de voz
inicial en Retell AI con la configuración estándar,
y prepara el entorno para que el cliente pueda
empezar a configurar su cuenta en menos de dos
minutos desde el primer acceso al dashboard.

**Día 1: Configuración Inicial (Cliente)**

El proceso de configuración inicial que el cliente
debe completar por su cuenta o con la asistencia
del equipo de Onucall está diseñado para durar
entre treinta y sesenta minutos y cubre los cuatro
elementos esenciales para que el agente pueda
empezar a funcionar.

El primer elemento es la configuración del agente
de voz, que incluye elegir el nombre del agente,
seleccionar el género y la voz, ajustar el nivel
de amabilidad en la escala del uno al cinco, y
escribir o generar con el asistente de IA el
primer caso de uso de presentación del negocio,
que indica al agente cómo debe presentarse cuando
responde una llamada y cuáles son los servicios
principales del concesionario.

El segundo elemento es la adquisición del número
de teléfono mediante el proceso descrito en la
sección de integración con Zadarma. El cliente
selecciona el prefijo provincial deseado y el
número queda activo en menos de dos minutos.

El tercer elemento es la carga del catálogo inicial
de vehículos. Para facilitar este proceso, el
dashboard ofrece tres opciones de carga. La primera
es la carga manual mediante el formulario de alta
de vehículo uno por uno. La segunda es la carga
masiva mediante un archivo CSV con una plantilla
descargable que el cliente puede completar con
su catálogo y subir de una sola vez. La tercera
es la importación desde un portal de anuncios
si el cliente tiene ya sus vehículos publicados
en Coches.net o AutoScout24, mediante la introducción
de la URL de su perfil de vendedor en el portal.

El cuarto elemento es la configuración del horario
laboral básico del concesionario, que incluye
los días de apertura, las horas de inicio y cierre
de cada jornada, y si hay turno partido el horario
de la pausa. Esta configuración puede completarse
en menos de cinco minutos desde el asistente de
configuración del calendario.

**Día 1: Verificación del Sistema (Equipo Onucall)**

Mientras el cliente realiza la configuración
inicial, el equipo de Onucall verifica de forma
proactiva que todos los componentes del sistema
están correctamente conectados. Esta verificación
incluye comprobar que el número de Zadarma está
correctamente vinculado al agente de Retell AI,
que el agente de Retell AI tiene acceso correcto
a las funciones de herramienta del backend de
Onucall, que el flujo de n8n de identificación
de cliente al inicio de llamada está activo y
respondiendo en menos de quinientos milisegundos,
y que el catálogo inicial del cliente es accesible
para el agente mediante la función de búsqueda
de vehículos.

Si se detecta cualquier problema en esta verificación,
el equipo de Onucall lo resuelve proactivamente
antes de que el cliente haga su primera prueba
del sistema, eliminando la posibilidad de que
el cliente tenga una primera experiencia negativa.

**Día 1: La Primera Llamada de Prueba**

Una vez completada la configuración inicial y
verificado el sistema, el cliente realiza una
llamada de prueba al número de teléfono de Onucall
desde su propio móvil. Esta llamada de prueba
tiene tres objetivos. El primero es que el cliente
escuche por primera vez la voz de su agente y
evalúe si el nombre, el tono y el nivel de amabilidad
configurados representan adecuadamente a su negocio.
El segundo es que el cliente compruebe que el
agente conoce los vehículos del catálogo y puede
responder preguntas básicas sobre ellos. El tercero
es que el cliente compruebe que el proceso de
agendamiento funciona correctamente y que la cita
aparece en el sistema después de la llamada.

Si el cliente no está satisfecho con algún aspecto
del agente después de la llamada de prueba, puede
ajustar la configuración desde el dashboard y
realizar otra llamada de prueba inmediatamente.
El proceso de ajuste y prueba puede repetirse
tantas veces como sea necesario sin coste adicional.

**Días 2 a 7: Optimización Temprana**

Durante la primera semana de uso real, el equipo
de Onucall monitoriza la actividad de la cuenta
del nuevo cliente y contacta proactivamente si
detecta cualquier señal de alerta como ausencia
de llamadas gestionadas, leads sin resumen de
IA generado, o citas agendadas que no aparecen
en el CRM. El objetivo de esta monitorización
es detectar y resolver cualquier problema técnico
o de configuración en los primeros días antes
de que el cliente lo perciba como un fallo del
producto.

Al final de la primera semana, el equipo de Onucall
envía al administrador del cliente un resumen
de la actividad de la semana con el número de
llamadas gestionadas, los leads captados, las
citas agendadas y una recomendación personalizada
de la siguiente configuración que añadir para
mejorar el rendimiento del sistema, generalmente
la creación de los primeros casos de uso específicos
del negocio o la subida del primer documento a
la Base de Conocimientos.

**Mes 1: Evaluación de ROI**

Al final del primer mes completo de uso, el equipo
de Onucall realiza una llamada de seguimiento con
el administrador del cliente para evaluar juntos
los resultados del mes. En esta llamada se revisan
las métricas de uso del dashboard, se identifican
las citas agendadas que han resultado en visitas
reales, se calcula el ROI estimado del mes basándose
en las ventas que el cliente atribuye a leads
captados por el agente, y se planifican los
siguientes pasos de optimización del sistema para
el mes siguiente.

Esta llamada de evaluación de ROI al final del
primer mes es el momento más crítico del proceso
de retención. Un cliente que puede ver claramente
que el agente le ha captado leads que de otra
forma se hubieran perdido y que alguno de esos
leads ha resultado en una venta difícilmente
cancela su suscripción en los meses siguientes.

***

### APÉNDICE H: ARGUMENTARIO DE VENTAS

Este apéndice recoge los argumentos principales
del proceso de venta de Onucall a concesionarios
de vehículos, organizados por el tipo de objeción
más frecuente que el equipo comercial encuentra
en el proceso de captación.

**Objeción 1: Ya tenemos un CRM y funciona bien**

Respuesta: Entiendo perfectamente que ya tienes
herramientas que te funcionan para gestionar los
leads que ya tienes. Onucall no viene a sustituir
tu CRM. Onucall viene a capturar los leads que
tu CRM nunca ve porque llegan cuando el teléfono
no lo coge nadie. Tu CRM organiza lo que ya entra.
Onucall captura lo que estás perdiendo. ¿Cuántas
llamadas perdidas tenéis un fin de semana normal?

**Objeción 2: No me fío de que una IA gestione
mis clientes**

Respuesta: Es una preocupación completamente
legítima y por eso te propongo que lo veas en
directo ahora mismo. Llama a este número desde
tu móvil y pregúntale por el coche que más te
cuesta vender este mes. Habla con el agente como
si fueras un cliente real. Luego me dices si
confiarías en que ese agente coja el teléfono
el domingo por la tarde cuando estás cenando
con tu familia.

**Objeción 3: Es muy caro para lo que es**

Respuesta: Entiendo que trescientos noventa y
nueve euros al mes parece mucho hasta que hacemos
los números juntos. Un solo coche de ocasión
vendido que de otra forma se hubiera perdido por
una llamada no atendida te deja entre quinientos
y mil quinientos euros de margen neto. Onucall
necesita rescatarte menos de una venta al mes
para pagarse solo. Y en la práctica los concesionarios
que lo usan recuperan entre cuatro y ocho ventas
al mes que antes perdían. ¿Cuánto vale eso para
ti al año?

**Objeción 4: No tenemos tiempo para aprender
una herramienta nueva**

Respuesta: El proceso de configuración inicial
dura entre treinta y sesenta minutos y lo hacemos
contigo paso a paso. Después de eso, el agente
funciona solo sin que tengas que hacer nada. Los
leads aparecen en el panel, las citas están en
la agenda del vendedor y el agente coge el teléfono
solo. No necesitas aprender nada nuevo para el
día a día. Solo tienes que abrir el panel por las
mañanas y ver los leads de la noche anterior.

**Objeción 5: ¿Qué pasa si la IA comete un error
con un cliente?**

Respuesta: El agente solo hace dos cosas: dar
información sobre los coches que tú le has dado
y agendar citas según el horario que tú has
configurado. No negocia precios, no hace promesas
que no puedas cumplir y no toma decisiones
comerciales. Si el cliente pregunta algo que el
agente no sabe responder, le dice exactamente
eso y le propone que le llame un especialista
del equipo. El agente nunca inventa. Solo trabaja
con la información que tú le das.

**Objeción 6: Mis clientes prefieren hablar con
personas reales**

Respuesta: Los clientes que quieren hablar con
una persona real tienen esa opción. Si durante
la llamada el cliente dice explícitamente que
quiere hablar con alguien del equipo, el agente
registra sus datos y genera inmediatamente una
notificación para que un vendedor le llame en
los próximos minutos. Lo que Onucall evita es
que ese cliente que quería hablar con alguien
real llame el sábado a las seis de la tarde,
nadie le coja, y el lunes por la mañana ya haya
comprado en otro concesionario.

***

### APÉNDICE I: CONFIGURACIONES RECOMENDADAS POR TIPO DE CONCESIONARIO

Este apéndice proporciona configuraciones de
referencia para los tipos de concesionario más
frecuentes en el mercado español. Cada configuración
incluye los parámetros recomendados para el agente
de voz, los departamentos sugeridos con sus reglas
de agendamiento, y los casos de uso más relevantes
para ese perfil de negocio.

**Perfil 1: Concesionario Multimarca de V.O.
Independiente (El Perfil Más Frecuente)**

Este es el cliente ideal principal de Onucall.
Gestiona entre veinte y cien vehículos de ocasión
de múltiples marcas. Tiene entre dos y seis personas
en el equipo. Sus clientes son compradores
particulares que llaman tras ver anuncios en
portales digitales.

Configuración recomendada del agente:
Nivel de amabilidad tres o cuatro. Tono cercano
pero profesional. El agente debe presentarse con
el nombre del concesionario y su nombre propio.
Ejemplo: Buenas tardes, le atiende María del
Concesionario García Vehículos, ¿en qué puedo
ayudarle?

Departamentos recomendados:
Un único departamento denominado Ventas de
Vehículos de Ocasión con una duración de cita
de treinta minutos, un buffer de diez minutos,
una antelación mínima de dos horas y una
concurrencia máxima de uno si hay un solo vendedor
o de dos si hay dos vendedores activos.

Casos de uso recomendados:
Caso uno: si el cliente pregunta por un vehículo
concreto que está en el catálogo, facilítale el
precio, los kilómetros, el año y el equipamiento
principal, y pregúntale si desea concertar una
visita para verlo.
Caso dos: si el cliente no tiene un vehículo
concreto en mente y te da un presupuesto o un
tipo de vehículo, preséntale hasta tres opciones
del catálogo que encajen con sus criterios
ordenadas de menor a mayor precio.
Caso tres: si el cliente menciona que quiere
entregar su coche como parte del pago, confirma
que el concesionario trabaja con vehículos de
entrada y recoge la marca, modelo, año y kilómetros
aproximados del vehículo que quiere entregar para
que el equipo de tasación le contacte.
Caso cuatro: si el cliente menciona que ha visto
el coche en el concesionario pero no en la web,
recoge toda la información que pueda sobre el
vehículo y sus datos de contacto, e indícale que
un miembro del equipo le llamará en las próximas
horas con la información completa.

Documentos recomendados para la Base de Conocimientos:
Las condiciones de garantía que el concesionario
ofrece en sus vehículos de ocasión. La política
de tasaciones y compra de vehículos a particulares.
Cualquier promoción de financiación vigente.

**Perfil 2: Concesionario Oficial de Marca Mediano**

Este perfil tiene mayor estructura organizativa
con departamentos diferenciados. Sus clientes
incluyen tanto compradores de vehículos nuevos
como de ocasión certificados por la marca.

Configuración recomendada del agente:
Nivel de amabilidad tres. Tono profesional y
orientado a la marca. El agente debe conocer
los modelos de la marca representada y sus
versiones principales.

Departamentos recomendados:
Departamento de Ventas de Vehículos Nuevos con
una duración de cita de cuarenta y cinco minutos,
buffer de quince minutos y antelación mínima de
veinticuatro horas.
Departamento de Ventas de Vehículos de Ocasión
Certificados con una duración de cita de treinta
minutos, buffer de diez minutos y antelación
mínima de dos horas.
Departamento de Financiación y Seguros con una
duración de cita de sesenta minutos, sin buffer
y antelación mínima de cuarenta y ocho horas.
Departamento de Pruebas de Conducción con una
duración de cita de cuarenta y cinco minutos,
buffer de treinta minutos para la preparación
del vehículo de demostración, y antelación mínima
de veinticuatro horas.

Casos de uso recomendados:
Caso uno: si el cliente pregunta por un vehículo
nuevo, identifica el modelo de su interés y
derívalo al departamento de Ventas de Vehículos
Nuevos para agendar una visita o una prueba de
conducción según su preferencia.
Caso dos: si el cliente pregunta por financiación
o por las cuotas mensuales de un vehículo concreto,
infórmale de que tenemos un asesor de financiación
especializado y agrenda una cita en el departamento
de Financiación para que le prepare una simulación
personalizada sin compromiso.
Caso tres: si el cliente pregunta por un vehículo
de ocasión certificado, derívalo al departamento
correspondiente e informa de que todos los vehículos
de ocasión certificados de la marca incluyen
garantía oficial, revisión de más de ciento cincuenta
puntos y asistencia en carretera.
Caso cuatro: si el cliente menciona el nombre de
un modelo de la competencia, no hagas comparaciones
directas y destaca las ventajas del modelo
equivalente de nuestra marca en términos de
tecnología de seguridad, consumo y coste de
mantenimiento.

Documentos recomendados para la Base de Conocimientos:
Los catálogos de equipamiento de los modelos
principales de la marca para el año en curso.
Las condiciones de la garantía oficial del fabricante
y de la garantía de los vehículos de ocasión
certificados. Las fichas técnicas de los modelos
más vendidos del catálogo actual. Las condiciones
de los planes de financiación vigentes.

**Perfil 3: Distribuidor de Motocicletas**

Este perfil tiene características específicas
relacionadas con la estacionalidad del sector
y con el perfil técnico de sus clientes.

Configuración recomendada del agente:
Nivel de amabilidad cuatro o cinco. El comprador
de motocicletas suele ser más apasionado por el
producto que el comprador de un turismo y valora
un trato cercano y compartir el entusiasmo por
el mundo de las dos ruedas. El agente debe conocer
la terminología específica del sector: cilindrada,
tipo de carnet necesario, peso en vacío, altura
de asiento, par motor.

Departamentos recomendados:
Departamento de Ventas de Motocicletas Nuevas
con una duración de cita de cuarenta y cinco
minutos y buffer de quince minutos.
Departamento de Ventas de Motocicletas de Ocasión
con una duración de cita de treinta minutos y
buffer de diez minutos.
Departamento de Pruebas de Conducción para los
modelos que lo permitan con una duración de treinta
minutos y buffer de veinte minutos.

Casos de uso recomendados:
Caso uno: si el cliente menciona que tiene el
carnet A2 o que lo acaba de sacar, oriéntale hacia
los modelos de hasta cuarenta y siete caballos
disponibles en el catálogo y explícale que en
dos años puede acceder al carnet A sin restricciones.
Caso dos: si el cliente pregunta por motos trail,
naked, deportivas o scooter, identifica el tipo
de uso principal (ciudad, carretera, mixto,
aventura) y preséntale las opciones del catálogo
más adecuadas para ese perfil de uso.
Caso tres: si el cliente menciona que es su primera
moto, recomiéndale modelos de iniciación del
catálogo y destaca la importancia del equipamiento
de protección, indicando que el concesionario
también dispone de accesorios y equipamiento.

Documentos recomendados para la Base de Conocimientos:
Las fichas técnicas de los modelos principales
del catálogo. Los requisitos de carnet por
cilindrada y potencia. Las condiciones de garantía
de los modelos nuevos y de ocasión.

**Perfil 4: Distribuidor de Maquinaria Agrícola
y Tractores**

Este perfil tiene la mayor especialización técnica
de todos los perfiles de Onucall y es donde la
Base de Conocimientos aporta más valor.

Configuración recomendada del agente:
Nivel de amabilidad dos o tres. El agricultor
que llama a un distribuidor de tractores tiene
una mentalidad práctica y valora la eficiencia
en la comunicación. El agente debe usar la
terminología del sector: potencia en CV, tracción
a las cuatro ruedas, toma de fuerza, enganche
de tres puntos, cabina climatizada, telemetría
agrícola.

Departamentos recomendados:
Departamento de Ventas de Maquinaria Nueva con
una duración de cita de noventa minutos dado el
alto valor de las operaciones y la complejidad
técnica de la decisión de compra, con un buffer
de treinta minutos y una antelación mínima de
cuarenta y ocho horas.
Departamento de Ventas de Maquinaria de Ocasión
con una duración de cita de sesenta minutos y
buffer de veinte minutos.
Departamento de Demostraciones en Campo con una
duración de cita de ciento veinte minutos, buffer
de sesenta minutos para el desplazamiento al
terreno del cliente, y antelación mínima de
setenta y dos horas.

Casos de uso recomendados:
Caso uno: si el cliente menciona el tipo de cultivo
o la superficie de su explotación, identifica
el rango de potencia recomendado para ese tipo
de trabajo y los modelos del catálogo que encajan.
Caso dos: si el cliente pregunta por subvenciones
o por el plan de renovación de maquinaria agrícola,
indícale que nuestro asesor comercial puede
informarle en detalle sobre las ayudas disponibles
y agrenda una cita específica para ese tema.
Caso tres: si el cliente quiere una demostración
del tractor en su finca, agrenda la cita en el
departamento de Demostraciones en Campo y recoge
la dirección exacta de la finca y el tipo de
terreno donde se realizará la prueba.

Documentos recomendados para la Base de Conocimientos:
Las fichas técnicas completas de los tractores
del catálogo incluyendo especificaciones de motor,
transmisión, toma de fuerza y sistemas hidráulicos.
Las guías de selección de potencia por tipo de
cultivo y superficie. Las condiciones de los
planes de financiación específicos para maquinaria
agrícola. La información sobre las subvenciones
disponibles para la renovación de maquinaria.

***

### APÉNDICE J: CASOS DE PRUEBA DEL SISTEMA

Este apéndice define los casos de prueba que deben
ejecutarse antes de cada lanzamiento de una nueva
versión del producto para verificar que todos los
componentes críticos del sistema funcionan
correctamente.

**Prueba 1: Verificación del Flujo Completo de
una Llamada de Nuevo Cliente**

Objetivo: Verificar que una llamada de un número
desconocido es correctamente gestionada desde
el inicio hasta el registro del lead en el CRM.

Pasos:
Llamar al número de Zadarma del entorno de pruebas
desde un número no registrado en el CRM.
Verificar que el agente responde en menos de tres
segundos.
Verificar que el agente se presenta con el nombre
configurado y con el nivel de amabilidad correcto.
Preguntar por un vehículo concreto del catálogo
de pruebas y verificar que el agente proporciona
información correcta y actualizada.
Solicitar una cita para el día siguiente y verificar
que el agente ofrece huecos reales del calendario
de pruebas.
Confirmar la cita y proporcionar nombre y teléfono
de prueba.
Verificar que la cita aparece en el dashboard
de Onucall en menos de treinta segundos tras
finalizar la llamada.
Verificar que el lead aparece en el CRM con el
resumen correcto de la conversación.
Verificar que el WhatsApp de confirmación de
cita es enviado al número de prueba en menos de
sesenta segundos.

Resultado esperado: Todos los pasos se completan
correctamente sin intervención manual. El lead
y la cita son visibles en el dashboard antes de
que transcurra un minuto desde el fin de la llamada.

**Prueba 2: Verificación de la Identificación
de Cliente Conocido**

Objetivo: Verificar que un cliente registrado en
el CRM es correctamente identificado al inicio
de la llamada y que el agente personaliza su
saludo.

Pasos:
Crear un lead de prueba en el CRM con un número
de teléfono específico y un vehículo de interés
asociado.
Llamar al número de Zadarma desde ese número de
teléfono.
Verificar que el agente menciona el nombre del
cliente o hace referencia a su interacción anterior
en su primer saludo.
Verificar que el agente tiene acceso al historial
del cliente durante la conversación.

Resultado esperado: El agente personaliza el
saludo en menos de dos segundos desde que la
llamada es respondida, utilizando el nombre del
cliente o haciendo referencia a su vehículo de
interés previo.

**Prueba 3: Verificación de la Jerarquía
Excluyente de Calendarios**

Objetivo: Verificar que el sistema no ofrece
huecos en días que están cerrados por excepción
en el calendario de la organización aunque el
departamento y el vendedor estén configurados
como activos.

Pasos:
Crear una excepción en el calendario de la
organización marcando el día siguiente como
cerrado con descripción Prueba de excepción.
Llamar al número de Zadarma y solicitar una
cita para el día siguiente.
Verificar que el agente no ofrece ese día como
opción disponible.
Verificar que el agente ofrece el siguiente día
laborable disponible según el calendario.

Resultado esperado: El agente no menciona el
día cerrado como opción en ningún momento de
la conversación y ofrece alternativas correctas.

**Prueba 4: Verificación del Sistema de
Notificaciones Urgentes por Bug Empresarial**

Objetivo: Verificar que el sistema genera
correctamente una notificación urgente cuando
el agente detecta que un cliente hace referencia
a un vehículo no catalogado.

Pasos:
Llamar al número de Zadarma y describir al agente
un vehículo con características que no coinciden
con ningún vehículo del catálogo de pruebas.
Indicar al agente que ese vehículo se vio en el
concesionario físicamente.
Finalizar la llamada.
Verificar que el lead aparece en el CRM con nota
de alta prioridad.
Verificar que la notificación urgente de bug
empresarial aparece en el dashboard del administrador de organización en menos de sesenta
segundos tras el fin de la llamada.
Verificar que la notificación incluye el resumen
de la conversación, los datos del cliente y la
descripción del vehículo no catalogado.

Resultado esperado: La notificación urgente es
visible en el dashboard del administrador antes
de que transcurra un minuto desde el fin de la
llamada, con toda la información necesaria para
actuar de forma inmediata.

**Prueba 5: Verificación del Sistema RAG con
Documento de Base de Conocimientos**

Objetivo: Verificar que el agente responde
correctamente preguntas técnicas basándose en
el contenido de un documento subido a la Base
de Conocimientos.

Pasos:
Subir un documento PDF de prueba a la Base de
Conocimientos con información técnica específica
y verificable sobre un modelo concreto del
catálogo de pruebas.
Esperar a que el sistema confirme que el documento
ha sido procesado y vectorizado correctamente.
Llamar al número de Zadarma y preguntar por ese
vehículo concreto.
Hacer una pregunta técnica específica cuya
respuesta solo puede obtenerse del documento
subido y no de los campos estandarizados de la
ficha del vehículo.
Verificar que el agente proporciona una respuesta
correcta basada en el contenido del documento.
Hacer una pregunta técnica cuya respuesta no
está en ningún documento subido.
Verificar que el agente indica correctamente que
no dispone de esa información y ofrece que un
especialista contacte con el cliente.

Resultado esperado: El agente responde correctamente
con la información del documento cuando está
disponible, y comunica honestamente la ausencia
de información cuando no está disponible, sin
inventar ni suponer datos.

**Prueba 6: Verificación del Modo de Asignación
Autónoma**

Objetivo: Verificar que el sistema asigna
correctamente las citas a los vendedores cuando
el modo de asignación autónoma está activado.

Pasos:
Activar el modo de asignación autónoma en el
departamento de pruebas con el algoritmo Round
Robin configurado.
Llamar al número de Zadarma y agendar una cita
como nuevo cliente.
Verificar que la cita es asignada automáticamente
a un vendedor del departamento sin intervención
del administrador.
Repetir el proceso tres veces con el mismo
departamento.
Verificar que la distribución de citas entre
los vendedores del departamento sigue el patrón
Round Robin correcto.

Resultado esperado: Cada nueva cita es asignada
automáticamente al siguiente vendedor en el orden
de rotación y aparece en su agenda individual
sin necesidad de ninguna acción del administrador.

**Prueba 7: Verificación del Anti Double Booking**

Objetivo: Verificar que el sistema no permite
que dos clientes reserven el mismo slot de tiempo
de forma simultánea.

Pasos:
Identificar un slot específico disponible en
el calendario del departamento de pruebas.
Lanzar simultáneamente desde dos dispositivos
distintos dos llamadas al número de Zadarma y
solicitar el mismo slot de tiempo en ambas.
Verificar que únicamente una de las dos llamadas
consigue confirmar la cita en ese slot.
Verificar que la segunda llamada recibe una
respuesta del agente indicando que ese horario
acaba de ser reservado y ofreciendo el siguiente
slot disponible.
Verificar que solo existe un registro de cita
para ese slot en el sistema tras el proceso.

Resultado esperado: El sistema confirma la cita
al primer cliente que la reserva y propone
automáticamente alternativas al segundo cliente,
garantizando que ningún slot queda doblemente
reservado en la base de datos.

**Prueba 8: Verificación de la Eliminación
Automática de Grabaciones por Caducidad**

Objetivo: Verificar que el sistema elimina
correctamente las grabaciones de audio cuando
su período de retención ha expirado.

Pasos:
Crear manualmente en la base de datos de pruebas
un registro de llamada con una grabación de
prueba cuya fecha de creación sea anterior al
período de retención configurado.
Ejecutar manualmente el flujo de n8n de eliminación
de grabaciones caducadas.
Verificar que el archivo de audio ha sido eliminado
de Supabase Storage.
Verificar que el registro de auditoría de la
eliminación ha sido creado correctamente con
la fecha, hora e identificador del archivo
eliminado.
Verificar que el resumen de la llamada sigue
disponible en el sistema aunque la grabación
haya sido eliminada.

Resultado esperado: El archivo de audio es
eliminado correctamente, el registro de auditoría
documenta la eliminación y el resumen de la
llamada permanece accesible en el CRM.

***

### APÉNDICE K: ARQUITECTURA DE SEGURIDAD

Este apéndice documenta las medidas de seguridad
implementadas en Onucall para proteger los datos
de los clientes y garantizar la integridad del
sistema.

**Seguridad de la Base de Datos**

Toda la base de datos de Onucall está alojada
en Supabase Cloud con cifrado en reposo mediante
AES-256 y cifrado en tránsito mediante TLS 1.3.
El acceso directo a la base de datos está
restringido exclusivamente a las Edge Functions
de Supabase y a los RPCs, nunca a conexiones
directas desde el frontend.

El sistema de Row Level Security de PostgreSQL
actúa como una barrera de acceso a nivel de fila
que garantiza que cada tenant solo puede acceder
a sus propios datos. Las políticas de RLS están
definidas en todas las tablas que contienen datos
de tenants y son evaluadas automáticamente por
PostgreSQL en cada consulta, independientemente
de cómo se realice la consulta o desde qué
componente del sistema.

**Seguridad de las Comunicaciones**

Todas las comunicaciones entre el frontend de
Qwik y el backend de Supabase se realizan mediante
HTTPS con certificados SSL válidos gestionados
automáticamente por la infraestructura de despliegue.
Las claves de API de Supabase y de los servicios
externos (Retell AI, Zadarma, OpenAI) están
almacenadas como variables de entorno cifradas
en la infraestructura de despliegue y nunca se
exponen en el código fuente ni en los logs del
sistema.

Los webhooks entrantes de Retell AI y de Zadarma
son verificados mediante firmas HMAC que garantizan
que las notificaciones recibidas provienen
efectivamente de esos servicios y no de fuentes
maliciosas que intenten inyectar datos falsos
en el sistema.

**Seguridad de los Archivos**

Los archivos de audio de las grabaciones y los
documentos PDF de la Base de Conocimientos están
almacenados en buckets privados de Supabase
Storage con acceso controlado exclusivamente
mediante tokens de acceso temporales generados
por el backend. Ningún archivo almacenado en
Supabase Storage es accesible mediante una URL
pública directa sin autenticación.

Los tokens de acceso temporal para los archivos
tienen una validez de quince minutos, lo que
garantiza que incluso si un token es interceptado
su ventana de uso es extremadamente limitada.

**Seguridad del Agente de Voz**

El agente de voz está configurado para rechazar
cualquier intento del cliente de hacerle revelar
información sobre su configuración interna, sobre
el prompt que usa, sobre las instrucciones que
ha recibido o sobre cualquier otro aspecto técnico
del sistema. Esta protección es especialmente
importante para prevenir ataques de prompt
injection en los que un cliente malintencionado
intenta manipular al agente para que realice
acciones no autorizadas o revele información
confidencial del negocio del concesionario.

El agente también está configurado para no
proporcionar nunca información personal de otros
clientes ni datos internos del concesionario
como precios de coste, márgenes de negociación
o información sobre la situación financiera del
negocio.

**Auditoría y Trazabilidad**

El sistema mantiene un log de auditoría completo
de todas las acciones sensibles realizadas en
la plataforma: accesos a transcripciones y
grabaciones de llamadas, eliminaciones de datos
de clientes por ejercicio del derecho de supresión,
cambios en la configuración del agente de voz,
modificaciones en los roles y permisos de los
usuarios, y activaciones y desactivaciones del
modo de asignación autónoma. Estos logs son
inmutables una vez creados y están disponibles
para el administrador de organización durante
un período de dos años.

***

### APÉNDICE L: PLANIFICACIÓN TÉCNICA DEL MVP

Este apéndice detalla la planificación técnica
del producto mínimo viable de Onucall, con las
tareas específicas de desarrollo organizadas
por semana y los criterios de aceptación para
considerar cada tarea completada.

**Semana 1: Infraestructura Base**

Tarea 1.1: Crear el proyecto en Supabase con
la configuración inicial de la base de datos,
activar las extensiones necesarias incluyendo
pgvector, y configurar las variables de entorno
del proyecto.
Criterio de aceptación: La base de datos responde
a consultas de prueba y la extensión pgvector
está activa y puede almacenar y recuperar vectores.

Tarea 1.2: Crear el esquema SQL completo de las
tablas principales: organizations, departments,
users, organization_members, calendar_schedules,
calendar_exceptions, appointments, vehicles,
leads, calls.
Criterio de aceptación: Todas las tablas existen
en la base de datos con sus columnas, tipos de
datos, restricciones y relaciones correctamente
definidos.

Tarea 1.3: Crear los índices de rendimiento en
todas las tablas según las especificaciones del
documento de arquitectura.
Criterio de aceptación: Los índices existen y
las consultas de prueba sobre las tablas más
grandes ejecutan en menos de diez milisegundos.

Tarea 1.4: Configurar las políticas de Row Level
Security para todas las tablas con datos de
tenants.
Criterio de aceptación: Un usuario de la
organización A no puede ver datos de la organización
B bajo ninguna circunstancia.

Tarea 1.5: Crear el proyecto Qwik con la
configuración inicial de Tailwind CSS y la
estructura de carpetas del proyecto.
Criterio de aceptación: El proyecto arranca
localmente y la página de inicio carga en menos
de un segundo.

**Semana 2: Motor de Calendario**

Tarea 2.1: Implementar el RPC
get_time_window_availability en PostgreSQL con
la lógica de generate_series, EXTRACT ISODOW,
LEFT JOIN con excepciones y sustracción de citas
confirmadas.
Criterio de aceptación: El RPC devuelve resultados
correctos para períodos de hasta treinta días
en menos de veinte milisegundos con datos de prueba.

Tarea 2.2: Implementar el RPC book_appointment
con la lógica de bloqueo transaccional para
prevenir el double booking.
Criterio de aceptación: Dos ejecuciones simultáneas
del RPC para el mismo slot solo confirman una
cita y la segunda recibe el error correcto.

Tarea 2.3: Crear las Edge Functions de Supabase
que exponen los RPCs como endpoints de API para
consumo desde el frontend y desde Retell AI.
Criterio de aceptación: Los endpoints responden
correctamente a peticiones HTTP con los parámetros
correctos y devuelven errores estructurados para
parámetros incorrectos.

**Semana 3: Integración con Retell AI y Zadarma**

Tarea 3.1: Crear la integración con la API de
Retell AI para la creación y actualización de
agentes de voz desde el backend de Onucall.
Criterio de aceptación: La creación de una
organización nueva en Onucall crea automáticamente
el agente correspondiente en Retell AI.

Tarea 3.2: Implementar los webhooks de Retell AI
en el backend de Onucall con verificación de
firma HMAC.
Criterio de aceptación: Los webhooks de inicio
y fin de llamada son recibidos, verificados y
procesados correctamente.

Tarea 3.3: Implementar el prompt dinámico que
se construye en tiempo real al inicio de cada
llamada con el contexto del catálogo, los casos
de uso y el historial del cliente si está
disponible.
Criterio de aceptación: El prompt generado
contiene información actualizada del catálogo
y responde correctamente a una llamada de prueba
con preguntas sobre vehículos del catálogo de
pruebas.

Tarea 3.4: Crear la integración con la API de
Zadarma para la adquisición de números de
teléfono desde el dashboard de Onucall.
Criterio de aceptación: El proceso completo de
adquisición de un número desde el dashboard hasta
que el número está activo y redirigido al agente
de Retell AI dura menos de dos minutos.

**Semana 4: Módulo de Catálogo de Vehículos**

Tarea 4.1: Implementar el formulario de alta
de vehículo en el dashboard de Qwik con todos
los campos de la ficha y la galería de fotos.
Criterio de aceptación: Un administrador puede
dar de alta un vehículo completo con fotos en
menos de cinco minutos.

Tarea 4.2: Implementar la vista de listado del
catálogo con filtros por tipo, estado y precio.
Criterio de aceptación: El listado carga en menos
de dos segundos con hasta doscientos vehículos
y los filtros responden en menos de quinientos
milisegundos.

Tarea 4.3: Implementar el control de estados
del vehículo con las transiciones correctas entre
disponible, reservado, vendido, en preparación
y oculto.
Criterio de aceptación: El cambio de estado de
un vehículo se refleja en el agente de voz en
la siguiente llamada que reciba sobre ese vehículo.

Tarea 4.4: Implementar el endpoint API público
del catálogo con autenticación por clave de API.
Criterio de aceptación: El endpoint devuelve
únicamente los vehículos con estado disponible
de la organización correspondiente a la clave
de API proporcionada.

**Semana 5: CRM de Leads**

Tarea 5.1: Implementar la vista de pipeline Kanban
del CRM con las columnas de estados y la
funcionalidad de arrastrar y soltar entre columnas.
Criterio de aceptación: El pipeline muestra
correctamente todos los leads activos y el cambio
de estado mediante drag and drop se persiste
en la base de datos correctamente.

Tarea 5.2: Implementar la ficha completa del
lead con el historial de interacciones, el resumen
de la última llamada y las tareas de seguimiento.
Criterio de aceptación: La ficha de un lead
muestra toda la información disponible sobre ese
cliente y permite añadir notas y tareas de seguimiento con fecha
y hora de recordatorio.

Tarea 5.3: Implementar el sistema de asignación
de leads a vendedores con soporte para asignación
manual por el administrador y asignación automática
por Round Robin cuando el modo autónomo está
activado.
Criterio de aceptación: La asignación manual
funciona desde la ficha del lead y el Round Robin
distribuye equitativamente los nuevos leads entre
los vendedores activos del departamento.

Tarea 5.4: Implementar el Radar de Intención
con la clasificación por temperatura y los filtros
de ordenación.
Criterio de aceptación: Los leads sin cita
confirmada con señales de interés detectadas
aparecen en el Radar ordenados por temperatura
y fecha de última interacción.

Semana 6: Módulo de Calendario en el Dashboard

Tarea 6.1: Implementar la vista de calendario
mensual visual en el dashboard con indicación
de los días activos y cerrados según la
configuración del calendario de la organización.
Criterio de aceptación: El calendario mensual
muestra correctamente los días laborables y los
días cerrados según el horario base y las
excepciones configuradas.

Tarea 6.2: Implementar el modal de creación y
edición de excepciones del calendario con los
campos de fecha, tipo de excepción, horario
especial si aplica, y descripción del motivo.
Criterio de aceptación: Una excepción creada
desde el modal aparece inmediatamente en el
calendario visual y es tenida en cuenta por el
RPC de disponibilidad en la siguiente consulta.

Tarea 6.3: Implementar la configuración del
horario base semanal para organizaciones,
departamentos y vendedores con el selector visual
de días y horas.
Criterio de aceptación: Los cambios en el horario
base se reflejan en el calendario visual
inmediatamente y el RPC de disponibilidad los
aplica correctamente.

Tarea 6.4: Implementar la agenda individual del
vendedor con las vistas de día y semana y la
visualización de los detalles de cada cita.
Criterio de aceptación: La agenda del vendedor
muestra correctamente todas sus citas asignadas
con el resumen del lead vinculado a cada una.

Semana 7: Flujos de n8n y Sistema de
Notificaciones

Tarea 7.1: Implementar el flujo de n8n de
identificación del cliente al inicio de la llamada
con la consulta al CRM y la construcción del
contexto dinámico del prompt.
Criterio de aceptación: El flujo completo desde
la recepción del webhook de inicio de llamada
hasta la devolución del contexto a Retell AI
se ejecuta en menos de quinientos milisegundos.

Tarea 7.2: Implementar el flujo de n8n de
procesamiento del fin de llamada con la creación
del lead, el registro de la cita si fue agendada,
y el envío del WhatsApp de confirmación.
Criterio de aceptación: Todos los elementos
generados por el fin de una llamada (lead, cita,
WhatsApp) aparecen en el sistema en menos de
sesenta segundos tras el fin de la llamada.

Tarea 7.3: Implementar el sistema de notificaciones
del dashboard con los tres niveles de urgencia
y la distribución por roles.
Criterio de aceptación: Las notificaciones urgentes
aparecen destacadas visualmente en el dashboard
del administrador correspondiente y las
notificaciones informativas no interrumpen el
flujo de trabajo.

Tarea 7.4: Implementar el flujo de detección de
anomalías y bugs empresariales con la generación
automática de notificaciones urgentes.
Criterio de aceptación: Una llamada donde el
cliente menciona un vehículo no catalogado genera
la notificación urgente correcta en el dashboard
del administrador en menos de sesenta segundos.

Semana 8: Testing End-to-End y Preparación
del Lanzamiento

Tarea 8.1: Ejecutar todos los casos de prueba
del Apéndice J y documentar los resultados.
Criterio de aceptación: Todos los casos de prueba
pasan correctamente sin errores.

Tarea 8.2: Realizar una prueba de carga simulando
el uso simultáneo de diez organizaciones con
cinco llamadas concurrentes cada una.
Criterio de aceptación: El sistema mantiene las
latencias dentro de los umbrales definidos bajo
carga y no se producen errores de concurrencia.

Tarea 8.3: Realizar una auditoría de seguridad
verificando las políticas de RLS, los controles
de acceso por roles y la correcta implementación
del sistema de retención y eliminación de
grabaciones.
Criterio de aceptación: Ningún usuario puede
acceder a datos de una organización diferente
a la suya bajo ningún escenario de prueba.

Tarea 8.4: Preparar el entorno de producción con
la configuración de dominios, certificados SSL,
variables de entorno y monitorización de errores.
Criterio de aceptación: El entorno de producción
está completamente configurado y responde
correctamente a las pruebas de verificación pre-lanzamiento.

Tarea 8.5: Realizar la primera demostración
completa del producto con un concesionario real
del entorno de Huelva o Sevilla.
Criterio de aceptación: La demostración cubre
todos los flujos principales del sistema en menos
de diez minutos y el cliente expresa interés
en contratar el servicio o solicita una prueba
gratuita.

APÉNDICE M: RECURSOS Y REFERENCIAS
Este apéndice recopila las fuentes de datos y
los recursos técnicos que han sido utilizados
en la elaboración de este documento y que son
relevantes para el desarrollo y la operación
de Onucall.

Fuentes de Datos de Mercado

ANFAC (Asociación Española de Fabricantes de
Automóviles y Camiones): Datos oficiales de
matriculaciones de turismos y vehículos comerciales
en España. Web: anfac.com

GANVAM (Asociación Nacional de Vendedores de
Vehículos a Motor, Reparación y Recambios): Datos
oficiales del mercado de vehículos de ocasión
en España. Web: ganvam.es

Faconauto (Federación de Asociaciones de
Concesionarios de la Automoción): Datos de
rentabilidad, facturación y estructura del sector
concesionarios en España. Web: faconauto.com

ANESDOR (Asociación Nacional de Empresas del
Sector de las Dos Ruedas): Datos oficiales de
matriculaciones de motocicletas y ciclomotores
en España. Web: anesdor.com

ANEN (Asociación Nacional de Empresas Náuticas):
Datos oficiales del mercado de embarcaciones de
recreo en España. Web: anen.es

ASEICAR (Asociación Española de la Industria y
Comercio del Caravaning): Datos oficiales del
mercado de autocaravanas, campers y caravanas
en España. Web: aseicar.es

Ministerio de Agricultura, Pesca y Alimentación
(MAPA): Datos de ventas de maquinaria agrícola
y tractores en España. Web: mapa.gob.es

DBK Datamonitor: Informes sectoriales sobre el
mercado de concesionarios de automóviles en España.

Bumper: Informe The 2025 State of AI Adoption
in Car Dealerships sobre la adopción de
inteligencia artificial en el sector de
concesionarios en España.

CBRE España: Informe de Madurez Digital del Sector
Inmobiliario en España 2025-2026.

Documentación Técnica

Supabase Documentation: docs.supabase.com
Documentación oficial de Supabase incluyendo
Row Level Security, Edge Functions, Storage y
pgvector.

pgvector GitHub: github.com/pgvector/pgvector
Documentación y ejemplos de uso de la extensión
pgvector para PostgreSQL.

Retell AI Documentation: docs.retellai.com
Documentación oficial de la API de Retell AI
incluyendo la gestión de agentes, los webhooks
y el mecanismo de tool calling.

Zadarma API Documentation: zadarma.com/es/support/api
Documentación oficial de la API de Zadarma para
la gestión de números de teléfono y el historial
de llamadas.

n8n Documentation: docs.n8n.io
Documentación oficial de n8n incluyendo los nodos
disponibles, los triggers y las mejores prácticas
para flujos de automatización en producción.

Qwik Documentation: qwik.dev/docs
Documentación oficial del framework Qwik
incluyendo QwikCity, el sistema de routing y
las mejores prácticas de rendimiento.

OpenAI API Documentation: platform.openai.com/docs
Documentación oficial de la API de OpenAI
incluyendo el modelo text-embedding-3-small para
la generación de embeddings.

Anthropic API Documentation: docs.anthropic.com
Documentación oficial de la API de Anthropic
para el uso del modelo Claude 3.5 Sonnet como
LLM principal del sistema.

Marco Legal

Reglamento (UE) 2016/679 del Parlamento Europeo
y del Consejo relativo a la protección de las
personas físicas en lo que respecta al tratamiento
de datos personales y a la libre circulación de
estos datos (RGPD). Publicado en el Diario Oficial
de la Unión Europea el 4 de mayo de 2016.

Ley Orgánica 3/2018, de 5 de diciembre, de
Protección de Datos Personales y Garantía de los
Derechos Digitales (LOPD-GDD). Publicada en el
Boletín Oficial del Estado el 6 de diciembre de
2018.

Agencia Española de Protección de Datos (AEPD):
Guías y criterios de interpretación del RGPD
aplicables al tratamiento de datos personales
en el contexto de servicios de atención al cliente
y grabación de llamadas. Web: aepd.es

Fin del documento versión 1.0

Control de versiones:

| Versión | Fecha | Responsable | Cambios principales |
|:---|:---|:---|:---|
| 1.0 | 23 febrero 2026 | Fundador | Documento inicial completo. Cubre el ciclo completo del vertical de concesionarios de vehículos incluyendo arquitectura técnica, módulos del producto, integraciones, privacidad, modelo de negocio y hoja de ruta. |
| 1.1 | Por definir | Por definir | Incorporación de la documentación técnica de la API pública. Incorporación del vertical inmobiliario. |
| 1.2 | Por definir | Por definir | Incorporación de las integraciones con DMS y portales de anuncios. Actualización de las proyecciones financieras con datos reales de los primeros clientes. |
| 2.0 | Por definir | Por definir | Incorporación de los verticales de abogados y clínicas médicas. Revisión completa del modelo de negocio con datos de mercado actualizados. |

Documento confidencial. Propiedad intelectual
exclusiva del equipo fundador de Onucall. Queda
expresamente prohibida su reproducción total o
parcial, su distribución a terceros y su uso para
fines distintos al desarrollo interno del producto,
sin la autorización expresa y por escrito del
equipo fundador.

Onucall © 2026. Todos los derechos reservados.

