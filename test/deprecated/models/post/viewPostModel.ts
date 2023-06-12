import {ViewExtendedLikesInfoModel} from "../like/viewExtendedLikesInfoModel";

export type ViewPostModel = {
    id:	string
    title: string
    shortDescription: string
    content: string
    blogId:	string
    extendedLikesInfo: ViewExtendedLikesInfoModel
    blogName: string
    createdAt: string
}