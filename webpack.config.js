module.exports = {
  entry: './src/index.ts',
  module: {
    loaders: [
      { loader: 'ts', test: /\.ts$/ }
    ]
  },
  output: {
    filename: 'lib/index.js'
  },
  resolve: {
    extensions: ['', '.js', '.ts'],
    modulesDirectories: ['src', 'node_modules']
  }
}
