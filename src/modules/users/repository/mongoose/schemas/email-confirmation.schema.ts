import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class EmailConfirmation {
  constructor(confirmationCode: string, expirationDate: Date, isConfirmed: boolean) {
    this.confirmationCode = confirmationCode;
    this.expirationDate = expirationDate;
    this.isConfirmed = isConfirmed;
  }

  @Prop({ type: String })
  confirmationCode: string;

  @Prop({ type: Date })
  expirationDate: Date;

  @Prop({ type: Boolean })
  isConfirmed: boolean;
}

export const EmailConfirmationSchema = SchemaFactory.createForClass(EmailConfirmation);
