export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    name: process.env.DB_NAME ?? 'aurelia',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
  },
  security: {
    tokenKey: process.env.API_TOKEN_KEY,
    tokenTtlSeconds: parseInt(process.env.API_TOKEN_TTL_SECONDS ?? '3600', 10),
    sessionTtlSeconds: parseInt(process.env.API_SESSION_TTL_SECONDS ?? '2592000', 10),
  },
  auth: {
    loginPassword: process.env.API_LOGIN_PASSWORD ?? process.env.DEMO_LOGIN_PASSWORD,
  },
});
