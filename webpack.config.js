const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

let packageJson = require('./package.json');
module.exports = {
	mode: "development",
	entry: ['./src/extensions.ts', './src/index.ts'],
	output: {
		filename: 'main.[contenthash].js',
		path: path.resolve(__dirname, 'dist'),
		clean: true
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			}, {
				test: /\.s[ac]ss$/i,
				use: [
					"style-loader",
					"css-loader",
					"sass-loader",
				],
			}, {
				test: /\.png$/,
				type: "asset/inline"
			}
		],
	},
	plugins: [
		new webpack.DefinePlugin({
			PACKAGE_VERSION: JSON.stringify(packageJson.version)
		}),
		new HtmlWebpackPlugin({
			template: "src/index.html",
			templateParameters: {

			}
		}),
	],
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
	devServer: {
		host: '127.0.0.1'
	}
};
