import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigsInterface } from '@core/configs/configs.config';
import { ExceptionsEnum } from '@common/enums/exceptions.enum';
import { getObjValues } from '@common/utils/dataValidations.util';
import { ErrorInterface } from '@shared/internal/interfaces/errorInterface';
import { ResponseInterface } from '@shared/internal/interfaces/endpointInterface';


@Catch(HttpException)
export default class KnownExceptionFilter implements ExceptionFilter {
	private readonly showStack: boolean;

	constructor(
		private readonly configService: ConfigService,
	) {
		const appConfigs = this.configService.get<ConfigsInterface['application']>('application')!;
		this.showStack = appConfigs.stackErrorVisible;
	}

	public catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<ResponseInterface>();
		const status = exception.getStatus();

		const errorResponse: ErrorInterface & { description?: string } = {
			name: exception.name,
			message: exception.message,
			cause: exception.cause,
			stack: this.showStack ? exception.stack : undefined,
		};

		const knownExceptions = getObjValues<ExceptionsEnum>(ExceptionsEnum).map((exception) => exception.toString());
		if (knownExceptions.includes(exception.name)) {
			const { description, details } = exception.getResponse() as any;
			errorResponse.description = description ?? details;
			errorResponse.details = details;
		}

		response
			.status(status)
			.json(errorResponse);
	}
}
