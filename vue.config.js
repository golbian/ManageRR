module.exports = {
    devServer: {
      publicPath: '/',
      port: process.env.PORT_VUE,
      https: true,
      overlay: {
        // warnings: true,
        // errors: true
      }
    },
  }