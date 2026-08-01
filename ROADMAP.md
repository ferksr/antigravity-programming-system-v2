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

*No item currently in progress.*

## Completed [APPEND]
- [x] **Fase 1 — Fundaciones**: Mapa (Leaflet), cuadrilátero, grilla H3, máscara, candidatos, preview en tiempo real. Sin Google. (Completado: 2026-08-01)
- [x] **Fase 2 — Dominio**: Tipos de evaluación, motor de scoring, penalización exponencial, ranking. 21 tests Vitest. (Completado: 2026-08-01)
- [x] **Fase 3 — Persistencia**: IndexedDB con Dexie. Tablas: projects, evaluations, candidates, results, auditEvents. ProjectRepository, EvaluationRepository, ResultRepository. 5 tests de integración. (Completado: 2026-08-01)
- [x] **Fase 4 — Audit Log**: AuditEvent con correlation IDs, logger con formato §19.4, AuditLogStore reactivo append-only, AuditRepository, useAuditLog hook. 10 tests Vitest. (Completado: 2026-08-01)
- [x] **Fase 5 — Reuse Engine**: Distancia geodésica (Haversine), firmas de cálculo canónicas, motor de reutilización (threshold, freshness, compatibilidad), ReuseService con Audit Log. 8 tests Vitest. (Completado: 2026-08-01)
- [x] **Fase 8 — MVP UI & Proveedor de Simulación Local**: Interfaz completa interactiva en localhost:5173 (paneles de criterios/pesos, slider de penalización por desigualdad, visor de Audit Log en tiempo real con copia para IA, modal de detalle de candidato, coloreado de mapa HSL 1-100 y proveedor de simulación local por modo de transporte). 40 tests Vitest. (Completado: 2026-08-01)
