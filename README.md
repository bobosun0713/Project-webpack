# 專案 (開發說明) - webpack
> 輸出文件 : webpack
> 開發服務器顯示:npx webpack-dev-server

1. css -  CSS or Sass
2. image - 存放照片
3. js - 存放 (入口文件為 : index.js)

tag: 待更新開發環境與生產環境切換。

## 目前packge.json版本，是測試過可以的，開發環境版本，之後持續更新，以下代碼有包含註解。

```
const { resolve } = require('path');
const HtmlWebPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

// 設置環境變量
process.env.NODE_ENV = 'development';

// CSS 兼容性
const commonCssLoader1 = [
  // 取代style-loader， 提取JS中的CSS成單獨文件
  MiniCssExtractPlugin.loader,
  'css-loader',
  // CSS兼容性處理 postcss-loader / postcss-preset-env
  // 'postcss-loader', 不修改配置可這樣簡寫
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
      /*
        js 兼容性處理: babel-loader  @babel/core  @babel/preset-env

        1. 基本兼容性處理 ---> @babel/preset-env 
           缺點 : 只能轉換基本語法

        2. 全部JS兼容性處理 ---> @babel/polyfill ，直接在入口 JS文件中引入
           缺點 : 會引入所有JS兼容性，體積會變大

        3. 只針對需要兼容性的語法 ---> core-js

        4. 第2 跟 第3 只能選其中一個使用

        5. 壓縮只要把 mode 模式改為production，又會自動壓縮
       */
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
        //使用一個loader
        // 下載 1.url-loader  2.file-loader
        loader: 'url-loader',
        options: {
          // 圖片大小 小於8kb，就會被base64處理
          // 優點:減少請求數量(減輕服務氣壓力)
          // 缺點:圖片體積會更大
          limit: 8 * 1024,

          // 問題 : 因為url-loader默認使用ES6模塊解析
          // 而html-loader引入圖片是commonjs
          // 解析問題[object Module]
          // 解決辦法； 關閉url-loader的ES6模塊解析
          esModule: false,

          // 給圖片進行命名
          // [hash:10]取圖片hash的前10位
          // [ext]取原來的擴展名
          name: '[hash:10].[ext]',

          //更改輸出位址
          outputPath: 'image'
        }
      },

      // 處理 html中img資源
      {
        test: /\.html$/,
        loader: 'html-loader',
        //專門處理html文件中的img圖片(負責引入img，從而能被url-loader進行處理)
      },

      // 處理 其他 資源
      {
        exclude: /\.(html|js|css|scss|jpg|png|gif)/,
        // 排除以上文件，其他會原封不動的輸出文件
        loader: 'file-loader',
        options: {
          name: '[hash:10].[ext]',
          //更改輸出位址
          outputPath: 'other'
        }
      }
    ]
  },
  plugins: [
    // 處理html資源
    new HtmlWebPlugin({
      template: './src/index.html',
      // html壓縮
      minify: {
        // 移除空格
        collapseWhitespace: true,
        // 移除註解
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

  // 開發服務器 自動化
  // 特點 :只會在內存編譯打包，不會有任何輸出
  // 目前devServer 版本不支援cli 4 所以要降版本為 : npm i webpack-cli@3 -D
  // 啟動devServer 指令為 : npx webpack-dev-server
  devServer: {
    contentBase: resolve(__dirname, 'build'),
    // 啟動壓縮
    compress: true,
    // 端口號
    port: 3000,
    // 自動打開瀏覽器
    open: true,
    // 開始HRM功能，需重新開啟webpack (針對被更新的文件做處理 ， 提升速度)
    // JS 文件；默認沒有HRM功能 --> 解決辦法在入口JS文件，添加支持HMR功能代碼 ，但如果入口文件有變化，全部文件都會更新。
    // html 當開始HRM，html不會更新，改寫做法在 entry入口 把html也引入進去 (正常時候不用做HRM，因為html只有一個 文件)
    // hot: true
  }
};
```
