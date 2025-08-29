const PROXY_CONFIG = [{
  context: ['/cfe/mesadeturno' + '/**'],
  target: 'http://127.0.0.1:8080',
  secure: false,
  logLevel: 'debug',
  changeOrigin: true,
},
{
  context: ['/cfe/expedientefiscalelectronico' + '/**'],
  target: 'http://127.0.0.1:8089',
  secure: false,
  logLevel: 'debug',
  changeOrigin: true,
}
];

module.exports = PROXY_CONFIG;
