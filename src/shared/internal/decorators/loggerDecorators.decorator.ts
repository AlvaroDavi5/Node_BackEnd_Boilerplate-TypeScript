/* eslint-disable no-console, @typescript-eslint/no-restricted-types */

export function classLoggerDecorator(): ClassDecorator {
	return <TFunction extends Function>(target: TFunction) => {
		console.log(`[ClassDecorator] ${target.name} - ${JSON.stringify(target.prototype)}`);
	};
}

export function propertyLoggerDecorator(): PropertyDecorator {
	return (target: object, propertyKey: string | symbol) => {
		console.log(`[PropertyDecorator] ${JSON.stringify(target)} - ${propertyKey.toString()}`);
	};
}

export function methodLoggerDecorator(): MethodDecorator {
	return <T>(target: object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) => {
		console.log(`[MethodDecorator] ${JSON.stringify(target)} - ${propertyKey.toString()} - ${descriptor.value}`);
	};
}

export function parameterLoggerDecorator(): ParameterDecorator {
	return (target: object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
		console.log(`[ParameterDecorator] ${JSON.stringify(target)} - ${propertyKey?.toString()} - ${parameterIndex}`);
	};
}
