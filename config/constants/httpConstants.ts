
const httpStatus = {
	OK: 200,
	CREATED: 201,
	ACCEPTED: 202,
	NO_CONTENT: 204,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	CONFLICT: 409,
	INTERNAL_SERVER_ERROR: 500,
	BAD_GATEWAY: 502,
	SERVICE_UNAVAILABLE: 503
}

const apiMessages = {
	found: (element: string) => `${element} finded successfully`,
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
	badGateway: (element: string) => `${element} is bad gateway!`,
	serviceUnavailable: (element: string) => `${element} is unavailable!`,
	unrecognizedError: () => `Unrecognized error!`
}


type httpConstants = {
	status: typeof httpStatus,
	messages: typeof apiMessages
}


export const httpConstants: httpConstants = {
	status: httpStatus,
	messages: apiMessages
}
