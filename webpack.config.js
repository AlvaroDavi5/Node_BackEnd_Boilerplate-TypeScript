/* eslint-disable import/unambiguous, import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */
const webpack = require('webpack');
const { join } = require('path');
const nodeExternals = require('webpack-node-externals');
/* eslint-enable import/unambiguous, import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */


module.exports = {
	entry: ['webpack/hot/poll?1000', './build/main.js'],
	watch: false,
	target: 'node',
	externals: [
		nodeExternals({
			allowlist: ['webpack/hot/poll?1000'],
		}),
	],
	module: {
		rules: [
			{
				test: /\.ts?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
		],
	},
	mode: 'development',
	resolve: {
		extensions: ['.ts', '.js'],
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin(),
	],
	output: {
		libraryTarget: 'commonjs',
		path: join(__dirname, 'build'),
		filename: 'webpack.js',
	},
};
