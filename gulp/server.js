/**
 * @fileOverview server
 * @author XiaoBin Li (lixiaobin@baijiahulian.com)
 */

'use strict';

var path = require('path');
var gulp = require('gulp');
var Hapi = require('hapi');
var Inert = require('inert');
var through = require('through2');
var routes = require('../mock/routes').routes;
var server = new Hapi.Server();
var file = require('./help/file');
var sass = require('gulp-sass');
var portConfig = require('../config/index');

var WebpackDevServer = require("webpack-dev-server");
var ip = require('ip');
var webpack = require('webpack');
var config = require('./config/webpack.dev');

var htmlPath = path.join(config.output.path, '../index.html')

console.log(htmlPath);

var PROJECT_PATH = process.cwd();

var swig = require('swig');
swig.setDefaults({ 
    cache: false,
    varControls: ['${', '}$']
});

server.register(Inert, function () {});

gulp.task('server:start',  function () {
    var PORT = portConfig.devServerPort;
    var mockServerPort = portConfig.mockServerPort;
    for (var item in config.entry) {
        config.entry[item].unshift('webpack-dev-server/client?http://0.0.0.0:' + PORT, 'webpack/hot/dev-server')
    }
    config.plugins.push(new webpack.HotModuleReplacementPlugin());

    var proxy = [
        {
            path: '*.json',
            target: 'http://localhost:' + mockServerPort,
            host: 'localhost'
        },
        // {
        //     path: "*.scss",
        //     target: "http://localhost:" + mockServerPort,
        //     host: "localhost"
        // },
        // {
        //     path: "/",
        //     target: "http://localhost:" + mockServerPort,
        //     host: "localhost"
        // },
        {
            path: "/*.do",
            target: "http://localhost:" + mockServerPort,
            host: "localhost"
        }
    ];

    //启动服务
    var app = new WebpackDevServer(webpack(config), {
        publicPath: config.output.publicPath,
        hot: true,
        quiet: true,
        historyApiFallback: true,
        proxy: proxy
    });

    app.listen(PORT, '0.0.0.0');

    server.connection({
        host: '0.0.0.0',
        port: mockServerPort
    });

    server.path('../');

    /**
     * 处理请求
     * @param {Object} request
     * @param {Object} reply
     */
    function processRequestHandler(request, reply) {
        var param = request.params.param;
        var fileInfo = file.getFileInfo(request.path);
        var fileType = fileInfo.fileType;

        switch(fileType) {
            case 'css':
            case 'scss':
                console.log(fileInfo);
                gulp.src(param)
                    .pipe(sass.sync().on('error', sass.logError))
                    .pipe(through.obj(
                        function (chunk, enc, callback) {
                            reply(chunk.contents.toString()).type('text/css');
                        }
                    ));
                break;
            case 'html':
                console.log(fileInfo);
                var template = swig.compileFile(fileInfo.filePath);
                var output = template({});
                reply(output);
                break;
            default :
                 console.log(fileInfo);
                //console.log(PROJECT_PATH + '/' + param);
                reply.file(PROJECT_PATH + '/' + param);
                break;
        }
    }

    server.route({
        method: 'GET',
        path: '/{param*}',
        handler: processRequestHandler
    });
    server.route({
        method: 'GET',
        path: '/index',
        handler: function(request, reply) {
            console.log(11111);
            const fs = devMiddleWare.fileSystem
            devMiddleWare.waitUntilValid(() => {
                reply(fs.readFileSync(htmlPath));
            })
            //var htmlPath = path.join(config.output.path, '../index.html')
        }
    });
    routes.forEach(function (item) {
        server.route(item);
    });

    server.start(function () {
        console.log(`Server Started at ${server.info.protocol}:\/\/${ip.address()}:${PORT}`);
    });
});

