import path from 'path';

export default {
  mode: 'development',
  target: 'web',  // Указываем, что сборка ориентирована на браузер

  entry: './src/js/main.js',
  output: {
    filename: 'main.bundle.js',
    path: path.resolve('dist/js'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
    ],
  },
  resolve: {
    fallback: {
      fs: false, // Проблемы с модулями Node.js
    },
  },
  devtool: 'source-map', // Для удобной отладки
};
