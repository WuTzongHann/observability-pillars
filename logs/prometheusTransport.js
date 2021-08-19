import Transport from 'winston-transport'
import prometheus from 'prom-client'

class PrometheusTransport extends Transport {
  constructor () {
    super()

    this.logsTotalCounter = new prometheus.Counter({
      name: 'winston_logs_total',
      help: 'Total number of winston logs.',
      labelNames: ['level']
    })
  }

  log (info, callback) {
    setImmediate(() => {
      this.emit('logged', info)
      this.logsTotalCounter.inc({ level: info.level })
    })
    callback()
  }
}

export { PrometheusTransport }
