import type { ErrorRequestHandler } from "express";

import { env } from "../config/env";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode ?? 500;

  res.status(statusCode).json({
    message: error.message ?? "Error interno del servidor",
    ...(env.nodeEnv === "development" ? { stack: error.stack } : {}),
  });
};
