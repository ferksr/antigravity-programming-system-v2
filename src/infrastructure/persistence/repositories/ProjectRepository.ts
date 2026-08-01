import { GeoZoneDatabase, type ProjectEntity } from '../db'

export class ProjectRepository {
  private db: GeoZoneDatabase

  constructor(db: GeoZoneDatabase) {
    this.db = db
  }

  async create(project: Omit<ProjectEntity, 'createdAt' | 'updatedAt'>): Promise<ProjectEntity> {
    const now = new Date().toISOString()
    const entity: ProjectEntity = {
      ...project,
      createdAt: now,
      updatedAt: now,
    }
    await this.db.projects.add(entity)
    return entity
  }

  async getById(id: string): Promise<ProjectEntity | undefined> {
    return this.db.projects.get(id)
  }

  async getAll(): Promise<ProjectEntity[]> {
    return this.db.projects.orderBy('updatedAt').reverse().toArray()
  }

  async update(id: string, changes: Partial<Omit<ProjectEntity, 'id' | 'createdAt'>>): Promise<void> {
    const updatedAt = new Date().toISOString()
    await this.db.projects.update(id, { ...changes, updatedAt })
  }

  async delete(id: string): Promise<void> {
    await this.db.projects.delete(id)
  }
}
