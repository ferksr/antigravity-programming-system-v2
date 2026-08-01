import { GeoZoneDatabase, type EvaluationEntity, type CandidateEntity } from '../db'

export class EvaluationRepository {
  private db: GeoZoneDatabase

  constructor(db: GeoZoneDatabase) {
    this.db = db
  }

  async createEvaluation(
    evaluation: Omit<EvaluationEntity, 'createdAt'>,
    candidates: Omit<CandidateEntity, 'evaluationId'>[]
  ): Promise<EvaluationEntity> {
    const now = new Date().toISOString()
    const evalEntity: EvaluationEntity = {
      ...evaluation,
      createdAt: now,
    }

    const candidateEntities: CandidateEntity[] = candidates.map((c) => ({
      ...c,
      evaluationId: evaluation.id,
    }))

    await this.db.transaction('rw', [this.db.evaluations, this.db.candidates], async () => {
      await this.db.evaluations.add(evalEntity)
      await this.db.candidates.bulkAdd(candidateEntities)
    })

    return evalEntity
  }

  async getById(id: string): Promise<EvaluationEntity | undefined> {
    return this.db.evaluations.get(id)
  }

  async getByProjectId(projectId: string): Promise<EvaluationEntity[]> {
    return this.db.evaluations.where('projectId').equals(projectId).sortBy('createdAt')
  }

  async getCandidatesByEvaluationId(evaluationId: string): Promise<CandidateEntity[]> {
    return this.db.candidates.where('evaluationId').equals(evaluationId).toArray()
  }

  async updateStatus(id: string, status: EvaluationEntity['status']): Promise<void> {
    await this.db.evaluations.update(id, { status })
  }
}
