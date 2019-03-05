module.exports = {
  entryPoints: {
    "ecos-form-custom": "./export/src/forms/index.js",
    "glyphicon-to-fa": "./export/src/glyphicon-to-fa/index.js",

    // Examples
    // "header": "./export/src/examples/header/index.js",
    // "right-menu": "./export/src/examples/right-menu/index.js",
    // "simple": "./export/src/examples/simple/index.js"
  },
  // Exclude external libraries from bundle. See https://webpack.js.org/configuration/externals/
  externals: {
    react : {
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'react',
    },
    'react-dom' : {
      commonjs: 'react-dom',
      commonjs2: 'react-dom',
      amd: 'react-dom',
    },
    redux : {
      commonjs: 'redux',
      commonjs2: 'redux',
      amd: 'redux',
    },
    'react-redux' : {
      commonjs: 'react-redux',
      commonjs2: 'react-redux',
      amd: 'react-redux',
    },
    'react-custom-scrollbars' : {
      commonjs: 'react-custom-scrollbars',
      commonjs2: 'react-custom-scrollbars',
      amd: 'react-custom-scrollbars',
    }
  }
};
