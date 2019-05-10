const path = require('path');

module.exports = {
    entry: {
        'filestorage': './src/index.js'
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].min.js',
        library: 'filestorage'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            }
        ]
    },
    performance: { hints: false }
};
