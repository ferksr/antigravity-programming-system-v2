# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [0.1.0] - 2026-08-01

### Added
- **Scaffolding inicial (Fase 1)**: Inicialización del proyecto con Vite, React, TypeScript y Leaflet.
- **Estructura por capas**: Creados los directorios de la arquitectura (`domain`, `application`, `infrastructure`, `components`, `pages`, `stores`, `hooks`, `lib`).
- **Configuración de Vitest**: Integración de Vitest para ejecuciones de pruebas unitarias locales.
- **Grilla H3 & Cuadrilátero Interactivo**:
  - Modelo espacial de cuadrilátero (`QuadrilateralZone`) con 4 vértices interactivos y arrastrales.
  - Generación de grilla H3 con `h3-js` e integración de puntos candidatos centroides.
  - Componente `ZoneControls.tsx` para modificar la resolución H3 (niveles 7 a 9) y estadísticas en tiempo real.
  - Componente `MapContainer.tsx` con Leaflet para renderizado GeoJSON libre de problemas de ciclo de vida.
