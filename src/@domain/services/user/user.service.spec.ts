import { describe, it, beforeEach, mock } from "node:test";
import assert from "node:assert";
import { UserRepository } from "../../../@infrastructure/repositories/user.repository.js";
import { UserService } from "./user.service.js";
import {
  UserNotFoundError,
  EmailAlreadyInUseError,
  InvalidEmailError,
  InvalidPasswordError,
} from "../../../shared/errors/user.errors.js";
import { CreateUserInput, UpdateUserInput } from "../../types/user-inputs.js";
import { User, UserRole } from "../../entities/user.entity.js";
import { right, left } from "../../../shared/errors/either.js";

describe("UserService", () => {
  let userService: UserService;
  let mockUserRepository: UserRepository;

  beforeEach(() => {
    mockUserRepository = {
      findById: mock.fn(),
      findByEmail: mock.fn(),
      findAll: mock.fn(),
      create: mock.fn(),
      update: mock.fn(),
      delete: mock.fn(),
    } as any;

    userService = new UserService(mockUserRepository);
  });

  describe("createUser", () => {
    it("should create a user successfully when email is unique", async () => {
      const userData: CreateUserInput = {
        name: "Acauhi",
        email: "acauhi@example.com",
        password: "ValidPass123!",
        role: UserRole.STUDENT,
      };

      const userResult = await User.create(userData);
      assert.ok(userResult.isRight());
      const createdUser = userResult.value;

      (mockUserRepository.findByEmail as any).mock.mockImplementation(() =>
        Promise.resolve(null)
      );
      (mockUserRepository.create as any).mock.mockImplementation(() =>
        Promise.resolve(createdUser)
      );

      const result = await userService.createUser(userData);

      assert.ok(result.isRight());
      assert.ok(result.value instanceof User);
      assert.strictEqual(result.value.name, "Acauhi");
      assert.strictEqual(result.value.email.toString(), "acauhi@example.com");
      assert.strictEqual(result.value.role, UserRole.STUDENT);

      assert.strictEqual(
        (mockUserRepository.findByEmail as any).mock.callCount(),
        1
      );
      assert.strictEqual(
        (mockUserRepository.create as any).mock.callCount(),
        1
      );
    });

    it("should return EmailAlreadyInUseError when email already exists", async () => {
      const userData: CreateUserInput = {
        name: "Test User",
        email: "existing@example.com",
        password: "ValidPass123!",
        role: UserRole.STUDENT,
      };

      const existingUser = {
        id: "existing-user-id",
        name: "Existing User",
        email: { toString: () => "existing@example.com" },
        role: UserRole.STUDENT,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      (mockUserRepository.findByEmail as any).mock.mockImplementation(() =>
        Promise.resolve(existingUser)
      );

      const result = await userService.createUser(userData);

      assert.ok(result.isLeft());
      assert.ok(result.value instanceof EmailAlreadyInUseError);
      assert.strictEqual(
        (mockUserRepository.findByEmail as any).mock.callCount(),
        1
      );
      assert.strictEqual(
        (mockUserRepository.create as any).mock.callCount(),
        0
      );
    });

    it("should return InvalidEmailError when email format is invalid", async () => {
      const userData: CreateUserInput = {
        name: "Test User",
        email: "invalid-email",
        password: "ValidPass123!",
        role: UserRole.STUDENT,
      };

      (mockUserRepository.findByEmail as any).mock.mockImplementation(() =>
        Promise.resolve(null)
      );

      const result = await userService.createUser(userData);

      assert.ok(result.isLeft());
      assert.ok(result.value instanceof InvalidEmailError);
      assert.strictEqual(
        (mockUserRepository.findByEmail as any).mock.callCount(),
        1
      );
      assert.strictEqual(
        (mockUserRepository.create as any).mock.callCount(),
        0
      );
    });

    it("should return InvalidPasswordError when password is too weak", async () => {
      const userData: CreateUserInput = {
        name: "Test User",
        email: "test@example.com",
        password: "123",
        role: UserRole.STUDENT,
      };

      (mockUserRepository.findByEmail as any).mock.mockImplementation(() =>
        Promise.resolve(null)
      );

      const result = await userService.createUser(userData);

      assert.ok(result.isLeft());
      assert.ok(result.value instanceof InvalidPasswordError);
      assert.strictEqual(
        (mockUserRepository.findByEmail as any).mock.callCount(),
        1
      );
      assert.strictEqual(
        (mockUserRepository.create as any).mock.callCount(),
        0
      );
    });

    it("should pass correct email to repository when checking uniqueness", async () => {
      const userData: CreateUserInput = {
        name: "Test User",
        email: "Test@Example.com",
        password: "ValidPass123!",
        role: UserRole.STUDENT,
      };

      (mockUserRepository.findByEmail as any).mock.mockImplementation(() =>
        Promise.resolve(null)
      );

      await userService.createUser(userData);

      assert.deepStrictEqual(
        (mockUserRepository.findByEmail as any).mock.calls[0].arguments,
        ["Test@Example.com"]
      );
    });
  });

  describe("findById", () => {
    it("should return user when found", async () => {
      const userId = "user-123";
      const user = { id: userId, name: "Test User" } as User;

      (mockUserRepository.findById as any).mock.mockImplementation(() =>
        Promise.resolve(user)
      );

      const result = await userService.findById(userId);

      assert.ok(result.isRight());
      assert.strictEqual(result.value, user);
      assert.strictEqual(
        (mockUserRepository.findById as any).mock.callCount(),
        1
      );
      assert.deepStrictEqual(
        (mockUserRepository.findById as any).mock.calls[0].arguments,
        [userId]
      );
    });

    it("should return UserNotFoundError when user not found", async () => {
      const userId = "non-existent";

      (mockUserRepository.findById as any).mock.mockImplementation(() =>
        Promise.resolve(null)
      );

      const result = await userService.findById(userId);

      assert.ok(result.isLeft());
      assert.ok(result.value instanceof UserNotFoundError);
      assert.strictEqual(
        (mockUserRepository.findById as any).mock.callCount(),
        1
      );
    });

    it("should handle null userId", async () => {
      (mockUserRepository.findById as any).mock.mockImplementation(() =>
        Promise.resolve(null)
      );

      const result = await userService.findById(null as any);

      assert.ok(result.isLeft());
      assert.ok(result.value instanceof UserNotFoundError);
    });

    it("should handle undefined userId", async () => {
      (mockUserRepository.findById as any).mock.mockImplementation(() =>
        Promise.resolve(null)
      );

      const result = await userService.findById(undefined as any);

      assert.ok(result.isLeft());
      assert.ok(result.value instanceof UserNotFoundError);
    });
  });

  describe("findByEmail", () => {
    it("should return user when found", async () => {
      const email = "test@example.com";
      const user = { email: { toString: () => email } } as User;

      (mockUserRepository.findByEmail as any).mock.mockImplementation(() =>
        Promise.resolve(user)
      );

      const result = await userService.findByEmail(email);

      assert.ok(result.isRight());
      assert.strictEqual(result.value, user);
      assert.strictEqual(
        (mockUserRepository.findByEmail as any).mock.callCount(),
        1
      );
    });

    it("should return UserNotFoundError when user not found", async () => {
      const email = "nonexistent@example.com";

      (mockUserRepository.findByEmail as any).mock.mockImplementation(() =>
        Promise.resolve(null)
      );

      const result = await userService.findByEmail(email);

      assert.ok(result.isLeft());
      assert.ok(result.value instanceof UserNotFoundError);
    });

    it("should handle null email", async () => {
      (mockUserRepository.findByEmail as any).mock.mockImplementation(() =>
        Promise.resolve(null)
      );

      const result = await userService.findByEmail(null as any);

      assert.ok(result.isLeft());
      assert.ok(result.value instanceof UserNotFoundError);
    });

    it("should handle undefined email", async () => {
      (mockUserRepository.findByEmail as any).mock.mockImplementation(() =>
        Promise.resolve(null)
      );

      const result = await userService.findByEmail(undefined as any);

      assert.ok(result.isLeft());
      assert.ok(result.value instanceof UserNotFoundError);
    });
  });

  describe("updateUser", () => {
    it("should update user successfully when user exists and email is unique", async () => {
      const userId = "user-123";
      const updateData: UpdateUserInput = {
        name: "Updated Name",
        role: UserRole.TEACHER,
      };

      const existingUser = {
        id: userId,
        name: "Original Name",
        email: { toString: () => "test@example.com" },
        role: UserRole.STUDENT,
        update: mock.fn(() => Promise.resolve(right(undefined))),
      } as any;

      const updatedUser = {
        ...existingUser,
        name: "Updated Name",
        role: UserRole.TEACHER,
      } as User;

      (mockUserRepository.findById as any).mock.mockImplementation(() =>
        Promise.resolve(existingUser)
      );
      (mockUserRepository.update as any).mock.mockImplementation(() =>
        Promise.resolve(updatedUser)
      );

      const result = await userService.updateUser(userId, updateData);

      assert.ok(result.isRight());
      assert.strictEqual(result.value, updatedUser);
      assert.strictEqual(
        (mockUserRepository.findById as any).mock.callCount(),
        1
      );
      assert.strictEqual(
        (mockUserRepository.update as any).mock.callCount(),
        1
      );
    });

    it("should return UserNotFoundError when user does not exist", async () => {
      const userId = "non-existent";
      const updateData: UpdateUserInput = { name: "New Name" };

      (mockUserRepository.findById as any).mock.mockImplementation(() =>
        Promise.resolve(null)
      );

      const result = await userService.updateUser(userId, updateData);

      assert.ok(result.isLeft());
      assert.ok(result.value instanceof UserNotFoundError);
      assert.strictEqual(
        (mockUserRepository.update as any).mock.callCount(),
        0
      );
    });

    it("should return EmailAlreadyInUseError when updating to existing email", async () => {
      const userId = "user-123";
      const updateData: UpdateUserInput = {
        email: "existing@example.com",
      };

      const existingUser = {
        id: userId,
        email: { toString: () => "original@example.com" },
      } as User;

      const userWithEmail = {
        id: "another-user",
        email: { toString: () => "existing@example.com" },
      } as User;

      (mockUserRepository.findById as any).mock.mockImplementation(() =>
        Promise.resolve(existingUser)
      );
      (mockUserRepository.findByEmail as any).mock.mockImplementation(() =>
        Promise.resolve(userWithEmail)
      );

      const result = await userService.updateUser(userId, updateData);

      assert.ok(result.isLeft());
      assert.ok(result.value instanceof EmailAlreadyInUseError);
      assert.strictEqual(
        (mockUserRepository.update as any).mock.callCount(),
        0
      );
    });

    it("should allow updating user with same email", async () => {
      const userId = "user-123";
      const updateData: UpdateUserInput = {
        name: "Updated Name",
        email: "test@example.com",
      };

      const existingUser = {
        id: userId,
        name: "Original Name",
        email: { toString: () => "test@example.com" },
        update: mock.fn(() => Promise.resolve(right(undefined))),
      } as any;

      const updatedUser = {
        ...existingUser,
        name: "Updated Name",
      } as User;

      (mockUserRepository.findById as any).mock.mockImplementation(() =>
        Promise.resolve(existingUser)
      );
      (mockUserRepository.findByEmail as any).mock.mockImplementation(() =>
        Promise.resolve(existingUser)
      );
      (mockUserRepository.update as any).mock.mockImplementation(() =>
        Promise.resolve(updatedUser)
      );

      const result = await userService.updateUser(userId, updateData);

      assert.ok(result.isRight());
      assert.strictEqual(result.value, updatedUser);
    });

    it("should return InvalidEmailError when updating with invalid email format", async () => {
      const userId = "user-123";
      const updateData: UpdateUserInput = {
        email: "invalid-email-format",
      };

      const existingUser = {
        id: userId,
        email: { toString: () => "original@example.com" },
        update: mock.fn(() => Promise.resolve(left(new InvalidEmailError()))),
      } as any;

      (mockUserRepository.findById as any).mock.mockImplementation(() =>
        Promise.resolve(existingUser)
      );

      const result = await userService.updateUser(userId, updateData);

      assert.ok(result.isLeft());
      assert.ok(result.value instanceof InvalidEmailError);
      assert.strictEqual(
        (mockUserRepository.update as any).mock.callCount(),
        0
      );
    });

    it("should return InvalidPasswordError when updating with weak password", async () => {
      const userId = "user-123";
      const updateData: UpdateUserInput = {
        password: "123",
      };

      const existingUser = {
        id: userId,
        email: { toString: () => "test@example.com" },
        update: mock.fn(() =>
          Promise.resolve(left(new InvalidPasswordError()))
        ),
      } as any;

      (mockUserRepository.findById as any).mock.mockImplementation(() =>
        Promise.resolve(existingUser)
      );

      const result = await userService.updateUser(userId, updateData);

      assert.ok(result.isLeft());
      assert.ok(result.value instanceof InvalidPasswordError);
      assert.strictEqual(
        (mockUserRepository.update as any).mock.callCount(),
        0
      );
    });

    it("should handle null userId", async () => {
      const updateData: UpdateUserInput = { name: "New Name" };

      (mockUserRepository.findById as any).mock.mockImplementation(() =>
        Promise.resolve(null)
      );

      const result = await userService.updateUser(null as any, updateData);

      assert.ok(result.isLeft());
      assert.ok(result.value instanceof UserNotFoundError);
    });

    it("should handle undefined updateData", async () => {
      const userId = "user-123";
      const existingUser = {
        id: userId,
        email: { toString: () => "test@example.com" },
        update: mock.fn(() => Promise.resolve(right(undefined))),
      } as any;

      (mockUserRepository.findById as any).mock.mockImplementation(() =>
        Promise.resolve(existingUser)
      );
      (mockUserRepository.update as any).mock.mockImplementation(() =>
        Promise.resolve(existingUser)
      );

      const result = await userService.updateUser(userId, undefined as any);

      assert.ok(result.isRight());
    });
  });

  describe("deleteUser", () => {
    it("should delete user successfully when user exists", async () => {
      const userId = "user-123";
      const user = { id: userId } as User;

      (mockUserRepository.findById as any).mock.mockImplementation(() =>
        Promise.resolve(user)
      );
      (mockUserRepository.delete as any).mock.mockImplementation(() =>
        Promise.resolve()
      );

      const result = await userService.deleteUser(userId);

      assert.ok(result.isRight());
      assert.strictEqual(result.value, undefined);
      assert.strictEqual(
        (mockUserRepository.delete as any).mock.callCount(),
        1
      );
      assert.deepStrictEqual(
        (mockUserRepository.delete as any).mock.calls[0].arguments,
        [userId]
      );
    });

    it("should return UserNotFoundError when user does not exist", async () => {
      const userId = "non-existent";

      (mockUserRepository.findById as any).mock.mockImplementation(() =>
        Promise.resolve(null)
      );

      const result = await userService.deleteUser(userId);

      assert.ok(result.isLeft());
      assert.ok(result.value instanceof UserNotFoundError);
      assert.strictEqual(
        (mockUserRepository.delete as any).mock.callCount(),
        0
      );
    });

    it("should handle null userId", async () => {
      (mockUserRepository.findById as any).mock.mockImplementation(() =>
        Promise.resolve(null)
      );

      const result = await userService.deleteUser(null as any);

      assert.ok(result.isLeft());
      assert.ok(result.value instanceof UserNotFoundError);
    });

    it("should handle undefined userId", async () => {
      (mockUserRepository.findById as any).mock.mockImplementation(() =>
        Promise.resolve(null)
      );

      const result = await userService.deleteUser(undefined as any);

      assert.ok(result.isLeft());
      assert.ok(result.value instanceof UserNotFoundError);
    });
  });

  describe("findAll", () => {
    it("should return paginated users", async () => {
      const mockResult = {
        users: [
          { id: "1", name: "User 1" } as User,
          { id: "2", name: "User 2" } as User,
        ],
        total: 10,
      };

      (mockUserRepository.findAll as any).mock.mockImplementation(() =>
        Promise.resolve(mockResult)
      );

      const result = await userService.findAll(1, 2);

      assert.strictEqual(result.users.length, 2);
      assert.strictEqual(result.total, 10);
      assert.strictEqual(
        (mockUserRepository.findAll as any).mock.callCount(),
        1
      );
      assert.deepStrictEqual(
        (mockUserRepository.findAll as any).mock.calls[0].arguments,
        [1, 2]
      );
    });

    it("should return empty result when no users exist", async () => {
      const mockResult = {
        users: [],
        total: 0,
      };

      (mockUserRepository.findAll as any).mock.mockImplementation(() =>
        Promise.resolve(mockResult)
      );

      const result = await userService.findAll();

      assert.strictEqual(result.users.length, 0);
      assert.strictEqual(result.total, 0);
      assert.strictEqual(
        (mockUserRepository.findAll as any).mock.callCount(),
        1
      );
    });

    it("should handle findAll with default pagination", async () => {
      const mockResult = {
        users: [{ id: "1", name: "User 1" } as User],
        total: 1,
      };

      (mockUserRepository.findAll as any).mock.mockImplementation(() =>
        Promise.resolve(mockResult)
      );

      const result = await userService.findAll();

      assert.strictEqual(result.users.length, 1);
      assert.strictEqual(result.total, 1);
      assert.deepStrictEqual(
        (mockUserRepository.findAll as any).mock.calls[0].arguments,
        [undefined, undefined]
      );
    });

    it("should handle page 0", async () => {
      const mockResult = {
        users: [{ id: "1", name: "User 1" } as User],
        total: 1,
      };

      (mockUserRepository.findAll as any).mock.mockImplementation(() =>
        Promise.resolve(mockResult)
      );

      const result = await userService.findAll(0, 10);

      assert.strictEqual(result.users.length, 1);
      assert.deepStrictEqual(
        (mockUserRepository.findAll as any).mock.calls[0].arguments,
        [0, 10]
      );
    });

    it("should handle negative page", async () => {
      const mockResult = {
        users: [],
        total: 0,
      };

      (mockUserRepository.findAll as any).mock.mockImplementation(() =>
        Promise.resolve(mockResult)
      );

      const result = await userService.findAll(-1, 10);

      assert.strictEqual(result.users.length, 0);
      assert.deepStrictEqual(
        (mockUserRepository.findAll as any).mock.calls[0].arguments,
        [-1, 10]
      );
    });

    it("should handle limit 0", async () => {
      const mockResult = {
        users: [],
        total: 5,
      };

      (mockUserRepository.findAll as any).mock.mockImplementation(() =>
        Promise.resolve(mockResult)
      );

      const result = await userService.findAll(1, 0);

      assert.strictEqual(result.users.length, 0);
      assert.strictEqual(result.total, 5);
      assert.deepStrictEqual(
        (mockUserRepository.findAll as any).mock.calls[0].arguments,
        [1, 0]
      );
    });

    it("should handle very large limit", async () => {
      const mockResult = {
        users: [
          { id: "1", name: "User 1" } as User,
          { id: "2", name: "User 2" } as User,
        ],
        total: 2,
      };

      (mockUserRepository.findAll as any).mock.mockImplementation(() =>
        Promise.resolve(mockResult)
      );

      const result = await userService.findAll(1, 1000000);

      assert.strictEqual(result.users.length, 2);
      assert.strictEqual(result.total, 2);
      assert.deepStrictEqual(
        (mockUserRepository.findAll as any).mock.calls[0].arguments,
        [1, 1000000]
      );
    });

    it("should handle null page and limit", async () => {
      const mockResult = {
        users: [{ id: "1", name: "User 1" } as User],
        total: 1,
      };

      (mockUserRepository.findAll as any).mock.mockImplementation(() =>
        Promise.resolve(mockResult)
      );

      const result = await userService.findAll(null as any, null as any);

      assert.strictEqual(result.users.length, 1);
      assert.deepStrictEqual(
        (mockUserRepository.findAll as any).mock.calls[0].arguments,
        [null, null]
      );
    });
  });
});
