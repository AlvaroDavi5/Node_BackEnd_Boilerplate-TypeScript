
export interface UserAuthInterface {
	username: string | null | undefined;
	clientId: string | null | undefined;
}

export type userAuthType = UserAuthInterface | null | undefined
