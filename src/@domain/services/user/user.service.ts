import { User } from "../../entities/user.entity.js";
import { CreateUserInput, UpdateUserInput } from "../../types/user-inputs.js";
import { Either, left, right } from "../../../shared/errors/either.js";
import {
  EmailAlreadyInUseError,
  UserNotFoundError,
  InvalidEmailError,
  InvalidPasswordError,
} from "../../../shared/errors/user.errors.js";
import { UserRepository } from "../../../@infrastructure/repositories/user.repository.js";

type UserServiceError =
  | UserNotFoundError
  | EmailAlreadyInUseError
  | InvalidEmailError
  | InvalidPasswordError;

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

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
  ): Promise<Either<UserServiceError, User>> {
    const emailUniquenessCheck = await this.checkEmailUniqueness(
      userData.email
    );
    if (emailUniquenessCheck.isLeft()) {
      return left(emailUniquenessCheck.value);
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
  ): Promise<Either<UserServiceError, User>> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      return left(new UserNotFoundError());
    }

    if (userData.email && userData.email !== user.email.toString()) {
      const emailUniquenessCheck = await this.checkEmailUniqueness(
        userData.email,
        id
      );
      if (emailUniquenessCheck.isLeft()) {
        return left(emailUniquenessCheck.value);
      }
    }

    const updateResult = await user.update(userData);
    if (updateResult.isLeft()) {
      return left(updateResult.value);
    }

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

  private async checkEmailUniqueness(
    email: string,
    excludeUserId?: string
  ): Promise<Either<EmailAlreadyInUseError, void>> {
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser && existingUser.id !== excludeUserId) {
      return left(new EmailAlreadyInUseError());
    }

    return right(undefined);
  }
}
