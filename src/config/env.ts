const parsePort = (value: string | undefined, fallback: number) => {
  if (!value) {
    return fallback;
  }

  const port = Number(value);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("PORT debe ser un numero entero positivo");
  }

  return port;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parsePort(process.env.PORT, 3000),
  ignoreSsl: process.env.IGNORE_SSL ? "true" : "false",

  // SAP Service Layer Configuration
  sap: {
    companyDb: process.env.SAP_COMPANY_DB ?? "SBODEMO",
    username: process.env.SAP_USERNAME ?? "manager",
    password: process.env.SAP_PASSWORD ?? "1234",
    sapUrl: process.env.SAP_URL ?? "http://localhost:50000/b1s/v1",
  },

  // SAP HANA DB Configuration
  hana: {
    server: process.env.HANA_SERVER ?? "192.168.1.1",
    port: parsePort(process.env.HANA_PORT, 30015),
    username: process.env.HANA_USER_NAME ?? "your_username",
    password: process.env.HANA_PASSWORD ?? "your_password",
    databaseName: process.env.HANA_DATABASE_NAME ?? "your_database_name",
    schema: process.env.HANA_SCHEMA ?? "your_schema_name",
  },
};
