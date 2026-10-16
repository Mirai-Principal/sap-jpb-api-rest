import { Router } from "express";

import { TestRouter } from "./test.routes";
import { Sap } from "./sap.routes";
import { Users } from "./Users.routes";
import { ListaMateriales } from "./ListaMateriales.routes";
import { SfaRouter } from "./sfa.routes";
import { ConfiguracionRouter } from "./Configuracion.routes";
import { ItemsRouter } from "./items.routes";

export const apiRouter = Router();

apiRouter.use("/test", TestRouter);
apiRouter.use("/sap", Sap);
apiRouter.use("/users", Users);
apiRouter.use("/lista-materiales", ListaMateriales);
apiRouter.use("/configuracion", ConfiguracionRouter);
apiRouter.use("/items", ItemsRouter);

apiRouter.use("/sfa", SfaRouter);
