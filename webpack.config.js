/* eslint-disable import/unambiguous, import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */
const { join } = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
/* eslint-enable import/unambiguous, import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */


module.exports = {
	mode: 'production',
	watch: false,
	target: 'node',
	entry: ['webpack/hot/poll?1000', './build/main.js'],
	resolve: {
		extensions: ['.ts', '.js'],
	},
	module: {
		rules: [
			{
				test: /\.ts?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
		],
	},
	output: {
		libraryTarget: 'commonjs',
		path: join(__dirname, 'build'),
		filename: 'webpack.js',
	},
	externals: [
		nodeExternals({
			allowlist: ['webpack/hot/poll?1000'],
		}),
	],
	plugins: [
		new webpack.HotModuleReplacementPlugin(),
	],
};
