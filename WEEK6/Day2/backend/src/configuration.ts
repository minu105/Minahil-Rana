export default () => ({
  PORT: parseInt(process.env.PORT || '4000', 10),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce_loyalty',
  JWT_SECRET: process.env.JWT_SECRET || 'dev_secret',
  SOCKET_CORS_ORIGIN: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:3000',
});
