export enum LikeStatus {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

export enum LikeLocation {
  Comment = 'Comment',
  Post = 'Post',
}

export type LikeStatusType = keyof typeof LikeStatus;
export type LikeLocationsType = keyof typeof LikeLocation;

export class LikeDetailsType {
  constructor(public addedAt: string, public userId: string, public login: string) {}
}

export class LikesInfo {
  constructor(
    public likesCount: number = 0,
    public dislikesCount: number = 0,
    public myStatus: LikeStatusType = LikeStatus.None,
  ) {}
}

export class ExtendedLikesInfo extends LikesInfo {
  constructor(
    likesCount = 0,
    dislikesCount = 0,
    myStatus: LikeStatusType = LikeStatus.None,
    public newestLikes: LikeDetailsType[] = [],
  ) {
    super(likesCount, dislikesCount, myStatus);
  }
}
