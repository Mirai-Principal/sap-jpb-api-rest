import { Router } from "express";

import { UserController } from "../modules/Users/user.controller";

export const Users = Router();
const usersController = new UserController();

Users.get("/", usersController.getUsers);
Users.patch("/unlock", usersController.unlockUser);
Users.patch("/lock", usersController.lockUser);
