export interface IEntityRepository<T> {
  findById(id: string): Promise<T | null>;
  findByEmail(email: string): Promise<T | null>;
  findAll(
    page?: number,
    limit?: number
  ): Promise<{ users: T[]; total: number }>;
  create(entity: T): Promise<T>;
  update(entity: T): Promise<T>;
  delete(id: string): Promise<void>;
}
