# Project Roadmap

Tracks long-term vision, backlog ideas, planned sprints, active milestones, and completed features.

## Wishlist [APPEND]
- [ ] Soporte de polígonos complejos (más de 4 vértices)
- [ ] Múltiples zonas en una sola evaluación
- [ ] Proveedores adicionales (alternativas a Google)
- [ ] Backend opcional para persistencia compartida
- [ ] Colaboración y sincronización entre usuarios
- [ ] Análisis temporal (variación de tiempos por día/hora)
- [ ] Comparación de escenarios side-by-side
- [ ] Detección automática de barreras geográficas (ríos, autopistas)

## Planned [APPEND]
- [ ] **Fase 3 — Persistencia**: IndexedDB con Dexie. Proyectos, evaluaciones, resultados, índice espacial.
- [ ] **Fase 4 — Audit Log**: Logger estructurado, eventos, correlation IDs, visualización en tiempo real, filtros, copia, exportación.
- [ ] **Fase 5 — Reuse Engine**: Búsqueda espacial, threshold geodésico, firmas, freshness, reutilización cruzada entre evaluaciones.
- [ ] **Fase 6 — Google Provider**: Rutas en auto y transporte público, Places, links de verificación. Timeout, reintentos, diagnóstico.
- [ ] **Fase 7 — Usage Manager**: Estimación pre-ejecución, progreso en tiempo real, límites de consumo, cancelación.
- [ ] **Fase 8 — MVP UI**: Configuración completa, criterios, ejecución, ranking, detalle por candidato, estado de ejecución, Audit Log.
- [ ] **Fase 9 — Refinamiento**: Selección de candidatos, zonas de refinamiento, ramas de evaluación, historial.
- [ ] **Fase 10 — Hardening**: Tests completos, manejo de errores, import/export, documentación, optimización.

## In Progress [EDITABLE]
*(Maximum 1 item in progress at any given time without explicit justification)*
- [ ] **Fase 3 — Persistencia**: IndexedDB con Dexie. Proyectos, evaluaciones, resultados, índice espacial.

## Completed [APPEND]
- [x] **Fase 1 — Fundaciones**: Mapa (Leaflet), cuadrilátero, grilla H3, máscara, candidatos, preview en tiempo real. Sin Google. (Completado: 2026-08-01)
- [x] **Fase 2 — Dominio**: Tipos de evaluación, motor de scoring, penalización exponencial, ranking. 21 tests Vitest. (Completado: 2026-08-01)
