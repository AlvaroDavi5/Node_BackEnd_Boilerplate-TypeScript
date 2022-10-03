// ? modules import
import {
	createContainer, InjectionMode,
	asClass, asFunction, asValue,
} from 'awilix';


// // examples
class exampleClass {
	public attribute!: string;
}
const exampleFunction = (param: string) => {
	return param;
};
const exampleValue = 'value';

// ! container creation
const container = createContainer({
	injectionMode: InjectionMode.PROXY,
});

// * modules register/load
container
	.register({
		exampleClass: asClass(exampleClass),
		exampleFunction: asFunction(exampleFunction),
		exampleValue: asValue(exampleValue),
	})
	.loadModules(
		[
			'src/app/operation/**/**.ts',
		],
		{
			formatName: 'camelCase',
			resolverOptions: {
				injectionMode: InjectionMode.PROXY,
			}
		},
	);


export default container;
