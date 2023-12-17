export const config = () => ({
  app: {
    host: process.env.PAYMENT_SERVICE_HOST,
    port: parseInt(process.env.PAYMENT_SERVICE_PORT),
  },
  database: {},
});
