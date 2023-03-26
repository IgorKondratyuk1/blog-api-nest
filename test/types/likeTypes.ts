import {WithId} from "mongodb";
import {HydratedDocument} from "mongoose";

export enum LikeStatus {
    None = "None",
    Like = "Like",
    Dislike = "Dislike"
}

export enum LikeLocation {
    Comment = "Comment",
    Post = "Post"
}

export type LikeStatusType = keyof typeof LikeStatus;
export type LikeLocationsType = keyof typeof LikeLocation;

export type LikeType = {
    userId: string
    userLogin: string
    locationId: string
    locationName: LikeLocationsType
    myStatus: LikeStatusType
    createdAt: Date
    updatedAt: Date
}
export type LikeDbType = WithId<{
    id: string
    userId: string
    userLogin: string
    locationId: string
    locationName: LikeLocationsType
    myStatus: LikeStatusType
    createdAt: Date
    updatedAt: Date
}>;

export type LikeDbMethodsType = {
    setStatus(status: string): Promise<void>
};

export type HydratedLike = HydratedDocument<LikeDbType, LikeDbMethodsType>