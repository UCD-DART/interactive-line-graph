const path = require("path");
// const UglifyJSPlugin = require("uglifyjs-webpack-plugin");

module.exports = {
  // entry: "./src/js/invasive.js", //change this to any file I'm currently working on for dev purposes
  entry: {
     zika: "./src/js/zika.js",
    invasive: "./src/js/invasive.js"
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js" //change this to whatever file you're working on for the dev purposes
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
