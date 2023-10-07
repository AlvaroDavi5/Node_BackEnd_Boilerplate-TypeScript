import { CacheEnum } from '../../../../../../src/modules/app/domain/enums/cache.enum';
import { EventsEnum } from '../../../../../../src/modules/app/domain/enums/events.enum';
import { ThemesEnum } from '../../../../../../src/modules/app/domain/enums/themes.enum';
import { WebSocketEventsEnum } from '../../../../../../src/modules/app/domain/enums/webSocketEvents.enum';


describe('Modules :: App :: Domain :: Enums', () => {

	describe('# CacheEnum', () => {
		test('Should return keys', () => {
			expect(Object.keys(CacheEnum)).toEqual(['SUBSCRIPTIONS']);
		});

		test('Should return values', () => {
			expect(Object.values(CacheEnum)).toEqual(['subscriptions']);
		});

		test('Should return value', () => {
			expect(CacheEnum.SUBSCRIPTIONS).toBe('subscriptions');
		});
	});

	describe('# EventsEnum', () => {
		test('Should return keys', () => {
			expect(Object.keys(EventsEnum)).toEqual(['CREATE']);
		});

		test('Should return values', () => {
			expect(Object.values(EventsEnum)).toEqual(['CREATE']);
		});

		test('Should return value', () => {
			expect(EventsEnum.CREATE).toBe('CREATE');
		});
	});

	describe('# ThemesEnum', () => {
		test('Should return keys', () => {
			expect(Object.keys(ThemesEnum)).toEqual(['DEFAULT', 'LIGHT', 'DARK']);
		});

		test('Should return values', () => {
			expect(Object.values(ThemesEnum)).toEqual(['DEFAULT', 'LIGHT', 'DARK']);
		});

		test('Should return value', () => {
			expect(ThemesEnum.DEFAULT).toBe('DEFAULT');
			expect(ThemesEnum.LIGHT).toBe('LIGHT');
			expect(ThemesEnum.DARK).toBe('DARK');
		});
	});

	describe('# WebSocketEventsEnum', () => {
		test('Should return keys', () => {
			expect(Object.keys(WebSocketEventsEnum)).toEqual([
				'CONNECT',
				'DISCONNECT',
				'RECONNECT',
				'EMIT',
				'EMIT_PRIVATE',
				'BROADCAST',
			]);
		});

		test('Should return values', () => {
			expect(Object.values(WebSocketEventsEnum)).toEqual([
				'connection',
				'disconnect',
				'reconnect',
				'emit',
				'emit-private',
				'broadcast',
			]);
		});

		test('Should return value', () => {
			expect(WebSocketEventsEnum.CONNECT).toBe('connection');
			expect(WebSocketEventsEnum.DISCONNECT).toBe('disconnect');
			expect(WebSocketEventsEnum.RECONNECT).toBe('reconnect');
			expect(WebSocketEventsEnum.EMIT).toBe('emit');
			expect(WebSocketEventsEnum.EMIT_PRIVATE).toBe('emit-private');
			expect(WebSocketEventsEnum.BROADCAST).toBe('broadcast');
		});
	});
});
