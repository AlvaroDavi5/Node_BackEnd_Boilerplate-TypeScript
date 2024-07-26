
export interface MockObservableInterface<R = void, A extends any[] = unknown[]> {
	call: jest.Mock<R, A, unknown>;
}
