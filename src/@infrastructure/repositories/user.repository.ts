import { EntityManager, Repository } from "typeorm";
import { User } from "../../@domain/entities/user.entity.js";

export class UserRepository {
  private repository: Repository<User>;

  constructor(private readonly entityManager: EntityManager) {
    this.repository = entityManager.getRepository(User);
  }

  async findById(id: string): Promise<User | null> {
    if (!id) {
      return null;
    }
    return this.repository.findOneBy({ id });
  }

  async findByEmail(email: string): Promise<User | null> {
    if (!email) {
      return null;
    }
    return this.repository.findOneBy({
      email: email.toLowerCase(),
    });
  }

  async findAll(
    page = 1,
    limit = 10
  ): Promise<{ users: User[]; total: number }> {
    const normalizedPage = Math.max(1, page || 1);
    const normalizedLimit = limit ?? 10;

    if (normalizedLimit === 0) {
      const total = await this.repository.count();
      return { users: [], total };
    }

    const skip = (normalizedPage - 1) * Math.max(0, normalizedLimit);

    const [users, total] = await this.repository.findAndCount({
      skip: Math.max(0, skip),
      take: Math.max(1, normalizedLimit),
    });

    return { users, total };
  }

  async create(user: User): Promise<User> {
    return this.repository.save(user);
  }

  async update(user: User): Promise<User> {
    return this.repository.save(user);
  }

  async delete(id: string): Promise<void> {
    if (!id) {
      return;
    }
    await this.repository.delete(id);
  }
}
