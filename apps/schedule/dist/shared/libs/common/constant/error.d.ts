export declare const enum EnvironmentEnum {
    DEVELOPMENT = "development",
    TEST = "test",
    PRODUCTION = "production"
}
export declare enum HttpStatusCodeEnum {
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
    NetworkAuthenticationRequired = 511
}
export declare const enum ErrorMessageEnum {
    BAD_REQUEST = "Bad Request",
    UNAUTHORIZED = "Unauthorized",
    FORBIDDEN = "Forbidden",
    NOT_FOUND = "Not Found",
    METHOD_NOT_ALLOWED = "Method Not Allowed",
    REQUEST_TIMEOUT = "Request Timeout",
    CONFLICT = "Conflict",
    UNPROCESSABLE_ENTITY = "Unprocessable Entity",
    TOO_MANY_REQUESTS = "Too Many Requests",
    INTERNAL_SERVER_ERROR = "L\u1ED7i h\u1EC7 th\u1ED1ng",
    BAD_GATEWAY = "Bad Gateway",
    GATEWAY_TIMEOUT = "Gateway Timeout"
}
export declare const enum RedirectionMessageEnum {
    MOVED_PERMANENTLY = "Moved Permanently",
    FOUND = "Found"
}
export declare const enum SuccessfulMessageEnum {
    OK = "OK",
    CREATED = "Created",
    ACCEPTED = "Accepted",
    NO_CONTENT = "No Content"
}
export declare const enum MessageEnum {
    SUCCESS = "Success",
    FAIL = "Failed"
}
export declare const enum DataTypeEnum {
    OBJECT = "object",
    ARRAY = "array",
    STRING = "string",
    NUMBER = "number",
    BOOLEAN = "boolean",
    NULL = "null",
    UNDEFINED = "undefined"
}
export declare const enum VariableTypeEnum {
    CAMEL_CASE = "camelCase",
    SNAKE_CASE = "snakeCase"
}
export declare const enum FormatTimeEnum {
    DATE_TIME = "YYYY-MM-DD HH:mm:ss",
    DATE = "YYYY-MM-DD",
    TIME = "HH:mm:ss"
}
