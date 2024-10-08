
export interface MockObservableInterface<R = void, A extends unknown[] = unknown[]> {
	call: jest.Mock<R, A, unknown>;
}
