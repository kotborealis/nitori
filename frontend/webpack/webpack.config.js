const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = (env = {prod: false}) => {
    const ifProd = (plugin, _else = undefined) => env.prod ? plugin : _else;
    const ifDebug = (plugin, _else = undefined) => !env.prod ? plugin : _else;
    const removeEmpty = array => array.filter(p => !!p);

    return {
        entry: {
            app: path.join(__dirname, '../src/index.js'),
            vendor: [
                'react',
                'react-dom',
                'react-router',
            ],
        },

        output: {
            filename: ifProd('[hash].[name].js', '[name].js'),
            path: path.join(__dirname, '../build/'),
            publicPath: '/',
            pathinfo: false
        },

        devtool: ifDebug('cheap-module-eval-source-map'),
        resolve: {
            alias: {
                "components": path.resolve(__dirname, '../src/components'),
            }
        },

        mode: ifProd('production', 'development'),

        optimization: ifDebug({
            minimize: false,
            removeAvailableModules: false,
            removeEmptyChunks: false,
            splitChunks: false,
        }, {
            splitChunks: {
                chunks: "all"
            }
        }),

        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: 'babel-loader',
                            options: {
                                cacheDirectory: true,
                            }
                        }
                    ]
                },
                {
                    test: /\.css/,
                    use: [
                        'style-loader',
                        {
                            loader: 'css-loader',
                            options: {
                                modules: true,
                            },
                        }
                    ],
                },
                {
                    test: /\.(jpe?g|png|gif|svg)$/i,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                hash: 'sha512',
                                digest: 'hex',
                                name: ifProd('[hash].[ext]', '[name].[ext]')
                            }
                        }
                    ]
                },
                {
                    test: /\.(ttf|woff2?|eot)$/i,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                hash: 'sha512',
                                digest: 'hex',
                                name: ifProd('[hash].[ext]', '[name].[ext]')
                            }
                        }
                    ]
                },
                {
                    test: /\.mp3$/i,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                hash: 'sha512',
                                digest: 'hex',
                                name: ifProd('[hash].[ext]', '[name].[ext]')
                            }
                        }
                    ]
                }
            ],
        },

        plugins: removeEmpty([
            ifDebug(new webpack.LoaderOptionsPlugin({
                debug: true
            })),

            ifDebug(new webpack.NamedModulesPlugin()),

            new HtmlWebpackPlugin({
                template: path.join(__dirname, '../src/index.html'),
                filename: 'index.html',
                inject: 'body',
            }),

            ifProd(new UglifyJsPlugin({
                parallel: true,
                cache: true,
                uglifyOptions: {
                    ie8: false,
                    ecma: 8,
                    mangle: true,
                    compress: true,
                    warnings: false
                }
            }))
        ]),

        devServer: {
            host: `0.0.0.0`,
            port: 8080,
            public: `localhost:8080`,
            contentBase: path.join(__dirname, '../build/'),
            disableHostCheck: true,
            historyApiFallback: true,
            inline: true,
            open: true,
            openPage: '',
            overlay: true,
            proxy: {
                '/nitori_api/': 'http://127.0.0.1:3000',
                pathRewrite: {'^/nitori_api' : ''}
            },
        }
    };

};