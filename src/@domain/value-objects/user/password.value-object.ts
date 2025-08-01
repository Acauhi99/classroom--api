import bcrypt from "bcrypt";
import { Either, left, right } from "../../../shared/errors/either.js";
import { InvalidPasswordError } from "../../../shared/errors/user.errors.js";

export class Password {
  private readonly value: string;
  private readonly hashed: boolean;

  private constructor(password: string, hashed: boolean) {
    this.value = password;
    this.hashed = hashed;
  }

  static create(password: string): Either<InvalidPasswordError, Password> {
    if (!this.validate(password)) {
      return left(new InvalidPasswordError());
    }

    return right(new Password(password, false));
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
      return false;
    }

    return bcrypt.compare(plainPassword, this.value);
  }

  toString(): string {
    return this.value;
  }
}
