import { EntitySchema } from "typeorm";
import { User, UserRole } from "../../@domain/entities/user.entity.js";

export const UserSchema = new EntitySchema<User>({
  name: "User",
  target: User,
  columns: {
    id: {
      primary: true,
      type: String,
    },
    name: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      transformer: {
        from: (value: string) => value,
        to: (email) => email?.toString(),
      },
    },
    password: {
      type: String,
      transformer: {
        from: (value: string) => value,
        to: (password) => password?.toString(),
      },
    },
    role: {
      type: String,
      enum: UserRole,
    },
    bio: {
      type: String,
      nullable: true,
    },
    avatar: {
      type: String,
      nullable: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      createDate: true,
    },
    updatedAt: {
      type: Date,
      updateDate: true,
    },
  },
});
