import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class EmailConfirmation {
  @Prop({ type: String })
  confirmationCode: string;

  @Prop({ type: String })
  expirationDate: string;

  @Prop({ type: Boolean })
  isConfirmed: boolean;
}

export const EmailConfirmationSchema =
  SchemaFactory.createForClass(EmailConfirmation);
