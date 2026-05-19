import * as hanaClient from "@sap/hana-client";

import { env } from "../config/env";

interface HanaConnectionOptions {
  serverNode: string;
  uid: string;
  pwd: string;
  databaseName?: string;
  currentSchema?: string;
}

interface HanaConnection {
  connect: (
    options: HanaConnectionOptions,
    callback: (error?: Error) => void,
  ) => void;
  disconnect: (callback?: (error?: Error) => void) => void;
  exec: <T = unknown>(
    sql: string,
    params: unknown[],
    callback: (error?: Error, result?: T) => void,
  ) => void;
  execute: <T = unknown>(
    sql: string,
    params: unknown[],
    callback: (error?: Error, result?: T) => void,
  ) => void;
}

/**
 * Cliente de base de datos HANA
 * @example
 * ```typescript
 * const client = HanaDbConnection.getInstance();
 * const result = await client.query("SELECT * FROM table");
 * ```
 * @property query - Ejecuta consultas SQL que retornan múltiples filas
 * @property execute - Ejecuta consultas SQL que no retornan resultados
 * @property scalar - Ejecuta consultas SQL que retornan un solo valor
 */
class HanaDbConnection {
  private static instance: HanaDbConnection;
  private connection: HanaConnection | null = null;
  private connectionPromise: Promise<HanaConnection> | null = null;

  private constructor() { }

  static getInstance() {
    if (!HanaDbConnection.instance) {
      HanaDbConnection.instance = new HanaDbConnection();
    }

    return HanaDbConnection.instance;
  }

  async connect() {
    if (this.connection) {
      return Promise.resolve(this.connection);
    }

    if (this.connectionPromise) {
      console.info("⌛ Conexion SAP HANA DB en proceso...");
      return this.connectionPromise;
    }

    console.info("⌛ Conectando a SAP HANA DB, esquema:", env.hana.schema);
    const connection = hanaClient.createConnection();

    this.connectionPromise = new Promise<HanaConnection>((resolve, reject) => {
      connection.connect(
        {
          serverNode: `${env.hana.server}:${env.hana.port}`,
          uid: env.hana.username,
          pwd: env.hana.password,
          databaseName: env.hana.databaseName,
          currentSchema: env.hana.schema,
        },
        (error?: Error) => {
          this.connectionPromise = null;

          if (error) {
            this.connection = null;
            console.error("❌ Error conectando a SAP HANA DB:", error.message);
            reject(error);
            return;
          }

          this.connection = connection;
          console.info("✅ Conexion SAP HANA DB establecida");
          resolve(connection);
        },
      );
    });

    return this.connectionPromise;
  }

  async disconnect() {
    if (!this.connection) {
      console.info("❌ No existe conexion SAP HANA DB activa para cerrar");
      return;
    }

    console.info("✅ Desconectando SAP HANA DB...");
    const connection = this.connection;
    this.connection = null;

    await new Promise<void>((resolve, reject) => {
      connection.disconnect((error?: Error) => {
        if (error) {
          console.error("❌ Error desconectando SAP HANA DB:", error.message);
          reject(error);
          return;
        }

        console.info("✅ Conexion SAP HANA DB cerrada");
        resolve();
      });
    });
  }

  async query<T = Record<string, unknown>>(
    sql: string,
    params: unknown[] = [],
  ): Promise<T[]> {
    const connection = await this.connect();

    // console.info("✅ Ejecutando consulta SAP HANA DB:", sql);

    return new Promise<T[]>((resolve, reject) => {
      connection.exec<T[]>(sql, params, (error?: Error, result?: T[]) => {
        if (error) {
          console.error("❌ Error ejecutando consulta SAP HANA DB:", error.message);
          reject(error);
          return;
        }

        resolve(result ?? []);
      });
    });
  }

  async execute(sql: string, params: unknown[] = []): Promise<void> {
    const connection = await this.connect();

    console.info("✅ Ejecutando comando SAP HANA DB:", sql);

    await new Promise<void>((resolve, reject) => {
      connection.execute(sql, params, (error?: Error) => {
        if (error) {
          console.error("❌ Error ejecutando comando SAP HANA DB:", error.message);
          reject(error);
          return;
        }

        resolve();
      });
    });
  }

  async scalar<T = unknown>(
    sql: string,
    params: unknown[] = [],
  ): Promise<T | null> {
    const rows = await this.query<Record<string, T>>(sql, params);
    const firstRow = rows[0];

    if (!firstRow) {
      return null;
    }

    return Object.values(firstRow)[0] ?? null;
  }
}

export const hanaDbConnection = HanaDbConnection.getInstance();
export default hanaDbConnection;
