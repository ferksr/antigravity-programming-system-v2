# GeoZone Optimizer — Especificación Maestra para Agente de IDE

## 0. Instrucciones para el agente

Este documento define el producto, sus reglas funcionales y sus decisiones arquitectónicas iniciales.

Antes de programar:

1. Leer este documento completo.
2. Leer `PRODUCT.md`, `ARCHITECTURE.md`, `SCORING.md`, `PROVIDERS.md` y `DECISIONS.md` si existen.
3. No implementar una decisión que contradiga una regla definida aquí.
4. Si una decisión técnica no está definida, elegir la solución más simple que respete los principios del proyecto y documentarla en `DECISIONS.md`.
5. No agregar dependencias, APIs externas ni servicios innecesarios.
6. Priorizar siempre el procesamiento local.
7. Antes de hacer una llamada a Google, verificar si el resultado puede reutilizarse.
8. No modificar el dominio para adaptarlo a una API específica.
9. Toda nueva funcionalidad debe incluir tests apropiados.
10. Mantener la documentación actualizada cuando cambie una decisión o regla.

La aplicación debe construirse como un producto real, incrementalmente, comenzando por un MVP funcional.

---

# 1. Objetivo del producto

Construir una aplicación web local-first que permita encontrar las mejores ubicaciones dentro de una zona geográfica definida por el usuario.

El usuario define una zona mediante un cuadrilátero sobre un mapa y evalúa las posibles ubicaciones utilizando múltiples criterios, por ejemplo:

* tiempo de viaje al trabajo;
* tiempo de viaje de otra persona;
* tiempo de viaje de un familiar;
* transporte público;
* automóvil;
* proximidad a parques;
* proximidad a plazas;
* proximidad a clubes;
* proximidad a escuelas;
* proximidad a jardines;
* proximidad a lugares encontrados mediante texto libre.

Cada criterio tiene:

* parámetros propios;
* peso;
* resultado original;
* score normalizado;
* participación en el score final.

El usuario puede controlar cuánto se penaliza que una ubicación tenga criterios muy desparejos.

El sistema debe producir un ranking de ubicaciones y permitir verificar cada resultado.

Después de una primera evaluación, el usuario puede seleccionar candidatos y realizar refinamientos con mayor precisión.

El objetivo técnico principal es:

> Obtener la mayor cantidad de información útil minimizando las llamadas a APIs externas.

---

# 2. Principios inmutables del sistema

## 2.1 Local-first

Todo lo que pueda calcularse localmente debe calcularse localmente.

No utilizar APIs externas para:

* geometría;
* distancias geográficas;
* generación de grillas;
* máscaras;
* generación de candidatos;
* índices espaciales;
* threshold;
* scoring;
* normalización;
* pesos;
* penalización;
* historial;
* persistencia;
* búsqueda de resultados reutilizables;
* estimación de consumo.

## 2.2 API externa

El MVP utiliza únicamente Google Maps Platform como proveedor externo.

No agregar otras APIs que requieran API key.

El mapa principal no utiliza Google Maps.

## 2.3 BYOK

El usuario proporciona su propia API key de Google.

La key:

* no debe estar hardcodeada;
* no debe estar en Git;
* no debe incluirse en exports;
* no debe aparecer en logs;
* debe estar separada de los datos del proyecto;
* debe mostrarse enmascarada;
* debe poder eliminarse.

La arquitectura debe permitir migrar en el futuro a un backend o proxy sin modificar el dominio.

## 2.4 Configurabilidad

El usuario decide y configura:

* zona;
* grilla;
* resolución;
* criterios;
* pesos;
* penalización;
* threshold;
* freshness;
* reutilización;
* refinamientos;
* límites de consumo.

No automatizar decisiones que el usuario explícitamente controla.

## 2.5 Transparencia y auditabilidad

El sistema debe mostrar:

* qué se calculó;
* qué se reutilizó;
* qué se descartó;
* qué se va a calcular;
* cuántas llamadas se realizaron;
* cuántas se evitaron;
* cuánto se estima consumir;
* qué parámetros produjo cada resultado;
* qué está haciendo la aplicación en tiempo real;
* por qué una operación está pendiente, falló o fue reutilizada.

La aplicación debe disponer de un **Audit Log visible en tiempo real**, copiable y exportable, que permita reconstruir el comportamiento de una evaluación y entregarlo a un agente de IA para auditoría o diagnóstico.

---

# 3. Modelo conceptual

Estas entidades deben mantenerse separadas.

## Proyecto

Contenedor persistente del trabajo del usuario.

Puede contener múltiples evaluaciones y ramas de refinamiento.

## Zona

Región geográfica que se desea evaluar.

En el MVP es un cuadrilátero.

## Grilla

Sistema espacial utilizado para distribuir puntos de evaluación.

La grilla no es la unidad de reutilización.

## Candidato

Ubicación concreta propuesta para ser evaluada.

Tiene coordenadas y pertenece a una evaluación.

Un candidato puede ser nuevo en una evaluación aunque exista un resultado previamente calculado para una ubicación cercana.

## Criterio

Una pregunta que se realiza sobre una ubicación.

Ejemplo:

> ¿Cuánto tarda llegar desde esta ubicación al trabajo A los lunes a las 08:00 en transporte público?

## Resultado

Dato obtenido para una combinación de:

* posición espacial;
* criterio;
* firma;
* proveedor.

Los resultados son reutilizables si cumplen las reglas de compatibilidad.

## Firma de cálculo

Identifica todos los parámetros que pueden afectar un resultado.

## Evaluación

Snapshot de una ejecución completa.

Contiene:

* configuración;
* candidatos;
* criterios;
* resultados utilizados;
* scores;
* ranking.

Una evaluación histórica no debe modificarse.

## Refinamiento

Nueva evaluación que explora una zona más precisa alrededor de candidatos seleccionados.

## Reuse Engine

Componente que determina si un resultado existente puede utilizarse para una nueva necesidad de cálculo.

## Audit Event

Evento técnico o funcional registrado durante la ejecución de la aplicación.

Contiene información suficiente para reconstruir qué hizo la aplicación y por qué.

---

# 4. Flujo principal

El flujo normal es:

1. Crear o abrir proyecto.
2. Dibujar cuadrilátero.
3. Configurar grilla.
4. Ver la grilla en tiempo real.
5. Ver candidatos estimados en tiempo real.
6. Configurar criterios.
7. Configurar pesos.
8. Configurar penalización.
9. Configurar threshold y freshness.
10. Ver estimación de consumo.
11. Ejecutar evaluación.
12. Buscar resultados reutilizables.
13. Calcular únicamente los faltantes.
14. Normalizar resultados.
15. Calcular score final.
16. Mostrar ranking.
17. Seleccionar una ubicación.
18. Inspeccionar cada criterio.
19. Verificar resultados externamente.
20. Seleccionar candidatos para refinar.
21. Configurar refinamiento.
22. Ejecutar nueva evaluación.
23. Reutilizar resultados compatibles anteriores.
24. Comparar evaluaciones.

Todas las etapas relevantes deben producir eventos en el Audit Log.

---

# 5. Regla central de cálculo y reutilización

Para cada dato que la aplicación necesita:

```text
Necesidad de cálculo
→ Buscar resultado existente
→ Comparar firma
→ Buscar resultados espacialmente cercanos
→ Calcular distancia local
→ Verificar threshold
→ Verificar freshness
→ Reutilizar si es compatible
→ Calcular con Google solamente si no existe resultado válido
```

Nunca hacer una llamada a Google antes de ejecutar esta lógica.

Cada decisión debe quedar registrada en el Audit Log.

Ejemplo:

```text
Resultado encontrado
→ Firma compatible
→ Distancia: 143 m
→ Threshold: 200 m
→ Freshness: válido
→ Acción: reutilizar
```

---

# 6. Reutilización espacial

El threshold es una distancia geográfica configurable.

Valor inicial recomendado:

`200 metros`

Ejemplos:

* `0 m`: coincidencia exacta;
* `50 m`;
* `100 m`;
* `200 m`;
* `500 m`.

El cálculo del threshold es completamente local.

Utilizar distancia geodésica.

No utilizar diferencias simples de latitud/longitud.

El sistema no necesita detectar automáticamente ríos, autopistas u otras barreras.

Si el usuario considera que una barrera geográfica hace inadecuada la reutilización, puede reducir el threshold.

Cada decisión de reutilización o rechazo debe registrarse.

---

# 7. Reutilización lógica

Un resultado solo puede reutilizarse si su firma es compatible.

Ejemplos:

* automóvil ≠ transporte público;
* lunes 08:00 ≠ lunes 09:00;
* origen diferente ≠ mismo origen;
* destino diferente ≠ mismo destino;
* preferencias diferentes ≠ mismas preferencias.

La proximidad espacial nunca compensa una incompatibilidad lógica.

El Audit Log debe registrar explícitamente los motivos de incompatibilidad cuando un resultado candidato no puede reutilizarse.

---

# 8. Reutilización entre evaluaciones

Los resultados almacenados no pertenecen exclusivamente a una evaluación.

Una nueva evaluación puede reutilizar resultados obtenidos previamente si:

* la firma es compatible;
* están dentro del threshold;
* cumplen freshness.

Esto incluye resultados obtenidos en:

* evaluaciones anteriores;
* refinamientos;
* ramas alternativas;
* evaluaciones que luego fueron eliminadas visualmente.

Eliminar una evaluación no implica borrar automáticamente los resultados reutilizables.

---

# 9. Firma de cálculo

La firma debe ser determinística.

Debe contener todos los parámetros que puedan afectar el resultado.

Según el criterio:

* tipo;
* origen;
* destino;
* modo;
* día;
* fecha;
* hora;
* salida/llegada;
* preferencias;
* restricciones;
* categoría;
* texto;
* parámetros de búsqueda;
* proveedor;
* versión relevante;
* timezone.

La firma debe calcularse localmente.

Nunca reutilizar un resultado si la firma no es compatible.

Registrar en el Audit Log:

* firma solicitada;
* firma encontrada;
* comparación;
* resultado de compatibilidad.

No exponer API keys ni secretos en el log.

---

# 10. Grilla y generación de candidatos

## 10.1 Tecnología

Utilizar H3.

Motivos:

* gratuito;
* open source;
* sin API key;
* cobertura global;
* determinístico;
* reproducible;
* múltiples resoluciones;
* IDs estables;
* estructura jerárquica.

## 10.2 Zona

El MVP utiliza un cuadrilátero definido por el usuario.

El cuadrilátero genera una máscara geográfica.

Solo participan las celdas que intersectan la máscara según la regla definida.

## 10.3 Candidatos

Para cada celda seleccionada:

1. generar un punto representativo;
2. verificar que esté dentro de la zona;
3. descartar puntos claramente inválidos;
4. crear candidato.

La estrategia exacta para elegir el punto representativo debe estar encapsulada y poder cambiarse.

## 10.4 Importante

Las celdas H3 se utilizan para:

* distribuir candidatos;
* obtener reproducibilidad;
* facilitar indexación espacial;
* favorecer coincidencias entre evaluaciones superpuestas.

No se deben tratar como la unidad principal de cache.

El cache se basa en resultados asociados a posiciones y firmas.

---

# 11. Preview en tiempo real

Toda modificación que pueda calcularse localmente debe visualizarse inmediatamente en el mapa.

Como mínimo:

* cuadrilátero;
* máscara;
* grilla;
* resolución H3;
* tamaño aproximado de celdas;
* cantidad de celdas;
* candidatos;
* cantidad de candidatos;
* zonas de refinamiento;
* tamaño de refinamiento;
* resolución de refinamiento.

Ejemplo:

Al cambiar la resolución de la grilla, el mapa debe actualizar inmediatamente:

* celdas;
* candidatos;
* cantidad estimada.

No hacer llamadas a Google para actualizar el preview.

La UI debe diferenciar:

* preview local;
* cálculo externo pendiente;
* resultado externo disponible.

Registrar en el Audit Log los cambios relevantes de configuración y regeneración del preview.

---

# 12. Accesibilidad y candidatos inválidos

Descartar candidatos claramente inutilizables.

Ejemplos:

* mar;
* lagos;
* cuerpos de agua;
* ubicaciones evidentemente no utilizables.

Utilizar primero métodos locales.

Usar Google únicamente cuando sea necesario.

Separar:

* validez geográfica;
* accesibilidad física;
* accesibilidad vial;
* accesibilidad mediante transporte público.

La implementación inicial puede comenzar con validación básica y evolucionar posteriormente.

Registrar el motivo de cada descarte.

---

# 13. Criterios

El sistema debe tener un motor genérico de criterios.

Los criterios iniciales son:

## 13.1 Viaje A

Origen:

* candidato.

Destino:

* ubicación configurable.

Modo:

* transporte público.

Parámetros:

* día;
* hora;
* salida/llegada;
* preferencias disponibles.

Resultado:

* duración.

## 13.2 Viaje B

Origen:

* candidato.

Destino:

* segunda ubicación configurable.

Modo:

* transporte público.

Parámetros:

* día;
* hora;
* salida/llegada;
* preferencias disponibles.

Resultado:

* duración.

## 13.3 Viaje C

Origen:

* ubicación configurable.

Destino:

* candidato.

Modo:

* automóvil.

Parámetros:

* día;
* hora;
* salida/llegada;
* preferencias disponibles.

Resultado:

* duración.

## 13.4 Proximidad por categoría

Ejemplos:

* parque;
* plaza;
* club;
* jardín de infantes;
* escuela;
* hospital.

## 13.5 Proximidad por texto

Permitir búsquedas mediante texto libre.

Ejemplos:

* espacio verde;
* club con determinadas características;
* jardín bilingüe.

La búsqueda por categoría y la búsqueda por texto deben tratarse como tipos de criterio diferentes.

---

# 14. Google Provider

La integración con Google debe estar aislada en Infrastructure.

El dominio no debe importar SDKs de Google.

Implementar inicialmente:

* rutas en automóvil;
* rutas en transporte público;
* búsqueda de Places;
* links de verificación.

El provider debe devolver modelos internos, no objetos específicos de Google.

Toda operación debe registrar:

* proveedor;
* tipo de operación;
* parámetros relevantes;
* timestamp;
* resultado;
* error si corresponde.

Los eventos deben alimentar el Audit Log.

---

# 15. Estado de proveedores y diagnóstico

La aplicación debe permitir conocer en todo momento el estado de las APIs externas desde la perspectiva de la propia aplicación.

No afirmar que un proveedor está globalmente caído basándose únicamente en una solicitud fallida.

El sistema debe diferenciar entre:

* funcionando;
* lento;
* solicitudes pendientes;
* timeout;
* error de red;
* error de autenticación;
* API no habilitada;
* cuota o límite;
* error del proveedor;
* error desconocido.

El estado debe basarse en actividad observable de la aplicación.

---

# 16. Ejecución y detección de procesos trabados

Cada ejecución debe tener un estado explícito:

* `IDLE`
* `PLANNING`
* `ESTIMATING`
* `RUNNING`
* `PAUSED`
* `WAITING_PROVIDER`
* `DEGRADED`
* `STALLED`
* `COMPLETED`
* `PARTIAL`
* `FAILED`
* `CANCELLED`

La UI debe mostrar siempre el estado actual.

Si existe un período configurable sin progreso, valor inicial:

`30 segundos`

y existen operaciones pendientes, mostrar que la ejecución parece estar esperando respuestas externas.

No cancelar automáticamente.

Mostrar:

* tiempo desde la última respuesta;
* solicitudes pendientes;
* solicitudes en timeout;
* última operación enviada;
* última operación completada;
* último evento recibido.

Registrar la transición de estado en el Audit Log.

---

# 17. Timeout y reintentos

Toda solicitud externa debe tener timeout.

Valor inicial recomendado:

`30 segundos`

Al alcanzar el timeout:

1. registrar la solicitud;
2. marcarla como `TIMEOUT`;
3. mostrarla en el diagnóstico;
4. decidir si se reintenta según la política configurada.

Nunca dejar una solicitud pendiente indefinidamente.

Los reintentos deben ser controlados.

Utilizar:

* cantidad máxima configurable;
* backoff;
* jitter.

No reintentar automáticamente errores permanentes.

Cada intento debe registrarse.

Ejemplo:

```text
Solicitud 145
Intento 1 → timeout
Intento 2 → exitoso
```

El consumo debe contabilizar correctamente cada llamada realizada.

---

# 18. Health Check

Permitir ejecutar una prueba manual de conexión.

El usuario puede seleccionar:

`Comprobar conexión con Google`

La prueba debe:

1. verificar configuración;
2. verificar disponibilidad de red;
3. realizar una solicitud mínima válida;
4. medir latencia;
5. identificar errores de autenticación o configuración;
6. mostrar el resultado.

La prueba debe advertir que puede generar consumo o facturación según el proveedor.

No ejecutar health checks automáticamente con alta frecuencia.

Registrar el resultado en el Audit Log.

---

# 19. Audit Log visible y auditable

La aplicación debe tener un **Audit Log visible en tiempo real**.

Su propósito es permitir que:

1. el usuario vea qué está haciendo la aplicación;
2. pueda diagnosticar problemas;
3. pueda auditar una evaluación;
4. pueda copiar el contenido y entregarlo a un agente de IA;
5. pueda reconstruir por qué se tomó una decisión.

El log no es únicamente un log de errores.

Debe registrar las decisiones importantes del sistema.

## 19.1 Eventos mínimos

Registrar, cuando corresponda:

* inicio de aplicación;
* apertura de proyecto;
* modificación de configuración;
* cambio de zona;
* generación de grilla;
* generación de candidatos;
* descarte de candidatos;
* creación de firma;
* búsqueda de reutilización;
* resultado reutilizado;
* resultado rechazado;
* motivo de rechazo;
* llamada a Google;
* solicitud enviada;
* respuesta recibida;
* timeout;
* retry;
* error;
* pausa;
* reanudación;
* cancelación;
* cambio de estado;
* cálculo de score;
* finalización;
* evaluación parcial;
* exportación;
* importación.

## 19.2 Información de cada evento

Cada evento debe incluir, cuando esté disponible:

* timestamp;
* nivel;
* tipo de evento;
* proyecto;
* evaluación;
* operación;
* candidato;
* criterio;
* proveedor;
* estado;
* mensaje;
* duración;
* error;
* request ID interno;
* correlation ID;
* módulo;
* función;
* archivo;
* línea;
* columna.

Los datos sensibles nunca deben registrarse.

Nunca incluir:

* API keys;
* credenciales;
* secretos;
* tokens.

## 19.3 Referencia técnica

La aplicación debe intentar mostrar la ubicación exacta del código que generó el evento:

```text
module: providers/google/routing.ts
function: computeRoute
file: routing.ts
line: 184
column: 12
```

En desarrollo, utilizar sourcemaps cuando sea posible.

En producción, la referencia de archivo y línea es `best effort`.

Si no está disponible, mostrar al menos:

* módulo;
* función;
* identificador de operación.

No hacer depender el funcionamiento de la aplicación de la disponibilidad de archivo o línea.

## 19.4 Formato de evento

Ejemplo:

```text
[10:32:15.120]
evaluation=E-102
operation=route#144
status=RUNNING
module=providers/google/routing.ts
function=computeRoute
file=routing.ts
line=184
candidate=-32.95,-60.65
criterion=Work A
message=Request sent
```

Ejemplo de reutilización:

```text
[10:32:15.130]
evaluation=E-102
operation=reuse#144
status=REUSED
module=application/reuse/ReuseEngine.ts
function=findReusableResult
candidate=-32.95,-60.65
criterion=Work A
distance=143m
threshold=200m
signature=compatible
freshness=valid
message=Existing result reused
```

## 19.5 Propagación de contexto

Cada ejecución debe tener:

* `projectId`;
* `evaluationId`;
* `operationId`;
* `correlationId`.

Estos identificadores deben propagarse a través de las capas relevantes.

Esto permite seguir una operación desde:

```text
UI
→ Application
→ Reuse Engine
→ Provider
→ Persistencia
```

El usuario debe poder filtrar el log por estos identificadores.

## 19.6 Interfaz del log

Debe permitir:

* ver en tiempo real;
* pausar el desplazamiento automático;
* buscar;
* filtrar por nivel;
* filtrar por evaluación;
* filtrar por operación;
* filtrar por proveedor;
* filtrar por estado;
* expandir detalles;
* copiar evento;
* copiar selección;
* copiar evaluación completa;
* exportar log.

El modo de copia debe producir texto legible para humanos y agentes de IA.

## 19.7 Auditoría histórica

Una evaluación finalizada debe conservar sus eventos de auditoría relevantes.

El usuario debe poder abrir una evaluación y revisar:

* qué ocurrió;
* en qué orden;
* qué se reutilizó;
* qué se calculó;
* qué falló;
* por qué falló;
* qué resultados se descartaron.

El log histórico no debe cambiar retrospectivamente.

Los logs técnicos de desarrollo pueden tener políticas de retención diferentes.

---

# 20. Diagnóstico por operación

Cada operación debe poder inspeccionarse.

Mostrar:

* ID;
* tipo;
* criterio;
* candidato;
* firma;
* estado;
* inicio;
* finalización;
* duración;
* reutilizado o calculado;
* proveedor;
* error;
* cantidad de intentos.

Ejemplo:

```text
Operación #145

Tipo: Transit Route
Candidato: -32.95, -60.65
Estado: TIMEOUT
Inicio: 10:32:15
Última actividad: 10:32:45
Intentos: 1
Proveedor: Google
```

La operación debe poder localizarse dentro del Audit Log mediante su ID.

---

# 21. Consumo de API

Antes de ejecutar una evaluación mostrar:

* candidatos;
* resultados reutilizables;
* resultados faltantes;
* nuevas operaciones estimadas;
* consumo estimado.

Durante:

* progreso;
* completados;
* reutilizados;
* calculados;
* errores;
* timeouts;
* reintentos;
* cancelados;
* solicitudes pendientes;
* estado del proveedor.

Después:

* total de operaciones;
* reutilizados;
* nuevas llamadas;
* reintentos;
* errores;
* timeouts;
* resultados parciales.

Diferenciar:

* HTTP requests;
* operaciones lógicas;
* unidades facturables.

No asumir que son equivalentes.

Permitir:

* cancelar;
* pausar;
* reanudar;
* limitar concurrencia;
* configurar límites;
* detener ejecución ante límites.

Toda operación de consumo debe registrarse en el Audit Log.

---

# 22. Persistencia

Usar IndexedDB mediante Dexie.

Guardar localmente:

* proyectos;
* configuraciones;
* zonas;
* evaluaciones;
* candidatos;
* resultados;
* firmas;
* timestamps;
* estadísticas;
* refinamientos;
* eventos de auditoría relevantes.

Permitir:

* exportar;
* importar;
* eliminar;
* limpiar cache.

La API key no se incluye en exports.

La información propia de la aplicación puede conservarse durante meses.

Los datos derivados de proveedores externos deben estar sujetos a la política vigente del proveedor.

La política definitiva de almacenamiento y reutilización de datos de Google debe verificarse antes de publicar el MVP.

---

# 23. Freshness

Cada resultado debe registrar:

* creación;
* última actualización;
* antigüedad;
* proveedor.

El usuario puede configurar freshness.

La reutilización depende de:

```text
firma compatible
+
distancia <= threshold
+
freshness válido
```

El historial de evaluaciones y el almacenamiento de resultados son conceptos diferentes.

Un resultado puede dejar de ser reutilizable y seguir formando parte del historial de una evaluación.

Registrar en el Audit Log las razones de reutilización o rechazo por freshness.

---

# 24. Evaluaciones e historial

Cada evaluación es inmutable.

Ejemplo:

```text
Evaluación inicial
├── Refinamiento A
│   └── Refinamiento A.1
└── Refinamiento B
```

El usuario puede:

* volver a una evaluación;
* crear una rama;
* refinar nuevamente;
* cambiar resolución;
* cambiar threshold;
* cambiar criterios;
* iniciar una evaluación independiente.

"Iniciar desde cero" significa crear una nueva evaluación.

No implica eliminar automáticamente resultados previamente almacenados.

---

# 25. Refinamiento

El refinamiento siempre es controlado por el usuario.

El usuario selecciona:

* candidatos;
* tamaño de área;
* resolución;
* tamaño de celda;
* threshold.

El sistema genera una nueva evaluación.

Si las áreas se superponen, los candidatos pueden quedar espacialmente próximos.

El sistema no necesita que las celdas sean idénticas para reutilizar resultados.

La reutilización se realiza mediante:

* firma;
* distancia;
* threshold;
* freshness.

La nueva evaluación debe aprovechar resultados compatibles de cualquier evaluación anterior.

Registrar en el Audit Log:

* candidatos seleccionados;
* parámetros del refinamiento;
* candidatos generados;
* resultados reutilizados;
* nuevos cálculos.

---

# 26. Scoring

El scoring se realiza después de obtener los valores originales.

Flujo:

```text
Resultado original
→ Normalización
→ Score individual 1–100
→ Peso
→ Penalización
→ Score final
```

Nunca perder el valor original.

## 26.1 Normalización relativa

El score se calcula respecto del conjunto de candidatos de una evaluación.

Escala:

`1–100`

Nunca utilizar 0.

### Menor es mejor

Ejemplo:

* tiempo;
* distancia.

```text
score = 1 + 99 × (max - value) / (max - min)
```

### Mayor es mejor

Ejemplo:

* rating;
* cantidad de reseñas.

```text
score = 1 + 99 × (value - min) / (max - min)
```

### Todos iguales

Si `max = min`:

```text
score = 100
```

El score siempre debe permanecer entre `1` y `100`.

Los cálculos internos pueden utilizar decimales.

Registrar los resultados de scoring relevantes en el Audit Log.

---

# 27. Rangos pesimistas

Si un proveedor devuelve un rango, usar el extremo que genere el peor resultado para el criterio.

Regla:

> Pesimista = extremo del rango que produce el peor score.

Ejemplos:

```text
20–50 minutos → 50
500–800 metros → 800
4.2–4.7 rating → 4.2
100–500 reseñas → 100
```

---

# 28. Pesos

Cada criterio tiene un peso no negativo.

Los pesos no necesitan sumar 100.

Normalizar:

```text
peso_normalizado = peso / suma_de_pesos
```

Si todos son 0, mostrar error.

---

# 29. Penalización por desigualdad

El usuario dispone de un slider de `0–100`.

Objetivo:

* `0`: no penalizar desigualdad;
* `100`: máxima penalización.

Utilizar inicialmente una media generalizada:

```text
Score = (Σ wᵢ × xᵢ^p)^(1/p)
```

Donde:

* `xᵢ`: score individual 1–100;
* `wᵢ`: peso normalizado;
* `p`: función del slider.

Mapeo inicial:

```text
p = 1 - 0.99 × (penalty / 100)
```

Validar mediante tests.

El sistema debe verificar casos como:

* `100, 100` > `45, 45`;
* con penalización suficiente, `45, 45` > `100, 1`.

La implementación debe ser estable cuando `p` se aproxima a 0.

---

# 30. Historial de scoring

Cada evaluación debe guardar:

* valores originales;
* min;
* max;
* dirección;
* scores;
* pesos;
* penalización;
* score final;
* configuración;
* timestamp.

Los scores históricos no deben cambiar cuando se agreguen nuevos candidatos.

La UI debe diferenciar:

* valor original;
* score;
* score final;
* fecha;
* resultado calculado;
* resultado reutilizado.

---

# 31. Verificación externa

Al seleccionar un candidato mostrar:

* ubicación;
* score final;
* score por criterio;
* valor original;
* peso;
* contribución;
* fecha;
* origen del resultado.

## Viajes

Mostrar:

* duración;
* origen;
* destino;
* modo;
* día;
* hora;
* salida/llegada.

Proporcionar link de Google Maps para verificar la ruta.

El link debe reproducir únicamente los parámetros que Google Maps permita representar.

No afirmar equivalencia exacta cuando no pueda garantizarse.

## Places

Permitir abrir en Google Maps los lugares utilizados para los criterios.

El usuario debe poder verificar:

* existencia;
* ubicación;
* rating;
* reseñas;
* características.

---

# 32. Timezone

La aplicación debe funcionar globalmente.

No asumir un país específico.

Cada proyecto debe tener una timezone de referencia.

Cuando día y hora afectan un cálculo, la timezone debe formar parte de la firma.

Si la zona cruza husos horarios:

* advertir;
* permitir configuración explícita.

---

# 33. Configuración del usuario

Configurable:

### Zona

* cuadrilátero.

### Grilla

* resolución H3;
* parámetros de generación;
* punto representativo cuando corresponda.

### Reutilización

* threshold;
* freshness;
* utilizar resultados previos.

### Criterios

* parámetros específicos de cada criterio.

### Scoring

* pesos;
* penalización.

### API

* API key;
* concurrencia;
* límites;
* timeout;
* reintentos.

### Refinamiento

* candidatos;
* tamaño;
* resolución;
* threshold.

### Observabilidad

* nivel de log;
* retención del log;
* auto-scroll;
* mostrar detalles técnicos;
* mostrar ubicación de código cuando esté disponible.

Todo parámetro local con representación geográfica debe actualizar el mapa en tiempo real.

---

# 34. Arquitectura técnica

Separar:

```text
UI
↓
Application
↓
Domain
↓
Infrastructure
```

## Domain

Contiene:

* candidatos;
* criterios;
* firmas;
* scoring;
* evaluaciones;
* refinamientos;
* reglas de reutilización.

No depende de Google, React ni IndexedDB.

## Application

Contiene casos de uso:

* crear evaluación;
* generar candidatos;
* evaluar criterios;
* reutilizar resultados;
* ejecutar cálculos;
* calcular scores;
* refinar;
* persistir;
* emitir eventos de auditoría.

## Infrastructure

Contiene:

* Google;
* H3;
* geometría;
* índice espacial;
* IndexedDB;
* tracking de consumo;
* observabilidad;
* logging técnico.

## UI

Contiene:

* mapa;
* controles;
* configuración;
* resultados;
* ranking;
* historial;
* progreso;
* Audit Log;
* diagnóstico.

---

# 35. Arquitectura de logging

El logging debe implementarse como infraestructura transversal.

Debe existir un logger estructurado con contexto.

Conceptualmente:

```text
Logger
├── info()
├── debug()
├── warn()
├── error()
└── audit()
```

Los eventos funcionales importantes deben utilizar `audit()`.

Los detalles técnicos de desarrollo pueden utilizar `debug()`.

El logger debe recibir automáticamente el contexto disponible:

* projectId;
* evaluationId;
* operationId;
* correlationId.

La UI debe consumir eventos mediante un mecanismo reactivo.

La persistencia del log debe ser desacoplada de su visualización.

El sistema debe poder:

* mostrar eventos en tiempo real;
* persistir eventos;
* exportarlos;
* filtrarlos.

El logging nunca debe bloquear la ejecución principal.

Si falla la persistencia del log, la operación principal no debe fallar por ese motivo.

---

# 36. Stack

Inicialmente:

* React;
* Vite;
* TypeScript;
* Zustand;
* TanStack Query;
* MapLibre GL JS;
* H3-js;
* Turf.js o equivalente;
* Dexie;
* Vitest;
* Playwright;
* ESLint;
* Prettier.

Los cambios deben registrarse en `DECISIONS.md`.

---

# 37. Estructura del repositorio

```text
/
├── README.md
├── PRODUCT.md
├── ARCHITECTURE.md
├── SCORING.md
├── PROVIDERS.md
├── SECURITY.md
├── DECISIONS.md
├── ROADMAP.md
├── CONTRIBUTING.md
├── CHANGELOG.md
├── LICENSE
├── .gitignore
├── .env.example
│
├── src/
│   ├── domain/
│   │   ├── candidate/
│   │   ├── criteria/
│   │   ├── scoring/
│   │   ├── evaluation/
│   │   ├── reuse/
│   │   └── refinement/
│   │
│   ├── application/
│   │   ├── evaluations/
│   │   ├── candidates/
│   │   ├── calculations/
│   │   └── refinement/
│   │
│   ├── infrastructure/
│   │   ├── google/
│   │   ├── h3/
│   │   ├── spatial/
│   │   ├── persistence/
│   │   ├── usage/
│   │   └── observability/
│   │
│   ├── components/
│   ├── pages/
│   ├── stores/
│   ├── hooks/
│   └── lib/
│
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

---

# 38. Documentación del repositorio

## README.md

Instalación, configuración y ejecución.

## PRODUCT.md

Objetivo, usuarios, alcance y MVP.

## ARCHITECTURE.md

Arquitectura, módulos, flujo y decisiones técnicas.

## SCORING.md

Normalización, pesos, penalización y casos límite.

## PROVIDERS.md

Google APIs, operaciones, límites, consumo y políticas.

## SECURITY.md

API keys, BYOK, persistencia y exports.

## DECISIONS.md

Decisiones arquitectónicas y sus motivos.

## ROADMAP.md

MVP y evolución futura.

## CONTRIBUTING.md

Reglas de desarrollo.

## CHANGELOG.md

Cambios relevantes por versión.

---

# 39. Testing

## Dominio

Probar:

* firmas;
* compatibilidad;
* threshold;
* scoring;
* normalización;
* pesos;
* penalización.

## Espacial

Probar:

* cuadriláteros;
* máscaras;
* H3;
* candidatos;
* distancia;
* threshold;
* superposición.

## Reutilización

Probar:

* mismo resultado;
* resultado cercano;
* resultado lejano;
* firma diferente;
* modo diferente;
* horario diferente;
* freshness vencido;
* freshness válido.

## Historial

Probar:

* evaluación;
* refinamiento;
* ramas;
* nueva evaluación;
* reutilización cruzada.

## Consumo

Probar:

* estimación;
* reutilización;
* cálculo;
* cancelación;
* límites.

## Logging

Probar:

* creación de eventos;
* contexto correcto;
* correlation ID;
* project ID;
* evaluation ID;
* operation ID;
* persistencia;
* exportación;
* filtrado;
* orden cronológico;
* no exposición de API keys;
* eventos de reutilización;
* eventos de errores;
* eventos de timeout;
* eventos de reintento.

## Observabilidad

Probar:

* estado correcto;
* diagnóstico correcto;
* health check;
* medición de latencia;
* detección de ausencia de progreso;
* timeout;
* reintentos;
* pausa;
* reanudación;
* cancelación.

## UI

Probar:

* preview;
* cambios de grilla;
* cambios de candidatos;
* cambios de zona;
* refinamiento;
* progreso;
* Audit Log;
* filtros;
* copia;
* exportación.

---

# 40. Orden de implementación

## Fase 1 — Fundaciones

Implementar:

* proyecto;
* mapa;
* cuadrilátero;
* H3;
* máscara;
* preview;
* candidatos.

Sin Google.

## Fase 2 — Dominio

Implementar:

* criterios;
* firmas;
* resultados;
* scoring;
* normalización;
* pesos;
* penalización.

Sin Google.

## Fase 3 — Persistencia

Implementar:

* IndexedDB;
* proyectos;
* evaluaciones;
* resultados;
* índice espacial.

## Fase 4 — Audit Log

Implementar:

* logger estructurado;
* eventos;
* correlation IDs;
* contexto;
* visualización;
* filtros;
* copia;
* exportación;
* persistencia.

El Audit Log debe estar disponible antes de integrar la lógica compleja de Google.

## Fase 5 — Reuse Engine

Implementar:

* búsqueda espacial;
* threshold;
* firmas;
* freshness;
* reutilización.

Registrar cada decisión en el Audit Log.

## Fase 6 — Google Provider

Implementar:

* automóvil;
* transporte público;
* Places;
* links.

Integrar:

* timeout;
* reintentos;
* diagnóstico;
* estado del proveedor.

## Fase 7 — Usage Manager

Implementar:

* estimación;
* consumo;
* progreso;
* límites;
* cancelación.

Integrar todos los eventos en el Audit Log.

## Fase 8 — MVP UI

Integrar:

* configuración;
* criterios;
* ejecución;
* ranking;
* detalle;
* verificación;
* estado de ejecución;
* Audit Log.

## Fase 9 — Refinamiento

Implementar:

* selección;
* zonas;
* resolución;
* ramas;
* historial.

## Fase 10 — Hardening

Implementar:

* tests;
* errores;
* import/export;
* documentación;
* optimización.

---

# 41. Criterios de aceptación del MVP

El MVP debe poder:

1. Mostrar un mapa sin API key adicional.
2. Dibujar un cuadrilátero.
3. Mostrar grilla en tiempo real.
4. Mostrar candidatos en tiempo real.
5. Cambiar resolución y visualizar inmediatamente el resultado.
6. Generar candidatos con H3.
7. Evaluar al menos tres criterios de viaje.
8. Soportar automóvil y transporte público.
9. Configurar día y hora.
10. Configurar pesos.
11. Normalizar scores de 1 a 100.
12. Aplicar penalización configurable.
13. Generar ranking.
14. Mostrar resultados individuales.
15. Abrir links de verificación.
16. Guardar datos localmente.
17. Reutilizar resultados compatibles.
18. Aplicar threshold local.
19. Mostrar qué resultados fueron reutilizados.
20. Estimar llamadas antes de ejecutar.
21. Mostrar progreso y consumo.
22. Mostrar en tiempo real qué está haciendo la aplicación.
23. Disponer de Audit Log visible.
24. Permitir copiar y exportar el Audit Log.
25. Permitir API key propia.
26. Mostrar errores y causas identificables.
27. Mostrar solicitudes pendientes y timeouts.
28. Mostrar cuándo una ejecución parece trabada.
29. Permitir pausar y cancelar.
30. Seleccionar candidatos para refinamiento.
31. Guardar evaluaciones.
32. Crear nuevas evaluaciones reutilizando resultados compatibles anteriores.
33. Auditar una evaluación histórica.

---

# 42. Roadmap posterior al MVP

Posibles extensiones:

* polígonos complejos;
* múltiples zonas;
* más tipos de criterios;
* más proveedores;
* backend opcional;
* colaboración;
* sincronización;
* publicación online;
* autenticación;
* análisis temporal;
* comparación de escenarios;
* optimización avanzada;
* detección automática de barreras geográficas.

Estas funcionalidades no deben complicar la arquitectura del MVP.

---

# 43. Regla final del proyecto

La aplicación debe seguir este principio:

> Primero resolver localmente.
> Segundo reutilizar resultados existentes.
> Tercero calcular únicamente lo que falta.
> Cuarto llamar a Google solo cuando sea estrictamente necesario.
> Quinto registrar y hacer visible lo que la aplicación está haciendo.

La grilla H3 existe para generar candidatos de forma determinística y reproducible.

El candidato representa una ubicación dentro de una evaluación.

El resultado es el dato reutilizable.

La firma determina compatibilidad lógica.

La distancia y el threshold determinan compatibilidad espacial.

El Reuse Engine decide si un resultado existente puede reutilizarse.

El usuario decide qué evaluar y qué refinar.

La aplicación debe mostrar en el mapa, en tiempo real, todo parámetro local cuya consecuencia geográfica pueda visualizarse.

La aplicación debe mostrar en el Audit Log, en tiempo real, las decisiones y operaciones relevantes que está ejecutando.

El Audit Log debe permitir comprender el comportamiento del sistema sin necesidad de acceder directamente al código fuente.

Cuando sea técnicamente posible, debe permitir localizar el origen del evento en módulo, función, archivo y línea.

La aplicación debe conservar suficiente información para que el usuario pueda entender, verificar y reproducir cada evaluación.

Toda llamada a una API externa debe considerarse un recurso limitado.

El sistema debe ser observable, auditable y diagnosticable desde la interfaz.
