import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { UserService } from "../../@domain/services/user/user.service.js";
import {
  UserResponseDto,
  CreateUserDto,
  UpdateUserDto,
} from "../dtos/user.dto.js";
import {
  CreateUserInput,
  UpdateUserInput,
} from "../../@domain/types/user-inputs.js";

export class UserController {
  constructor(private readonly userService: UserService) {}

  async create(req: Request, res: Response): Promise<Response> {
    const dto = plainToInstance(CreateUserDto, req.body);
    const validationErrors = await validate(dto);

    if (validationErrors.length > 0) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: validationErrors.map((error) => ({
          field: error.property,
          messages: Object.values(error.constraints || {}),
        })),
      });
    }

    const userData: CreateUserInput = {
      name: dto.name,
      email: dto.email,
      password: dto.password,
      role: dto.role,
      bio: dto.bio,
      avatar: dto.avatar,
    };

    const result = await this.userService.createUser(userData);

    if (result.isLeft()) {
      return this.handleError(res, result.value);
    }

    const userResponse = plainToInstance(UserResponseDto, result.value, {
      excludeExtraneousValues: true,
    });

    return res.status(201).json({
      status: "success",
      data: userResponse,
    });
  }

  async findById(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    const result = await this.userService.findById(id);

    if (result.isLeft()) {
      return this.handleError(res, result.value);
    }

    const userResponse = plainToInstance(UserResponseDto, result.value, {
      excludeExtraneousValues: true,
    });

    return res.status(200).json({
      status: "success",
      data: userResponse,
    });
  }

  async update(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    const dto = plainToInstance(UpdateUserDto, req.body);
    const validationErrors = await validate(dto);

    if (validationErrors.length > 0) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: validationErrors.map((error) => ({
          field: error.property,
          messages: Object.values(error.constraints || {}),
        })),
      });
    }

    const userData: UpdateUserInput = {
      name: dto.name,
      email: dto.email,
      password: dto.password,
      role: dto.role,
      bio: dto.bio,
      avatar: dto.avatar,
      isVerified: dto.isVerified,
    };

    const result = await this.userService.updateUser(id, userData);

    if (result.isLeft()) {
      return this.handleError(res, result.value);
    }

    const userResponse = plainToInstance(UserResponseDto, result.value, {
      excludeExtraneousValues: true,
    });

    return res.status(200).json({
      status: "success",
      data: userResponse,
    });
  }

  async delete(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    const result = await this.userService.deleteUser(id);

    if (result.isLeft()) {
      return this.handleError(res, result.value);
    }

    return res.status(204).send();
  }

  async findAll(req: Request, res: Response): Promise<Response> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const { users, total } = await this.userService.findAll(page, limit);

    const usersResponse = users.map((user) =>
      plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true })
    );

    return res.status(200).json({
      status: "success",
      data: usersResponse,
      total,
      page,
      limit,
    });
  }

  private handleError(res: Response, error: Error): Response {
    const errorMap: Record<string, { status: number; message: string }> = {
      UserNotFoundError: { status: 404, message: error.message },
      EmailAlreadyInUseError: { status: 409, message: error.message },
      InvalidEmailError: { status: 400, message: error.message },
      InvalidPasswordError: { status: 400, message: error.message },
      ValidationError: { status: 400, message: error.message },
    };

    const errorConfig = errorMap[error.constructor.name] || {
      status: 500,
      message: "Internal server error",
    };

    return res.status(errorConfig.status).json({
      status: "error",
      message: errorConfig.message,
    });
  }
}
