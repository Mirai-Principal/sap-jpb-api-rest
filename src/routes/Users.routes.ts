import { Router } from "express";

import { getUsers } from "../modules/Users/user.controller";

export const Users = Router();

Users.get("/", getUsers);
