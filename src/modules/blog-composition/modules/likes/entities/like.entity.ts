import { LikeLocationsType, LikeStatus, LikeStatusType } from '../types/like';
import IdGenerator from '../../../../../common/utils/id-generator';

export class LikeEntity {
  public id: string;
  public userId: string;
  public userLogin: string;
  public locationId: string;
  public locationName: LikeLocationsType;
  public myStatus: LikeStatusType;
  public isBanned: boolean;
  public createdAt: Date;

  constructor(
    id: string,
    userId: string,
    userLogin: string,
    locationId: string,
    locationName: LikeLocationsType,
    myStatus: LikeStatusType,
    isBanned: boolean,
    createdAt: Date,
  ) {
    this.id = id;
    this.userId = userId;
    this.userLogin = userLogin;
    this.locationName = locationName;
    this.locationId = locationId;
    this.myStatus = myStatus;
    this.isBanned = isBanned;
    this.createdAt = createdAt;
  }

  public setLikeStatus(likeStatus: LikeStatusType) {
    this.createdAt = new Date();
    this.myStatus = likeStatus;
  }

  public static createInstance(
    userId: string,
    userLogin: string,
    locationName: LikeLocationsType,
    locationId: string,
    myStatus: LikeStatusType,
  ) {
    return new LikeEntity(
      IdGenerator.generate(),
      userId,
      userLogin,
      locationId,
      locationName,
      myStatus,
      false,
      new Date(),
    );
  }
}
