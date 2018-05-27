const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: /node_modules/,
				loader: 'ts-loader'
			}
		]
    },

    resolve: {
      extensions: ['.ts', '.js'],
      modules: [
        path.resolve(__dirname, 'src'),
        'node_modules'
      ]
    },
    
	plugins: [
        new CopyWebpackPlugin([
            {
                from: 'static',
                to: '.'
            }
        ])
	],
    
	entry: './src/index.ts',

	output: {
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, 'dist')
    },
    
	devServer: {
		contentBase: path.resolve(__dirname, 'dist')
    },

	mode: 'development'
};
