import { describe, it, beforeEach, afterEach, before, after } from "node:test";
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
import { UserRole } from "../../entities/user.entity.js";
import { AppDataSource } from "../../../@infrastructure/database/data-source.js";
import { QueryRunner } from "typeorm";

describe("UserService", () => {
  let userService: UserService;
  let queryRunner: QueryRunner;

  before(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  });

  beforeEach(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const userRepository = new UserRepository(queryRunner.manager);
    userService = new UserService(userRepository);
  });

  afterEach(async () => {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  });

  after(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  describe("createUser", () => {
    it("should create a student user successfully", async () => {
      const userData: CreateUserInput = {
        name: "Acauhi",
        email: "acauhi@example.com",
        password: "ValidPass123!",
        role: UserRole.STUDENT,
      };

      const result = await userService.createUser(userData);

      assert.ok(result.isRight());
      assert.ok(result.value.id);
      assert.strictEqual(result.value.name, "Acauhi");
      assert.strictEqual(result.value.email.toString(), "acauhi@example.com");
      assert.strictEqual(result.value.role, UserRole.STUDENT);
    });

    it("should create a teacher user successfully", async () => {
      const userData: CreateUserInput = {
        name: "Professor Silva",
        email: "professor@example.com",
        password: "ValidPass123!",
        role: UserRole.TEACHER,
        bio: "Experienced math teacher",
      };

      const result = await userService.createUser(userData);

      assert.ok(result.isRight());
      assert.ok(result.value.id);
      assert.strictEqual(result.value.name, "Professor Silva");
      assert.strictEqual(result.value.role, UserRole.TEACHER);
      assert.strictEqual(result.value.bio, "Experienced math teacher");
    });

    it("should create an admin user successfully", async () => {
      const userData: CreateUserInput = {
        name: "Admin User",
        email: "admin@example.com",
        password: "ValidPass123!",
        role: UserRole.ADMIN,
        avatar: "https://example.com/avatar.jpg",
      };

      const result = await userService.createUser(userData);

      assert.ok(result.isRight());
      assert.strictEqual(result.value.role, UserRole.ADMIN);
      assert.strictEqual(result.value.avatar, "https://example.com/avatar.jpg");
    });

    it("should return EmailAlreadyInUseError when email is already taken", async () => {
      const userData: CreateUserInput = {
        name: "First User",
        email: "duplicate@example.com",
        password: "ValidPass123!",
        role: UserRole.STUDENT,
      };

      await userService.createUser(userData);

      const duplicateUserData: CreateUserInput = {
        name: "Second User",
        email: "duplicate@example.com",
        password: "AnotherPass123!",
        role: UserRole.TEACHER,
      };

      const result = await userService.createUser(duplicateUserData);

      assert.ok(result.isLeft());
      assert.ok(result.value instanceof EmailAlreadyInUseError);
    });

    it("should return InvalidEmailError when email format is invalid", async () => {
      const userData: CreateUserInput = {
        name: "Test User",
        email: "invalid-email",
        password: "ValidPass123!",
        role: UserRole.STUDENT,
      };

      const result = await userService.createUser(userData);

      assert.ok(result.isLeft());
      assert.ok(result.value instanceof InvalidEmailError);
    });

    it("should return InvalidPasswordError when password is too weak", async () => {
      const userData: CreateUserInput = {
        name: "Test User",
        email: "test@example.com",
        password: "123",
        role: UserRole.STUDENT,
      };

      const result = await userService.createUser(userData);

      assert.ok(result.isLeft());
      assert.ok(result.value instanceof InvalidPasswordError);
    });
  });

  describe("findById", () => {
    it("should find user by id successfully", async () => {
      const userData: CreateUserInput = {
        name: "Find Me",
        email: "findme@example.com",
        password: "ValidPass123!",
        role: UserRole.TEACHER,
      };

      const createResult = await userService.createUser(userData);
      assert.ok(createResult.isRight());

      const result = await userService.findById(createResult.value.id);

      assert.ok(result.isRight());
      assert.strictEqual(result.value.id, createResult.value.id);
      assert.strictEqual(result.value.name, "Find Me");
      assert.strictEqual(result.value.role, UserRole.TEACHER);
    });

    it("should return UserNotFoundError when user does not exist", async () => {
      const nonExistentId = "01HQZX1KQZYX1KQZYX1KQZYX1K";

      const result = await userService.findById(nonExistentId);

      assert.ok(result.isLeft());
      assert.ok(result.value instanceof UserNotFoundError);
    });
  });

  describe("findByEmail", () => {
    it("should find user by email successfully", async () => {
      const userData: CreateUserInput = {
        name: "Email User",
        email: "email@example.com",
        password: "ValidPass123!",
        role: UserRole.ADMIN,
      };

      await userService.createUser(userData);

      const result = await userService.findByEmail("email@example.com");

      assert.ok(result.isRight());
      assert.strictEqual(result.value.email.toString(), "email@example.com");
      assert.strictEqual(result.value.name, "Email User");
      assert.strictEqual(result.value.role, UserRole.ADMIN);
    });

    it("should return UserNotFoundError when email does not exist", async () => {
      const result = await userService.findByEmail("nonexistent@example.com");

      assert.ok(result.isLeft());
      assert.ok(result.value instanceof UserNotFoundError);
    });
  });

  describe("findAll", () => {
    it("should return empty list when no users exist", async () => {
      const result = await userService.findAll();

      assert.strictEqual(result.users.length, 0);
      assert.strictEqual(result.total, 0);
    });

    it("should return all users with different roles and pagination", async () => {
      const users: CreateUserInput[] = [
        {
          name: "Student 1",
          email: "student1@example.com",
          password: "ValidPass123!",
          role: UserRole.STUDENT,
        },
        {
          name: "Teacher 1",
          email: "teacher1@example.com",
          password: "ValidPass123!",
          role: UserRole.TEACHER,
        },
        {
          name: "Admin 1",
          email: "admin1@example.com",
          password: "ValidPass123!",
          role: UserRole.ADMIN,
        },
      ];

      for (const userData of users) {
        await userService.createUser(userData);
      }

      const result = await userService.findAll(1, 2);

      assert.strictEqual(result.users.length, 2);
      assert.strictEqual(result.total, 3);
      assert.ok(Object.values(UserRole).includes(result.users[0].role));
      assert.ok(Object.values(UserRole).includes(result.users[1].role));
    });
  });

  describe("updateUser", () => {
    it("should update user name and role successfully", async () => {
      const userData: CreateUserInput = {
        name: "Original Name",
        email: "original@example.com",
        password: "ValidPass123!",
        role: UserRole.STUDENT,
      };

      const createResult = await userService.createUser(userData);
      assert.ok(createResult.isRight());

      const updateData: UpdateUserInput = {
        name: "Updated Name",
        role: UserRole.TEACHER,
        bio: "Now I'm a teacher",
      };

      const result = await userService.updateUser(
        createResult.value.id,
        updateData
      );

      assert.ok(result.isRight());
      assert.strictEqual(result.value.name, "Updated Name");
      assert.strictEqual(result.value.role, UserRole.TEACHER);
      assert.strictEqual(result.value.bio, "Now I'm a teacher");
      assert.strictEqual(result.value.email.toString(), "original@example.com");
    });

    it("should update user from student to admin", async () => {
      const userData: CreateUserInput = {
        name: "Student User",
        email: "student@example.com",
        password: "ValidPass123!",
        role: UserRole.STUDENT,
      };

      const createResult = await userService.createUser(userData);
      assert.ok(createResult.isRight());

      const updateData: UpdateUserInput = {
        role: UserRole.ADMIN,
        isVerified: true,
      };

      const result = await userService.updateUser(
        createResult.value.id,
        updateData
      );

      assert.ok(result.isRight());
      assert.strictEqual(result.value.role, UserRole.ADMIN);
      assert.strictEqual(result.value.isVerified, true);
    });

    it("should return UserNotFoundError when user does not exist", async () => {
      const nonExistentId = "01HQZX1KQZYX1KQZYX1KQZYX1K";
      const updateData: UpdateUserInput = {
        name: "New Name",
        role: UserRole.TEACHER,
      };

      const result = await userService.updateUser(nonExistentId, updateData);

      assert.ok(result.isLeft());
      assert.ok(result.value instanceof UserNotFoundError);
    });

    it("should return EmailAlreadyInUseError when updating to existing email", async () => {
      const user1Data: CreateUserInput = {
        name: "User 1",
        email: "user1@example.com",
        password: "ValidPass123!",
        role: UserRole.TEACHER,
      };
      await userService.createUser(user1Data);

      const user2Data: CreateUserInput = {
        name: "User 2",
        email: "user2@example.com",
        password: "ValidPass123!",
        role: UserRole.STUDENT,
      };
      const createResult = await userService.createUser(user2Data);
      assert.ok(createResult.isRight());

      const updateData: UpdateUserInput = {
        email: "user1@example.com",
      };

      const result = await userService.updateUser(
        createResult.value.id,
        updateData
      );

      assert.ok(result.isLeft());
      assert.ok(result.value instanceof EmailAlreadyInUseError);
    });

    it("should allow updating user with same email", async () => {
      const userData: CreateUserInput = {
        name: "Test User",
        email: "test@example.com",
        password: "ValidPass123!",
        role: UserRole.STUDENT,
      };

      const createResult = await userService.createUser(userData);
      assert.ok(createResult.isRight());

      const updateData: UpdateUserInput = {
        name: "Updated Name",
        email: "test@example.com",
        role: UserRole.TEACHER,
      };

      const result = await userService.updateUser(
        createResult.value.id,
        updateData
      );

      assert.ok(result.isRight());
      assert.strictEqual(result.value.name, "Updated Name");
      assert.strictEqual(result.value.email.toString(), "test@example.com");
      assert.strictEqual(result.value.role, UserRole.TEACHER);
    });
  });

  describe("deleteUser", () => {
    it("should delete teacher user successfully", async () => {
      const userData: CreateUserInput = {
        name: "Teacher to Delete",
        email: "delete@example.com",
        password: "ValidPass123!",
        role: UserRole.TEACHER,
      };

      const createResult = await userService.createUser(userData);
      assert.ok(createResult.isRight());

      const result = await userService.deleteUser(createResult.value.id);

      assert.ok(result.isRight());
      assert.strictEqual(result.value, undefined);

      const findResult = await userService.findById(createResult.value.id);
      assert.ok(findResult.isLeft());
      assert.ok(findResult.value instanceof UserNotFoundError);
    });

    it("should return UserNotFoundError when user does not exist", async () => {
      const nonExistentId = "01HQZX1KQZYX1KQZYX1KQZYX1K";

      const result = await userService.deleteUser(nonExistentId);

      assert.ok(result.isLeft());
      assert.ok(result.value instanceof UserNotFoundError);
    });
  });
});
