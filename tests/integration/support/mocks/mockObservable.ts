
export interface MockObservableInterface {
	call: jest.Mock<void, unknown[], any>;
}

export const mockObservable: MockObservableInterface = {
	call: jest.fn((...args: unknown[]): void => { console.log(args); }),
};
