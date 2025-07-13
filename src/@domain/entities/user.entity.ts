import { ulid } from "ulid";
import { Email } from "../value-objects/email.value-object.js";
import { Password } from "../value-objects/password.value-object.js";

export enum UserRole {
  STUDENT = "student",
  TEACHER = "teacher",
  ADMIN = "admin",
}

export class User {
  id!: string;
  name!: string;
  email!: Email;
  password!: Password;
  role!: UserRole;
  bio?: string;
  avatar?: string;
  isVerified!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  static create(props: {
    name: string;
    email: Email;
    password: Password;
    role: UserRole;
    bio?: string;
    avatar?: string;
  }): User {
    const user = new User();
    user.id = ulid();
    user.name = props.name;
    user.email = props.email;
    user.password = props.password;
    user.role = props.role;
    user.bio = props.bio;
    user.avatar = props.avatar;
    user.isVerified = false;
    user.createdAt = new Date();
    user.updatedAt = new Date();
    return user;
  }

  update(props: Partial<User>): void {
    if (props.name) this.name = props.name;
    if (props.email) this.email = props.email;
    if (props.password) this.password = props.password;
    if (props.role) this.role = props.role;
    if (props.bio !== undefined) this.bio = props.bio;
    if (props.avatar !== undefined) this.avatar = props.avatar;
    if (props.isVerified !== undefined) this.isVerified = props.isVerified;
    this.updatedAt = new Date();
  }
}
