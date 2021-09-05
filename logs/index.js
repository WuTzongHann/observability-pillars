import winston from 'winston'
import path from 'path'
import PrometheusTransport from './prometheusTransport.js'
import { isJSON } from '../utility/index.js'

const { combine, timestamp, printf } = winston.format

const defaultOptions = {
  defaultMeta: {},
  printAll: true
}

class Logger {
  constructor (userOptions = {}) {
    const options = { ...defaultOptions, ...userOptions }
    const { defaultMeta, printAll } = options
    const myFormat = printf(info => {
      info = Object.keys(info).sort().reduce((result, key) => {
        result[key] = info[key]
        return result
      }, {})
      const { trace_id, span_id, level, timestamp, caller, message, ...others } = info
      const matched = Object.assign(
        { trace_id, span_id, level, timestamp, caller, message },
        printAll ? others : {}
      )
      return JSON.stringify(matched)
    })

    this.logger = winston.createLogger({
      level: 'info',
      format: combine(timestamp(), myFormat),
      defaultMeta: defaultMeta,
      transports: [
        new winston.transports.Console(),
        new PrometheusTransport()
      ]
    })

    // this allows logger to handle output from express' morgan middleware
    this.stream = {
      write: (message) => {
        if (typeof message !== 'string') {
          this.logger.error.apply(this.logger, formatLogArguments(['message is only accepted in a string format']))
        } else if (isJSON(message)) {
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

  child (defaultMeta = {}) {
    const childLogger = new Logger({ defaultMeta })
    const keys = Object.keys(defaultMeta)
    keys.forEach((key) => {
      childLogger[key] = defaultMeta[key]
    })
    return childLogger
  }
}

/**
 * Attempts to add file and line number info to the given log arguments.
 */
const formatLogArguments = (args) => {
  if (args.length === 0) args = ['']
  else args = Array.prototype.slice.call(Array.from(args))

  const { relativePath, line, origin } = getStackFrame(1)
  const callerStr = (relativePath !== '' & line !== '') ? `(${relativePath}:${line})` : origin

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

  return args
}

/**
 * Parses and returns info about the call stack at the given index.
 */
const getStackFrame = (frameIndex) => {
  // get call stack, and analyze it
  // get all file, method, and line numbers
  const stackFrames = (new Error()).stack.split('\n').slice(3)

  // stack frame format: https://v8.dev/docs/stack-trace-api
  // do not remove the regex expresses to outside of this method (due to a BUG in node.js)
  const frameRegWithMethodName = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/gi
  const frameRegWithNoMethodName = /at\s+()(.*):(\d*):(\d*)/gi

  const targetFrame = stackFrames[frameIndex] || stackFrames[0]
  const result = frameRegWithMethodName.exec(targetFrame) || frameRegWithNoMethodName.exec(targetFrame)
  if (result && result.length === 5) {
    return {
      method: result[1],
      relativePath: path.relative(path.resolve(), result[2].split('//').pop()),
      line: result[3],
      pos: result[4],
      file: path.basename(result[2]),
      origin: targetFrame
    }
  } else {
    return {
      method: '',
      relativePath: '',
      line: '',
      pos: '',
      file: '',
      origin: targetFrame
    }
  }
}

export default Logger
