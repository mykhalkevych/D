const path = require('path');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

function resolve(dir) {
	return path.resolve(__dirname, dir)
}

const PATHS = {
	src: resolve('src'),
	dist: resolve('dist')
}

const baseWebpack = {
	entry: {
		main: './src/js/index.js'
	},
	output: {
		path: PATHS.dist,
		filename: './js/[name].js'
	},
	module: {
		rules: [
			{
				test: /\.(scss|sass|css)$/,
				use: [
					'style-loader',
					'css-loader',
					'sass-loader'
				]
			},
			{
				test: /\.(gif|svg|png|jpe?g)$/i,
				use: [
					'file-loader?[name].[ext]&outputPath=images/',
					'image-webpack-loader'
				]
			},
			{
				test: /\.json$/,
				loader: 'json-loader'
			}
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: './src/index.html'
		}),
		new CopyWebpackPlugin([
			{
				from: path.resolve(__dirname, 'src/js/*.json'),
				to: path.resolve(__dirname, 'dist/js/'),
			}])
	]
};

const devWebpack = {
	devServer: {
		contentBase: path.join(__dirname, 'dist'),
		compress: false,
		stats: 'errors-only',
		port: 9000,
		open: true
	},
};

const prodWebpack = {
	module: {
		rules: [
			{
				test: /\.(scss|sass|css)$/,
				use: ExtractTextPlugin.extract({
					publicPath: "../",
					fallback: 'style-loader',
					use: ['css-loader', 'sass-loader'],
				})
			}
		]
	},
	plugins: [
		new ExtractTextPlugin(
			{
				filename: './css/style.css',
				disable: false,
				allChunks: true
			}),
		new UglifyJSPlugin({
			sourceMap: true
		})
	]
};


module.exports = function (env) {
	if (env === 'production') {
		return merge([
			baseWebpack,
			prodWebpack
		]);
	}
	if (env === 'development') {
		return merge([
			baseWebpack,
			devWebpack
		])
	}
};