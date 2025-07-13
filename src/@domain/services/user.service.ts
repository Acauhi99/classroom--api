import { User, UserRole } from "../entities/user.entity.js";
import { IUserRepository } from "../interfaces/user-repository.interface.js";
import { Email } from "../value-objects/email.value-object.js";
import { Password } from "../value-objects/password.value-object.js";
import {
  NotFoundError,
  ConflictError,
} from "../../shared/errors/application-errors.js";

export class UserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User");
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async findAll(
    page?: number,
    limit?: number
  ): Promise<{ users: User[]; total: number }> {
    return this.userRepository.findAll(page, limit);
  }

  async createUser(userData: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    bio?: string;
    avatar?: string;
  }): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new ConflictError("Email already in use");
    }

    const email = new Email(userData.email);
    const password = await Password.create(userData.password).hash();

    const user = User.create({
      name: userData.name,
      email,
      password,
      role: userData.role,
      bio: userData.bio,
      avatar: userData.avatar,
    });

    return this.userRepository.create(user);
  }

  async updateUser(
    id: string,
    userData: {
      name?: string;
      email?: string;
      password?: string;
      role?: UserRole;
      bio?: string;
      avatar?: string;
      isVerified?: boolean;
    }
  ): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User");
    }

    if (userData.email && userData.email !== user.email.toString()) {
      const existingUser = await this.userRepository.findByEmail(
        userData.email
      );
      if (existingUser && existingUser.id !== id) {
        throw new ConflictError("Email already in use");
      }
      user.email = new Email(userData.email);
    }

    if (userData.password) {
      user.password = await Password.create(userData.password).hash();
    }

    user.update({
      name: userData.name,
      role: userData.role,
      bio: userData.bio,
      avatar: userData.avatar,
      isVerified: userData.isVerified,
    });

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
