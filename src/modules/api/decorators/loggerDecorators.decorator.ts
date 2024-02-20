
export function classDecorator(): ClassDecorator {
	// eslint-disable-next-line @typescript-eslint/ban-types
	return <TFunction extends Function>(target: TFunction) => {
		console.log(`[ClassDecorator] ${target.name} - ${JSON.stringify(target.prototype)}`);
	};
}

export function propertyDecorator(): PropertyDecorator {
	return (target: object, propertyKey: string | symbol) => {
		console.log(`[PropertyDecorator] ${JSON.stringify(target)} - ${propertyKey.toString()}`);
	};
}

export function methodDecorator(): MethodDecorator {
	return <T>(target: object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) => {
		console.log(`[MethodDecorator] ${JSON.stringify(target)} - ${propertyKey.toString()} - ${descriptor.value}`);
	};
}

export function parameterDecorator(): ParameterDecorator {
	return (target: object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
		console.log(`[ParameterDecorator] ${JSON.stringify(target)} - ${propertyKey?.toString()} - ${parameterIndex}`);
	};
}
