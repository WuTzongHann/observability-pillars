// const xRequestId = 'x-request-id'
const xB3TraceId = 'x-b3-traceid'
const xB3SpanId = 'x-b3-spanid'
// const xB3ParentId = 'x-b3-parentspanid'

const tracingMiddleware = (logger) => (req, res, next) => {
  const traceid = req.headers[xB3TraceId]
  const spanid = req.headers[xB3SpanId]
  const childLogger = logger.child({
    trace_id: traceid,
    span_id: spanid
  })
  res.locals.logger = childLogger
  next()
}

export default tracingMiddleware
