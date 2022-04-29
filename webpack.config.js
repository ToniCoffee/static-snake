const htmlWebpackPlugin = require('html-webpack-plugin');

const cssRules = {
	test: /\.css$/i,
	use: ['style-loader', 'css-loader'],
};

module.exports = {
	entry: {
		main: './src/index.js',
	},
	output: {
		filename: 'app.[contenthash].js'
	},
	module: {
		rules: [cssRules]
	},
	plugins: [
		new htmlWebpackPlugin({
			template: 'src/index.html'
		})
	],
	devServer: {
		watchFiles: ['src/**/*.js', 'src/index.html'],
	},
};