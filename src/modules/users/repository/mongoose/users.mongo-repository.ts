import { Injectable } from '@nestjs/common';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UsersMapper } from '../../utils/users.mapper';
import UserModel from '../../models/user.model';
import { UsersRepository } from '../../interfaces/users.repository';

@Injectable()
export class UsersMongoRepository extends UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
    super();
  }

  async save(user: UserModel): Promise<boolean> {
    try {
      const savingUser = new this.userModel(UsersMapper.toMongo(user));
      const result = await this.userModel.findByIdAndUpdate(user.id, savingUser);
      return !!result;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async create(userModel: UserModel): Promise<UserModel | null> {
    try {
      const newUser = new this.userModel(UsersMapper.toMongo(userModel));
      const createdUser = await this.userModel.create(newUser);
      return UsersMapper.toDomain(createdUser);
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findById(id: string): Promise<UserModel | null> {
    try {
      const foundedUser: UserDocument | null = await this.userModel.findOne({ id });
      return foundedUser ? UsersMapper.toDomain(foundedUser) : null;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findUserByLoginOrEmail(loginOrEmail: string): Promise<UserModel | null> {
    try {
      const foundedUser: UserDocument | null = await this.userModel.findOne({
        $or: [{ 'accountData.login': loginOrEmail }, { 'accountData.email': loginOrEmail }],
      });

      return foundedUser ? UsersMapper.toDomain(foundedUser) : null;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findUserByEmailConfirmationCode(code: string): Promise<UserModel | null> {
    try {
      const foundedUser: UserDocument | null = await this.userModel.findOne({
        'emailConfirmation.confirmationCode': code,
      });

      return foundedUser ? UsersMapper.toDomain(foundedUser) : null;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findUserByPasswordConfirmationCode(code: string): Promise<UserModel | null> {
    try {
      const foundedUser: UserDocument | null = await this.userModel.findOne({
        'passwordRecovery.recoveryCode': code,
      });

      return foundedUser ? UsersMapper.toDomain(foundedUser) : null;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async remove(id: string): Promise<boolean> {
    try {
      const result = await this.userModel.deleteOne({ id });
      return result.deletedCount === 1;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async removeAll(): Promise<boolean> {
    try {
      await this.userModel.deleteMany({});
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
