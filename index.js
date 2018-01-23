
var path = require('path')
var Filter = require('broccoli-persistent-filter')
var cs1 = require('coffee-script')
var cs2 = require('coffeescript')
var stringify = require('json-stable-stringify')

module.exports = CoffeeScriptFilter
CoffeeScriptFilter.prototype = Object.create(Filter.prototype)
CoffeeScriptFilter.prototype.constructor = CoffeeScriptFilter
function CoffeeScriptFilter (inputTree, options) {
  if (!options || typeof options !== 'object') {
    options = { persist: true };
  } else if (typeof options.persist === 'undefined') {
    options.persist = true;
  }

  if (!(this instanceof CoffeeScriptFilter)) return new CoffeeScriptFilter(inputTree, options)
  Filter.call(this, inputTree, options)
  options = options || {}
  this.bare = options.bare;
  this.options = options;
}

CoffeeScriptFilter.prototype.extensions = ['coffee', 'coffee2', 'litcoffee', 'coffee.md']
CoffeeScriptFilter.prototype.targetExtension = 'js'
CoffeeScriptFilter.prototype.baseDir = function() {
  return __dirname;
};

CoffeeScriptFilter.prototype.optionsHash = function() {
  if (!this._optionsHash) {
    this._optionsHash = stringify(this.options);
  }

  return this._optionsHash;
};

CoffeeScriptFilter.prototype.cacheKeyProcessString = function(string, relativePath) {
  return this.optionsHash() + Filter.prototype.cacheKeyProcessString.call(this, string, relativePath);
};

CoffeeScriptFilter.prototype.processString = function (string, srcFile) {
  var ext = path.extname(srcFile)
  var cs = cs1
  if (ext === '.coffee2') {
    cs = cs2
  }

  var opts = {
    bare: this.bare,
    literate: cs.helpers.isLiterate(srcFile)
  }

  try {
    return cs.compile(string, opts)
  } catch (err) {
    // CoffeeScript reports line and column as zero-indexed
    // first_line/first_column properties; pass them on
    err.line = err.location && ((err.location.first_line || 0) + 1)
    err.column = err.location && ((err.location.first_column || 0) + 1)
    err.filename = srcFile
    throw err
  }
}
