import winston from 'winston'
import PrometheusTransport from './prometheusTransport.js'
import path from 'path'

const { combine, timestamp, printf } = winston.format
const PROJECT_ROOT = path.join('file:/', path.resolve())

const myFormat = printf(info => {
  return `{"level":"${info.level}","timestamp":"${info.timestamp}","caller":"${info.caller}","message":${JSON.stringify(info.message)}}`
})

const defaultOptions = {
  defaultMeta: {}
}

class Logger {
  constructor (userOptions = {}) {
    const options = { ...defaultOptions, ...userOptions }
    this.jsonLogger = winston.createLogger({
      level: 'info',
      format: combine(timestamp(), myFormat),
      defaultMeta: options.defaultMeta,
      transports: [
        new winston.transports.Console(),
        new PrometheusTransport()
      ]
    })

    // ref: https://gist.github.com/ludwig/b47b5de4a4c53235825af3b4cef4869a
    // this allows winston to handle output from express' morgan middleware
    this.jsonLogger.stream = {
      write: function (message) {
        this.jsonLogger.info(message)
      }
    }
    this.stream = this.jsonLogger.stream
  }

  // A custom logger interface that wraps winston, making it easy to instrument
  // code and still possible to replace winston in the future.

  debug () {
    this.jsonLogger.debug.apply(this.jsonLogger, formatLogArguments(arguments))
  }

  info () {
    this.jsonLogger.info.apply(this.jsonLogger, formatLogArguments(arguments))
  }

  warn () {
    this.jsonLogger.warn.apply(this.jsonLogger, formatLogArguments(arguments))
  }

  error () {
    this.jsonLogger.error.apply(this.jsonLogger, formatLogArguments(arguments))
  }

  child (meta = {}) {
    return new Logger({ defaultMeta: meta })
  }
}

/**
 * Attempts to add file and line number info to the given log arguments.
 */
function formatLogArguments (args) {
  args = Array.prototype.slice.call(args)

  const stackInfo = getStackInfo(1)

  if (stackInfo) {
    // get file path relative to project root
    const calleeStr = '(' + stackInfo.relativePath + ':' + stackInfo.line + ')'

    switch (typeof args[1]) {
      case 'function':
        args.splice(1, 0, { caller: calleeStr })
        break
      case 'object':
        args[1].caller = calleeStr
        break
      case 'undefined':
        if (typeof args[0] === 'string') args[1] = { caller: calleeStr }
        else if (typeof args[0] === 'object') args[0].caller = calleeStr
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
  // const stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/gi
  // const stackReg2 = /at\s+()(.*):(\d*):(\d*)/gi
  const stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/gi
  const stackReg2 = /at\s+()(.*):(\d*):(\d*)/gi

  const s = stacklist[stackIndex] || stacklist[0]
  const sp = stackReg.exec(s) || stackReg2.exec(s)

  if (sp && sp.length === 5) {
    return {
      method: sp[1],
      relativePath: path.relative(PROJECT_ROOT, sp[2]),
      line: sp[3],
      pos: sp[4],
      file: path.basename(sp[2]),
      stack: stacklist.join('\n')
    }
  }
}

export default Logger
