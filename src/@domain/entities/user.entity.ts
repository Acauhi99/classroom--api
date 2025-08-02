import { ulid } from "ulid";
import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { CreateUserInput, UpdateUserInput } from "../types/user-inputs.js";
import { Email } from "../value-objects/user/email.value-object.js";
import { Password } from "../value-objects/user/password.value-object.js";
import { Either, left, right } from "../../shared/errors/either.js";
import {
  InvalidEmailError,
  InvalidPasswordError,
} from "../../shared/errors/user.errors.js";

export enum UserRole {
  STUDENT = "student",
  TEACHER = "teacher",
  ADMIN = "admin",
}

type InvalidUserError = InvalidEmailError | InvalidPasswordError;

@Entity("users")
export class User {
  @PrimaryColumn("varchar")
  id!: string;

  @Column("varchar")
  name!: string;

  @Column({
    type: "varchar",
    unique: true,
    transformer: {
      to: (value: Email): string => value.toString(),
      from: (value: string): Email => {
        const result = Email.create(value);
        if (result.isRight()) {
          return result.value;
        }
        throw new InvalidEmailError();
      },
    },
  })
  email!: Email;

  @Column({
    type: "varchar",
    transformer: {
      to: (value: Password): string => value.toString(),
      from: (value: string): Password => Password.fromHashed(value),
    },
  })
  password!: Password;

  @Column({
    type: "enum",
    enum: UserRole,
  })
  role!: UserRole;

  @Column("varchar", { nullable: true })
  bio?: string;

  @Column("varchar", { nullable: true })
  avatar?: string;

  @Column("boolean", { default: false })
  isVerified!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  static async create(
    props: CreateUserInput
  ): Promise<Either<InvalidUserError, User>> {
    const emailResult = Email.create(props.email);
    if (emailResult.isLeft()) {
      return left(emailResult.value);
    }

    const passwordResult = Password.create(props.password);
    if (passwordResult.isLeft()) {
      return left(passwordResult.value);
    }

    const hashedPassword = await passwordResult.value.hash();

    const user = new User();
    user.id = ulid();
    user.name = props.name;
    user.email = emailResult.value;
    user.password = hashedPassword;
    user.role = props.role;
    user.bio = props.bio;
    user.avatar = props.avatar;
    user.isVerified = false;

    return right(user);
  }

  async update(
    props: UpdateUserInput
  ): Promise<Either<InvalidUserError, void>> {
    if (props.email && props.email !== this.email.toString()) {
      const emailResult = Email.create(props.email);
      if (emailResult.isLeft()) {
        return left(emailResult.value);
      }
      this.email = emailResult.value;
    }

    if (props.password) {
      const passwordResult = Password.create(props.password);
      if (passwordResult.isLeft()) {
        return left(passwordResult.value);
      }
      this.password = await passwordResult.value.hash();
    }

    if (props.name !== undefined) this.name = props.name;
    if (props.role !== undefined) this.role = props.role;
    if (props.bio !== undefined) this.bio = props.bio;
    if (props.avatar !== undefined) this.avatar = props.avatar;
    if (props.isVerified !== undefined) this.isVerified = props.isVerified;

    return right(undefined);
  }
}
