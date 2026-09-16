export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "SAP API REST",
    description: "Documentacion interactiva de la API REST con Express y TypeScript.",
    version: "1.0.0",
  },
  servers: [
    {
      url: "http://192.168.57.1:3300",
      description: "Servidor de desarrollo",
    },
  ],
  tags: [
    {
      name: "Estado",
      description: "Endpoints de disponibilidad de la API",
    },
    {
      name: "Usuarios",
      description: "Operaciones para gestion de usuarios",
    },
    {
      name: "SAP",
      description: "Operaciones integradas con SAP (Transferencias)",
    },
    {
      name: "Test",
      description: "Endpoints para pruebas de Service Layer",
    }
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
                    message: {
                      type: "string",
                      example: "getUsers",
                    },
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
    "/api/v1/users/unlock": {
      patch: {
        tags: ["Usuarios"],
        summary: "Desbloquear un usuario de SAP",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  UserCode: {
                    type: "string",
                    example: "manager"
                  }
                },
                required: ["UserCode"]
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Usuario desbloqueado exitosamente",
          },
          "400": {
            description: "Falta el campo UserCode",
          },
          "500": {
            description: "Error al desbloquear el usuario",
          }
        }
      }
    },
    "/api/v1/users/lock": {
      patch: {
        tags: ["Usuarios"],
        summary: "Bloquear un usuario de SAP",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  UserCode: {
                    type: "string",
                    example: "manager"
                  }
                },
                required: ["UserCode"]
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Usuario bloqueado exitosamente",
          },
          "400": {
            description: "Falta el campo UserCode",
          },
          "500": {
            description: "Error al bloquear el usuario",
          }
        }
      }
    },
    "/api/v1/sap/tsFromPesajeToMat": {
      post: {
        tags: ["SAP"],
        summary: "Transferencia de Stock de Pesaje a Mat",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                description: "Payload de la transferencia",
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Transferencia realizada con exito",
          },
          "500": {
            description: "Error al transferir",
          }
        }
      }
    },
    "/api/v1/sap/tsToUbicaciones": {
      post: {
        tags: ["SAP"],
        summary: "Transferencia de Stock entre Ubicaciones",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                description: "Payload de la transferencia a ubicaciones",
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Transferencia realizada con exito",
          },
          "500": {
            description: "Error al transferir",
          }
        }
      }
    },
    "/api/v1/test/{query}": {
      get: {
        tags: ["Test"],
        summary: "Probar consulta al Service Layer de SAP",
        parameters: [
          {
            name: "query",
            in: "path",
            required: true,
            schema: {
              type: "string",
              example: "Items"
            },
            description: "Endpoint a consultar en el Service Layer"
          }
        ],
        responses: {
          "200": {
            description: "Resultado de la consulta",
          },
          "500": {
            description: "Error en la peticion al Service Layer",
          }
        }
      }
    }
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
      },
      ErrorResponse: {
        type: "object",
        properties: {
          message: {
            type: "string",
            example: "Ocurrio un error",
          },
          error: {
            type: "string",
            example: "Detalle del error",
          }
        },
      },
    },
  },
} as const;
