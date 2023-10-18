export const enum EnvironmentEnum {
  DEVELOPMENT = 'development',
  TEST = 'test',
  PRODUCTION = 'production',
}

export enum HttpStatusCodeEnum {
  Continue = 100,
  SwitchingProtocols = 101,
  Processing = 102,
  EarlyHints = 103,
  Ok = 200,
  Created = 201,
  Accepted = 202,
  NonAuthoritativeInformation = 203,
  NoContent = 204,
  ResetContent = 205,
  PartialContent = 206,
  MultiStatus = 207,
  AlreadyReported = 208,
  ImUsed = 226,
  MultipleChoices = 300,
  MovedPermanently = 301,
  Found = 302,
  SeeOther = 303,
  NotModified = 304,
  UseProxy = 305,
  Unused = 306,
  TemporaryRedirect = 307,
  PermanentRedirect = 308,
  BadRequest = 400,
  Unauthorized = 401,
  PaymentRequired = 402,
  Forbidden = 403,
  NotFound = 404,
  MethodNotAllowed = 405,
  NotAcceptable = 406,
  ProxyAuthenticationRequired = 407,
  RequestTimeout = 408,
  Conflict = 409,
  Gone = 410,
  LengthRequired = 411,
  PreconditionFailed = 412,
  PayloadTooLarge = 413,
  UriTooLong = 414,
  UnsupportedMediaType = 415,
  RangeNotSatisfiable = 416,
  ExpectationFailed = 417,
  ImATeapot = 418,
  MisdirectedRequest = 421,
  UnprocessableEntity = 422,
  Locked = 423,
  FailedDependency = 424,
  TooEarly = 425,
  UpgradeRequired = 426,
  PreconditionRequired = 428,
  TooManyRequests = 429,
  RequestHeaderFieldsTooLarge = 431,
  UnavailableForLegalReasons = 451,
  InternalServerError = 500,
  NotImplemented = 501,
  BadGateway = 502,
  ServiceUnavailable = 503,
  GatewayTimeout = 504,
  HttpVersionNotSupported = 505,
  VariantAlsoNegotiates = 506,
  InsufficientStorage = 507,
  LoopDetected = 508,
  NotExtended = 510,
  NetworkAuthenticationRequired = 511,
}

export const enum ErrorMessageEnum {
  BAD_REQUEST = 'Bad Request', // 400
  UNAUTHORIZED = 'Unauthorized', // 401
  FORBIDDEN = 'Forbidden', // 403
  NOT_FOUND = 'Not Found', // 404
  METHOD_NOT_ALLOWED = 'Method Not Allowed', // 405
  REQUEST_TIMEOUT = 'Request Timeout', // 408
  CONFLICT = 'Conflict', // 409
  UNPROCESSABLE_ENTITY = 'Unprocessable Entity', // 422
  TOO_MANY_REQUESTS = 'Too Many Requests', // 429
  INTERNAL_SERVER_ERROR = 'Internal Server Error', // 500
  BAD_GATEWAY = 'Bad Gateway', // 502
  GATEWAY_TIMEOUT = 'Gateway Timeout', // 504
}

export const enum RedirectionMessageEnum {
  MOVED_PERMANENTLY = 'Moved Permanently', // 301
  FOUND = 'Found', // 302
}

export const enum SuccessfulMessageEnum {
  OK = 'OK', // 200
  CREATED = 'Created', // 201
  ACCEPTED = 'Accepted', // 202
  NO_CONTENT = 'No Content', // 204
}

export const enum MessageEnum {
  SUCCESS = 'Success',
  FAIL = 'Failed',
}

export const enum DataTypeEnum {
  OBJECT = 'object',
  ARRAY = 'array',
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  NULL = 'null',
  UNDEFINED = 'undefined',
}

export const enum VariableTypeEnum {
  CAMEL_CASE = 'camelCase',
  SNAKE_CASE = 'snakeCase',
}

export const enum FormatTimeEnum {
  DATE_TIME = 'YYYY-MM-DD HH:mm:ss',
  DATE = 'YYYY-MM-DD',
  TIME = 'HH:mm:ss',
}
