'use strict';

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const NODE_ENV = process.env.NODE_ENV || 'development';

const babelLoader = {
  loader: 'babel-loader',
  options: {
    presets: ['@babel/env', '@babel/preset-react', '@babel/typescript']
  }
};

const plugins = [
  new webpack.HotModuleReplacementPlugin(),
  new HtmlWebpackPlugin({
    title: 'react',
    template: './src/index.html'
  })
];

let publicPath = '/';

if (NODE_ENV !== 'development') {
  publicPath = './';
  plugins.push(
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    })
  );
}

module.exports = {
  mode: NODE_ENV,
  entry: './src/index.tsx',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, './dist'),
    publicPath: publicPath
  },
  plugins: plugins,

  // Enable sourcemaps for debugging webpack's output.
  devtool: NODE_ENV == 'development' ? 'source-map' : undefined,

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },

  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: [
          babelLoader
        ]
      },
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      // {
      //   enforce: "pre",
      //   test: /\.js$/,
      //   loader: "source-map-loader"
      // },

      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
            // options: {
            //   modules: true
            // }
          }
        ]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf|svg|png|jpg|gif)$/,
        use: [
          'file-loader'
        ]
      }
    ]
  },

  // When importing a module whose path matches one of the following, just
  // assume a corresponding global variable exists and use that instead.
  // This is important because it allows us to avoid bundling all of our
  // dependencies, which allows browsers to cache those libraries between builds.
  // externals: {
  //   react: "React",
  //   "react-dom": "ReactDOM"
  // }
};
