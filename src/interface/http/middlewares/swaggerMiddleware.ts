import YAML from 'yamljs';
import swaggerUi from 'swagger-ui-express';


const swaggerDocument = YAML.load('docs/swagger.yaml');

export default () => [
	swaggerUi.serve, swaggerUi.setup(swaggerDocument),
];
