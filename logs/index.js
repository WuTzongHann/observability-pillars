import winston from 'winston'
import path from 'path'
import PrometheusTransport from './prometheusTransport.js'
import { isJSON } from '../utility.js'

const { combine, timestamp, json } = winston.format

const defaultOptions = {
  defaultMeta: {},
  mySortedKeys: ['trace_id', 'span_id', 'level', 'timestamp', 'caller', 'message'],
  ignoreRemainingKeys: false
}

class Logger {
  constructor (userOptions = {}) {
    const options = { ...defaultOptions, ...userOptions }

    const mySort = winston.format((info) => {
      const { mySortedKeys: sortedKeys, ignoreRemainingKeys } = options
      const remainingKeys = Object.keys(info).sort()
      const keys = []

      for (let i = 0; i < sortedKeys.length; i++) {
        if (sortedKeys[i] in info) {
          keys.push(sortedKeys[i])
          remainingKeys.splice(remainingKeys.indexOf(sortedKeys[i]), 1)
        }
      }
      keys.push(...remainingKeys)

      for (let i = 0, length = keys.length; i < length; i++) {
        const value = info[keys[i]]
        delete info[keys[i]]
        info[keys[i]] = value
      }

      if (ignoreRemainingKeys) {
        for (let i = 0; i < remainingKeys.length; i++) {
          delete info[remainingKeys[i]]
        }
      }

      return info
    })

    this.logger = winston.createLogger({
      level: 'info',
      format: combine(timestamp(), mySort(), json()),
      defaultMeta: options.defaultMeta,
      transports: [
        new winston.transports.Console(),
        new PrometheusTransport()
      ]
    })

    // ref: https://gist.github.com/ludwig/b47b5de4a4c53235825af3b4cef4869a
    // this allows winston to handle output from express' morgan middleware
    this.stream = {
      write: (message) => {
        if (typeof message !== 'string') console.log(new Error('message is only accepted in a string format'))
        if (isJSON(message)) {
          const obj = JSON.parse(message)
          const objMessage = (obj.message === undefined) ? '' : obj.message
          delete obj.message
          this.logger.info.apply(this.logger, formatLogArguments([objMessage, obj]))
        } else {
          this.logger.info.apply(this.logger, formatLogArguments([message]))
        }
      }
    }
  }

  // A custom logger interface that wraps winston, making it easy to instrument code and still possible to replace winston in the future.
  log () { this.logger.debug.apply(this.logger, formatLogArguments(arguments)) }
  debug () { this.logger.debug.apply(this.logger, formatLogArguments(arguments)) }
  info () { this.logger.info.apply(this.logger, formatLogArguments(arguments)) }
  warn () { this.logger.warn.apply(this.logger, formatLogArguments(arguments)) }
  error () { this.logger.error.apply(this.logger, formatLogArguments(arguments)) }

  child (meta = {}) { return new Logger({ defaultMeta: meta }) }
}

/**
 * Attempts to add file and line number info to the given log arguments.
 */
function formatLogArguments (args) {
  if (args.length === 0) args = ['']
  args = Array.prototype.slice.call(args)

  const stackInfo = getStackInfo(1)

  if (stackInfo) {
    // get file path relative to project root
    const callerStr = '(' + stackInfo.relativePath + ':' + stackInfo.line + ')'

    switch (typeof args[1]) {
      case 'function':
        args.splice(1, 0, { caller: callerStr })
        break
      case 'object':
        args[1].caller = callerStr
        break
      case 'undefined':
        if (typeof args[0] === 'string') args[1] = { caller: callerStr }
        else if (typeof args[0] === 'object') args[0].caller = callerStr
        break
    }
  }

  return args
}

/**
 * Parses and returns info about the call stack at the given index.
 */
function getStackInfo (stackIndex) {
  // get call stack, and analyze it
  // get all file, method, and line numbers
  const stacklist = (new Error()).stack.split('\n').slice(3)

  // stack trace format:
  // http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
  // do not remove the regex expresses to outside of this method (due to a BUG in node.js)
  const stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/gi
  const stackReg2 = /at\s+()(.*):(\d*):(\d*)/gi

  const s = stacklist[stackIndex] || stacklist[0]
  const sp = stackReg.exec(s) || stackReg2.exec(s)

  if (sp && sp.length === 5) {
    return {
      method: sp[1],
      relativePath: path.relative(path.resolve(), sp[2].split('//').pop()),
      line: sp[3],
      pos: sp[4],
      file: path.basename(sp[2]),
      stack: stacklist.join('\n')
    }
  }
}

export default Logger
