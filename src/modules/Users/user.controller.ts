import type { Request, Response } from "express";
import { UserBusiness } from "./user.business";

export class UserController {
    constructor(private userBusiness: UserBusiness = new UserBusiness()) {}
    
    getUsers = async (req: Request, res: Response) => {
        try {
            const users = await this.userBusiness.getUsers();
            console.info("✅ Usuarios obtenidos exitosamente");
            res.status(200).json({
                message: "getUsers",
                data: users,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Error desconocido";

            console.error("❌ ERROR: obteniendo usuarios \n", error);
            res.status(500).json({
                message: "❌ Error al obtener los usuarios",
                error: message,
            });
        }
    };

    unlockUser = async (req: Request, res: Response) => {
        try {
            const { UserCode } = req.body;
            if (!UserCode) {
                res.status(400).json({
                    message: "❌ El campo UserCode es requerido",
                });
                return;
            }
            const result = await this.userBusiness.unlockUser(UserCode.toString());
            console.info("✅ Usuario desbloqueado exitosamente");
            res.status(200).json({
                message: "unlockUser",
                data: result,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Error desconocido";
            
            console.error("❌ ERROR: desbloqueando usuario \n", error);
            res.status(500).json({
                message: "❌ Error al desbloquear el usuario",
                error: message,
            });
        }
    };

    lockUser = async (req: Request, res: Response) => {
        try {
            const { UserCode } = req.body;
            if (!UserCode) {
                res.status(400).json({
                    message: "❌ El campo UserCode es requerido",
                });
                return;
            }
            const result = await this.userBusiness.lockUser(UserCode.toString());
            console.info("✅ Usuario bloqueado exitosamente");
            res.status(200).json({
                message: "lockUser",
                data: result,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Error desconocido";
            
            console.error("❌ ERROR: bloqueando usuario \n", error);
            res.status(500).json({
                message: "❌ Error al bloquear el usuario",
                error: message,
            });
        }
    };
}