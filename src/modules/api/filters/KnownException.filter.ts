import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { ConfigsInterface } from '@core/configs/envs.config';
import DataParserHelper from '@common/utils/helpers/DataParser.helper';
import { ExceptionsEnum } from '@common/enums/exceptions.enum';
import { getObjValues, isNullOrUndefined } from '@common/utils/dataValidations.util';
import { ErrorInterface } from '@shared/internal/interfaces/errorInterface';
import { ResponseInterface } from '@shared/internal/interfaces/endpointInterface';


@Catch(HttpException)
export default class KnownExceptionFilter implements ExceptionFilter<HttpException | AxiosError | Error> {
	private readonly showStack: boolean;
	private readonly knownExceptions: string[];

	constructor(
		private readonly configService: ConfigService,
		private readonly dataParserHelper: DataParserHelper,
	) {
		this.knownExceptions = getObjValues<ExceptionsEnum>(ExceptionsEnum).map((exc) => exc.toString());

		const appConfigs = this.configService.get<ConfigsInterface['application']>('application')!;
		this.showStack = appConfigs.showDetailedLogs;
	}

	public catch(exception: HttpException | AxiosError | Error, host: ArgumentsHost) {
		const context = host.switchToHttp();
		const response = context.getResponse<ResponseInterface>();

		const isHttpException = exception instanceof HttpException;
		const isAxiosError = exception instanceof AxiosError;

		let status = 500;
		const errorResponse: ErrorInterface & { description?: string } = {
			name: exception.name,
			message: exception.message,
			stack: this.showStack ? exception.stack : undefined,
		};

		if (isHttpException) {
			status = exception.getStatus();
			const exceptionResponse = exception.getResponse();

			if (this.knownExceptions.includes(exception.name)) {
				if (typeof exceptionResponse === 'object' && !isNullOrUndefined(exceptionResponse)) {
					const { description, details } = exceptionResponse as unknown as any;
					errorResponse.description = description;
					errorResponse.details = details;
				} else {
					const strData = this.dataParserHelper.toString(exceptionResponse);
					errorResponse.details = strData;
				}
			}

			errorResponse.cause = exception.cause;
		} else if (isAxiosError) {
			const { status: exceptionStatus } = exception;

			if (exceptionStatus)
				status = exceptionStatus;

			errorResponse.details = exception.code;
			errorResponse.cause = exception.cause;
		}

		response
			.status(status)
			.json(errorResponse);
	}
}
