import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';

@Schema({ _id: false })
export class PasswordRecovery {
  constructor(recoveryCode: string | null, expirationDate: Date | null, isUsed: boolean | null) {
    this.recoveryCode = recoveryCode;
    this.expirationDate = expirationDate;
    this.isUsed = isUsed;
  }

  @Prop({ type: String })
  recoveryCode: string;

  @Prop({ type: Date })
  expirationDate: Date;

  @Prop({ type: Boolean })
  isUsed: boolean;
}

export const PasswordRecoverySchema = SchemaFactory.createForClass(PasswordRecovery);
