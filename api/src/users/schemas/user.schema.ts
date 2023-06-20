import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum UserType {
  VIP = 'VIP',
  NORMAL = 'NORMAL',
}

export enum UserStatus {
  NORMAL = 'NORMAL',
  LOCKED = 'LOCKED',
  EXPIRED = 'EXPIRED',
}

export interface UserLock {
  count: number;
  time?: Date;
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  uuid: string;

  @Prop({ required: true, unique: true })
  account: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  nickname: string;

  @Prop({ default: UserStatus.NORMAL })
  status: UserStatus;

  @Prop({ type: Object })
  lock?: UserLock;

  @Prop()
  expiredAt?: Date;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
