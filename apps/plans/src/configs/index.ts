export const config = () => ({
  app: {
    host: process.env.PLAN_SERVICE_HOST,
    port: parseInt(process.env.PLAN_SERVICE_PORT),
  },
  database: {},
});
