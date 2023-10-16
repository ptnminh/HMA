export const config = () => ({
  app: {
    host: process.env.AUTH_SERVICE_HOST,
    port: parseInt(process.env.AUTH_SERVICE_PORT),
  },
  database: {},
});
