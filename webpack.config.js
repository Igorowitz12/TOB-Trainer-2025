const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");

let isDevBuild = false;
if (!process.env.COMMIT_REF) {
  isDevBuild = true;
  process.env.COMMIT_REF = "local build";
}
if (!process.env.BUILD_DATE) {
  isDevBuild = true;
  process.env.BUILD_DATE = "";
}
if (!process.env.DEPLOY_URL) {
  isDevBuild = true;
  process.env.DEPLOY_URL = "http://localhost:8000/";
}

const config = {
  mode: isDevBuild ? "development" : "production",
  entry: "./src/index.ts",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
    publicPath: '',
  },
  devtool: "source-map",
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    compress: true,
    port: 8000,
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: `index.html`, to: "", context: `src/` },
        { from: `index.html`, to: "colosseum.html", context: `src/` },
        { from: `assets/favicon.ico`, to: "favicon.ico", context: `src/` },
        { from: '*.png', to: "", context: "node_modules/@supalosa/oldschool-trainer-sdk/_bundles/", noErrorOnMissing: true },
        { from: '*.gif', to: "", context: "node_modules/@supalosa/oldschool-trainer-sdk/_bundles/", noErrorOnMissing: true },
        { from: '*.ogg', to: "", context: "node_modules/@supalosa/oldschool-trainer-sdk/_bundles/", noErrorOnMissing: true },
        { from: `assets/fonts/*.woff`, to: "", context: `src/` },
        { from: `assets/fonts/*.woff2`, to: "", context: `src/` },
      ],
    }),
    new webpack.EnvironmentPlugin(["COMMIT_REF", "BUILD_DATE", "DEPLOY_URL"]),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/i,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|ogg|gltf|glb)$/i,
        type: "asset/resource",
      },
      {
        test: /\.html$/i,
        loader: "html-loader",
      },
    ],
  },
};

module.exports = config;
