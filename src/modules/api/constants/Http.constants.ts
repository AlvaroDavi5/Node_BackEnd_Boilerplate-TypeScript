import { Injectable } from '@nestjs/common';


@Injectable()
export default class HttpConstants {
	public readonly status = {
		// Informationals
		CONTINUE: 100,
		SWITCHING_PROTOCOLS: 101,

		// Successfully
		OK: 200,
		CREATED: 201,
		ACCEPTED: 202,
		NON_AUTHORITATIVE_INFORMATION: 203,
		NO_CONTENT: 204,
		RESET_CONTENT: 205,

		// Redirections
		MULTIPLE_CHOICES: 300,
		MOVED_PERMANENTLY: 301,
		FOUND: 302,
		SEE_OTHER: 303,
		USE_PROXY: 305,
		UNUSED: 306,
		TEMPORARY_REDIRECT: 307,

		// Client Errors
		BAD_REQUEST: 400,
		UNAUTHORIZED: 401,
		PAYMENT_REQUIRED: 402,
		FORBIDDEN: 403,
		NOT_FOUND: 404,
		METHOD_NOT_ALLOWED: 405,
		NOT_ACCEPTABLE: 406,
		PROXY_AUTHENTICATION_REQUIRED: 407,
		REQUEST_TIMEOUT: 408,
		CONFLICT: 409,
		GONE: 410,
		LENGTH_REQUIRED: 411,
		PRECONDITION_FAILED: 412,
		REQUEST_ENTITY_TOO_LARGE: 413,
		REQUEST_URI_TOO_LONG: 414,
		UNSUPPORTED_MEDIA_TYPE: 415,
		REQUESTED_RANGE_NOT_SATISFIABLE: 416,
		EXPECTATION_FAILED: 417,
		I_AM_A_TEAPOT: 418,
		MISDIRECTED_REQUEST: 421,
		UNPROCESSABLE_ENTITY: 422,
		LOCKED: 423,
		FAILED_DEPENDENCY: 424,
		UPGRADE_REQUIRED: 426,

		// Server Errors
		INTERNAL_SERVER_ERROR: 500,
		NOT_IMPLEMENTED: 501,
		BAD_GATEWAY: 502,
		SERVICE_UNAVAILABLE: 503,
		GATEWAY_TIMEOUT: 504,
		NOT_SUPPORTED: 505,
	};

	public readonly messages = {
		found: (element: string) => `${element} finded successfully.`,
		notFound: (element: string) => `${element} not found!`,
		created: (element: string) => `${element} created successfully.`,
		notCreated: (element: string) => `Error to create ${element}!`,
		updated: (element: string) => `${element} updated successfully.`,
		notUpdated: (element: string) => `Error to update ${element}!`,
		deleted: (element: string) => `${element} deleted successfully.`,
		notDeleted: (element: string) => `Error to delete ${element}!`,
		badRequest: (element: string) => `${element} is invalid!`,
		unauthorized: (element: string) => `${element} is unauthorized!`,
		forbidden: (element: string) => `${element} is forbidden!`,
		conflict: (element: string) => `${element} already exists!`,
		notAcceptable: (element: string) => `${element} is not acceptable!`,
		notImplemented: (element: string) => `${element} is not implemented!`,
		serviceUnavailable: (element: string) => `${element} is unavailable!`,
		unrecognizedError: () => 'Unrecognized error!'
	};
}
