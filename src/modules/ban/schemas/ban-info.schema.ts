import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class BanInfo {
  constructor(isBanned: boolean, banDate: Date | null) {
    this.isBanned = isBanned;
    this.banDate = banDate;
  }

  @Prop({ type: Boolean, required: true, default: false })
  isBanned: boolean;

  @Prop({ type: Date, required: false })
  banDate: Date | null;
}

export const BanInfoSchema = SchemaFactory.createForClass(BanInfo);
