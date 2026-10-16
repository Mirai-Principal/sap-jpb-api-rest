import ServiceFacade from "../../services/service.facade";
import { UserSAP } from "./user.schema";

export class UserRepository {
    async getUserByCode(userCode: string): Promise<UserSAP | null> {
        const sql = `
            SELECT "USERID", "USER_CODE", "U_NAME", "Locked"
            FROM "OUSR"
            WHERE UPPER("USER_CODE") = UPPER(?)
        `;
        const result = await ServiceFacade.hanaDb.query<UserSAP>(sql, [userCode]);
        return result[0] ?? null;
    }

    async updateLockStatus(userId: number, locked: "Y" | "N"): Promise<void> {
        const sql = `
            UPDATE "OUSR"
            SET "Locked" = ?
            WHERE "USERID" = ?
        `;
        await ServiceFacade.hanaDb.execute(sql, [locked, userId]);
    }
}

