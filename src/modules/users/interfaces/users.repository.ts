import UserEntity from '../entities/user.entity';

export abstract class UsersRepository {
  public abstract save(user: UserEntity): Promise<boolean>;

  public abstract create(newUser: UserEntity): Promise<UserEntity | null>;

  public abstract findById(id: string): Promise<UserEntity | null>;

  public abstract findUserByLoginOrEmail(loginOrEmail: string): Promise<UserEntity | null>;

  public abstract findUserByEmailConfirmationCode(code: string): Promise<UserEntity | null>;

  public abstract findUserByPasswordConfirmationCode(code: string): Promise<UserEntity | null>;

  public abstract remove(id: string): Promise<boolean>;

  public abstract removeAll(): Promise<boolean>;
}
