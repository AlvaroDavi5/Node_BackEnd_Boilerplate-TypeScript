import {
	Controller, Version,
	Sse, UseGuards, UseFilters
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiProduces, ApiConsumes, ApiOkResponse } from '@nestjs/swagger';
import { interval, map, Observable } from 'rxjs';
import exceptionsResponseDecorator from '@api/decorators/exceptionsResponse.decorator';
import HttpExceptionsFilter from '@api/filters/HttpExceptions.filter';
import CustomThrottlerGuard from '@common/guards/CustomThrottler.guard';
import { ApiVersionsEnum } from '@common/enums/apiVersions.enum';


@ApiTags('Server-Sent Events')
@Controller()
@UseGuards(CustomThrottlerGuard)
@UseFilters(HttpExceptionsFilter)
@exceptionsResponseDecorator()
export default class ServerEvents {
	// TODO - move to events module and apply for polling
	@ApiOperation({
		summary: 'Server-Sent Events',
		description: 'Send to Client the Server events',
		deprecated: false,
	})
	@Sse('sse')
	@Version(ApiVersionsEnum.DEFAULT)
	@ApiOkResponse({
		schema: {
			example: { number: 1, text: 'OK' },
		}
	})
	@ApiConsumes('text/plain')
	@ApiProduces('text/event-stream')
	sse(): Observable<Partial<MessageEvent<{ number: number, text: string }>>> {
		return interval(1000).pipe(map<number, Partial<MessageEvent<{ number: number, text: string }>>>((n) => ({
			data: { number: n, text: 'OK' },
		})));
	}
}
