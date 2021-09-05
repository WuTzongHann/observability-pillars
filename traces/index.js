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
  await next()
}

/**
 * getExistStringOrEmptyString
 */
const parseValue = (value) => (value === undefined) ? '' : value

const SetOutgoingHeaderWithTraceFromHeader = (httpHeadersInput, httpHeadersOutput) => {
  httpHeadersOutput[xRequestId] = parseValue(httpHeadersInput[xRequestId])
  httpHeadersOutput[xB3TraceId] = parseValue(httpHeadersInput[xB3TraceId])
  httpHeadersOutput[xB3SpanId] = parseValue(httpHeadersInput[xB3SpanId])
  httpHeadersOutput[xB3ParentId] = parseValue(httpHeadersInput[xB3ParentId])
}

const NewOutgoingContextWithTraceFromHeader = (httpHeadersInput) => {
  const result = {}
  result[xRequestId] = parseValue(httpHeadersInput[xRequestId])
  result[xB3TraceId] = parseValue(httpHeadersInput[xB3TraceId])
  result[xB3SpanId] = parseValue(httpHeadersInput[xB3SpanId])
  result[xB3ParentId] = parseValue(httpHeadersInput[xB3ParentId])
  return result
}

const SetOutgoingHeaderWithTraceFromContext = (grpcMetadataInput, httpHeadersOutput) => {
  httpHeadersOutput[xRequestId] = parseValue(grpcMetadataInput[xRequestId])
  httpHeadersOutput[xB3TraceId] = parseValue(grpcMetadataInput[xB3TraceId])
  httpHeadersOutput[xB3SpanId] = parseValue(grpcMetadataInput[xB3SpanId])
  httpHeadersOutput[xB3ParentId] = parseValue(grpcMetadataInput[xB3ParentId])
}

const NewOutgoingContextWithTraceFromContext = (grpcMetadataInput) => {
  const result = {}
  result[xRequestId] = parseValue(grpcMetadataInput[xRequestId])
  result[xB3TraceId] = parseValue(grpcMetadataInput[xB3TraceId])
  result[xB3SpanId] = parseValue(grpcMetadataInput[xB3SpanId])
  result[xB3ParentId] = parseValue(grpcMetadataInput[xB3ParentId])
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
