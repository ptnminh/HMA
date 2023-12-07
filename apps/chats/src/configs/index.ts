export const config = () => ({
  app: {
    host: process.env.CHAT_SERVICE_HOST,
    port: parseInt(process.env.CHAT_SERVICE_PORT),
  },
  database: {},
});
