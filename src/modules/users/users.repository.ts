import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UsersMapper } from './utils/users.mapper';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async save(user: UserDocument): Promise<any> {
    return await user.save();
  }

  async create(createUserDto: CreateUserDto, isConfirmed: boolean) {
    const newUser = await User.createInstance(createUserDto, isConfirmed);

    await this.userModel.create(newUser);
    return UsersMapper.toView(newUser);
  }

  async findOne(id: string) {
    return this.userModel.findOne({ id }).exec();
  }

  async findUserByLoginOrEmail(loginOrEmail: string) {
    return this.userModel.findOne({
      $or: [{ 'accountData.login': loginOrEmail }, { 'accountData.email': loginOrEmail }],
    });
  }

  async findUserByEmailConfirmationCode(code: string) {
    return this.userModel.findOne({
      'emailConfirmation.confirmationCode': code,
    });
  }

  async findUserByPasswordConfirmationCode(code: string) {
    return this.userModel.findOne({
      'passwordRecovery.recoveryCode': code,
    });
  }

  async remove(id: string) {
    const result = await this.userModel.deleteOne({ id });
    return result.deletedCount === 1;
  }

  async removeAll() {
    return this.userModel.deleteMany({});
  }
}
