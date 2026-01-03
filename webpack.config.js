const
    path = require('path'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    CopyPlugin = require("copy-webpack-plugin"),
    { CleanWebpackPlugin } = require('clean-webpack-plugin'),
    OverwolfPlugin = require('./overwolf.webpack');

module.exports = env => ({
    entry: {
        background: './src/background/background.ts',
        desktop: './src/desktop/desktop.ts',
        desktopLogged: './src/desktop/desktopLogged.ts',
        in_game: './src/in_game/in_game.ts',
        comps: './src/in_game/comps/comps.ts',
        compDashboard: './src/in_game/comps/compDashboard.ts',
        debug: './src/debug/debug.ts'
    },
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    output: {
      path: path.resolve(__dirname, 'dist/'),
      filename: 'js/[name].js'
    },
    plugins: [
        new CleanWebpackPlugin,

        //theres no public folder 
        // new CopyPlugin({
        //     patterns: [ { from: "public", to: "./" } ],
        // }),

        new HtmlWebpackPlugin({
            template: './src/background/background.html',
            filename: path.resolve(__dirname, './dist/background.html'),
            chunks: ['background']
        }),

        // desktop
        new HtmlWebpackPlugin({
            template: './src/desktop/desktop.html',
            filename: path.resolve(__dirname, './dist/desktop.html'),
            chunks: ['desktop']
        }),
        new HtmlWebpackPlugin({
            template: './src/desktop/desktop.html',
            filename: path.resolve(__dirname, './dist/desktop.html'),
            chunks: ['desktop']
        }),
        new HtmlWebpackPlugin({
            template: './src/desktop/desktopLogged.html',
            filename: path.resolve(__dirname, './dist/desktopLogged.html'),
            chunks: ['desktopLogged']
        }),

        // in_game
        new HtmlWebpackPlugin({
            template: './src/in_game/in_game.html',
            filename: path.resolve(__dirname, './dist/in_game.html'),
            chunks: ['in_game']
        }),
        new HtmlWebpackPlugin({
            template: './src/in_game/comps/comps.html',
            filename: path.resolve(__dirname, './dist/comps.html'),
            chunks: ['comps']
        }),
        new HtmlWebpackPlugin({
            template: './src/in_game/comps/compDashboard.html',
            filename: path.resolve(__dirname, './dist/compDashboard.html'),
            chunks: ['compDashboard']
        }),
        new HtmlWebpackPlugin({
            template: './src/debug/debug.html',
            filename: path.resolve(__dirname, './dist/debug.html'),
            chunks: ['debug']
        }),
        new OverwolfPlugin(env)
    ]
})
