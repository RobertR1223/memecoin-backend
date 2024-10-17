import { Binds, configure, createPool } from "snowflake-sdk";
import { databaseDetails } from "../config/db.config";

export interface SnowflakeQueryInterface {
  readonly query: string;
  readonly binds?: Binds;
}
export interface SnowflakeResultInterface<T> {
  readonly results: T[];
}

// // Initialize the Snowflake connection configuration
// const connectionConfig = {
//   authenticator: "SNOWFLAKE",
//   account: process.env.SNOWFLAKE_ACCOUNT as string,
//   password: process.env.SNOWFLAKE_PASSWORD as string,
//   username: process.env.SNOWFLAKE_USERNAME as string,
//   role: process.env.SNOWFLAKE_ROLE as string,
//   warehouse: process.env.SNOWFLAKE_WAREHOUSE as string,
//   database: databaseDetails.DATABASE_NAME,
//   schema: process.env.SNOWFLAKE_SCHEMA as string,
//   accessUrl: process.env.SNOWFLAKE_ACCESS_URL as string,
//   clientSessionKeepAlive: true,
// };

// Singleton connection manager
class SnowflakeConnectionManager {
  private connectionPool: ReturnType<typeof createPool>;

  constructor() {
    configure({
      insecureConnect: true,
      ocspFailOpen: true,
    });
    this.connectionPool = createPool(
      {
        authenticator: "SNOWFLAKE",
        account: "bta69289.us-east-1",
        password: "Astra123#",
        username: "ASTRA_DI_USER",
        role: "ASTRADAO",
        warehouse: "TM_DI_WH",
        database: databaseDetails.DATABASE_NAME,
        schema: "BLOCKCHAIN",
        accessUrl: "https://bta69289.us-east-1.snowflakecomputing.com",
        clientSessionKeepAlive: true,
      },
      {
        max: 10,
        min: 0,
      }
    );
  }

  public query = async <T = any>(
    query: string,
    binds: any[]
  ): Promise<T[][]> => {
    const res = await this.executeQuery<T>({
      query,
      binds,
    });
    return [res.results];
  };

  public executeQuery = async <T>(
    req: SnowflakeQueryInterface
  ): Promise<SnowflakeResultInterface<T>> =>
    new Promise(async (resolve, reject) => {
      try {
        await this.connectionPool.use(async (connection: any) =>
          connection.execute({
            sqlText: req.query,
            binds: req.binds ? req.binds : [],
            complete: (completeErr: any, _stat: any, rows: T[]) => {
              if (completeErr) {
                console.error(completeErr);
                reject(completeErr);
              }
              resolve({ results: rows });
            },
          })
        );
      } catch (err) {
        reject(err);
      }
    });
}

export default SnowflakeConnectionManager;
