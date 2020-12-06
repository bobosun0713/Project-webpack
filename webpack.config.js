const { resolve } = require('path');
const HtmlWebPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');


process.env.NODE_ENV = 'development';


const commonCssLoader1 = [
  MiniCssExtractPlugin.loader,
  'css-loader',
  {
    loader: 'postcss-loader',
    options: {
      ident: 'postcss',
      plugins: () => [
        // postcss 插建
        require('postcss-preset-env')()
      ]
    }
  }
];
const commonCssLoader2 = [
  // 取代style-loader， 提取JS中的CSS成單獨文件
  MiniCssExtractPlugin.loader,
  'css-loader',
  'postcss-loader',
];

module.exports = {
  mode: 'development',
  entry: './src/js/index.js',
  output: {
    filename: 'js/built.js',
    path: resolve(__dirname, 'build'),
  },
  module: {
    rules: [
      // 處理 Css資源
      {
        test: /\.css$/,
        use: [...commonCssLoader2]
      },

      // 處理 Sass資源
      {
        test: /\.(sa|sc)ss$/,
        use: [...commonCssLoader2, 'sass-loader']
      },

      // 處理 JS-ES6 轉 ES5
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          // 預設:指示怎樣做語法轉換
          presets: [
            ['@babel/preset-env',
              {
                // 案需加載
                useBuiltIns: 'usage',
                //指定core-js版本
                corejs: { version: 3 },
                // 指定兼容性做到哪個版本瀏覽器
                targets: { chrome: '60', firefox: '60', ie: '9', safari: '10', edge: '17' }
              }
            ]
          ]
        }
      },

      // 處理 圖片資源
      {
        test: /\.(jpg|png|gif)$/,
        loader: 'url-loader',
        options: {
          limit: 8 * 1024,
          esModule: false,
          name: '[hash:10].[ext]',
          outputPath: 'image'
        }
      },

      // 處理 html中img資源
      {
        test: /\.html$/,
        loader: 'html-loader',
      },

      // 處理 其他 資源
      {
        exclude: /\.(html|js|css|scss|jpg|png|gif)/,
        loader: 'file-loader',
        options: {
          name: '[hash:10].[ext]',
          outputPath: 'other'
        }
      }
    ]
  },
  plugins: [
    // 處理html資源
    new HtmlWebPlugin({
      template: './src/index.html',
      minify: {
        collapseWhitespace: true,
        removeComments: true
      }
    }),

    // 從JS提取CSS
    new MiniCssExtractPlugin({
      filename: 'css/built.css'
    }),

    // 壓縮CSS
    new OptimizeCssAssetsWebpackPlugin(),

    // 打包前先清空目錄
    new CleanWebpackPlugin()
  ],

  devServer: {
    contentBase: resolve(__dirname, 'build'),
    // 啟動壓縮
    compress: true,
    // 端口號
    port: 3000,
    // 自動打開瀏覽器
    open: true,
    // 開始HRM功能
    hot: true
  }
};