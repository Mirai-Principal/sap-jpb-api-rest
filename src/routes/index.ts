import { Router } from "express";

import { userRouter } from "./user.routes";
import { sap } from "./sap.routers";

export const apiRouter = Router();

apiRouter.use("/users", userRouter);
// apiRouter.use("/auth", sapRouter);
apiRouter.use("/sap", sap);
