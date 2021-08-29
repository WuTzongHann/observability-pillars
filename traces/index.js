import Logger from '../logs/index.js'

const defaultOptions = {
  logger: new Logger()
}

const xRequestId = 'x-request-id'
const xB3TraceId = 'x-b3-traceid'
const xB3SpanId = 'x-b3-spanid'
const xB3ParentId = 'x-b3-parentspanid'

const httpMiddleware = (logger = defaultOptions.logger) => async (req, res, next) => {
  const traceid = req.headers[xB3TraceId]
  const spanid = req.headers[xB3SpanId]
  const childLogger = logger.child({
    trace_id: traceid,
    span_id: spanid
  })
  res.locals.logger = childLogger
  await next()
}

const grpcInterceptor = (logger = defaultOptions.logger) => async (ctx, next) => {
  const traceid = ctx.metadata[xB3TraceId]
  const spanid = ctx.metadata[xB3SpanId]
  const childLogger = logger.child({
    trace_id: traceid,
    span_id: spanid
  })
  ctx.locals.logger = childLogger
  await next() // must write await
}

const getExistValueOrEmptyString = (value) => (value === undefined) ? '' : value

const SetOutgoingHeaderWithTraceFromHeader = (httpHeadersInput, httpHeadersOutput) => {
  httpHeadersOutput[xRequestId] = getExistValueOrEmptyString(httpHeadersInput[xRequestId])
  httpHeadersOutput[xB3TraceId] = getExistValueOrEmptyString(httpHeadersInput[xB3TraceId])
  httpHeadersOutput[xB3SpanId] = getExistValueOrEmptyString(httpHeadersInput[xB3SpanId])
  httpHeadersOutput[xB3ParentId] = getExistValueOrEmptyString(httpHeadersInput[xB3ParentId])
}

const NewOutgoingContextWithTraceFromHeader = (httpHeadersInput) => {
  const result = {}
  result[xRequestId] = getExistValueOrEmptyString(httpHeadersInput[xRequestId])
  result[xB3TraceId] = getExistValueOrEmptyString(httpHeadersInput[xB3TraceId])
  result[xB3SpanId] = getExistValueOrEmptyString(httpHeadersInput[xB3SpanId])
  result[xB3ParentId] = getExistValueOrEmptyString(httpHeadersInput[xB3ParentId])
  return result
}

const SetOutgoingHeaderWithTraceFromContext = (grpcMetadataInput, httpHeadersOutput) => {
  httpHeadersOutput[xRequestId] = getExistValueOrEmptyString(grpcMetadataInput[xRequestId])
  httpHeadersOutput[xB3TraceId] = getExistValueOrEmptyString(grpcMetadataInput[xB3TraceId])
  httpHeadersOutput[xB3SpanId] = getExistValueOrEmptyString(grpcMetadataInput[xB3SpanId])
  httpHeadersOutput[xB3ParentId] = getExistValueOrEmptyString(grpcMetadataInput[xB3ParentId])
}

const NewOutgoingContextWithTraceFromContext = (grpcMetadataInput) => {
  const result = {}
  result[xRequestId] = getExistValueOrEmptyString(grpcMetadataInput[xRequestId])
  result[xB3TraceId] = getExistValueOrEmptyString(grpcMetadataInput[xB3TraceId])
  result[xB3SpanId] = getExistValueOrEmptyString(grpcMetadataInput[xB3SpanId])
  result[xB3ParentId] = getExistValueOrEmptyString(grpcMetadataInput[xB3ParentId])
  return result
}

export default {
  httpMiddleware,
  grpcInterceptor,
  SetOutgoingHeaderWithTraceFromHeader,
  NewOutgoingContextWithTraceFromHeader,
  SetOutgoingHeaderWithTraceFromContext,
  NewOutgoingContextWithTraceFromContext
}
