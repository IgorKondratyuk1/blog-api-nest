import {WithId} from "mongodb";
import {HydratedDocument} from "mongoose";

export type DeviceType = {
    ip: string
    title: string
    issuedAt: string
    expiredAt: string
    deviceId: string
    userId: string
    isValid: boolean
}

export type DeviceDbType = WithId<{
    id: string
    ip: string
    title: string
    issuedAt: string
    expiredAt: string
    deviceId: string
    userId: string
    isValid: boolean
}>

export type DeviceDbMethodsType = {
    setIssuedDate(issuedAt: string): Promise<void>
}

export type HydratedDevice = HydratedDocument<DeviceDbType, DeviceDbMethodsType>;