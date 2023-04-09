import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class BanInfo {
  @Prop({ type: Boolean, required: true, default: false })
  isBanned: boolean;

  // TODO Question: how declare properties that dont need at first
  @Prop({ type: Date, required: false })
  banDate: Date | null;

  @Prop({ type: String, required: false })
  banReason: string | null;
}

export const BanInfoSchema = SchemaFactory.createForClass(BanInfo);
