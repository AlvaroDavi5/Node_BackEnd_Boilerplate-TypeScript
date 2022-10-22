import { AwilixContainer } from 'awilix';


export interface ContainerInterface {
	[key: string]: object | string | any,
}

export type containerType = AwilixContainer | object | any
