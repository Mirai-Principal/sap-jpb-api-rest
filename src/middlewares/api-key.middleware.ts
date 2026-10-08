import type { RequestHandler } from "express";

// API Key temporal del prototipo (configurable también por variable de entorno)
const DEFAULT_API_KEY = "1999295F480CE1A208EC264A0C9CA82D6D1899485664EAA479360D6F2566A2D1";

// Rutas públicas que no requieren autenticación por API Key
const PUBLIC_PATHS = ["/", "/openapi.json", "/metrics"];

export const apiKeyMiddleware: RequestHandler = (req, res, next) => {
  // Permitir acceso a la documentación y endpoints públicos
  if (PUBLIC_PATHS.includes(req.path) || req.path.startsWith("/docs")) {
    return next();
  }

  const apiKey = req.header("x-api-key");
  const expectedApiKey = process.env.API_KEY ?? DEFAULT_API_KEY;

  if (!apiKey) {
    res.status(401).json({
      message: "❌ Acceso no autorizado: el header 'x-api-key' es requerido",
    });
    return;
  }

  if (apiKey.trim() !== expectedApiKey.trim()) {
    res.status(401).json({
      message: "❌ Acceso denegado: API Key inválida",
    });
    return;
  }

  console.info(`🔑 API Key validada correctamente para [${req.method}] ${req.originalUrl}`);
  next();
};
