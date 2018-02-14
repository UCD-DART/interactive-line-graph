const path = require("path");
// const UglifyJSPlugin = require("uglifyjs-webpack-plugin");

module.exports = {
  entry: "./src/js/zika.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.(s*)css$/,
        use: ["style-loader", "css-loader", "sass-loader"]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ["file-loader"]
      },
      {
        test: /\.js$/,
        use: ["babel-loader"]
      }
    ]
  },
  devServer: {
    contentBase: "./dist"
  }
  //   plugins: [new UglifyJSPlugin()]
};
