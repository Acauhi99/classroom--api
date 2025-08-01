import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
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
import {
  EmailAlreadyInUseError,
  UserNotFoundError,
  InvalidEmailError,
  InvalidPasswordError,
} from "../../shared/errors/user.errors.js";

export class UserController {
  constructor(private readonly userService: UserService) {}

  async create(req: Request, res: Response): Promise<Response> {
    const dto = plainToInstance(CreateUserDto, req.body);
    const input = mapCreateUserDtoToInput(dto);
    const result = await this.userService.createUser(input);

    if (result.isLeft()) {
      if (result.value instanceof EmailAlreadyInUseError) {
        return res
          .status(409)
          .json({ status: "error", message: result.value.message });
      }
      if (
        result.value instanceof InvalidEmailError ||
        result.value instanceof InvalidPasswordError
      ) {
        return res
          .status(400)
          .json({ status: "error", message: result.value.message });
      }

      return res
        .status(400)
        .json({ status: "error", message: "Unknown error" });
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
      return res
        .status(404)
        .json({ status: "error", message: result.value.message });
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
    const input = mapUpdateUserDtoToInput(dto);
    const result = await this.userService.updateUser(id, input);

    if (result.isLeft()) {
      if (result.value instanceof UserNotFoundError) {
        return res
          .status(404)
          .json({ status: "error", message: result.value.message });
      }
      if (result.value instanceof EmailAlreadyInUseError) {
        return res
          .status(409)
          .json({ status: "error", message: result.value.message });
      }
      return res
        .status(400)
        .json({ status: "error", message: (result.value as Error).message });
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
      return res
        .status(404)
        .json({ status: "error", message: result.value.message });
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
}

function mapCreateUserDtoToInput(dto: CreateUserDto): CreateUserInput {
  return {
    name: dto.name,
    email: dto.email,
    password: dto.password,
    role: dto.role,
    bio: dto.bio,
    avatar: dto.avatar,
  };
}

function mapUpdateUserDtoToInput(dto: UpdateUserDto): UpdateUserInput {
  return {
    name: dto.name,
    email: dto.email,
    password: dto.password,
    role: dto.role,
    bio: dto.bio,
    avatar: dto.avatar,
    isVerified: dto.isVerified,
  };
}
