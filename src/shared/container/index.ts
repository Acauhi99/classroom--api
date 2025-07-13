import { AppDataSource } from "../../@infrastructure/database/data-source.js";
import { UserRepository } from "../../@infrastructure/repositories/user.repository.js";
import { UserService } from "../../@domain/services/user.service.js";
import { UserController } from "../../@http/controllers/user.controller.js";

const repositories = {
  userRepository: new UserRepository(AppDataSource.manager),
};

const services = {
  userService: new UserService(repositories.userRepository),
};

const controllers = {
  userController: new UserController(services.userService),
};

export const container = {
  repositories,
  services,
  controllers,
};
