import { FastifyInstance } from 'fastify';
import defaultControllerRouter from './controllers/defaultController';


export default async function apiRoutes(fastify: FastifyInstance) {
	await fastify.register(defaultControllerRouter, { prefix: '/api' });
}
