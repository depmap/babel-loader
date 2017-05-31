const fs = require('fs')
const path = require('path')
const babel = require('babel-core')
const match = require('multimatch')

const IMPORT_RE = /(\bimport\s+?(?:.+\s+?from\s+?)?)(['"])([^'"]+)(\2)/g
const REQUIRE_RE = /(\brequire\s*?\(\s*?)(['"])([^'"]+)(\2\s*?\))/g

module.exports = {
  meta: {
    ext: '.js',
    outExt: '.js',
    outDir: 'js'
  },
  parse: (file, meta) => {
    const deps = []
		// TODO
    // find deps via import/require
    // https://gist.github.com/pilwon/ff55634a29bb4456e0dd
    let relativeDir = file.split('/').slice(0, -1).join('/')
    fs.readFileSync(file).toString().split('\n').forEach(line => {
      let match
      if (line.startsWith('import')) {
        match = IMPORT_RE.exec(line)
        if (match.length > 3) {
          let dep = match[3]
          if (dep.indexOf(meta.ext) === -1)
            dep = dep + meta.ext

          deps.push(path.join(relativeDir, dep))
        }
      } else {
        match = REQUIRE_RE.exec(line)
        if (match && match.length > 3) {
          let dep = match[3]
          if (dep.indexOf(meta.ext) === -1)
            dep = dep + meta.ext

          deps.push(path.join(relativeDir, dep))
        }
      }
    })

    return deps
  },
  compile: {
    string: (str, opts) => {
      return new Promise((resolve, reject) => {
        resolve(babel.transform(str, opts).code)
      })
    },
    file: (path, opts) => {
      let js = babel.transformFileSync(path, opts).code
      return js
    }
  }
}
