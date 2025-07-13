import { EntityManager, Repository } from "typeorm";
import { User } from "../../@domain/entities/user.entity.js";
import { IUserRepository } from "../../@domain/interfaces/user-repository.interface.js";
import { Email } from "../../@domain/value-objects/email.value-object.js";
import { Password } from "../../@domain/value-objects/password.value-object.js";

export class UserRepository implements IUserRepository {
  private repository: Repository<User>;

  constructor(private readonly entityManager: EntityManager) {
    this.repository = entityManager.getRepository(User);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.repository.findOneBy({ id });

    if (!user) return null;

    user.email = new Email(user.email.toString());
    user.password = Password.fromHashed(user.password.toString());

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.repository.findOneBy({
      email: email.toLowerCase(),
    });

    if (!user) return null;

    user.email = new Email(user.email.toString());
    user.password = Password.fromHashed(user.password.toString());

    return user;
  }

  async findAll(
    page = 1,
    limit = 10
  ): Promise<{ users: User[]; total: number }> {
    const [users, total] = await this.repository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });

    const processedUsers = users.map((user) => {
      user.email = new Email(user.email.toString());
      user.password = Password.fromHashed(user.password.toString());
      return user;
    });

    return { users: processedUsers, total };
  }

  async create(user: User): Promise<User> {
    const savedUser = await this.repository.save(user);

    savedUser.email = new Email(savedUser.email.toString());
    savedUser.password = Password.fromHashed(savedUser.password.toString());

    return savedUser;
  }

  async update(user: User): Promise<User> {
    const updatedUser = await this.repository.save(user);

    updatedUser.email = new Email(updatedUser.email.toString());
    updatedUser.password = Password.fromHashed(updatedUser.password.toString());

    return updatedUser;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
