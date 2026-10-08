import { Router } from "express";

import { TestRouter } from "./test.routes";
import { Sap } from "./sap.routes";
import { Users } from "./Users.routes";
import { ListaMateriales } from "./ListaMateriales.routes";
import { SfaRouter } from "./sfa.routes";
import { ConfiguracionRouter } from "./Configuracion.routes";

export const apiRouter = Router();

apiRouter.use("/test", TestRouter);
apiRouter.use("/sap", Sap);
apiRouter.use("/users", Users);
apiRouter.use("/lista-materiales", ListaMateriales);
apiRouter.use("/configuracion", ConfiguracionRouter);

apiRouter.use("/sfa", SfaRouter);
