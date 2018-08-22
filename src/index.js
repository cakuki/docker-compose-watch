const debounce = require('lodash.debounce')
const execa = require('execa')
const fs = require('fs')
const path = require('path')

const { parse } = require('./rule-parser')

const debounceFunctions = {
  build: {},
  restart: {}
}

exports.watch = async(config) => {
  const rules = parse(config)
  console.log('Running docker-compose services in background...')
  const { stdout } = await execa('docker-compose', ['up', '-d'])
  console.log(stdout)

  console.log(`Watching for changes...`)

  fs.watch(path.resolve('.'), { recursive: true }, (event, filename) => {
    console.log('EVENT!!!', event, filename)
    if (event != 'change') return
    const filePath = path.resolve('.', filename)

    rules.forEach(({
      matchers,
      build,
      debounce: debounceWait = 3000
    }) => {
      const matchingServices = matchers
        .filter(({ pattern }) => pattern.match(filePath))
        .map(({ service }) => service)
        .filter((s, i, array) => array.indexOf(s) == i)

      if (!matchingServices.length) return

      console.log(`Changes detected in service(s):\n\t- ${matchingServices.join('\n\t- ')}`)

      if (build)
        buildServices(matchingServices, debounceWait)
      else
        restartServices(matchingServices, debounceWait)
    })
  })
}

function buildServices(services, debounceWait) {
  services.forEach(service => {
    let fn = debounceFunctions.build[service]

    if (!fn)
      debounceFunctions.build[service] = fn = debounce(() => {
        debounceFunctions.build[service] = null
        execa('docker-compose', ['up', '-d', '--build', service]).stdout.pipe(process.stdout)
      }, debounceWait)

    fn()
  })
}

function restartServices(services, debounceWait) {
  services.forEach(service => {
    let fn = debounceFunctions.build[service]

    if (!fn)
      debounceFunctions.build[service] = fn = debounce(() => {
        debounceFunctions.build[service] = null
        execa('docker-compose', ['restart', service]).stdout.pipe(process.stdout)
      }, debounceWait)

    fn()
  })
}