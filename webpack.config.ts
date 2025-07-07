/* eslint-disable import/no-extraneous-dependencies */
import { join } from 'path';
import webpack from 'webpack';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const nodeExternals = require('webpack-node-externals');

const config: webpack.Configuration = {
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

export default config;
