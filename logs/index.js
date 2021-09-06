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
    const { defaultMeta, printAll, isDebug } = options
    // NOTE: red flag: myFormat, 「你」是誰？ this is a BAD naming。無論如何想一個具有描述性的命名
    const myFormat = printf(info => {
      // NOTE: red flag: again, DONT modify given argument to avoid potential bugs
      info = Object.keys(info).sort().reduce((result, key) => {
        result[key] = info[key]
        return result
      }, {})
      const { trace_id, span_id, level, timestamp, caller, message, ...others } = info
      // NOTE: Object.assign(), the order maybe still rely on the underlying implementation? the order is not deterministic!!!
      const matched = Object.assign(
        { trace_id, span_id, level, timestamp, caller, message },
        printAll ? others : {}
      )
      return JSON.stringify(matched)
    })
    // NOTE: 我試著用更簡潔的方式來重寫 myFormat。
    // 目標是抽出 pre defined fields 然後 JSON formatting
    // 又考慮 pretty printing 的需求應該只有 debug mode 會需要，故我覺得用 isDebug option 的語意比 printAll 好，
    // 若非 debug mode，他只是一個 jsonFormatter。
    // const jsonFormatter = printf(info => {
    //   if (isDebug) {
    //     return JSON.stringify(info,
    //       ['trace_id', 'span_id', 'level', 'timestamp', 'caller', 'message'])
    //       .concat(Object.keys(info))
    //   }
    //   return JSON.stringify(info)
    // })

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
          // NOTE: 這個限制太「軟」了，應允許退化到 winston 原始的用法，把 user 的內容一樣印出來，但你可以多印些東西到 stderr 之類的作為提醒
          // 或是有一個很「硬」的限制，出現此情況直接 throw error，讓 app crash 掉，避免上了 production 還期待有 log 被印出
          // 且你最後其實也放一個 else，那為何一開始還需要檢查是否為 string？若只關心 isJSON() 那就除此之外退化到 winston default usage
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
    Object.keys(defaultMeta).forEach(key => {
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
