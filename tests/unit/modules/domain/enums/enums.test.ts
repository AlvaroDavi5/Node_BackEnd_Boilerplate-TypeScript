import { CacheEnum } from '@domain/enums/cache.enum';
import { QueueEventsEnum, WebSocketEventsEnum, WebSocketRoomsEnum } from '@domain/enums/events.enum';
import { ThemesEnum } from '@domain/enums/themes.enum';


describe('Modules :: Domain :: Enums', () => {

	describe('# CacheEnum', () => {
		test('Should return keys', () => {
			expect(Object.keys(CacheEnum)).toEqual(['SUBSCRIPTIONS', 'HOOKS']);
		});

		test('Should return values', () => {
			expect(Object.values(CacheEnum)).toEqual(['subscriptions', 'hooks']);
		});

		test('Should return value', () => {
			expect(CacheEnum.SUBSCRIPTIONS).toBe('subscriptions');
			expect(CacheEnum.HOOKS).toBe('hooks');
		});
	});

	describe('# QueueEventsEnum', () => {
		test('Should return keys', () => {
			expect(Object.keys(QueueEventsEnum)).toEqual(['INVALID', 'NEW_CONNECTION']);
		});

		test('Should return values', () => {
			expect(Object.values(QueueEventsEnum)).toEqual(['INVALID', 'NEW_CONNECTION']);
		});

		test('Should return value', () => {
			expect(QueueEventsEnum.INVALID).toBe('INVALID');
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

	describe('# WebSocketEventsEnum and WebSocketRoomsEnum', () => {
		test('Should return keys', () => {
			expect(Object.keys(WebSocketEventsEnum)).toEqual([
				'CONNECT',
				'DISCONNECT',
				'RECONNECT',
				'EMIT',
				'ERROR',
				'EMIT_PRIVATE',
				'BROADCAST',
			]);

			expect(Object.keys(WebSocketRoomsEnum)).toEqual(['NEW_CONNECTIONS']);
		});

		test('Should return values', () => {
			expect(Object.values(WebSocketEventsEnum)).toEqual([
				'connection',
				'disconnect',
				'reconnect',
				'emit',
				'error',
				'emit_private',
				'broadcast',
			]);

			expect(Object.values(WebSocketRoomsEnum)).toEqual(['new_connections']);
		});

		test('Should return value', () => {
			expect(WebSocketEventsEnum.CONNECT).toBe('connection');
			expect(WebSocketEventsEnum.DISCONNECT).toBe('disconnect');
			expect(WebSocketEventsEnum.RECONNECT).toBe('reconnect');
			expect(WebSocketEventsEnum.EMIT).toBe('emit');
			expect(WebSocketEventsEnum.EMIT_PRIVATE).toBe('emit_private');
			expect(WebSocketEventsEnum.BROADCAST).toBe('broadcast');

			expect(WebSocketRoomsEnum.NEW_CONNECTIONS).toBe('new_connections');
		});
	});
});
