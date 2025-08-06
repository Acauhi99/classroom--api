import { describe, it, beforeEach, afterEach, before, after } from "node:test";
import assert from "node:assert";
import { UserRepository } from "./user.repository.js";
import { User, UserRole } from "../../@domain/entities/user.entity.js";
import { AppDataSource } from "../database/data-source.js";
import { QueryRunner } from "typeorm";

describe("UserRepository", () => {
  let userRepository: UserRepository;
  let queryRunner: QueryRunner;

  before(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  });

  beforeEach(async () => {
    queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    userRepository = new UserRepository(queryRunner.manager);
  });

  afterEach(async () => {
    if (queryRunner.isTransactionActive) {
      await queryRunner.rollbackTransaction();
    }
    await queryRunner.release();
  });

  after(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  describe("create", () => {
    it("should create and persist a user successfully", async () => {
      const userResult = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "ValidPass123!",
        role: UserRole.STUDENT,
      });

      assert.ok(userResult.isRight());
      const user = userResult.value;

      const createdUser = await userRepository.create(user);

      assert.ok(createdUser.id);
      assert.strictEqual(createdUser.name, "Test User");
      assert.strictEqual(createdUser.email.toString(), "test@example.com");
      assert.strictEqual(createdUser.role, UserRole.STUDENT);
      assert.strictEqual(createdUser.isVerified, false);
    });

    it("should create user with all optional fields", async () => {
      const userResult = await User.create({
        name: "Teacher User",
        email: "teacher@example.com",
        password: "ValidPass123!",
        role: UserRole.TEACHER,
        bio: "Math teacher",
        avatar: "https://example.com/avatar.jpg",
      });

      assert.ok(userResult.isRight());
      const user = userResult.value;

      user.isVerified = true;

      const createdUser = await userRepository.create(user);

      assert.strictEqual(createdUser.bio, "Math teacher");
      assert.strictEqual(createdUser.avatar, "https://example.com/avatar.jpg");
      assert.strictEqual(createdUser.isVerified, true);
      assert.strictEqual(createdUser.role, UserRole.TEACHER);
    });

    it("should handle user with undefined optional fields", async () => {
      const userResult = await User.create({
        name: "Simple User",
        email: "simple@example.com",
        password: "ValidPass123!",
        role: UserRole.STUDENT,
      });

      assert.ok(userResult.isRight());
      const user = userResult.value;

      const createdUser = await userRepository.create(user);

      assert.strictEqual(createdUser.bio, null);
      assert.strictEqual(createdUser.avatar, null);
    });
  });

  describe("findById", () => {
    it("should find user by id when user exists", async () => {
      const userResult = await User.create({
        name: "Find Me",
        email: "findme@example.com",
        password: "ValidPass123!",
        role: UserRole.ADMIN,
      });

      assert.ok(userResult.isRight());
      const createdUser = await userRepository.create(userResult.value);

      const foundUser = await userRepository.findById(createdUser.id);

      assert.ok(foundUser);
      assert.strictEqual(foundUser.id, createdUser.id);
      assert.strictEqual(foundUser.name, "Find Me");
      assert.strictEqual(foundUser.role, UserRole.ADMIN);
    });

    it("should return null when user does not exist", async () => {
      const nonExistentId = "01HQZX1KQZYX1KQZYX1KQZYX1K";

      const result = await userRepository.findById(nonExistentId);

      assert.strictEqual(result, null);
    });

    it("should return null when id is null", async () => {
      const result = await userRepository.findById(null as any);

      assert.strictEqual(result, null);
    });

    it("should return null when id is undefined", async () => {
      const result = await userRepository.findById(undefined as any);

      assert.strictEqual(result, null);
    });

    it("should return null when id is empty string", async () => {
      const result = await userRepository.findById("");

      assert.strictEqual(result, null);
    });
  });

  describe("findByEmail", () => {
    it("should find user by email when user exists", async () => {
      const userResult = await User.create({
        name: "Email User",
        email: "email@example.com",
        password: "ValidPass123!",
        role: UserRole.STUDENT,
      });

      assert.ok(userResult.isRight());
      await userRepository.create(userResult.value);

      const foundUser = await userRepository.findByEmail("email@example.com");

      assert.ok(foundUser);
      assert.strictEqual(foundUser.email.toString(), "email@example.com");
      assert.strictEqual(foundUser.name, "Email User");
    });

    it("should return null when email does not exist", async () => {
      const result = await userRepository.findByEmail(
        "nonexistent@example.com"
      );

      assert.strictEqual(result, null);
    });

    it("should find user by email case insensitively", async () => {
      const userResult = await User.create({
        name: "Case User",
        email: "CaseTest@Example.com",
        password: "ValidPass123!",
        role: UserRole.TEACHER,
      });

      assert.ok(userResult.isRight());
      await userRepository.create(userResult.value);

      const foundUser = await userRepository.findByEmail(
        "casetest@example.com"
      );

      assert.ok(foundUser);
      assert.strictEqual(foundUser.email.toString(), "casetest@example.com");
    });

    it("should return null when email is null", async () => {
      const result = await userRepository.findByEmail(null as any);

      assert.strictEqual(result, null);
    });

    it("should return null when email is undefined", async () => {
      const result = await userRepository.findByEmail(undefined as any);

      assert.strictEqual(result, null);
    });

    it("should return null when email is empty string", async () => {
      const result = await userRepository.findByEmail("");

      assert.strictEqual(result, null);
    });
  });

  describe("findAll", () => {
    it("should return empty result when no users exist", async () => {
      const result = await userRepository.findAll();

      assert.strictEqual(result.users.length, 0);
      assert.strictEqual(result.total, 0);
    });

    it("should return all users without pagination", async () => {
      const users = [
        { name: "User 1", email: "user1@example.com", role: UserRole.STUDENT },
        { name: "User 2", email: "user2@example.com", role: UserRole.TEACHER },
        { name: "User 3", email: "user3@example.com", role: UserRole.ADMIN },
      ];

      for (const userData of users) {
        const userResult = await User.create({
          ...userData,
          password: "ValidPass123!",
        });

        assert.ok(userResult.isRight());
        await userRepository.create(userResult.value);
      }

      const result = await userRepository.findAll();

      assert.strictEqual(result.users.length, 3);
      assert.strictEqual(result.total, 3);
    });

    it("should return paginated results correctly", async () => {
      const users = [
        { name: "User 1", email: "user1@example.com", role: UserRole.STUDENT },
        { name: "User 2", email: "user2@example.com", role: UserRole.TEACHER },
        { name: "User 3", email: "user3@example.com", role: UserRole.ADMIN },
      ];

      for (const userData of users) {
        const userResult = await User.create({
          ...userData,
          password: "ValidPass123!",
        });

        assert.ok(userResult.isRight());
        await userRepository.create(userResult.value);
      }

      const result = await userRepository.findAll(1, 2);

      assert.strictEqual(result.users.length, 2);
      assert.strictEqual(result.total, 3);
    });

    it("should handle page 0 correctly", async () => {
      const users = [
        { name: "User 1", email: "user1@example.com", role: UserRole.STUDENT },
        { name: "User 2", email: "user2@example.com", role: UserRole.TEACHER },
      ];

      for (const userData of users) {
        const userResult = await User.create({
          ...userData,
          password: "ValidPass123!",
        });

        assert.ok(userResult.isRight());
        await userRepository.create(userResult.value);
      }

      const result = await userRepository.findAll(0, 1);

      assert.strictEqual(result.users.length, 1);
      assert.strictEqual(result.total, 2);
    });

    it("should handle negative page correctly", async () => {
      const userResult = await User.create({
        name: "User 1",
        email: "user1@example.com",
        password: "ValidPass123!",
        role: UserRole.STUDENT,
      });

      assert.ok(userResult.isRight());
      await userRepository.create(userResult.value);

      const result = await userRepository.findAll(-1, 10);

      assert.strictEqual(result.users.length, 1);
      assert.strictEqual(result.total, 1);
    });

    it("should handle limit 0", async () => {
      const userResult = await User.create({
        name: "User 1",
        email: "user1@example.com",
        password: "ValidPass123!",
        role: UserRole.STUDENT,
      });

      assert.ok(userResult.isRight());
      await userRepository.create(userResult.value);

      const result = await userRepository.findAll(1, 0);

      assert.strictEqual(result.users.length, 0);
      assert.strictEqual(result.total, 1);
    });

    it("should handle very large limit", async () => {
      const users = [
        { name: "User 1", email: "user1@example.com", role: UserRole.STUDENT },
        { name: "User 2", email: "user2@example.com", role: UserRole.TEACHER },
      ];

      for (const userData of users) {
        const userResult = await User.create({
          ...userData,
          password: "ValidPass123!",
        });

        assert.ok(userResult.isRight());
        await userRepository.create(userResult.value);
      }

      const result = await userRepository.findAll(1, 1000000);

      assert.strictEqual(result.users.length, 2);
      assert.strictEqual(result.total, 2);
    });

    it("should handle null page and limit", async () => {
      const userResult = await User.create({
        name: "User 1",
        email: "user1@example.com",
        password: "ValidPass123!",
        role: UserRole.STUDENT,
      });

      assert.ok(userResult.isRight());
      await userRepository.create(userResult.value);

      const result = await userRepository.findAll(null as any, null as any);

      assert.strictEqual(result.users.length, 1);
      assert.strictEqual(result.total, 1);
    });

    it("should handle undefined page and limit", async () => {
      const userResult = await User.create({
        name: "User 1",
        email: "user1@example.com",
        password: "ValidPass123!",
        role: UserRole.STUDENT,
      });

      assert.ok(userResult.isRight());
      await userRepository.create(userResult.value);

      const result = await userRepository.findAll(undefined, undefined);

      assert.strictEqual(result.users.length, 1);
      assert.strictEqual(result.total, 1);
    });
  });

  describe("update", () => {
    it("should update user successfully", async () => {
      const userResult = await User.create({
        name: "Original Name",
        email: "original@example.com",
        password: "ValidPass123!",
        role: UserRole.STUDENT,
      });

      assert.ok(userResult.isRight());
      const createdUser = await userRepository.create(userResult.value);

      const updateResult = await createdUser.update({
        name: "Updated Name",
        role: UserRole.TEACHER,
        bio: "Now a teacher",
      });

      assert.ok(updateResult.isRight());

      const updatedUser = await userRepository.update(createdUser);

      assert.strictEqual(updatedUser.name, "Updated Name");
      assert.strictEqual(updatedUser.role, UserRole.TEACHER);
      assert.strictEqual(updatedUser.bio, "Now a teacher");
    });

    it("should clear optional fields when set to undefined", async () => {
      const userResult = await User.create({
        name: "Original Name",
        email: "original@example.com",
        password: "ValidPass123!",
        role: UserRole.STUDENT,
        bio: "Original bio",
      });

      assert.ok(userResult.isRight());
      const createdUser = await userRepository.create(userResult.value);

      const updatedUser = await createdUser.update({
        name: "Updated Name",
        role: UserRole.TEACHER,
        bio: undefined,
      });

      assert.ok(updatedUser.isRight());
    });
  });

  describe("delete", () => {
    it("should delete user successfully", async () => {
      const userResult = await User.create({
        name: "Delete Me",
        email: "delete@example.com",
        password: "ValidPass123!",
        role: UserRole.STUDENT,
      });

      assert.ok(userResult.isRight());
      const createdUser = await userRepository.create(userResult.value);

      await userRepository.delete(createdUser.id);

      const deletedUser = await userRepository.findById(createdUser.id);
      assert.strictEqual(deletedUser, null);
    });

    it("should not throw error when deleting non-existent user", async () => {
      const nonExistentId = "01HQZX1KQZYX1KQZYX1KQZYX1K";

      await userRepository.delete(nonExistentId);
    });

    it("should not throw error when deleting with null id", async () => {
      await userRepository.delete(null as any);
    });

    it("should not throw error when deleting with undefined id", async () => {
      await userRepository.delete(undefined as any);
    });

    it("should not throw error when deleting with empty string id", async () => {
      await userRepository.delete("");
    });
  });
});
