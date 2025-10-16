import { Router } from 'express';
import defaultControllerRouter from './controllers/defaultController';


const apiRouter: Router = Router();

apiRouter.use('/api', defaultControllerRouter());

export default apiRouter;
