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

export class UserController {
  constructor(private readonly userService: UserService) {}

  async create(req: Request, res: Response): Promise<Response> {
    const dto = plainToInstance(CreateUserDto, req.body);
    const input = mapCreateUserDtoToInput(dto);
    const user = await this.userService.createUser(input);

    const userResponse = plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });

    return res.status(201).json({
      status: "success",
      data: userResponse,
    });
  }

  async findAll(req: Request, res: Response): Promise<Response> {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const { users, total } = await this.userService.findAll(page, limit);

    const userResponses = users.map((user) =>
      plainToInstance(UserResponseDto, user, {
        excludeExtraneousValues: true,
      })
    );

    return res.status(200).json({
      status: "success",
      data: userResponses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  }

  async findById(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const user = await this.userService.findById(id);

    const userResponse = plainToInstance(UserResponseDto, user, {
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
    const user = await this.userService.updateUser(id, input);

    const userResponse = plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });

    return res.status(200).json({
      status: "success",
      data: userResponse,
    });
  }

  async delete(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    await this.userService.deleteUser(id);

    return res.status(204).send();
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
