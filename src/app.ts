import cors from "cors";
import express from "express";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";

import { openApiDocument } from "./docs/openapi";
import { errorHandler } from "./middlewares/error-handler";
import { notFoundHandler } from "./middlewares/not-found-handler";
import { apiRouter } from "./routes";

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Documentacion Swagger
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
  app.get("/openapi.json", (_req, res) => {
    res.status(200).json(openApiDocument);
  });

  // Endpoint raiz
  app.get("/", (_req, res) => {
    res.status(200).json({
      status: "API REST funcionando correctamente",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  // Rutas de la API
  app.use("/api/v1", apiRouter);

  // Manejadores de errores
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
