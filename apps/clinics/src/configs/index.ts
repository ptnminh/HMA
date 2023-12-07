export const config = () => ({
  app: {
    host: process.env.CLINIC_SERVICE_HOST,
    port: parseInt(process.env.CLINIC_SERVICE_PORT),
  },
  database: {},
});
