import 'fake-indexeddb/auto'
import { describe, expect, it, beforeEach } from 'vitest'
import { GeoZoneDatabase } from './db'
import { ProjectRepository } from './repositories/ProjectRepository'
import { EvaluationRepository } from './repositories/EvaluationRepository'
import { ResultRepository } from './repositories/ResultRepository'
import type { QuadrilateralZone } from '../../domain/spatial/types'
import type { EvaluationConfig } from '../../domain/evaluation/types'

describe('IndexedDB Persistence Layer (Dexie)', () => {
  let db: GeoZoneDatabase
  let projectRepo: ProjectRepository
  let evalRepo: EvaluationRepository
  let resultRepo: ResultRepository

  beforeEach(async () => {
    // Unique DB name per test to ensure clean isolate
    db = new GeoZoneDatabase()
    await db.open()
    await db.projects.clear()
    await db.evaluations.clear()
    await db.candidates.clear()
    await db.results.clear()
    await db.auditEvents.clear()

    projectRepo = new ProjectRepository(db)
    evalRepo = new EvaluationRepository(db)
    resultRepo = new ResultRepository(db)
  })

  // --- ProjectRepository Tests ---

  describe('ProjectRepository', () => {
    it('creates and retrieves a project by ID', async () => {
      const project = await projectRepo.create({
        id: 'proj-1',
        name: 'Zona Recoleta',
        description: 'Búsqueda de depto',
      })

      expect(project.id).toBe('proj-1')
      expect(project.name).toBe('Zona Recoleta')
      expect(project.createdAt).toBeDefined()

      const fetched = await projectRepo.getById('proj-1')
      expect(fetched).toEqual(project)
    })

    it('updates project fields', async () => {
      await projectRepo.create({ id: 'proj-2', name: 'Original Name' })
      await projectRepo.update('proj-2', { name: 'Updated Name' })

      const fetched = await projectRepo.getById('proj-2')
      expect(fetched?.name).toBe('Updated Name')
    })

    it('deletes a project', async () => {
      await projectRepo.create({ id: 'proj-3', name: 'To Delete' })
      await projectRepo.delete('proj-3')

      const fetched = await projectRepo.getById('proj-3')
      expect(fetched).toBeUndefined()
    })
  })

  // --- EvaluationRepository Tests ---

  describe('EvaluationRepository', () => {
    const sampleZone: QuadrilateralZone = [
      { lat: -34.59, lng: -58.40 },
      { lat: -34.59, lng: -58.39 },
      { lat: -34.60, lng: -58.39 },
      { lat: -34.60, lng: -58.40 },
    ]

    const sampleConfig: EvaluationConfig = {
      criteria: [],
      penaltySlider: 0,
    }

    it('creates an evaluation with candidate cells atomically', async () => {
      const evalEntity = await evalRepo.createEvaluation(
        {
          id: 'eval-1',
          projectId: 'proj-1',
          name: 'Evaluación Inicial',
          config: sampleConfig,
          zone: sampleZone,
          status: 'COMPLETED',
        },
        [
          { id: 'cand-1', h3Index: '88dd6b8151fffff', lat: -34.59, lng: -58.40 },
          { id: 'cand-2', h3Index: '88dd6b8153fffff', lat: -34.60, lng: -58.39 },
        ]
      )

      expect(evalEntity.id).toBe('eval-1')

      const candidates = await evalRepo.getCandidatesByEvaluationId('eval-1')
      expect(candidates).toHaveLength(2)
      expect(candidates[0].h3Index).toBe('88dd6b8151fffff')
    })
  })

  // --- ResultRepository Tests ---

  describe('ResultRepository', () => {
    it('saves and queries results by signature and criterionId', async () => {
      await resultRepo.saveResults([
        {
          id: 'res-1',
          signature: 'sig-transit-worka',
          lat: -34.59,
          lng: -58.40,
          criterionId: 'crit-work',
          rawValue: 25,
          provider: 'GOOGLE',
        },
        {
          id: 'res-2',
          signature: 'sig-transit-worka',
          lat: -34.60,
          lng: -58.39,
          criterionId: 'crit-work',
          rawValue: 40,
          provider: 'GOOGLE',
        },
      ])

      const found = await resultRepo.findBySignatureAndCriterion('sig-transit-worka', 'crit-work')
      expect(found).toHaveLength(2)
      expect(found[0].rawValue).toBe(25)
    })
  })
})
