import { User } from "../../entities/user.entity.js";
import { CreateUserInput, UpdateUserInput } from "../../types/user-inputs.js";
import { IEntityRepository } from "../../interfaces/entity-repository.interface.js";
import { Either, left, right } from "../../../shared/errors/either.js";
import {
  EmailAlreadyInUseError,
  UserNotFoundError,
  InvalidEmailError,
  InvalidPasswordError,
} from "../../../shared/errors/user.errors.js";

export class UserService {
  constructor(private readonly userRepository: IEntityRepository<User>) {}

  async findById(id: string): Promise<Either<UserNotFoundError, User>> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      return left(new UserNotFoundError());
    }

    return right(user);
  }

  async findByEmail(email: string): Promise<Either<UserNotFoundError, User>> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      return left(new UserNotFoundError());
    }

    return right(user);
  }

  async findAll(
    page?: number,
    limit?: number
  ): Promise<{ users: User[]; total: number }> {
    return this.userRepository.findAll(page, limit);
  }

  async createUser(
    userData: CreateUserInput
  ): Promise<
    Either<
      EmailAlreadyInUseError | InvalidEmailError | InvalidPasswordError,
      User
    >
  > {
    const existingUser = await this.userRepository.findByEmail(userData.email);

    if (existingUser) {
      return left(new EmailAlreadyInUseError());
    }

    const userResult = await User.create(userData);

    if (userResult.isLeft()) {
      return left(userResult.value);
    }

    const created = await this.userRepository.create(userResult.value);

    return right(created);
  }

  async updateUser(
    id: string,
    userData: UpdateUserInput
  ): Promise<Either<UserNotFoundError | EmailAlreadyInUseError, User>> {
    const user = await this.userRepository.findById(id);

    if (!user) return left(new UserNotFoundError());

    if (userData.email && userData.email !== user.email.toString()) {
      const existingUser = await this.userRepository.findByEmail(
        userData.email
      );

      if (existingUser && existingUser.id !== id) {
        return left(new EmailAlreadyInUseError());
      }
    }

    await user.update(userData);
    const updated = await this.userRepository.update(user);

    return right(updated);
  }

  async deleteUser(id: string): Promise<Either<UserNotFoundError, void>> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      return left(new UserNotFoundError());
    }

    await this.userRepository.delete(id);

    return right(undefined);
  }
}
