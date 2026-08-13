---
name: 'Create Usecase With Tests'
description: 'Use when implementing a new NestJS usecase and its unit test file. Enforces project test structure, mock patterns, scenario coverage (success, failure, exceptions), and NestJS TestingModule setup.'
applyTo: '{src,tests}/**/*.{ts,js}'
---

# Create Usecase With Tests

## Unit Test File Structure

Create test files at `tests/unit/modules/<module>/usecases/<Name>.usecase.test.ts` following the patterns below.

### File Structure Pattern

```typescript
import <Dependency> from '@<alias>/<path>';
// ... other imports

describe('Modules :: <ModuleName> :: UseCases :: <UseCaseName>', () => {
  // mocks
  const exceptionsMock = {
    internal: jest.fn(({ message }: ErrorInterface): Error => new Error(message)),
    integration: jest.fn(({ message }: ErrorInterface): Error => new Error(message)),
    unauthorized: jest.fn(({ message }: ErrorInterface): Error => new Error(message)),
    business: jest.fn(({ message }: ErrorInterface): Error => new Error(message)),
    notFound: jest.fn(({ message }: ErrorInterface): Error => new Error(message)),
    conflict: jest.fn(({ message }: ErrorInterface): Error => new Error(message)),
  };
  const <dependencyName>Mock = {
    <method>: jest.fn(async (<_params>): Promise<<ReturnType>> => {
      throw new Error('GenericError'); // default: throw unless success is the default
    }),
    // ...
  };

  // NOTE - if using NestJS TestingModule
  let useCase: <UseCaseName>;
  let nestTestingModule: TestingModule;
	// ? build test app
  beforeAll(async () => {
    nestTestingModule = await Test.createTestingModule({
      providers: [
        { provide: <DependencyType>, useValue: <dependencyName>Mock },
        // ...
      ],
    }).compile();

		// * get app provider
    useCase = nestTestingModule.get<UseCaseName>(UseCaseName);
  });
  afterAll(async () => {
    await nestTestingModule.close();
  });

  // NOTE - else (plain instantiation)
  const useCase = new <UseCaseName>(
    <dependencyName>Mock as unknown as <DependencyType>,
    // ...
  );

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('# Main Flux', () => {
    test('Should <describe success outcome>', async () => {
      // arrange: configure mocks with mockResolvedValueOnce
      // act: call useCase.execute(...)
      // assert: expect return value + toHaveBeenCalledTimes + toHaveBeenCalledWith
    });
  });

  describe('# <PrivateMethod>', () => {
    test('Should <describe success outcome>', async () => {
      // arrange: configure mocks with mockResolvedValueOnce
      // act: call useCase.execute(...)
      // assert: expect return value + toHaveBeenCalledTimes + toHaveBeenCalledWith
    });
  });

  describe('# Exceptions', () => {
    test('Should throw a <error type> error when <condition>', async () => {
      // arrange: configure mock with mockRejectedValueOnce or mockResolvedValueOnce
      // act+assert: await expect(useCase.execute(...)).rejects.toMatchObject(new Error('...'))
      // assert: verify mock call counts and which exceptions were called
    });
  });
});
```

## Mandatory Rules

- **All** dependencies are mocked as plain objects using `jest.fn()` typed by the actual interfaces.
- For NestJS usecases, always use `Test.createTestingModule` setup — never plain instantiation.
- Default mock behavior for methods that can fail: `throw new Error('GenericError')`.
- Default mock behavior for methods that usually succeed: return a safe neutral value (`null`, `false`, empty pagination, etc.).
- Cast mocks as `DependencyMock as unknown as ActualType` in the constructor call.
- `afterEach(() => jest.clearAllMocks())` is always present at the top-level `describe`.
- Use `mockResolvedValueOnce` / `mockRejectedValueOnce` — never persistent `mockResolvedValue` — to configure per-test behavior.
- Each test must assert **both** the return value **and** the call counts/arguments of the relevant mocks.
- Exception tests: `await expect(useCase.execute(...)).rejects.toMatchObject(new Error('<message>'))`.
- Separate scenarios into `describe('# Main Flux', ...)`, `describe('# Private Methods', ...)`, and `describe('# Exceptions', ...)`.
- Cover **every branching point** in `execute()`: one test per scenario, including inputs with wrong types.
- `describe` label format: `'Modules :: <Module> :: <SubPath> :: UseCases :: <ClassName>'`.

## Scenarios to Cover

Derive from the business rules of the usecase:

- All success paths through `execute()`.
- Each guard/validation that triggers a business/notFound/conflict/unauthorized exception.
- Each dependency that can throw (propagation test: verify the error bubbles correctly).
- Edge cases: `null`, `undefined`, empty collections, wrong-type inputs, boundary values.

## Completion Checklist

- [ ] Test file created at `tests/unit/modules/<module>/usecases/<Name>.usecase.test.ts`.
- [ ] All dependencies mocked with `jest.fn()` and typed correctly.
- [ ] `afterEach(jest.clearAllMocks)` present.
- [ ] Every `execute()` branch covered by at least one test.
- [ ] Assertions cover both return values and mock call counts/arguments.
- [ ] Wrong-type and null/undefined input scenarios included.
- [ ] Code follows the Oxlint config and is formatted by Oxfmt + EditorConfig.
