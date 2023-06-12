import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class BanInfo {
  @Prop({ type: Boolean, required: true, default: false })
  isBanned: boolean;

  @Prop({ type: Date, required: false })
  banDate: Date | null;
}

export const BanInfoSchema = SchemaFactory.createForClass(BanInfo);
