import express from 'express';
import merchantController from './controllers/merchantController';


const DefaultRouter = express.Router();
const ApiRouter = express.Router();

DefaultRouter.use(express.json()).use(express.urlencoded({ extended: true }));

ApiRouter.use('/merchant', merchantController.router());

DefaultRouter.use('/api', ApiRouter);

export default DefaultRouter;
