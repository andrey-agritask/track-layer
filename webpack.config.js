const webpack = require('webpack');

module.exports = {
  mode: 'development',

  entry: {
    app: './app.js'
  },

  plugins: [
    // Read google maps token from environment variable
    new webpack.EnvironmentPlugin(['GoogleMapsAPIKey'])
  ]
};