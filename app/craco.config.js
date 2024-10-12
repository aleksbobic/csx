const webpack = require('webpack');

require('dotenv').config({
    path:
        process.env.NODE_ENV === 'production'
            ? '.env.production'
            : '.env.development'
});

module.exports = {
    webpack: {
        plugins: {
            add: [
                new webpack.DefinePlugin({
                    'process.env': JSON.stringify(process.env)
                })
            ]
        }
    }
};
