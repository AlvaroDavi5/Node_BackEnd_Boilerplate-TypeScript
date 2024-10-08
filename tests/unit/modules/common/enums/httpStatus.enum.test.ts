import { HttpStatusEnum } from '@common/enums/httpStatus.enum';


describe('Modules :: Common :: Enums :: HttpStatus', () => {
	describe('# Status Code', () => {
		test('Should return the same value', () => {
			expect(HttpStatusEnum.CONTINUE).toBe(100);
			expect(HttpStatusEnum.PROCESSING).toBe(102);
			expect(HttpStatusEnum.OK).toBe(200);
			expect(HttpStatusEnum.CREATED).toBe(201);
			expect(HttpStatusEnum.FOUND).toBe(302);
			expect(HttpStatusEnum.TEMPORARY_REDIRECT).toBe(307);
			expect(HttpStatusEnum.BAD_REQUEST).toBe(400);
			expect(HttpStatusEnum.UNAUTHORIZED).toBe(401);
			expect(HttpStatusEnum.FORBIDDEN).toBe(403);
			expect(HttpStatusEnum.NOT_FOUND).toBe(404);
			expect(HttpStatusEnum.INTERNAL_SERVER_ERROR).toBe(500);
			expect(HttpStatusEnum.SERVICE_UNAVAILABLE).toBe(503);
		});
	});
});
