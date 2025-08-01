import { Either, left, right } from "../../../shared/errors/either.js";
import { InvalidEmailError } from "../../../shared/errors/user.errors.js";

export class Email {
  private readonly value: string;

  private constructor(email: string) {
    this.value = email.toLowerCase();
  }

  static create(email: string): Either<InvalidEmailError, Email> {
    if (!this.validate(email)) {
      return left(new InvalidEmailError());
    }

    return right(new Email(email));
  }

  private static validate(email: string): boolean {
    if (!email || email.trim() !== email || email.includes(" ")) {
      return false;
    }

    const emailRegex =
      /^[a-zA-Z0-9]([a-zA-Z0-9._+%-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?\.([a-zA-Z]{2,})$/;

    return emailRegex.test(email);
  }

  toString(): string {
    return this.value;
  }
}
