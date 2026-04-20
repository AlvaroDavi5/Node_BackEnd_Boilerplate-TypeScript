---
name: create-usecase-with-tests
description: "Create a NestJS usecase and its unit test file. Use when implementing a new usecase with business rules that require isolated unit tests covering success, failure and exception scenarios."
argument-hint: "Describe the usecase business rules: inputs, outputs, dependencies (services/repositories), success scenarios and exceptions."
agent: agent
---

Create a NestJS usecase following the project architecture and its corresponding unit test file.

## Input

The user will provide the **business rules** of the usecase. Extract from their description:
- Usecase name and module path (`src/modules/<module>/usecases/<Name>.usecase.ts`)
- Constructor dependencies (services, repositories, helpers, constants)
- Input parameters of `execute()`
- Success scenarios (main flux)
- Failure scenarios (business rules not met)
- Exception scenarios (dependency throws)

If the user does not specify a module path, ask before proceeding.

---

## Part 1 — Usecase File

Create `src/modules/<module>/usecases/<Name>.usecase.ts` following these rules:

- Annotate with `@Injectable()`.
- Inject all dependencies via constructor with `private readonly`.
- Expose a single public `execute(...)` method with typed parameters and return type.
- Follow the architecture flow: **trigger → logic_provider → data_provider** (the usecase is the `logic_provider`; never access DB or IO directly).
- No payload mutation: create copies when transforming data.
- Use `const` over `let` wherever reassignment is not needed.
- Extract complex conditions to named boolean variables.
- Naming: `camelCase` for variables/functions, `PascalCase` for classes, `SNAKE_CASE` for constants.
- Format must comply with ESLint + Prettier project config.

---

## Part 2 — Unit Test File

Create `tests/unit/modules/<module>/usecases/<Name>.usecase.test.ts` following the **exact patterns** used in this project:

### File Structure Pattern

```typescript
import <Dependency> from '@<alias>/<path>';
// ... other imports

describe('Modules :: <ModuleName> :: UseCases :: <UseCaseName>', () => {
  // // mocks
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

	// if test use Nest.js
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

	// else
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

### Mandatory Rules
- **All** dependencies are mocked as plain objects or objects with mocked methods using `jest.fn()` typed by the actual interfaces — if is a NestJS application, create test using NestJS library imports (`Test.createTestingModule`) in unit tests.
- Default mock behavior for methods that can fail: `throw new Error('GenericError')`.
- Default mock behavior for methods that usually succeed in real flow: return a safe neutral value (`null`, `false`, empty pagination, etc.).
- Cast mocks as `DependencyMock as unknown as ActualType` in the constructor call.
- `afterEach(() => jest.clearAllMocks())` is always present at the top level `describe`.
- Use `mockResolvedValueOnce` / `mockRejectedValueOnce` (never persistent `mockResolvedValue`) to configure behavior per test.
- Each test must assert **both** the return value **and** the call counts/arguments of the relevant mocks.
- Exception tests: `await expect(useCase.execute(...)).rejects.toMatchObject(new Error('<message>'))`.
- Separate scenarios into `describe('# Main Flux', ...)`, `describe('# Private Methods', ...)` and `describe('# Exceptions', ...)`.
- Cover **every branching point** in `execute()`: one test per scenario.
- `describe` label format: `'Modules :: <Module> :: <SubPath> :: UseCases :: <ClassName>'`.

### Scenarios to Cover (derive from business rules provided)
- All success paths through `execute()`.
- Each guard/validation that triggers a business/notFound/conflict/unauthorized exception.
- Each dependency that can throw (propagation test: verify error bubbles correctly).

---

## Completion Checklist
- [ ] Usecase file created at correct path.
- [ ] Test file created at correct path.
- [ ] All dependencies mocked with `jest.fn()` and typed correctly.
- [ ] `afterEach(jest.clearAllMocks)` present.
- [ ] Every `execute()` branch covered by at least one test.
- [ ] Assertions cover both return values and mock call counts/arguments.
- [ ] Code follows ESLint + Prettier project config.
