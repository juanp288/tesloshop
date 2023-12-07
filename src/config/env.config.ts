export const EnvConfiguration = () => ({
  envPort: process.env.ENV_PORT || 3000,

  dbName: process.env.DB_NAME || 'dev',
  dbHost: process.env.DB_HOST,
  dbPort: process.env.DB_PORT || 5432,
  dbUsername: process.env.DB_USERNAME,
  dbPassword: process.env.DB_PASSWORD,
});
