export const config = () => ({
  app: {
    host: process.env.SCHEDULE_SERVICE_HOST,
    port: parseInt(process.env.SCHEDULE_SERVICE_PORT),
  },
  database: {},
});
