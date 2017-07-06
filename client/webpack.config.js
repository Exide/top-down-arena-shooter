const path = require('path');
const clientRoot = path.resolve(__dirname);
const projectRoot = path.resolve(__dirname, '..');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
  template: path.resolve(clientRoot, 'resources', 'index.html'),
  filename: 'index.html',
  inject: 'body'
});

module.exports = {
  entry: path.resolve(clientRoot, 'src', 'index.js'),
  output: {
    filename: 'client.js',
    path: path.resolve(projectRoot, 'dist', 'client')
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ }
    ]
  },
  plugins: [HtmlWebpackPluginConfig],
  devServer: {
    port: 8081
  }
};
