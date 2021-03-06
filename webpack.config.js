var webpack = require('webpack');
var WebpackMd5Hash = require('webpack-md5-hash'); //解决js与css chunkHash相同的插件
var ExtractTextPlugin = require('extract-text-webpack-plugin');//单独打包css
var HtmlWebpackPlugin = require('html-webpack-plugin'); //自动生成html
var path = require('path');

//简单对象属性继承
var _extends = function(des,source){
    for (var property in source) {
        des[property] = source[property];
    }
    return des;
}

//动态生成HTML
var processHTML = (function(arrayEntry){
    var arrayP = [];
    var obj = arrayEntry;
    for(var key in obj){
        var htmWP =  new HtmlWebpackPlugin({
            filename:path.resolve(__dirname,'dist/'+key+'.html'),//生成html到指定目录
            template:path.resolve(__dirname,'src/'+key+'.html'), //应用对应的模板
            chunks:[key],//允许只添加某些块 (比如，仅仅 [key] 块)
            hash:false, //如果为 true, 将添加一个唯一的 webpack 编译 hash 到所有包含的脚本和 CSS 文件，对于解除 cache 很有用
            inject: 'body', // Inject all scripts into the body
            inject:true,    //允许插件修改哪些内容，包括head与body
            minify:{        //压缩HTML文件
                removeComments:true,        //移除HTML中的注释
                collapseWhitespace:false    //删除空白符与换行符
            }
        });
        arrayP.push(htmWP);
    };
    return arrayP;
});

//var extractCSS = new ExtractTextPlugin('[name].[chunkhash:8].css');   //单独打包css 加入文件指纹
var extractCSS = new ExtractTextPlugin('[name].css');   //单独打包css
var extractLESS = new ExtractTextPlugin('[name].less'); //单独打包less

//需要打包的入口文件
var arrayEntry = {
    //指定打包公业务模块  默认打包index.js中的依赖
    'module/login/index':['./src/module/login'],
    'module/reg/index':['./src/module/reg'],
    'module/home/index':['./src/module/home'],
    'module/aboutUs/index':['./src/module/aboutUs'],
    'module/easyData/index':['./src/module/easyData'],
    'module/easyDesign/index':['./src/module/easyDesign'],
    'module/easyPrice/index':['./src/module/easyPrice'],
    'module/help/index':['./src/module/help']
};
module.exports = {
    devtool:'eval-source-map',
    //入口文件
    entry:_extends({
        //指定打包公共模块
        'common/common':['./src/common/js/cookie.js']
        },arrayEntry),
    //入口文件输出配置
    output:{
        path:'dist/',
        //filename: "[name].[chunkhash:8].js",   //输出文件名 加入文件指纹
        filename: "[name].js",   //输出文件名
        chunkFilename:'[chunkhash:8].[id].js'  //单独打包文件 可用于异步加载
    },
    module: {
        loaders: [
            {
                test: /\.(less|css)$/, //匹配的文件名 单独打包css 需要手动在用link 引入
                loader: ExtractTextPlugin.extract('style', 'css!less') //编译less文件
            },
            //css打包进js,动态放入html<style></style>内
            //{test:/\.css$/,loader: 'style!css'},
            //编译less文件
            //{test:/\.less$/,loader:'style!css!less'},
            //图片文件使用 url-loader 来处理，小于8kb的直接转为base64
            {test: /\.(png|jpg)$/, loader: 'url-loader?limit=30000'},
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                loaders: [
                    //'file?hash=sha512&digest=hex&name=[hash:8].[ext]', //给图片加指纹
                    'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'
                ]
            }
        ]
    },
    plugins:[
        //解决js与css chunkHash相同导致修改CSS后js的chunkHash也会改变的问题
        //new WebpackMd5Hash(),
        //打包css
        extractCSS
        //extractLESS  //打包less
    ].concat(processHTML(arrayEntry)),
    //其它配置
    resolve:{
        //设根路径 查找module的话从这里开始查找(如果设置此项，无法自动编译更新文件)
        // root:'d://testWebpack/src',
        //自动扩展文件后缀名，意味着我们require模块可以省略不写后缀名
        extensions:['','.js','.json','.css'],
        //模块别名定义，方便后续直接引用别名，无须多写长长的地址
        alias:{
            shortName1:'/js/page1/index.js'
        }
    },
    //配置本地服务器
    //devServer:{
    //    contentBase:'/dist',//本地服务器所加载的页面所在的目录
    //    colors:true,//终端中输出结果为彩色
    //    istoryApiFallback: true,//不跳转,
    //    inline: true//实时刷新
    //}

}

