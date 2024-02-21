import { Injectable } from '@nestjs/common';
import { UserMongoEntity, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UsersMapper } from '../../utils/users.mapper';
import { UsersRepository } from '../../interfaces/users.repository';
import UserEntity from '../../entities/user.entity';

@Injectable()
export class UsersMongoRepository extends UsersRepository {
  constructor(@InjectModel(UserMongoEntity.name) private userModel: Model<UserDocument>) {
    super();
  }

  async save(userEntity: UserEntity): Promise<boolean> {
    try {
      const savingUser = new this.userModel(UsersMapper.toMongo(userEntity));
      const result = await this.userModel.findByIdAndUpdate(userEntity.id, savingUser);
      return !!result;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async create(userEntity: UserEntity): Promise<UserEntity | null> {
    try {
      const newUser = new this.userModel(UsersMapper.toMongo(userEntity));
      const createdUser = await this.userModel.create(newUser);
      return UsersMapper.toDomainFromDocument(createdUser);
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findById(id: string): Promise<UserEntity | null> {
    try {
      const foundedUser: UserDocument | null = await this.userModel.findOne({ id });
      return foundedUser ? UsersMapper.toDomainFromDocument(foundedUser) : null;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findUserByLoginOrEmail(loginOrEmail: string): Promise<UserEntity | null> {
    try {
      const foundedUser: UserDocument | null = await this.userModel.findOne({
        $or: [{ 'accountData.login': loginOrEmail }, { 'accountData.email': loginOrEmail }],
      });

      return foundedUser ? UsersMapper.toDomainFromDocument(foundedUser) : null;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findUserByEmailConfirmationCode(code: string): Promise<UserEntity | null> {
    try {
      const foundedUser: UserDocument | null = await this.userModel.findOne({
        'emailConfirmation.confirmationCode': code,
      });

      return foundedUser ? UsersMapper.toDomainFromDocument(foundedUser) : null;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findUserByPasswordConfirmationCode(code: string): Promise<UserEntity | null> {
    try {
      const foundedUser: UserDocument | null = await this.userModel.findOne({
        'passwordRecovery.recoveryCode': code,
      });

      return foundedUser ? UsersMapper.toDomainFromDocument(foundedUser) : null;
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
