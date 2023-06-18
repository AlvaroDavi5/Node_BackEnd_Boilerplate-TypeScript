import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'winston';
import { AWSError } from 'aws-sdk';
import {
	CognitoIdentityProviderClient, CognitoIdentityProviderClientConfig, UserPoolDescriptionType,
	ListUserPoolsCommand, CreateUserPoolCommand, DeleteUserPoolCommand, CreateUserPoolClientCommand, DeleteUserPoolClientCommand, AdminCreateUserCommand, AdminGetUserCommand, AdminDeleteUserCommand, SignUpCommand, AdminConfirmSignUpCommand,
	SignUpCommandInput,
} from '@aws-sdk/client-cognito-identity-provider';
import { ConfigsInterface } from '@configs/configs';
import LoggerGenerator from '@infra/logging/logger';


@Injectable()
export default class CognitoClient {
	private awsConfig: CognitoIdentityProviderClientConfig;
	private userPoolName: string;
	private userPoolId: string;
	private clientId: string;
	private cognito: CognitoIdentityProviderClient;
	private readonly logger: Logger;

	constructor(
		private readonly configService: ConfigService,
		private readonly loggerGenerator: LoggerGenerator,
	) {
		this.logger = this.loggerGenerator.getLogger();
		const awsConfigs: ConfigsInterface['integration']['aws'] = this.configService.get<any>('integration.aws');
		const logging: ConfigsInterface['application']['logging'] = this.configService.get<any>('application.logging');
		const {
			region, sessionToken,
			accessKeyId, secretAccessKey,
		} = awsConfigs.credentials;
		const { userPoolName, userPoolId, clientId,
			endpoint, apiVersion } = awsConfigs.congito;

		this.awsConfig = {
			endpoint,
			region,
			apiVersion,
			credentials: {
				accessKeyId: String(accessKeyId),
				secretAccessKey: String(secretAccessKey),
				sessionToken,
			},
			logger: logging === 'true' ? this.logger : undefined,
		};
		this.userPoolName = userPoolName || 'defaultPool';
		this.userPoolId = userPoolId || '';
		this.clientId = clientId || '';
		this.cognito = new CognitoIdentityProviderClient(this.awsConfig);
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
			const result = await this.cognito.send(new ListUserPoolsCommand({
				MaxResults: 200,
			}));
			if (result?.UserPools)
				list = result.UserPools;
		} catch (error) {
			this.logger.error('List User Pools Error:', error);
		}

		return list;
	}

	async createUserPool(userPoolName: string | null): Promise<string> {
		let userPoolId = '';

		try {
			const result = await this.cognito.send(new CreateUserPoolCommand({
				PoolName: userPoolName || this.userPoolName,
			}));
			if (result?.UserPool?.Id)
				userPoolId = result.UserPool.Id;
		} catch (error) {
			this.logger.error('Create User Pool Error:', error);
		}

		return userPoolId;
	}

	async deleteUserPool(userPoolId: string | null): Promise<number> {
		let httpStatusCode = 0;

		try {
			const result = await this.cognito.send(new DeleteUserPoolCommand({
				UserPoolId: userPoolId || this.userPoolId,
			}));
			if (result?.$metadata?.httpStatusCode)
				httpStatusCode = result.$metadata.httpStatusCode;
		} catch (error) {
			this.logger.error('Delete User Pool Error:', error);
		}

		return httpStatusCode;
	}

	async createClient(userPoolName: string | null, userPoolId: string | null): Promise<string> {
		let clientId = '';

		try {
			const result = await this.cognito.send(new CreateUserPoolClientCommand({
				ClientName: userPoolName || this.userPoolName,
				UserPoolId: userPoolId || this.userPoolId,
			}));
			if (result?.UserPoolClient?.ClientId)
				clientId = result.UserPoolClient.ClientId;
		} catch (error) {
			this.logger.error('Create Client Error:', error);
		}

		return clientId;
	}

	async deleteClient(clientId: string | null, userPoolId: string | null): Promise<number> {
		let httpStatusCode = 0;

		try {
			const result = await this.cognito.send(new DeleteUserPoolClientCommand({
				ClientId: clientId || this.clientId,
				UserPoolId: userPoolId || this.userPoolId,
			}));
			if (result?.$metadata?.httpStatusCode)
				httpStatusCode = result.$metadata.httpStatusCode;
		} catch (error) {
			this.logger.error('Delete Client Error:', error);
		}

		return httpStatusCode;
	}

	async createUser(userName: string, userPoolId: string | null): Promise<string> {
		let userStatus = '';

		try {
			const result = await this.cognito.send(new AdminCreateUserCommand({
				Username: userName,
				UserPoolId: userPoolId || this.userPoolId,
			}));
			if (result?.User?.UserStatus)
				userStatus = result.User.UserStatus;
		} catch (error) {
			this.logger.error('Create User Error:', error);
		}

		return userStatus;
	}

	async getUser(userName: string, userPoolId: string | null): Promise<boolean> {
		let userEnabled = false;

		try {
			const result = await this.cognito.send(new AdminGetUserCommand({
				Username: userName,
				UserPoolId: userPoolId || this.userPoolId,
			}));
			if (result?.Enabled)
				userEnabled = result.Enabled;
		} catch (error) {
			this.logger.error('Get User Error:', error);
		}

		return userEnabled;
	}

	async deleteUser(userName: string, userPoolId: string | null): Promise<number> {
		let httpStatusCode = 0;

		try {
			const result = await this.cognito.send(new AdminDeleteUserCommand({
				Username: userName,
				UserPoolId: userPoolId || this.userPoolId,
			}));
			if (result?.$metadata?.httpStatusCode)
				httpStatusCode = result.$metadata.httpStatusCode;
		} catch (error) {
			this.logger.error('Delete User Error:', error);
		}

		return httpStatusCode;
	}

	async signUp(userName: string, userEmail: string, password: string): Promise<boolean> {
		let userConfirmed = false;

		try {
			const result = await this.cognito.send(new SignUpCommand(this._signUpParams(userName, userEmail, password)));
			if (result?.UserConfirmed)
				userConfirmed = result.UserConfirmed;
		} catch (error) {
			this.logger.error('signUp Error:', error);
		}

		return userConfirmed;
	}

	async confirmSignUp(userName: string, userPoolId: string | null): Promise<number> {
		let httpStatusCode = 0;

		try {
			const result = await this.cognito.send(new AdminConfirmSignUpCommand({
				Username: userName,
				UserPoolId: userPoolId || this.userPoolId,
			}));
			if (result.$metadata.httpStatusCode)
				httpStatusCode = result.$metadata.httpStatusCode;
		} catch (error) {
			this.logger.error('SignUp Confirm Error:', error);
		}

		return httpStatusCode;
	}
}
