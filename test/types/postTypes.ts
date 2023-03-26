import {WithId} from "mongodb";
import {HydratedDocument} from "mongoose";

export type PostType = {
    id: string
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: string
    extendedLikesInfo: {
        likesCount: number
        dislikesCount: number
    }
    createdAt: Date
    updatedAt: Date
}
export type PostDbType = WithId<{
    id: string
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: string
    extendedLikesInfo: {
        likesCount: number
        dislikesCount: number
    }
    createdAt: Date
    updatedAt: Date
}>

export type PostDbMethodsType = {
    updatePost(postBlogId: string, postContent: string, postTitle: string, postShortDescription: string): Promise<void>
    setLikesCount(likesCount: number): Promise<void>,
    setDislikesCount(dislikesCount: number): Promise<void>
}

export type HydratedPost = HydratedDocument<PostDbType, PostDbMethodsType>