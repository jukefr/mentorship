const debug = process.env.NODE_ENV !== 'production';
const assetPrefix = debug ? '' : '/mentorship/';

module.exports = withPlugins([withCSS, withMDX, withBlog], {
  assetPrefix,
  publicRuntimeConfig: {
    assetPrefix
  }
});

