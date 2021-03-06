import prometheus from 'prom-client'
import Transport from 'winston-transport'

const logsTotalCounter = new prometheus.Counter({
  name: 'winston_logs_total',
  help: 'Total number of winston logs.',
  labelNames: ['level']
})

class PrometheusTransport extends Transport {
  log (info, callback) {
    logsTotalCounter.inc({ level: info.level })
    callback()
  }
}

export default PrometheusTransport
