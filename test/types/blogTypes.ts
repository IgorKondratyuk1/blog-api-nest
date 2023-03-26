import {WithId} from "mongodb";
import {HydratedDocument} from "mongoose";

export type BlogType = {
    id: string
    name: string
    websiteUrl: string
    createdAt: Date
    updatedAt: Date
    description: string
}
export type BlogDbType = WithId<{
    id: string
    name: string
    websiteUrl: string
    createdAt: Date
    updatedAt: Date
    description: string
}>

export type BlogBbMethodsType = {
    updateBlog(name: string, websiteUrl: string): Promise<void>
}

export type HydratedBlog = HydratedDocument<BlogDbType, BlogBbMethodsType>