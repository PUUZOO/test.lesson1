// Webpack v4
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = (env, argv) => {
  return {
    entry: {
      index: "./dev/index.jsx",
    },
    output: {
      path: path.resolve(__dirname, "prod/"),
      filename: argv.mode === "development" ? "[name].js" : "[name][hash].js",
    },
    module: {
      rules: [
        {
          test: /\.(css|scss)$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            {
              loader: "css-loader",
              options: {
                sourceMap: true,
              },
            },
            {
              loader: "postcss-loader",
              options: {
                sourceMap: true,
              },
            },
            {
              loader: "sass-loader",
              options: {
                sourceMap: true,
              },
            },
          ],
        },
        {
          test: /\.jsx$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env", "@babel/preset-react"],
            },
          },
        },
        {
          test: /\.(woff|woff2|eot|ttf)$/,
          loader: "file-loader",
          options: {
            emitFile: true,
            name: "[ext]/[name].[ext]",
            outputPath: "/fonts/",
          },
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg)$/,
          loader: "file-loader",
          options: {
            emitFile: true,
            name: "[ext]/[name].[ext]",
            outputPath: "/img/",
          },
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: "index.html",
        template: "./dev/index.html",
        showErrors: true,
        inject: true,
      }),
      new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // both options are optional
        filename:
          argv.mode === "development" ? "[name].css" : "[name][hash].css",
      }),
    ],
  };
};
