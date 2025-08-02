import { Exclude, Expose } from "class-transformer";
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  Matches,
  IsBoolean,
} from "class-validator";
import { UserRole } from "../../@domain/entities/user.entity.js";

export class CreateUserDto {
  @IsString({ message: "Name must be a string" })
  @MinLength(2, { message: "Name must be at least 2 characters long" })
  name!: string;

  @IsEmail({}, { message: "Invalid email format" })
  email!: string;

  @IsString({ message: "Password must be a string" })
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  @Matches(/(?=.*[0-9])(?=.*[a-zA-Z])/, {
    message: "Password must contain at least one letter and one number",
  })
  password!: string;

  @IsEnum(UserRole, { message: "Invalid user role" })
  role!: UserRole;

  @IsOptional()
  @IsString({ message: "Bio must be a string" })
  bio?: string;

  @IsOptional()
  @IsString({ message: "Avatar must be a string" })
  avatar?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: "Name must be a string" })
  @MinLength(2, { message: "Name must be at least 2 characters long" })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: "Invalid email format" })
  email?: string;

  @IsOptional()
  @IsString({ message: "Password must be a string" })
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  @Matches(/(?=.*[0-9])(?=.*[a-zA-Z])/, {
    message: "Password must contain at least one letter and one number",
  })
  password?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: "Invalid user role" })
  role?: UserRole;

  @IsOptional()
  @IsString({ message: "Bio must be a string" })
  bio?: string;

  @IsOptional()
  @IsString({ message: "Avatar must be a string" })
  avatar?: string;

  @IsOptional()
  @IsBoolean({ message: "isVerified must be a boolean" })
  isVerified?: boolean;
}

export class UserResponseDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  email!: string;

  @Expose()
  role!: UserRole;

  @Expose()
  bio?: string;

  @Expose()
  avatar?: string;

  @Expose()
  isVerified!: boolean;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;

  @Exclude()
  password!: string;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
