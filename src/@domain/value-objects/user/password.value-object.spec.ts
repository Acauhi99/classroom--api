import { describe, it } from "node:test";
import assert from "node:assert";
import { Password } from "./password.value-object.js";
import { InvalidPasswordError } from "../../../shared/errors/user.errors.js";

describe("Password", () => {
  describe("create", () => {
    it("should create a valid password with 8+ characters, letters and numbers", () => {
      const result = Password.create("password123");

      assert.ok(result.isRight());
      assert.ok(result.value instanceof Password);
    });

    it("should return InvalidPasswordError when password is too short", () => {
      const result = Password.create("pass1");

      assert.ok(result.isLeft());
      assert.ok(result.value instanceof InvalidPasswordError);
    });

    it("should return InvalidPasswordError when password has no numbers", () => {
      const result = Password.create("passwordonly");

      assert.ok(result.isLeft());
      assert.ok(result.value instanceof InvalidPasswordError);
    });

    it("should return InvalidPasswordError when password has no letters", () => {
      const result = Password.create("12345678");

      assert.ok(result.isLeft());
      assert.ok(result.value instanceof InvalidPasswordError);
    });

    it("should create password with exactly 8 characters", () => {
      const result = Password.create("pass123a");

      assert.ok(result.isRight());
      assert.ok(result.value instanceof Password);
    });

    it("should create password with mixed case letters and numbers", () => {
      const result = Password.create("Password123");

      assert.ok(result.isRight());
      assert.ok(result.value instanceof Password);
    });
  });

  describe("fromHashed", () => {
    it("should create a password from hashed string", () => {
      const hashedPassword = "$2b$10$hashedpassword";
      const password = Password.fromHashed(hashedPassword);

      assert.ok(password instanceof Password);
      assert.strictEqual(password.toString(), hashedPassword);
    });
  });

  describe("hash", () => {
    it("should hash a plain password", async () => {
      const result = Password.create("password123");
      assert.ok(result.isRight());

      const password = result.value;
      const hashedPassword = await password.hash();

      assert.ok(hashedPassword instanceof Password);
      assert.notStrictEqual(hashedPassword.toString(), "password123");
      assert.ok(hashedPassword.toString().startsWith("$2b$10$"));
    });

    it("should return same instance if password is already hashed", async () => {
      const hashedPassword = Password.fromHashed("$2b$10$alreadyhashed");
      const result = await hashedPassword.hash();

      assert.strictEqual(result, hashedPassword);
    });
  });

  describe("compare", () => {
    it("should return true when comparing correct plain password with hashed password", async () => {
      const result = Password.create("password123");
      assert.ok(result.isRight());

      const password = result.value;
      const hashedPassword = await password.hash();
      const isMatch = await hashedPassword.compare("password123");

      assert.strictEqual(isMatch, true);
    });

    it("should return false when comparing incorrect plain password with hashed password", async () => {
      const result = Password.create("password123");
      assert.ok(result.isRight());

      const password = result.value;
      const hashedPassword = await password.hash();
      const isMatch = await hashedPassword.compare("wrongpassword");

      assert.strictEqual(isMatch, false);
    });

    it("should return false when trying to compare with non-hashed password", async () => {
      const result = Password.create("password123");
      assert.ok(result.isRight());

      const password = result.value;
      const isMatch = await password.compare("password123");

      assert.strictEqual(isMatch, false);
    });
  });

  describe("toString", () => {
    it("should return the password value as string", () => {
      const result = Password.create("password123");
      assert.ok(result.isRight());

      const password = result.value;
      assert.strictEqual(password.toString(), "password123");
    });

    it("should return hashed value for hashed password", () => {
      const hashedValue = "$2b$10$hashedpassword";
      const password = Password.fromHashed(hashedValue);

      assert.strictEqual(password.toString(), hashedValue);
    });
  });
});
