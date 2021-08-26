import Transport from 'winston-transport'
import prometheus from 'prom-client'

const logsTotalCounter = new prometheus.Counter({
  name: 'winston_logs_total',
  help: 'Total number of winston logs.',
  labelNames: ['level']
})

class PrometheusTransport extends Transport {
  // constructor () {
  //   super()
  // }

  log (info, callback) {
    setImmediate(() => {
      this.emit('logged', info)
      logsTotalCounter.inc({ level: info.level })
    })
    callback()
  }
}

export default PrometheusTransport
