export type AppEnv = {
  port: number;
  clientOrigin: string;
  oracleEnabled: boolean;
  oracleUser: string;
  oraclePassword: string;
  oracleConnectString: string;
  oraclePoolMin: number;
  oraclePoolMax: number;
  oraclePoolIncrement: number;
};

const parseNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseBoolean = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) {
    return fallback;
  }

  return value.toLowerCase() === "true";
};

export const loadAppEnv = (): AppEnv => ({
  port: parseNumber(process.env.PORT, 4000),
  clientOrigin: process.env.CLIENT_ORIGIN?.trim() || "http://localhost:3000",
  oracleEnabled: parseBoolean(process.env.ORACLE_ENABLED, false),
  oracleUser: process.env.ORACLE_USER?.trim() || "",
  oraclePassword: process.env.ORACLE_PASSWORD?.trim() || "",
  oracleConnectString: process.env.ORACLE_CONNECT_STRING?.trim() || "",
  oraclePoolMin: parseNumber(process.env.ORACLE_POOL_MIN, 1),
  oraclePoolMax: parseNumber(process.env.ORACLE_POOL_MAX, 10),
  oraclePoolIncrement: parseNumber(process.env.ORACLE_POOL_INCREMENT, 1)
});
