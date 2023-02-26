import express from 'express';
import defaultController from './controllers/defaultController';


const DefaultRouter = express.Router();
const ApiRouter = express.Router();

DefaultRouter.use(express.json()).use(express.urlencoded({ extended: true }));

ApiRouter.use('/api', defaultController.router());

DefaultRouter.use('/mockedService', ApiRouter);

export default DefaultRouter;
