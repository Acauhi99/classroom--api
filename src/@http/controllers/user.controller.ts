import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { UserService } from "../../@domain/services/user.service.js";
import { UserResponseDto } from "../dtos/user.dto.js";

export class UserController {
  constructor(private readonly userService: UserService) {}

  async create(req: Request, res: Response): Promise<Response> {
    const user = await this.userService.createUser(req.body);

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
    const user = await this.userService.updateUser(id, req.body);

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
