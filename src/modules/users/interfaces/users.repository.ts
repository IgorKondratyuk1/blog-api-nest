import UserModel from '../models/user.model';

export abstract class UsersRepository {
  public abstract save(user: UserModel): Promise<boolean>;

  public abstract create(newUser: UserModel): Promise<UserModel | null>;

  public abstract findById(id: string): Promise<UserModel | null>;

  public abstract findUserByLoginOrEmail(loginOrEmail: string): Promise<UserModel | null>;

  public abstract findUserByEmailConfirmationCode(code: string): Promise<UserModel | null>;

  public abstract findUserByPasswordConfirmationCode(code: string): Promise<UserModel | null>;

  public abstract remove(id: string): Promise<boolean>;

  public abstract removeAll(): Promise<boolean>;
}
