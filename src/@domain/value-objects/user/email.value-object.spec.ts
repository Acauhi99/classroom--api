import { describe, it } from "node:test";
import assert from "node:assert";
import { Email } from "./email.value-object.js";
import { InvalidEmailError } from "../../../shared/errors/user.errors.js";

describe("Email", () => {
  describe("create", () => {
    it("should create a valid email with standard format", () => {
      const result = Email.create("user@example.com");

      assert.ok(result.isRight());
      assert.ok(result.value instanceof Email);
    });

    it("should create a valid email with subdomain", () => {
      const result = Email.create("user@mail.example.com");

      assert.ok(result.isRight());
      assert.ok(result.value instanceof Email);
    });

    it("should create a valid email with numbers and special chars", () => {
      const result = Email.create("user123+test@example.com");

      assert.ok(result.isRight());
      assert.ok(result.value instanceof Email);
    });

    it("should create a valid email with dots in local part", () => {
      const result = Email.create("user.name@example.com");

      assert.ok(result.isRight());
      assert.ok(result.value instanceof Email);
    });

    it("should create a valid email with underscore", () => {
      const result = Email.create("user_name@example.com");

      assert.ok(result.isRight());
      assert.ok(result.value instanceof Email);
    });

    it("should return InvalidEmailError when email has no @ symbol", () => {
      const result = Email.create("userexample.com");

      assert.ok(result.isLeft());
      assert.ok(result.value instanceof InvalidEmailError);
    });

    it("should return InvalidEmailError when email has no domain", () => {
      const result = Email.create("user@");

      assert.ok(result.isLeft());
      assert.ok(result.value instanceof InvalidEmailError);
    });

    it("should return InvalidEmailError when email has no local part", () => {
      const result = Email.create("@example.com");

      assert.ok(result.isLeft());
      assert.ok(result.value instanceof InvalidEmailError);
    });

    it("should return InvalidEmailError when email has no TLD", () => {
      const result = Email.create("user@example");

      assert.ok(result.isLeft());
      assert.ok(result.value instanceof InvalidEmailError);
    });

    it("should return InvalidEmailError when email has invalid TLD", () => {
      const result = Email.create("user@example.c");

      assert.ok(result.isLeft());
      assert.ok(result.value instanceof InvalidEmailError);
    });

    it("should return InvalidEmailError when email has spaces", () => {
      const result = Email.create("user @example.com");

      assert.ok(result.isLeft());
      assert.ok(result.value instanceof InvalidEmailError);
    });

    it("should return InvalidEmailError when email has multiple @ symbols", () => {
      const result = Email.create("user@@example.com");

      assert.ok(result.isLeft());
      assert.ok(result.value instanceof InvalidEmailError);
    });

    it("should return InvalidEmailError when email starts with dot", () => {
      const result = Email.create(".user@example.com");

      assert.ok(result.isLeft());
      assert.ok(result.value instanceof InvalidEmailError);
    });

    it("should return InvalidEmailError when email ends with dot before @", () => {
      const result = Email.create("user.@example.com");

      assert.ok(result.isLeft());
      assert.ok(result.value instanceof InvalidEmailError);
    });

    it("should return InvalidEmailError when domain starts with dot", () => {
      const result = Email.create("user@.example.com");

      assert.ok(result.isLeft());
      assert.ok(result.value instanceof InvalidEmailError);
    });

    it("should return InvalidEmailError when email is empty", () => {
      const result = Email.create("");

      assert.ok(result.isLeft());
      assert.ok(result.value instanceof InvalidEmailError);
    });
  });

  describe("toString", () => {
    it("should return the email value as lowercase string", () => {
      const result = Email.create("USER@EXAMPLE.COM");
      assert.ok(result.isRight());

      const email = result.value;
      assert.strictEqual(email.toString(), "user@example.com");
    });

    it("should return the email value preserving valid format", () => {
      const result = Email.create("user@example.com");
      assert.ok(result.isRight());

      const email = result.value;
      assert.strictEqual(email.toString(), "user@example.com");
    });

    it("should convert mixed case email to lowercase", () => {
      const result = Email.create("User.Name@Example.Com");
      assert.ok(result.isRight());

      const email = result.value;
      assert.strictEqual(email.toString(), "user.name@example.com");
    });
  });
});
