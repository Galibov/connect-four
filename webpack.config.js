var path = require('path');
var pkg = require('./package.json')


module.exports = {
    context: path.join(__dirname, 'app'),
    entry: './assets/js/app.js',
    target: 'web',
    output: {
        path: path.resolve(pkg.config.buildDir),
        publicPath: "/",
        filename: "bundle.js"
    },
    node: {
        fs: 'empty'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: ['@babel/plugin-transform-runtime']
                    }
                }

            },
            {
                test: /\.html$/,
                exclude: /node_modules/,
                use: {
                    loader: "file-loader?name=[path][name].[ext]"
                }

            }
        ]
    }
};