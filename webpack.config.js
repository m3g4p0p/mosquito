import HtmlWebpackPlugin from 'html-webpack-plugin'

export default {
  entry: './src/index.js',
  mode: 'development',
  plugins: [new HtmlWebpackPlugin({
    template: 'src/index.html'
  })],
  module: {
    rules: [
      {
        test: /\.(csv|png)$/,
        type: 'asset/resource'
      }
    ]
  },
  devServer: {
    host: '0.0.0.0',
    port: 5500
  }
}
