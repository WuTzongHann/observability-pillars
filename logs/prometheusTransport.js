import Transport from 'winston-transport'
import prometheus from 'prom-client'

class PrometheusTransport extends Transport {
  constructor () {
    super()

    this.httpErrorLogsTotalCounter = new prometheus.Counter({
      name: 'http_error_logs_total',
      help: 'Total number of HTTP error logs.',
      labelNames: ['urlPath', 'method', 'statusCode', 'level', 'details']
    })
    this.httpWarnLogsTotalCounter = new prometheus.Counter({
      name: 'http_warn_logs_total',
      help: 'Total number of HTTP warn logs.',
      labelNames: ['urlPath', 'method', 'statusCode', 'level', 'details']
    })
    this.httpInfoLogsTotalCounter = new prometheus.Counter({
      name: 'http_info_logs_total',
      help: 'Total number of HTTP info logs.',
      labelNames: ['urlPath', 'method', 'statusCode', 'level', 'details']
    })
    this.grpcErrorLogsTotalCounter = new prometheus.Counter({
      name: 'grpc_error_logs_total',
      help: 'Total number of gRPC error logs.',
      labelNames: ['service', 'method', 'statusCode', 'level', 'details']
    })
    this.grpcWarnLogsTotalCounter = new prometheus.Counter({
      name: 'grpc_warn_logs_total',
      help: 'Total number of gRPC warn logs.',
      labelNames: ['service', 'method', 'statusCode', 'level', 'details']
    })
    this.grpcInfoLogsTotalCounter = new prometheus.Counter({
      name: 'grpc_info_logs_total',
      help: 'Total number of gRPC info logs.',
      labelNames: ['service', 'method', 'statusCode', 'level', 'details']
    })
  }

  log (info, callback) {
    setImmediate(() => {
      this.emit('logged', info)
      const defaultValues = {
        service: '',
        urlPath: '',
        method: '',
        statusCode: '',
        details: ''
      }
      const values = { ...defaultValues, ...info.message }
      const { service, urlPath, method, statusCode, details } = values
      const level = info.level
      if (Number(statusCode) > 100) {
        switch (level) {
          case 'error':
            this.httpErrorLogsTotalCounter.inc({ urlPath, method, statusCode, level, details })
            break
          case 'warn':
            this.httpWarnLogsTotalCounter.inc({ urlPath, method, statusCode, level, details })
            break
          case 'info':
            this.httpInfoLogsTotalCounter.inc({ urlPath, method, statusCode, level, details })
            break
          default:
            break
        }
      } else {
        switch (level) {
          case 'error':
            this.grpcErrorLogsTotalCounter.inc({ service, method, statusCode, level, details })
            break
          case 'warn':
            this.grpcWarnLogsTotalCounter.inc({ service, method, statusCode, level, details })
            break
          case 'info':
            this.grpcInfoLogsTotalCounter.inc({ service, method, statusCode, level, details })
            break
          default:
            break
        }
      }
    })
    callback()
  }
}

export { PrometheusTransport }
