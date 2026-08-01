import { GeoZoneDatabase, type ResultEntity } from '../db'

export class ResultRepository {
  private db: GeoZoneDatabase

  constructor(db: GeoZoneDatabase) {
    this.db = db
  }

  async saveResults(results: Omit<ResultEntity, 'createdAt'>[]): Promise<void> {
    const now = new Date().toISOString()
    const entities: ResultEntity[] = results.map((r) => ({
      ...r,
      createdAt: now,
    }))
    await this.db.results.bulkAdd(entities)
  }

  async findBySignatureAndCriterion(
    signature: string,
    criterionId: string
  ): Promise<ResultEntity[]> {
    return this.db.results
      .where('[signature+criterionId]')
      .equals([signature, criterionId])
      .toArray()
  }

  async findBySignature(signature: string): Promise<ResultEntity[]> {
    return this.db.results.where('signature').equals(signature).toArray()
  }

  async countTotal(): Promise<number> {
    return this.db.results.count()
  }

  async clearAll(): Promise<void> {
    await this.db.results.clear()
  }
}
