import { EntityManager, Repository } from "typeorm";
import { User } from "../../@domain/entities/user.entity.js";

export class UserRepository {
  private repository: Repository<User>;

  constructor(private readonly entityManager: EntityManager) {
    this.repository = entityManager.getRepository(User);
  }

  async findById(id: string): Promise<User | null> {
    return this.repository.findOneBy({ id });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOneBy({
      email: email.toLowerCase(),
    });
  }

  async findAll(
    page = 1,
    limit = 10
  ): Promise<{ users: User[]; total: number }> {
    const [users, total] = await this.repository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
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
    await this.repository.delete(id);
  }
}
