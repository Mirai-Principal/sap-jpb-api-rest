import { Router } from "express";

import { userRouter } from "./user.routes";
import { sapRouter } from "./sap.routers";

export const apiRouter = Router();

apiRouter.use("/users", userRouter);
apiRouter.use("/auth", sapRouter);
