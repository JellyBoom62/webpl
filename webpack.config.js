const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetWebpackPlugin = require('optimize-css-assets-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

const optimization = () => {
	const config = {
		splitChunks: {
			chunks: 'all'
		}
	}

	if (isProd) {
		config.minimizer = [
			new OptimizeCssAssetWebpackPlugin(),
			new TerserWebpackPlugin()
		]
	}

	return config
}

const filename = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`

const cssLoaders = extra => {
	const loaders = [
		{
			loader: MiniCssExtractPlugin.loader,
			options: {
				hmr: isDev,
				reloadAll: true
			},
		},
		'css-loader'
	]

	if (extra) {
		loaders.push(extra)
	}

	return loaders
}

const babelOptions = preset => {
	const opts = {
		presets: [
			'@babel/preset-env'
		],
		plugins: [
			'@babel/plugin-proposal-class-properties'
		]
	}

	if (preset) {
		opts.presets.push(preset)
	}

	return opts
}


const jsLoaders = () => {
	const loaders = [{
		loader: 'babel-loader',
		options: babelOptions()
	}]

	if (isDev) {
		loaders.push('eslint-loader')
	}

	return loaders
}

const plugins = () => {
	const base = [
		new HTMLWebpackPlugin({
			template: './index.html',
			minify: {
				collapseWhitespace: isProd
			}
		}),
		new CleanWebpackPlugin(),
		// new CopyWebpackPlugin({
		// 	patterns: [
		// 		{
		// 			from: path.resolve(__dirname, 'src/favicon.ico'),
		// 			to: path.resolve(__dirname, 'dist')
		// 		}
		// 	],
		// }),
		new MiniCssExtractPlugin({
			filename: '[name][contenthash].css'
		}),
	]

	// if (isProd) {
	// 	base.push(new BundleAnalyzerPlugin())
	// }

	return base
}

module.exports = {
	context: path.resolve(__dirname, 'src'),
	mode: 'development',
	entry: {
		main: ['@babel/polyfill', './js/index.jsx'],
		// simple: ['./js/script.js']s
	},
	output: {
		filename: filename('js'),
		path: path.resolve(__dirname, 'dist')
	},
	resolve: {
		extensions: ['.js', '.json'],
		alias: {
			'@js': path.resolve(__dirname, 'src/js'),
			'@fonts': path.resolve(__dirname, 'src/fonts'),
			'@img': path.resolve(__dirname, 'src/img'),
			'@svg': path.resolve(__dirname, 'src/svg'),
			'@scss': path.resolve(__dirname, 'src/scss'),
			'@': path.resolve(__dirname, 'src'),
		}
	},
	optimization: optimization(),
	devServer: {
		port: 4200,
	},
	devtool: isDev ? 'source-map' : '',
	plugins: plugins(),
	module: {
		rules: [
			{
				test: /\.css$/,
				use: cssLoaders()
			},
			{
				test: /\.less$/,
				use: cssLoaders('less-loader')
			},
			{
				test: /\.s[ac]ss$/,
				use: cssLoaders('sass-loader')
			},
			{
				test: /\.svg$/,
				use: [{
					loader: 'file-loader',
					options: {
						outputPath: 'svg',
					},

				}]
			},
			{
				test: /\.ico$/,
				use: [{
					loader: 'file-loader',
					options: {
						name: '[path][name].ico',
					}
				}]
			},
			{
				test: /\.(png|jpe?g|gif)$/,
				use: [{
					loader: 'file-loader',
					options: {
						outputPath: 'img',
					}
				},
				{
					loader: ImageMinimizerPlugin.loader,
					options: {
						deleteOriginalAssets: true,
						filename: '[path][name][ext]',
						minimizerOptions: {
							plugins: [
								['mozjpeg', { quality: 65 }],
								['pngquant', { quality: [0.5, 0.7] }],
							]
						}
					}
				},
				{
					loader: ImageMinimizerPlugin.loader,
					options: {
						severityError: 'warning',
						deleteOriginalAssets: false,
						filename: '[path][name].webp',
						minimizerOptions: {
							plugins: ['imagemin-webp']
						}
					}
				}
				]
			},
			{
				test: /\.(ttf|woff|woff2|eot)$/,
				use: [{
					loader: 'file-loader',
					options: {
						outputPath: 'fonts'
					}
				}]
			},
			{
				test: /\.xml$/,
				use: ['xml-loader']
			},
			{
				test: /\.csv$/,
				use: ['csv-loader']
			},
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: jsLoaders()
			},
			{
				test: /\.ts$/,
				exclude: /node_modules/,
				loader: {
					loader: 'babel-loader',
					options: babelOptions('@babel/preset-typescript')
				}
			},
			{
				test: /\.jsx$/,
				exclude: /node_modules/,
				loader: {
					loader: 'babel-loader',
					options: babelOptions('@babel/preset-react')
				}
			}
		]
	}
}