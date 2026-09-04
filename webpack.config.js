//@ts-check
"use strict";

const path = require("node:path");
const CopyPlugin = require("copy-webpack-plugin");

/** @typedef {import('webpack').Configuration} WebpackConfig */

/**
 * The extension runs in a Node.js context inside VS Code.
 * @see https://code.visualstudio.com/api/working-with-extensions/bundling-extension
 * @type {WebpackConfig}
 */
const extensionConfig = {
  target: "node",
  // Overridden to "production" by `npm run package`.
  mode: "none",
  entry: "./src/extension.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "extension.js",
    libraryTarget: "commonjs2",
    clean: true,
  },
  externals: {
    // Provided by the extension host at runtime; also listed in .vscodeignore.
    vscode: "commonjs vscode",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [{ loader: "ts-loader" }],
      },
    ],
  },
  plugins: [
    // The .sln/.vcxproj templates are data, not code, so they are copied
    // rather than bundled. src/core/templates.ts reads them from dist/assets.
    new CopyPlugin({
      patterns: [{ from: "assets", to: "assets" }],
    }),
  ],
  devtool: "nosources-source-map",
  infrastructureLogging: {
    // Enables the output the $ts-webpack-watch problem matcher parses.
    level: "log",
  },
};

module.exports = [extensionConfig];
