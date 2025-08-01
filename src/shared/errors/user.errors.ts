export class UserNotFoundError extends Error {
  constructor() {
    super("User not found");
    this.name = "UserNotFoundError";
  }
}

export class EmailAlreadyInUseError extends Error {
  constructor() {
    super("Email already in use");
    this.name = "EmailAlreadyInUseError";
  }
}

export class InvalidEmailError extends Error {
  constructor() {
    super("Invalid email format");
    this.name = "InvalidEmailError";
  }
}

export class InvalidPasswordError extends Error {
  constructor() {
    super("Invalid password format");
    this.name = "InvalidPasswordError";
  }
}
