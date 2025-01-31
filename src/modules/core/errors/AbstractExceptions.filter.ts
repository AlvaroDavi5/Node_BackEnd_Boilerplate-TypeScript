import { HttpException } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { AxiosError } from 'axios';
import { captureException } from '@core/errors/trackers';
import LoggerService from '@core/logging/Logger.service';
import DataParserHelper from '@common/utils/helpers/DataParser.helper';
import { HttpStatusEnum } from '@common/enums/httpStatus.enum';
import { ExceptionsEnum } from '@common/enums/exceptions.enum';
import { getObjValues } from '@common/utils/dataValidations.util';
import { ExceptionMetadataInterface } from '@shared/internal/interfaces/errorInterface';


export type ErrorOrExceptionToFilter = HttpException | WsException | AxiosError | Error;

export default abstract class AbstractExceptionsFilter {
	private readonly knownExceptions: string[];
	private readonly exceptionsToIgnore: string[];
	private readonly errorsToIgnore: number[];

	constructor(
		protected readonly logger: LoggerService,
		protected readonly dataParserHelper: DataParserHelper,
	) {
		this.knownExceptions = getObjValues<ExceptionsEnum>(ExceptionsEnum).map((exc) => exc.toString());

		this.exceptionsToIgnore = [
			ExceptionsEnum.TOO_MANY_REQUESTS,
			ExceptionsEnum.INVALID_TOKEN,
			ExceptionsEnum.CONTRACT,
		];
		this.errorsToIgnore = [
			HttpStatusEnum.TOO_MANY_REQUESTS,
			HttpStatusEnum.INVALID_TOKEN,
			HttpStatusEnum.I_AM_A_TEAPOT,
		];
	}

	protected capture(exception: unknown, metadata?: ExceptionMetadataInterface): void {
		this.logger.error(exception);

		const shouldIgnoreKnownException = exception instanceof HttpException
			&& this.knownExceptions.includes(exception.name)
			&& this.exceptionsToIgnore.includes(exception.name);

		const shouldIgnoreHttpException = exception instanceof HttpException
			&& this.errorsToIgnore.includes(exception.getStatus());

		const shouldIgnoreAxiosError = exception instanceof AxiosError
			&& !!exception.status
			&& this.errorsToIgnore.includes(exception.status);

		if (!shouldIgnoreKnownException && !shouldIgnoreHttpException && !shouldIgnoreAxiosError)
			captureException(exception, metadata);
	}
}
