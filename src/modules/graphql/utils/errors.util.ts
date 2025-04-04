import { GraphQLFormattedError } from 'graphql';


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatGraphQlError({ message, extensions, path }: GraphQLFormattedError, error: any): GraphQLFormattedError {
	const graphQLFormattedError: GraphQLFormattedError = {
		message: message ?? error?.message,
		path: path ?? error?.path,
		extensions: {
			code: extensions?.code,
			originalError: extensions?.originalError,
		},
	};

	return graphQLFormattedError;
}
