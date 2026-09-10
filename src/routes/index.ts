import { Router } from "express";

import { TestRouter } from "./test.routes";
import { Sap } from "./sap.routes";
import { Users } from "./Users.routes";

export const apiRouter = Router();

apiRouter.use("/test", TestRouter);
apiRouter.use("/sap", Sap);
apiRouter.use("/users", Users);
