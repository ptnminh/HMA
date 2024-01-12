export const config = () => ({
  app: {
    host: process.env.STAFF_SERVICE_HOST,
    port: parseInt(process.env.STAFF_SERVICE_PORT),
  },
  database: {},
});
