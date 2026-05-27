import { Router } from "express";

import { testRouter } from "./test.routes";
import { sap } from "./sap.routers";

export const apiRouter = Router();

apiRouter.use("/test", testRouter);
// apiRouter.use("/auth", sapRouter);
apiRouter.use("/sap", sap);
