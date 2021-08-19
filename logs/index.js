import winston from 'winston'
import { PrometheusTransport } from './prometheusTransport.js'

const { combine, timestamp, json } = winston.format

const jsonLogger = winston.createLogger({
  format: combine(timestamp(), json()),
  defaultMeta: { exportToPrometheus: true },
  transports: [
    // new winston.transports.File({ filename: 'logs/info.log' }),
    // new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // new winston.transports.File({ filename: 'logs/warn.log', level: 'warn' }),
    new PrometheusTransport()
  ]
})

if (process.env.NODE_ENV !== 'production') {
  jsonLogger.add(new winston.transports.Console())
}

export { jsonLogger }
