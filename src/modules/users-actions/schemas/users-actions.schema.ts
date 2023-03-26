import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { CreateUsersActionsDto } from '../dto/create-users-actions.dto';

export type UsersActionsDocument = HydratedDocument<UsersActions>;

@Schema()
export class UsersActions {
  constructor(ip: string, resource: string) {
    this.id = randomUUID();
    this.createdAt = new Date();
    this.resource = resource;
    this.ip = ip;
  }

  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: String })
  ip: string;

  @Prop({ type: String })
  resource: string;

  @Prop({ type: Date, required: true })
  createdAt: Date;

  public static createInstance(createUsersActionsDto: CreateUsersActionsDto) {
    return new UsersActions(createUsersActionsDto.ip, createUsersActionsDto.resource);
  }
}

export const UsersActionsSchema = SchemaFactory.createForClass(UsersActions);

UsersActionsSchema.statics = {
  createInstance: UsersActions.createInstance,
};
