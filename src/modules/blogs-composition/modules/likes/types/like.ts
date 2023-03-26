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
