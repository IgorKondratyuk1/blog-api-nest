import {WithId} from "mongodb";
import {HydratedDocument} from "mongoose";

export type UserActionsType = {
    ip: string
    resource: string
    lastActiveDate: Date
}

export type UserActionsDbType = WithId<{
    id: string
    ip: string
    resource: string
    lastActiveDate: Date
}>

export type HydrateUserAction = HydratedDocument<UserActionsDbType>