const debug = process.env.NODE_ENV !== 'production';
const withPlugins = require('next-compose-plugins');
const assetPrefix = debug ? '' : '/mentorship/';

module.exports = withPlugins([], {
  assetPrefix,
  publicRuntimeConfig: {
    assetPrefix
  }
});

