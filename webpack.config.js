const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: {
    popup: path.resolve(__dirname, 'src/popup.js'),
    content: [
      '@babel/polyfill',
      path.resolve(__dirname, 'src/content.js'),
      path.resolve(__dirname, 'src/content.css'),
    ],
  },

  mode: 'development',

  output: {
    publicPath: '',
    path: path.resolve(__dirname, 'build'),
    filename: '[name].js',
  },

  plugins: [
    new CopyWebpackPlugin([{
      from: './assets/',
      to: './',
    }, {
      from: './src/manifest.json',
      to: './manifest.json',
    }]),
  ],

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.css$/,
        use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
      },
    ],
  },
}
