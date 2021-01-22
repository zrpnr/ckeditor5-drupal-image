const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
	mode: 'development',
	optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        test: /\.js(\?.*)?$/i,
        extractComments: false
      }),
    ],
    moduleIds: 'named',
  },
	entry: {
		path: path.resolve(__dirname, 'src/drupalimage.js')
	},
	output: {
		path: path.resolve(__dirname, './build'),
		filename: 'drupalimage.js',
		library: ['CKEditor5', 'drupalImage'],
		libraryTarget: 'umd',
		libraryExport: 'default'
	},
	plugins: [
		new webpack.DllReferencePlugin({
			manifest: require('../ckeditor5/build/ckeditor5-dll.manifest.json'),
			name: 'CKEditor5.dll',
		})
	]
};