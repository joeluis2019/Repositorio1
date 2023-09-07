require('./server')
const registry = 'http://localhost:' + process.env.PORT
const bluebird = require('bluebird')
const exec = bluebird.promisify(require('child_process').exec)
const expect = require('chai').expect
const config = require('../lib/config')
const tmp = require('tmp')
const fs = require('fs-extra')
const path = require('path')
const storageBackends = require('./_storage_backends')

process.env.NPM_CONFIG_PACKAGE_LOCK = 'false'
process.env.NPM_CONFIG_REGISTRY = registry

let dir
tmp.setGracefulCleanup()

storageBackends.forEach(storage => {
  describe(storage, () => {
    before(() => {
      let Storage = require('../lib/storage/' + storage)
      config.storage = new Storage()
    })
    beforeEach(() => {
      dir = process.env.NPM_CONFIG_CACHE = tmp.dirSync().name
      process.chdir(dir)
    })
    afterEach(() => {
      fs.removeSync(dir)
      process.chdir(path.join(__dirname, '..'))
    })
    describe('install', function () {
      it('installs heroku-git', async function () {
        await exec('npm install array-union')
        expect(fs.existsSync(path.join(dir, 'node_modules', 'array-union', 'package.json'))).to.equal(true)
        expect(fs.existsSync(path.join(dir, 'node_modules', 'array-uniq', 'package.json'))).to.equal(true)
      })
    })
  })
})
