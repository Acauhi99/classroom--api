import { ValidationError } from "../../../shared/errors/application-errors.js";


export class Email {
  private readonly value: string;

  constructor(email: string) {
    if (!this.validate(email)) {
      throw new ValidationError("Invalid email format");
    }
    this.value = email.toLowerCase();
  }

  private validate(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  toString(): string {
    return this.value;
  }
}
