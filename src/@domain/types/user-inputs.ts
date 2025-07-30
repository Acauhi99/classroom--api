import { UserRole } from "../entities/user.entity.js";

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  bio?: string;
  avatar?: string;
};

export type UpdateUserInput = Partial<
  Omit<CreateUserInput, "email" | "password">
> & {
  email?: string;
  password?: string;
  isVerified?: boolean;
};
