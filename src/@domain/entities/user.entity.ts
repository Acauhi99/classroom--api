import { ulid } from "ulid";
import { Email } from "../value-objects/email.value-object.js";
import { Password } from "../value-objects/password.value-object.js";
import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { CreateUserInput, UpdateUserInput } from "../types/user-inputs.js";

export enum UserRole {
  STUDENT = "student",
  TEACHER = "teacher",
  ADMIN = "admin",
}

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
      from: (value: string): Email => new Email(value),
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

  static async create(props: CreateUserInput): Promise<User> {
    const user = new User();

    user.id = ulid();
    user.name = props.name;
    user.email = new Email(props.email);
    user.password = await Password.create(props.password).hash();
    user.role = props.role;
    user.bio = props.bio;
    user.avatar = props.avatar;
    user.isVerified = false;

    return user;
  }

  async update(props: UpdateUserInput): Promise<void> {
    if (props.email && props.email !== this.email.toString()) {
      this.email = new Email(props.email);
    }
    if (props.password) {
      this.password = await Password.create(props.password).hash();
    }
    if (props.name !== undefined) this.name = props.name;
    if (props.role !== undefined) this.role = props.role;
    if (props.bio !== undefined) this.bio = props.bio;
    if (props.avatar !== undefined) this.avatar = props.avatar;
    if (props.isVerified !== undefined) this.isVerified = props.isVerified;
  }
}
