import winston from 'winston'
import { PrometheusTransport } from './prometheusTransport.js'
import path from 'path'

const { combine, timestamp, printf } = winston.format
const PROJECT_ROOT = path.join('file:/', path.resolve())

const myFormat = printf(info => {
  return `{"level":"${info.level}","timestamp":"${info.timestamp}","caller":"${info.caller}","message":${JSON.stringify(info.message)}}`
})

const jsonLogger = winston.createLogger({
  level: 'info',
  format: combine(timestamp(), myFormat),
  transports: [
    new winston.transports.File({ filename: 'logs/info.log' }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/warn.log', level: 'warn' }),
    new PrometheusTransport()
  ]
})

if (process.env.NODE_ENV !== 'production') {
  jsonLogger.add(new winston.transports.Console())
}

// ref: https://gist.github.com/ludwig/b47b5de4a4c53235825af3b4cef4869a
// this allows winston to handle output from express' morgan middleware
jsonLogger.stream = {
  write: function (message) {
    jsonLogger.info(message)
  }
}

// A custom logger interface that wraps winston, making it easy to instrument
// code and still possible to replace winston in the future.

const debug = function () {
  jsonLogger.debug.apply(jsonLogger, formatLogArguments(arguments))
}

/* const log = function () {
  jsonLogger.log.apply(jsonLogger, formatLogArguments(arguments))
} */

const info = function () {
  jsonLogger.info.apply(jsonLogger, formatLogArguments(arguments))
}

const warn = function () {
  jsonLogger.warn.apply(jsonLogger, formatLogArguments(arguments))
}

const error = function () {
  jsonLogger.error.apply(jsonLogger, formatLogArguments(arguments))
}

const stream = jsonLogger.stream

/**
 * Attempts to add file and line number info to the given log arguments.
 */
function formatLogArguments (args) {
  args = Array.prototype.slice.call(args)

  const stackInfo = getStackInfo(1)

  if (stackInfo) {
    // get file path relative to project root
    const calleeStr = '(' + stackInfo.relativePath + ':' + stackInfo.line + ')'

    /* if (typeof (args[0]) === 'string') {
      args[0] = calleeStr + ' ' + args[0]
    } else {
      args.unshift(calleeStr)
    } */
    if (typeof (args[1]) === 'object') {
      args[1].caller = calleeStr
    } else {
      args[1] = { caller: calleeStr }
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

export default { debug, /* log, */ info, warn, error, stream }
