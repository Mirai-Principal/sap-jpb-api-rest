import serviceFacade from "../../services/service.facade";


export class UserBusiness {
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

    async unlockUser(userCode: string) {
        // 1. Buscamos el usuario por su UserCode para obtener su InternalKey
        const searchResult = (await serviceFacade.serviceLayer.request(
            `Users?$filter=UserCode eq '${userCode}'&$select=InternalKey,Locked`,
        )) as { value?: Array<{ InternalKey: number, Locked: string }> };

        const user = searchResult?.value?.[0];
        if (!user) {
            throw new Error(`Usuario "${userCode}" no fue encontrado en SAP`);
        }
        //compronbar si esta desbloqueado
        if (user.Locked === "tNO") {
            throw new Error(`Usuario "${userCode}" ya se encuentra desbloqueado`);
        }
        // 2. Con el InternalKey numérico, ejecutamos el PATCH en SAP
        const endpoint = `Users(${user.InternalKey})`;
        const sapResult = await serviceFacade.serviceLayer.request(
            endpoint,
            "PATCH",
            { Locked: "tNO" }
        );

        return {
            internalKey: user.InternalKey,
            userCode,
            status: "unlocked",
            sapResult,
        };
    }

    async lockUser(userCode: string) {
        // 1. Buscamos el usuario por su UserCode para obtener su InternalKey
        const searchResult = (await serviceFacade.serviceLayer.request(
            `Users?$filter=UserCode eq '${userCode}'&$select=InternalKey,Locked`
        )) as { value?: Array<{ InternalKey: number, Locked: string }> };

        const user = searchResult?.value?.[0];
        if (!user) {
            throw new Error(`Usuario "${userCode}" no fue encontrado en SAP`);
        }
        //compronbar si esta bloqueado
        if (user.Locked === "tYES") {
            throw new Error(`Usuario "${userCode}" ya se encuentra bloqueado`);
        }

        // 2. Con el InternalKey numérico, ejecutamos el PATCH en SAP
        const endpoint = `Users(${user.InternalKey})`;
        const sapResult = await serviceFacade.serviceLayer.request(
            endpoint,
            "PATCH",
            { Locked: "tYES" }
        );

        return {
            internalKey: user.InternalKey,
            userCode,
            status: "locked",
            sapResult,
        };
    }


}