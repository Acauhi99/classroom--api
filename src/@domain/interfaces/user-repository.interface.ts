import { User } from "../entities/user.entity.js";

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(
    page?: number,
    limit?: number
  ): Promise<{ users: User[]; total: number }>;
  create(user: User): Promise<User>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}
