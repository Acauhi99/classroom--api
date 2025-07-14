import { EntityManager } from "typeorm";
import { AppDataSource } from "../../@infrastructure/database/data-source.js";
import { UserRepository } from "../../@infrastructure/repositories/user.repository.js";
import { UserService } from "../../@domain/services/user.service.js";
import { UserController } from "../../@http/controllers/user.controller.js";
import { IUserRepository } from "../../@domain/interfaces/user-repository.interface.js";
import {
  DependencyError,
  ConfigurationError,
} from "../errors/application-errors.js";

const factories = {
  createEntityManager: (): EntityManager => AppDataSource.manager,

  createUserRepository: (entityManager: EntityManager): IUserRepository =>
    new UserRepository(entityManager),

  createUserService: (userRepository: IUserRepository): UserService =>
    new UserService(userRepository),

  createUserController: (userService: UserService): UserController =>
    new UserController(userService),
};

class Container {
  private static instance: Container;
  private dependencies: Map<string, any> = new Map();
  private entityManager: EntityManager;
  private initialized: boolean = false;

  private constructor() {
    if (!AppDataSource.isInitialized) {
      console.warn("Warning: Container created before database initialization");
    }
    this.entityManager = factories.createEntityManager();
    this.initialize();
  }

  public static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  private initialize(): void {
    if (!AppDataSource.isInitialized) {
      return;
    }

    this.initialized = true;
    this.entityManager = factories.createEntityManager();

    this.dependencies.set(
      "userRepository",
      factories.createUserRepository(this.entityManager)
    );

    this.dependencies.set(
      "userService",
      factories.createUserService(this.get("userRepository"))
    );

    this.dependencies.set(
      "userController",
      factories.createUserController(this.get("userService"))
    );
  }

  public get<T>(key: string): T {
    if (!this.initialized) {
      throw new ConfigurationError(
        "Container not initialized properly. Database connection may not be ready."
      );
    }

    if (!this.dependencies.has(key)) {
      throw new DependencyError(`Dependency ${key} not found in container`);
    }
    return this.dependencies.get(key) as T;
  }

  public override<T>(key: string, implementation: T): void {
    this.dependencies.set(key, implementation);
  }

  public reset(): void {
    this.dependencies.clear();
    this.initialize();
  }

  public isInitialized(): boolean {
    return this.initialized && AppDataSource.isInitialized;
  }
}

export const container = Container.getInstance();

export const repositories = {
  get userRepository(): IUserRepository {
    return container.get("userRepository");
  },
};

export const services = {
  get userService(): UserService {
    return container.get("userService");
  },
};

export const controllers = {
  get userController(): UserController {
    return container.get("userController");
  },
};
