import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';

@Schema()
export class PasswordRecovery {
  constructor() {
    this.recoveryCode = randomUUID();
    this.expirationDate = add(new Date(), { hours: 1 }).toISOString();
    this.isUsed = false;
  }

  @Prop({ type: String })
  recoveryCode: string;

  @Prop({ type: String })
  expirationDate: string;

  @Prop({ type: Boolean })
  isUsed: boolean;
}

export const PasswordRecoverySchema =
  SchemaFactory.createForClass(PasswordRecovery);
