import { User } from "../../entities/user.entity.js";
import {
  NotFoundError,
  ConflictError,
} from "../../../shared/errors/application-errors.js";
import { CreateUserInput, UpdateUserInput } from "../../types/user-inputs.js";
import { IEntityRepository } from "../../interfaces/entity-repository.interface.js";

export class UserService {
  constructor(private readonly userRepository: IEntityRepository<User>) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundError("User");
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundError("User");
    }

    return user;
  }

  async findAll(
    page?: number,
    limit?: number
  ): Promise<{ users: User[]; total: number }> {
    return this.userRepository.findAll(page, limit);
  }

  async createUser(userData: CreateUserInput): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(userData.email);

    if (existingUser) {
      throw new ConflictError("Email already in use");
    }

    const user = await User.create(userData);

    return this.userRepository.create(user);
  }

  async updateUser(id: string, userData: UpdateUserInput): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundError("User");

    if (userData.email && userData.email !== user.email.toString()) {
      const existingUser = await this.userRepository.findByEmail(
        userData.email
      );

      if (existingUser && existingUser.id !== id) {
        throw new ConflictError("Email already in use");
      }
    }

    await user.update(userData);

    return this.userRepository.update(user);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundError("User");
    }

    await this.userRepository.delete(id);
  }
}
