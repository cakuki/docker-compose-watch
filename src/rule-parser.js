const minimatch = require('minimatch')
const Minimatch = minimatch.Minimatch
const path = require('path')

exports.parse = (composeConfig) => {
  const serviceNames = Object.keys(composeConfig.services)
  const watchConfig = composeConfig['x-watch']

  return Object.entries(watchConfig).map(([name, {
    services = '*',
    watch = 'buildcontext',
    match = '*.*',
    build = true
  }]) => {
    const matchingServiceNames = minimatch.match(serviceNames, services)
    const matchingServices = Object.entries(composeConfig.services).filter(([name]) => matchingServiceNames.includes(name))
    const watchDirs = getWatchDirs(watch, matchingServices)
    const matchers = watchDirs.map(({ service, dir }) => ({
      service,
      pattern: new Minimatch(`${path.resolve('.', dir)}${path.sep}${match}`)
    }))

    return {
      name,
      matchers,
      build
    }
  })
}

function getWatchDirs(type, services) {
  switch (type) {
    case 'buildcontext':
      return services.map(([service, { build = null }]) => {
        switch (typeof build) {
          case 'string':
            return { service, dir: build }
          case 'object':
            return { service, dir: build.context }
          default:
            return null
        }
      }).map(val => val)

    case 'volumes':
      return services.map(([service, { volumes = [] }]) =>
        volumes
          .map(volume => volume.split(':')[0])
          .map(dir => ({ service, dir }))
        ).reduce((rv, array) => rv.concat(array), [])

    default:
      return []
  }
}
