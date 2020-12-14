module.exports = {
    devServer: {
    //   publicPath: process.env.NODE_ENV === 'production'
    // ? '/ManageRR/'
    // : '/',
      port: process.env.PORT_VUE,
      https: true
    },
    lintOnSave: 'warning'
  }