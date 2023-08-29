import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class BanExtendedInfo {
  constructor(isBanned: boolean, banDate: Date | null, banReason: string | null) {
    this.isBanned = isBanned;
    this.banDate = banDate;
    this.banReason = banReason;
  }

  @Prop({ type: Boolean, required: true, default: false })
  isBanned: boolean;

  @Prop({ type: Date, required: false })
  banDate: Date | null;

  @Prop({ type: String, required: false })
  banReason: string | null;
}

export const BanExtendedInfoSchema = SchemaFactory.createForClass(BanExtendedInfo);
