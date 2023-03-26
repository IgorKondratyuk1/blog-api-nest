import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UsersMapper } from './utils/users.mapper';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async save(user: UserDocument): Promise<boolean> {
    try {
      await user.save();
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async create(createUserDto: CreateUserDto, isConfirmed = false): Promise<UserDocument | null> {
    try {
      const newUser: User = await User.createInstance(createUserDto, isConfirmed);
      return await this.userModel.create(newUser);
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findById(id: string): Promise<UserDocument | null> {
    try {
      return this.userModel.findOne({ id }).exec(); // TODO Question: need to use exec() ?
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findUserByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null> {
    try {
      return this.userModel.findOne({
        $or: [{ 'accountData.login': loginOrEmail }, { 'accountData.email': loginOrEmail }],
      });
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findUserByEmailConfirmationCode(code: string): Promise<UserDocument | null> {
    try {
      return this.userModel.findOne({
        'emailConfirmation.confirmationCode': code,
      });
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findUserByPasswordConfirmationCode(code: string): Promise<UserDocument | null> {
    try {
      return this.userModel.findOne({
        'passwordRecovery.recoveryCode': code,
      });
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
