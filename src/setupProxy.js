const { createProxyMiddleware } = require('http-proxy-middleware');
const { env } = require('process');
const target = env.REACT_APP_PROXY_URL || 'http://localhost:8000';

module.exports = function(app) {
  app.use(
    '/users',
    createProxyMiddleware({
      target: target,
      changeOrigin: true,
    })
  );

  app.use(
    '/position',
    createProxyMiddleware({
      target: target,
      changeOrigin: true,
    })
  );

  app.use(
    '/usersinbounds',
    createProxyMiddleware({
      target: target,
      changeOrigin: true,
    })
  );

  app.use(
    '/usersinbounds',
    createProxyMiddleware({
      target: target,
      changeOrigin: true,
    })
  );
};