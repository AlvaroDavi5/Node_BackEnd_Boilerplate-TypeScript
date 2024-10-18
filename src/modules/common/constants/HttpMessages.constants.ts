import { Injectable } from '@nestjs/common';


@Injectable()
export default class HttpMessagesConstants {
	public readonly messages = {
		found: (element: string) => `${element} founded successfully.`,
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
