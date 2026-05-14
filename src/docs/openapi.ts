export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "SAP API REST",
    description: "Documentacion interactiva de la API REST con Express y TypeScript.",
    version: "1.0.0",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Servidor local",
    },
  ],
  tags: [
    {
      name: "Estado",
      description: "Endpoints de disponibilidad de la API",
    },
    {
      name: "Usuarios",
      description: "Operaciones de ejemplo para usuarios",
    },
  ],
  paths: {
    "/": {
      get: {
        tags: ["Estado"],
        summary: "Estado general de la API",
        responses: {
          "200": {
            description: "La API esta funcionando correctamente",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "API REST funcionando correctamente",
                    },
                    uptime: {
                      type: "number",
                      example: 12.345,
                    },
                    timestamp: {
                      type: "string",
                      format: "date-time",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/users": {
      get: {
        tags: ["Usuarios"],
        summary: "Listar usuarios",
        responses: {
          "200": {
            description: "Listado de usuarios",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/User",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/users/{id}": {
      get: {
        tags: ["Usuarios"],
        summary: "Obtener usuario por ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
              example: "1",
            },
            description: "Identificador del usuario",
          },
        ],
        responses: {
          "200": {
            description: "Usuario encontrado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      $ref: "#/components/schemas/User",
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Usuario no encontrado",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      User: {
        type: "object",
        properties: {
          id: {
            type: "string",
            example: "1",
          },
          name: {
            type: "string",
            example: "Usuario Demo",
          },
          email: {
            type: "string",
            format: "email",
            example: "demo@example.com",
          },
        },
        required: ["id", "name", "email"],
      },
      ErrorResponse: {
        type: "object",
        properties: {
          message: {
            type: "string",
            example: "Usuario no encontrado",
          },
        },
        required: ["message"],
      },
    },
  },
} as const;
