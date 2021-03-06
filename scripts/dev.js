import { emptyDirSync, rootResolvePath, copyFileSync } from './utils.js'

import webpack from 'webpack'
import path from 'path'
import WebpackDevServer from 'webpack-dev-server'
import { getWebpackConfig } from '../webpack.config.js'

const BUILD_MODE = 'development'
const BUILD_TARGET_DES = 'dev'
const resolvePathInDes = (...paths) => path.join(BUILD_TARGET_DES, ...paths)
emptyDirSync(rootResolvePath(BUILD_TARGET_DES))

// ref: https://github.com/webpack/webpack-dev-server/blob/master/examples/api/simple/server.js
// ref: https://webpack.js.org/configuration/dev-server/
const webpackConfig = getWebpackConfig({ mode: BUILD_MODE })
const compiler = webpack(webpackConfig)
// webpack 打包结束之后 copy 必要的静态文件
compiler.hooks.done.tap('MobiusCopyPlugin', () => {
  copyFileSync(
    rootResolvePath('src/statics/images/thoughts-daily.png'),
    rootResolvePath(resolvePathInDes('statics/images/thoughts-daily.png'))
  )
  copyFileSync(
    rootResolvePath('src/statics/images/beian.png'),
    rootResolvePath(resolvePathInDes('statics/images/beian.png'))
  )
})
const devServerOptions = Object.assign({}, {
  headers: { 'Access-Control-Allow-Origin': '*' },
  https: false,
  static: true,
  compress: true,
  host: '127.0.0.1',
  port: 3000,
  open: true, // browser extension development do not need to open the page
  hot: true,
  client: {
    logging: 'warn',
    overlay: {
      errors: true,
      warnings: false
    }
  },
  devMiddleware: {
    writeToDisk: true
  },
  watchFiles: {
    options: {
      aggregateTimeout: 1000
      // ignored: /node_modules/
    }
  },
  historyApiFallback: true
})
console.info('【devServerOptions】' + JSON.stringify(devServerOptions))

// init the devServer
const server = new WebpackDevServer(devServerOptions, compiler)

// launch the devServer
server.startCallback(() => {
  console.info(`Starting server on http://localhost:${devServerOptions.port}`)
})
