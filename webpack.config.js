const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');


module.exports = {
	entry: ['webpack/hot/poll?1000', './build/src/main.js'],
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
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
		],
	},
	mode: 'development',
	resolve: {
		extensions: ['.tsx', '.ts', '.js', '.jsx'],
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin(),
	],
	output: {
		libraryTarget: 'commonjs',
		path: path.join(__dirname, 'build'),
		filename: 'webpack.js',
	},
};
