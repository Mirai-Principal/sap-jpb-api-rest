import serviceFacade from "../../services/service.facade";
import { UserRepository } from "./user.repository";
import { UserResponse } from "./user.schema";



export class UserBusiness {
    constructor(private userRepository: UserRepository = new UserRepository()) {}

    async getUsers() {
        const currentYear = new Date().getFullYear();
        const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");
        const endpoint = `Users?$select=InternalKey,UserCode,UserName,Locked,LastLogoutDate&$filter=LastLogoutDate ne null and LastLogoutDate ge '${currentYear}-${currentMonth}-01'`;

        const sapResult = await serviceFacade.serviceLayer.request(
            endpoint,
            "GET",
            undefined,
            { "Prefer": "odata.maxpagesize=500" }
        );
        return sapResult;
    }

    async unlockUser(userCode: string): Promise<UserResponse> {
        const user = await this.userRepository.getUserByCode(userCode);
        if (!user) 
            throw new Error(`Usuario "${userCode}" no fue encontrado en SAP`);
        if (user.Locked === "N") 
            throw new Error(`Usuario "${userCode}" ya se encuentra desbloqueado`);

        await this.userRepository.updateLockStatus(user.USERID, "N");

        return {
            internalKey: user.USERID,
            userCode: user.USER_CODE,
            status: "unlocked",
        };
    }

    async lockUser(userCode: string): Promise<UserResponse> {
        if (userCode.toLowerCase() === process.env.SAP_USERNAME?.toLowerCase()) 
            throw new Error(`Accion denegada: No puedes bloquear al usuario de servicio de la API (${userCode})`);

        const user = await this.userRepository.getUserByCode(userCode);
        if (!user) 
            throw new Error(`Usuario "${userCode}" no fue encontrado en SAP`);
        if (user.Locked === "Y") 
            throw new Error(`Usuario "${userCode}" ya se encuentra bloqueado`);

        await this.userRepository.updateLockStatus(user.USERID, "Y");

        return {
            internalKey: user.USERID,
            userCode: user.USER_CODE,
            status: "locked",
        };
    }
}