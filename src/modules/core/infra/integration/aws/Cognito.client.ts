import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
	CognitoIdentityProviderClient, CognitoIdentityProviderClientConfig, UserPoolDescriptionType,
	ListUserPoolsCommand, CreateUserPoolCommand, DeleteUserPoolCommand, CreateUserPoolClientCommand, DeleteUserPoolClientCommand,
	AdminCreateUserCommand, AdminGetUserCommand, AdminDeleteUserCommand, SignUpCommand, AdminConfirmSignUpCommand,
	SignUpCommandInput,
} from '@aws-sdk/client-cognito-identity-provider';
import { ConfigsInterface } from '@core/configs/envs.config';
import Exceptions from '@core/errors/Exceptions';
import LoggerService from '@core/logging/Logger.service';


@Injectable()
export default class CognitoClient {
	private readonly awsConfig: CognitoIdentityProviderClientConfig;
	public readonly userPoolName: string;
	public readonly userPoolId: string;
	private readonly clientId: string;
	private readonly cognitoClient: CognitoIdentityProviderClient;

	constructor(
		private readonly configService: ConfigService,
		private readonly exceptions: Exceptions,
		private readonly logger: LoggerService,
	) {
		const awsConfigs = this.configService.get<ConfigsInterface['integration']['aws']>('integration.aws')!;
		const logging = this.configService.get<ConfigsInterface['application']['logging']>('application.logging')!;
		const {
			region, endpoint, sessionToken,
			accessKeyId, secretAccessKey,
		} = awsConfigs.credentials;
		const { userPoolName, userPoolId, clientId, apiVersion } = awsConfigs.congito;

		this.awsConfig = {
			endpoint,
			region,
			apiVersion,
			credentials: {
				accessKeyId: String(accessKeyId),
				secretAccessKey: String(secretAccessKey),
				sessionToken,
			},
			logger: logging ? this.logger : undefined,
		};
		this.userPoolName = userPoolName;
		this.userPoolId = userPoolId;
		this.clientId = clientId;
		this.cognitoClient = new CognitoIdentityProviderClient(this.awsConfig);
	}

	private signUpParams(userName: string, userEmail: string, password: string): SignUpCommandInput {
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


	public getClient(): CognitoIdentityProviderClient {
		return this.cognitoClient;
	}

	public destroy(): void {
		this.cognitoClient.destroy();
	}

	public async listUserPools(): Promise<UserPoolDescriptionType[]> {
		let list: UserPoolDescriptionType[] = [];

		try {
			const result = await this.cognitoClient.send(new ListUserPoolsCommand({
				MaxResults: 200,
			}));
			if (result?.UserPools)
				list = result.UserPools;
		} catch (error) {
			this.logger.error('List User Pools Error:', error);
			throw this.exceptions.integration(error as Error);
		}

		return list;
	}

	public async createUserPool(userPoolName: string): Promise<string> {
		let userPoolId = '';

		try {
			const result = await this.cognitoClient.send(new CreateUserPoolCommand({
				PoolName: userPoolName,
			}));
			if (result?.UserPool?.Id)
				userPoolId = result.UserPool.Id;
		} catch (error) {
			this.logger.error('Create User Pool Error:', error);
			throw this.exceptions.integration(error as Error);
		}

		return userPoolId;
	}

	public async deleteUserPool(userPoolId: string): Promise<number> {
		let statusCode = 0;

		try {
			const result = await this.cognitoClient.send(new DeleteUserPoolCommand({
				UserPoolId: userPoolId,
			}));

			const { httpStatusCode } = result.$metadata;
			if (httpStatusCode)
				statusCode = httpStatusCode;
		} catch (error) {
			this.logger.error('Delete User Pool Error:', error);
			throw this.exceptions.integration(error as Error);
		}

		return statusCode;
	}

	public async createClient(userPoolName: string, userPoolId: string): Promise<string> {
		let clientId = '';

		try {
			const result = await this.cognitoClient.send(new CreateUserPoolClientCommand({
				ClientName: userPoolName,
				UserPoolId: userPoolId,
			}));
			if (result?.UserPoolClient?.ClientId)
				clientId = result.UserPoolClient.ClientId;
		} catch (error) {
			this.logger.error('Create Client Error:', error);
			throw this.exceptions.integration(error as Error);
		}

		return clientId;
	}

	public async deleteClient(clientId: string, userPoolId: string): Promise<number> {
		let statusCode = 0;

		try {
			const result = await this.cognitoClient.send(new DeleteUserPoolClientCommand({
				ClientId: clientId,
				UserPoolId: userPoolId,
			}));

			const { httpStatusCode } = result.$metadata;
			if (httpStatusCode)
				statusCode = httpStatusCode;
		} catch (error) {
			this.logger.error('Delete Client Error:', error);
			throw this.exceptions.integration(error as Error);
		}

		return statusCode;
	}

	public async createUser(userName: string, userPoolId: string): Promise<string> {
		let userStatus = '';

		try {
			const result = await this.cognitoClient.send(new AdminCreateUserCommand({
				Username: userName,
				UserPoolId: userPoolId,
			}));
			if (result?.User?.UserStatus)
				userStatus = result.User.UserStatus;
		} catch (error) {
			this.logger.error('Create User Error:', error);
			throw this.exceptions.integration(error as Error);
		}

		return userStatus;
	}

	public async getUser(userName: string, userPoolId: string): Promise<boolean> {
		let userEnabled = false;

		try {
			const result = await this.cognitoClient.send(new AdminGetUserCommand({
				Username: userName,
				UserPoolId: userPoolId,
			}));
			if (result?.Enabled)
				userEnabled = result.Enabled;
		} catch (error) {
			this.logger.error('Get User Error:', error);
			throw this.exceptions.integration(error as Error);
		}

		return userEnabled;
	}

	public async deleteUser(userName: string, userPoolId: string): Promise<number> {
		let statusCode = 0;

		try {
			const result = await this.cognitoClient.send(new AdminDeleteUserCommand({
				Username: userName,
				UserPoolId: userPoolId,
			}));

			const { httpStatusCode } = result.$metadata;
			if (httpStatusCode)
				statusCode = httpStatusCode;
		} catch (error) {
			this.logger.error('Delete User Error:', error);
			throw this.exceptions.integration(error as Error);
		}

		return statusCode;
	}

	public async signUp(userName: string, userEmail: string, password: string): Promise<boolean> {
		let userConfirmed = false;

		try {
			const result = await this.cognitoClient.send(new SignUpCommand(this.signUpParams(userName, userEmail, password)));
			if (result?.UserConfirmed)
				userConfirmed = result.UserConfirmed;
		} catch (error) {
			this.logger.error('signUp Error:', error);
			throw this.exceptions.integration(error as Error);
		}

		return userConfirmed;
	}

	public async confirmSignUp(userName: string, userPoolId: string): Promise<number> {
		let statusCode = 0;

		try {
			const result = await this.cognitoClient.send(new AdminConfirmSignUpCommand({
				Username: userName,
				UserPoolId: userPoolId,
			}));

			const { httpStatusCode } = result.$metadata;
			if (httpStatusCode)
				statusCode = httpStatusCode;
		} catch (error) {
			this.logger.error('SignUp Confirm Error:', error);
			throw this.exceptions.integration(error as Error);
		}

		return statusCode;
	}
}
