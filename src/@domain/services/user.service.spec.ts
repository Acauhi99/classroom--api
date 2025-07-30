import { test, describe, beforeEach, mock } from "node:test";
import assert from "node:assert/strict";
import { UserService } from "./user.service.js";
import { User, UserRole } from "../entities/user.entity.js";
import { Email } from "../value-objects/email.value-object.js";
import { Password } from "../value-objects/password.value-object.js";
import {
  NotFoundError,
  ConflictError,
} from "../../shared/errors/application-errors.js";

function createFakeUser(overrides: Partial<User> = {}): User {
  const user = new User();

  user.id = "user-id";
  user.name = "John Doe";
  user.email = new Email("john@example.com");
  user.password = Password.create("abc12345");
  user.role = UserRole.STUDENT;
  user.bio = "Bio";
  user.avatar = "avatar.png";

  Object.assign(user, overrides);

  return user;
}

function setupUpdateUserMocks(
  userRepository: any,
  overrides: Partial<User> = {}
) {
  const fakeUser = createFakeUser(overrides);
  userRepository.findById.mock.mockImplementation(async () => fakeUser);

  userRepository.update.mock.mockImplementation(async (user: User) => user);

  return fakeUser;
}

describe("UserService", () => {
  let userRepository: any;
  let service: UserService;

  beforeEach(() => {
    userRepository = {};
    for (const method of [
      "findById",
      "findByEmail",
      "findAll",
      "create",
      "update",
      "delete",
    ]) {
      userRepository[method] = mock.fn();
    }
    service = new UserService(userRepository);
  });

  test("should create a user", async () => {
    // Arrange
    userRepository.findByEmail.mock.mockImplementation(async () => null);
    userRepository.create.mock.mockImplementation(async (user: User) => user);

    // Act
    const user = await service.createUser({
      name: "Jane",
      email: "jane@example.com",
      password: "abc12345",
      role: UserRole.TEACHER,
      bio: "Teacher bio",
      avatar: "avatar2.png",
    });

    // Assert
    assert.equal(user.name, "Jane");
    assert.equal(user.email.toString(), "jane@example.com");
    assert.equal(user.role, UserRole.TEACHER);
    assert.equal(user.bio, "Teacher bio");
    assert.equal(user.avatar, "avatar2.png");
    assert(user.password instanceof Password);
  });

  test("should not allow creating user with duplicate email", async () => {
    // Arrange
    userRepository.findByEmail.mock.mockImplementation(async () =>
      createFakeUser()
    );

    // Act & Assert
    await assert.rejects(
      () =>
        service.createUser({
          name: "Jane",
          email: "john@example.com",
          password: "abc12345",
          role: UserRole.STUDENT,
        }),
      ConflictError
    );
  });

  test("should find user by id", async () => {
    // Arrange
    const fakeUser = createFakeUser();
    userRepository.findById.mock.mockImplementation(async () => fakeUser);

    // Act
    const user = await service.findById(fakeUser.id);

    // Assert
    assert.equal(user.id, fakeUser.id);
    assert.equal(user.name, fakeUser.name);
  });

  test("should throw NotFoundError when user does not exist", async () => {
    // Arrange
    userRepository.findById.mock.mockImplementation(async () => null);

    // Act & Assert
    await assert.rejects(() => service.findById("nonexistent"), NotFoundError);
  });

  test("should update user name and bio", async () => {
    // Arrange
    const fakeUser = setupUpdateUserMocks(userRepository);
    // Act
    const updated = await service.updateUser(fakeUser.id, {
      name: "New Name",
      bio: "New Bio",
    });
    // Assert
    assert.equal(updated.name, "New Name");
    assert.equal(updated.bio, "New Bio");
  });

  test("should update user email", async () => {
    // Arrange
    const fakeUser = setupUpdateUserMocks(userRepository);
    userRepository.findByEmail.mock.mockImplementation(async () => null);
    // Act
    const updated = await service.updateUser(fakeUser.id, {
      email: "new@email.com",
    });
    // Assert
    assert.equal(updated.email.toString(), "new@email.com");
  });

  test("should not allow updating email to an existing one", async () => {
    // Arrange
    const fakeUser = createFakeUser();
    const otherUser = createFakeUser({
      id: "other-id",
      email: new Email("other@email.com"),
    });
    userRepository.findById.mock.mockImplementation(async () => fakeUser);
    userRepository.findByEmail.mock.mockImplementation(async () => otherUser);

    // Act & Assert
    await assert.rejects(
      () =>
        service.updateUser(fakeUser.id, {
          email: "other@email.com",
        }),
      ConflictError
    );
  });

  test("should update user password", async () => {
    // Arrange
    const fakeUser = setupUpdateUserMocks(userRepository);
    // Act
    const updated = await service.updateUser(fakeUser.id, {
      password: "abc78901",
    });
    // Assert
    assert(updated.password instanceof Password);
    assert(await updated.password.compare("abc78901"));
    assert(!(await updated.password.compare(fakeUser.password.toString())));
  });

  test("should update user role", async () => {
    // Arrange
    const fakeUser = setupUpdateUserMocks(userRepository);
    // Act
    const updated = await service.updateUser(fakeUser.id, {
      role: UserRole.ADMIN,
    });
    // Assert
    assert.equal(updated.role, UserRole.ADMIN);
  });

  test("should update user avatar", async () => {
    // Arrange
    const fakeUser = setupUpdateUserMocks(userRepository);
    // Act
    const updated = await service.updateUser(fakeUser.id, {
      avatar: "new-avatar.png",
    });
    // Assert
    assert.equal(updated.avatar, "new-avatar.png");
  });

  test("should set user as verified", async () => {
    // Arrange
    const fakeUser = setupUpdateUserMocks(userRepository);
    // Act
    const updated = await service.updateUser(fakeUser.id, {
      isVerified: true,
    });
    // Assert
    assert.equal(updated.isVerified, true);
  });

  test("should delete user", async () => {
    // Arrange
    const fakeUser = createFakeUser();
    userRepository.findById.mock.mockImplementation(async () => fakeUser);
    userRepository.delete.mock.mockImplementation(async () => {});

    // Act
    await service.deleteUser(fakeUser.id);

    // Assert
    assert.equal(userRepository.delete.mock.calls.length, 1);
    assert.equal(userRepository.delete.mock.calls[0].arguments[0], fakeUser.id);
  });

  test("should throw NotFoundError when updating non-existent user", async () => {
    // Arrange
    userRepository.findById.mock.mockImplementation(async () => null);

    // Act & Assert
    await assert.rejects(
      () => service.updateUser("nonexistent", { name: "Test" }),
      NotFoundError
    );
  });

  test("should throw NotFoundError when deleting non-existent user", async () => {
    // Arrange
    userRepository.findById.mock.mockImplementation(async () => null);

    // Act & Assert
    await assert.rejects(
      () => service.deleteUser("nonexistent"),
      NotFoundError
    );
  });

  test("should find user by email", async () => {
    // Arrange
    const fakeUser = createFakeUser();
    userRepository.findByEmail.mock.mockImplementation(async () => fakeUser);

    // Act
    const user = await service.findByEmail(fakeUser.email.toString());

    // Assert
    assert.equal(user?.id, fakeUser.id);
  });

  test("should return paginated users", async () => {
    // Arrange
    const fakeUser = createFakeUser();
    userRepository.findAll.mock.mockImplementation(async () => ({
      users: [fakeUser],
      total: 1,
    }));

    // Act
    const result = await service.findAll(1, 10);

    // Assert
    assert.deepEqual(result, { users: [fakeUser], total: 1 });
    assert.equal(userRepository.findAll.mock.calls.length, 1);
    assert.deepEqual(userRepository.findAll.mock.calls[0].arguments, [1, 10]);
  });
});
