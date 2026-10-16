export interface UserResponse {
    internalKey: number;
    userCode: string;
    status: "unlocked" | "locked";
}

export interface UserSAP {
    USERID: number;
    USER_CODE: string;
    U_NAME?: string;
    Locked: "Y" | "N";
}