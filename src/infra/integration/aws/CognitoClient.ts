import { Logger } from 'winston';
import { AWSError } from 'aws-sdk';
import {
	CognitoIdentityProviderClient, CognitoIdentityProviderClientConfig, UserPoolDescriptionType,
	ListUserPoolsCommand, CreateUserPoolCommand, DeleteUserPoolCommand, CreateUserPoolClientCommand, DeleteUserPoolClientCommand, AdminCreateUserCommand, AdminGetUserCommand, AdminDeleteUserCommand, SignUpCommand, AdminConfirmSignUpCommand,
	SignUpCommandInput,
} from '@aws-sdk/client-cognito-identity-provider';
import { ContainerInterface } from 'src/types/_containerInterface';


export default class CognitoClient {
	private awsConfig: CognitoIdentityProviderClientConfig;
	private userPoolName: string;
	private userPoolId: string;
	private clientName: string;
	private clientId: string;
	private cognito: CognitoIdentityProviderClient;
	private logger: Logger;

	constructor({
		logger,
		configs,
	}: ContainerInterface) {
		const {
			region, sessionToken,
			accessKeyId, secretAccessKey,
		} = configs.integration.aws.credentials;
		const { userPoolName, userPoolId,
			clientName, clientId,
			endpoint, apiVersion } = configs.integration.aws.congito;

		this.awsConfig = {
			endpoint,
			region,
			apiVersion,
			credentials: {
				accessKeyId,
				secretAccessKey,
				sessionToken,
			},
			logger: configs.application.logging === 'true' ? logger : undefined,
		};
		this.userPoolName = userPoolName;
		this.userPoolId = userPoolId;
		this.clientName = clientName;
		this.clientId = clientId;
		this.cognito = new CognitoIdentityProviderClient(this.awsConfig);
		this.logger = logger;
	}

	private _signUpParams(userName: string, userEmail: string, password: string): SignUpCommandInput {
		return {
			Username: userName,
			Password: password,
			UserAttributes: [
				{
					Name: 'email',
					Value: userEmail
				},
			],
			ClientId: this.clientId,
		};
	}


	getClient(): CognitoIdentityProviderClient {
		return this.cognito;
	}

	async listUserPools(): Promise<UserPoolDescriptionType[]> {
		let list: UserPoolDescriptionType[] = [];

		try {
			this.cognito.send(new ListUserPoolsCommand({
				MaxResults: 200,
			}), (err: AWSError, data) => {
				if (err) {
					this.logger.error('List Error:', err);
				}
				else {
					list = data?.UserPools || [];
				}
			});
		} catch (error) {
			this.logger.error(error);
		}

		return list;
	}

	async createUserPool(userPoolName: string | null): Promise<string> {
		let userPoolId = '';

		try {
			this.cognito.send(new CreateUserPoolCommand({
				PoolName: userPoolName || this.userPoolName,
			}), (err: AWSError, data) => {
				if (err) {
					this.logger.error('Create Error:', err);
				}
				else {
					userPoolId = data?.UserPool?.Id || '';
				}
			});
		} catch (error) {
			this.logger.error(error);
		}

		return userPoolId;
	}

	async deleteUserPool(userPoolId: string | null): Promise<number> {
		let httpStatusCode = 0;

		try {
			this.cognito.send(new DeleteUserPoolCommand({
				UserPoolId: userPoolId || this.userPoolId,
			}), (err: AWSError, data) => {
				if (err) {
					this.logger.error('Create Error:', err);
				}
				else {
					httpStatusCode = data?.$metadata?.httpStatusCode || 0;
				}
			});
		} catch (error) {
			this.logger.error(error);
		}

		return httpStatusCode;
	}

	async createClient(userPoolName: string | null, userPoolId: string | null): Promise<string> {
		let clientId = '';

		try {
			this.cognito.send(new CreateUserPoolClientCommand({
				ClientName: userPoolName || this.userPoolName,
				UserPoolId: userPoolId || this.userPoolId,
			}), (err: AWSError, data) => {
				if (err) {
					this.logger.error('Create Client Error:', err);
				}
				else {
					clientId = data?.UserPoolClient?.ClientId || '';
				}
			});
		} catch (error) {
			this.logger.error(error);
		}

		return clientId;
	}

	async deleteClient(clientId: string | null, userPoolId: string | null): Promise<number> {
		let httpStatusCode = 0;

		try {
			this.cognito.send(new DeleteUserPoolClientCommand({
				ClientId: clientId || this.clientId,
				UserPoolId: userPoolId || this.userPoolId,
			}), (err: AWSError, data) => {
				if (err) {
					this.logger.error('Delete Client Error:', err);
				}
				else {
					httpStatusCode = data?.$metadata.httpStatusCode || 0;
				}
			});
		} catch (error) {
			this.logger.error(error);
		}

		return httpStatusCode;
	}

	async createUser(userName: string, userPoolId: string | null): Promise<string> {
		let userStatus = '';

		try {
			this.cognito.send(new AdminCreateUserCommand({
				Username: userName,
				UserPoolId: userPoolId || this.userPoolId,
			}), (err: AWSError, data) => {
				if (err) {
					this.logger.error('Create User Error:', err);
				}
				else {
					userStatus = data?.User?.UserStatus || '';
				}
			});
		} catch (error) {
			this.logger.error(error);
		}

		return userStatus;
	}

	async getUser(userName: string, userPoolId: string | null): Promise<boolean> {
		let userEnabled = false;

		try {
			this.cognito.send(new AdminGetUserCommand({
				Username: userName,
				UserPoolId: userPoolId || this.userPoolId,
			}), (err: AWSError, data) => {
				if (err) {
					this.logger.error('Get User Error:', err);
				}
				else {
					userEnabled = data?.Enabled || false;
				}
			});
		} catch (error) {
			this.logger.error(error);
		}

		return userEnabled;
	}

	async deleteUser(userName: string, userPoolId: string | null): Promise<number> {
		let httpStatusCode = 0;

		try {
			this.cognito.send(new AdminDeleteUserCommand({
				Username: userName,
				UserPoolId: userPoolId || this.userPoolId,
			}), (err: AWSError, data) => {
				if (err) {
					this.logger.error('Delete User Error:', err);
				}
				else {
					httpStatusCode = data?.$metadata.httpStatusCode || 0;
				}
			});
		} catch (error) {
			this.logger.error(error);
		}

		return httpStatusCode;
	}

	async signUp(userName: string, userEmail: string, password: string): Promise<boolean> {
		let userConfirmed = false;

		try {
			this.cognito.send(new SignUpCommand(this._signUpParams(userName, userEmail, password)), (err: AWSError, data) => {
				if (err) {
					this.logger.error('signUp Error:', err);
				}
				else {
					userConfirmed = data?.UserConfirmed || false;
				}
			});
		} catch (error) {
			this.logger.error(error);
		}

		return userConfirmed;
	}

	async confirmSignUp(userName: string, userPoolId: string | null): Promise<number> {
		let httpStatusCode = 0;

		try {
			this.cognito.send(new AdminConfirmSignUpCommand({
				Username: userName,
				UserPoolId: userPoolId || this.userPoolId,
			}), (err: AWSError, data) => {
				if (err) {
					this.logger.error('SignUp Confirm Error:', err);
				}
				else {
					httpStatusCode = data?.$metadata.httpStatusCode || 0;
				}
			});
		} catch (error) {
			this.logger.error(error);
		}

		return httpStatusCode;
	}
}
