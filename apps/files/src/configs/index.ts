export const config = () => ({
  app: {
    host: process.env.FILE_SERVICE_HOST,
    port: parseInt(process.env.FILE_SERVICE_PORT),
  },
  database: {},
});
