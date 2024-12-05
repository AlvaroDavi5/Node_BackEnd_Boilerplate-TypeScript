import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
	CognitoIdentityProviderClient,
	ListUserPoolsCommand, CreateUserPoolCommand, DeleteUserPoolCommand, CreateUserPoolClientCommand, DeleteUserPoolClientCommand,
	AdminCreateUserCommand, AdminGetUserCommand, AdminDeleteUserCommand, SignUpCommand, AdminConfirmSignUpCommand,
	SignUpCommandInput, UserPoolDescriptionType, UserPoolClientType, UserType, SignUpResponse,
} from '@aws-sdk/client-cognito-identity-provider';
import { ConfigsInterface } from '@core/configs/envs.config';
import Exceptions from '@core/errors/Exceptions';
import LoggerService from '@core/logging/Logger.service';


@Injectable()
export default class CognitoClient {
	private readonly clientId: string;
	private readonly cognitoClient: CognitoIdentityProviderClient;

	constructor(
		private readonly configService: ConfigService,
		private readonly exceptions: Exceptions,
		private readonly logger: LoggerService,
	) {
		const { congito: { apiVersion, maxAttempts, clientId }, credentials: {
			region, endpoint, accessKeyId, secretAccessKey, sessionToken,
		} } = this.configService.get<ConfigsInterface['integration']['aws']>('integration.aws')!;
		const showExternalLogs = this.configService.get<ConfigsInterface['application']['showExternalLogs']>('application.showExternalLogs')!;

		this.clientId = clientId;

		this.cognitoClient = new CognitoIdentityProviderClient({
			endpoint, region, apiVersion, maxAttempts,
			credentials: { accessKeyId, secretAccessKey, sessionToken },
			logger: showExternalLogs ? this.logger : undefined,
		});
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

	public async listUserPools(max = 200): Promise<UserPoolDescriptionType[]> {
		try {
			const result = await this.cognitoClient.send(new ListUserPoolsCommand({
				MaxResults: max,
			}));

			return result.UserPools ?? [];
		} catch (error) {
			throw this.caughtError(error);
		}
	}

	public async createUserPool(userPoolName: string): Promise<string> {
		try {
			const result = await this.cognitoClient.send(new CreateUserPoolCommand({
				PoolName: userPoolName,
			}));

			if (!result?.UserPool?.Id)
				throw this.exceptions.internal({ message: 'UserPool not created' });

			return result.UserPool.Id;
		} catch (error) {
			throw this.caughtError(error);
		}
	}

	public async deleteUserPool(userPoolId: string): Promise<boolean> {
		try {
			const result = await this.cognitoClient.send(new DeleteUserPoolCommand({
				UserPoolId: userPoolId,
			}));

			const statusCode = result?.$metadata?.httpStatusCode ?? 500;
			return statusCode >= 200 && statusCode < 300;
		} catch (error) {
			throw this.caughtError(error);
		}
	}

	public async createClient(clientName: string, userPoolId: string): Promise<UserPoolClientType> {
		try {
			const result = await this.cognitoClient.send(new CreateUserPoolClientCommand({
				ClientName: clientName,
				UserPoolId: userPoolId,
			}));

			if (!result?.UserPoolClient?.ClientId)
				throw this.exceptions.internal({ message: 'Client not created' });

			return result.UserPoolClient;
		} catch (error) {
			throw this.caughtError(error);
		}
	}

	public async deleteClient(clientId: string, userPoolId: string): Promise<boolean> {
		try {
			const result = await this.cognitoClient.send(new DeleteUserPoolClientCommand({
				ClientId: clientId,
				UserPoolId: userPoolId,
			}));

			const statusCode = result?.$metadata?.httpStatusCode ?? 500;
			return statusCode >= 200 && statusCode < 300;
		} catch (error) {
			throw this.caughtError(error);
		}
	}

	public async createUser(userName: string, userPoolId: string): Promise<UserType> {
		try {
			const result = await this.cognitoClient.send(new AdminCreateUserCommand({
				Username: userName,
				UserPoolId: userPoolId,
			}));

			if (!result?.User?.Username)
				throw this.exceptions.internal({ message: 'User not created' });

			return result.User;
		} catch (error) {
			throw this.caughtError(error);
		}

	}

	public async getUser(userName: string, userPoolId: string): Promise<UserType> {
		const user: UserType = {};

		try {
			const result = await this.cognitoClient.send(new AdminGetUserCommand({
				Username: userName,
				UserPoolId: userPoolId,
			}));

			if (!result?.Username)
				throw this.exceptions.internal({ message: 'User not finded' });

			user.Username = result.Username;
			user.Enabled = result.Enabled;
			user.UserStatus = result.UserStatus;
			user.MFAOptions = result.MFAOptions;
			user.UserCreateDate = result.UserCreateDate;
			user.UserLastModifiedDate = result.UserLastModifiedDate;
		} catch (error) {
			throw this.caughtError(error);
		}

		return user;
	}

	public async deleteUser(userName: string, userPoolId: string): Promise<boolean> {
		try {
			const result = await this.cognitoClient.send(new AdminDeleteUserCommand({
				Username: userName,
				UserPoolId: userPoolId,
			}));

			const statusCode = result?.$metadata?.httpStatusCode ?? 500;
			return statusCode >= 200 && statusCode < 300;
		} catch (error) {
			throw this.caughtError(error);
		}
	}

	public async userSignUp(userName: string, userEmail: string, userPassword: string): Promise<SignUpResponse> {
		const user: SignUpResponse = {
			UserConfirmed: false,
			UserSub: '',
		};

		try {
			const result = await this.cognitoClient.send(new SignUpCommand(this.signUpParams(userName, userEmail, userPassword)));

			if (!result?.UserConfirmed)
				throw this.exceptions.internal({ message: 'User not confirmed' });

			user.UserConfirmed = result.UserConfirmed;
			user.UserSub = result.UserSub;
		} catch (error) {
			throw this.caughtError(error);
		}

		return user;
	}

	public async confirmUserSignUp(userName: string, userPoolId: string): Promise<boolean> {
		try {
			const result = await this.cognitoClient.send(new AdminConfirmSignUpCommand({
				Username: userName,
				UserPoolId: userPoolId,
			}));

			const statusCode = result?.$metadata?.httpStatusCode ?? 500;
			return statusCode >= 200 && statusCode < 300;
		} catch (error) {
			throw this.caughtError(error);
		}
	}

	private caughtError(error: unknown): Error {
		this.logger.error(error);
		return this.exceptions.integration(error as Error);
	}
}
