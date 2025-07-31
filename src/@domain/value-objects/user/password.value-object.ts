import bcrypt from "bcrypt";
import { ValidationError } from "../../../shared/errors/application-errors.js";

export class Password {
  private readonly value: string;
  private readonly hashed: boolean;

  private constructor(password: string, hashed: boolean) {
    this.value = password;
    this.hashed = hashed;
  }

  static create(password: string): Password {
    if (!this.validate(password)) {
      throw new ValidationError("Invalid password format");
    }
    return new Password(password, false);
  }

  static fromHashed(hashedPassword: string): Password {
    return new Password(hashedPassword, true);
  }

  private static validate(password: string): boolean {
    return (
      password.length >= 8 && /\d/.test(password) && /[a-zA-Z]/.test(password)
    );
  }

  async hash(): Promise<Password> {
    if (this.hashed) {
      return this;
    }

    const hashedPassword = await bcrypt.hash(this.value, 10);
    return Password.fromHashed(hashedPassword);
  }

  async compare(plainPassword: string): Promise<boolean> {
    if (!this.hashed) {
      throw new ValidationError("Cannot compare with a non-hashed password");
    }

    return bcrypt.compare(plainPassword, this.value);
  }

  toString(): string {
    return this.value;
  }
}
