import YAML from 'yamljs';
import swaggerUi from 'swagger-ui-express';


const swaggerDocument = YAML.load('src/interface/http/docs/swagger.yaml');

export default () => [
	swaggerUi.serve, swaggerUi.setup(swaggerDocument),
];
