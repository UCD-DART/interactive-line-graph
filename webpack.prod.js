const path = require("path");
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  entry: {
    zika: "./src/js/zika.js",
    invasive: "./src/js/invasive.js"
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js"
  },
  module: {
    rules: [
      {
        test: /\.(s*)css$/,
        // use: ["style-loader", "css-loader", "sass-loader"]
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: ["css-loader", "sass-loader"]
        })
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
  plugins: [new UglifyJSPlugin(), new ExtractTextPlugin("styles.css")]
};
