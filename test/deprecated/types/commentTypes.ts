import {WithId} from "mongodb";
import {HydratedDocument} from "mongoose";

export type CommentType = {
    id: string
    content: string
    userId: string
    userLogin: string
    createdAt: Date
    updatedAt: Date
    likesInfo: {
        likesCount: number
        dislikesCount: number
    }
}
export type CommentDbType = WithId<{
    id: string
    content: string
    userId: string
    userLogin: string
    createdAt: Date
    updatedAt: Date
    postId: string
    likesInfo: {
        likesCount: number
        dislikesCount: number
    }
}>

export type CommentDbMethodsType = {
    setLikesCount(likesCount: number): Promise<void>,
    setDislikesCount(dislikesCount: number): Promise<void>
}

export type HydratedComment = HydratedDocument<CommentDbType, CommentDbMethodsType>