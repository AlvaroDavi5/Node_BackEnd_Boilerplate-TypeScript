import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';


export default () =>
	applyDecorators(
		ApiBearerAuth('Authorization'),
	);
