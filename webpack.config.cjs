/* eslint-disable global-require */
/* eslint-disable import/no-extraneous-dependencies */

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/run.js',
  output: {
    path: path.resolve(__dirname, 'public'),
  },
  devServer: {
    open: true,
    host: 'localhost',
  },
  mode: process.env.NODE_ENV || 'development',
  module: {
    rules: [
      { test: /\.css$/, use: ['style-loader', 'css-loader', 'postcss-loader'] },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader', 'postcss-loader'],
      },
      {
        test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: 'url-loader?limit=10000',
      },
      {
        test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/,
        use: 'file-loader',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html',
    }),
  ],
};
