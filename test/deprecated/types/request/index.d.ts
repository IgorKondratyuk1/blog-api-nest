import {GuestUserType, UserAccountType} from "../../domain/User/UserTypes";

declare global {
    declare namespace Express {
        export interface Request {
            //user: UserAccountType
            userId: string
            userLogin: string
            deviceId: string
            issuedAt: string
        }
    }
}