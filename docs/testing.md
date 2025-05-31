# Tests

by _Álvaro Alves_

---

# Types of Tests

## Static
Tests responsible for checking the application without running it, such as linting and type checking tests.  
> Fast and easy to run across the entire application, they can be considered as the minimum required to run the project.  

## Unit
Tests responsible for testing a single unit or code module. In this type of test, we can focus on testing each line of code and achieving maximum coverage for its scenarios, validating the entire behavior of the code (logic, validations, definitions, outputs).  

### Mocks
Since only one unit is being tested, these tests tend to rely heavily on mocks for different scenarios.  
Ideally, avoid using any resource that hinders the accuracy of tests, such as libraries, framework functions, or mocks with conditional deviations.  

### Value x Cost
Since its scope is limited to the tested units and includes many mocks, unit tests provide little **value** for verification and require significant creation and maintenance effort (**cost**).  
> Ideal for testing highly used code segments in different contexts with various inputs.  

## Integration
Tests responsible for checking the integration between various units or code modules. In this type of test, we should focus on testing multiple flows and how each flow impacts the integration of the modules that compose the test subject (flows, possible errors, definitions, outputs).  

### Mocks
For testing a set of units, they tend to depend less on mocks than unit tests, yet still require mocks, especially for connections with backing services.  
Since these tests aim to closely resemble the entire application, it’s common to use libraries, framework functions, or mocks of external services that may cause flow deviations (something that needs testing).  

### Value x Cost
Since its scope is not limited to one unit and uses few mocks, integration tests offer good **value** for verification and incur a lower **cost** for creation and maintenance.  
> Ideal for testing various application flows almost end-to-end.  

## End-to-End
Tests responsible for checking an entire application flow, from start to finish. In this type of test, the focus is on testing one or more flows completely, focusing less on coverage and more on outcomes (requests, validations, responses).  

- Vertical  
Focuses on testing all layers of the application and may be limited to a single flow (the happy path).  

- Horizontal  
Focuses on testing several flows within an application context and may ignore some inner layers (already validated by unit tests).  

### Mocks
Since it is an end-to-end test, mocks should not be used.  
Ideally, use the same codebase and an environment that simulates production.  

### Value x Cost
Since its scope includes testing an entire application flow, end-to-end (or E2E) tests offer the highest **value** for verification and incur the lowest **cost** for creation and maintenance.  
> Ideal for testing requests from various application flows.  

# Recommended Coverage

- Unit: 80% - 90%  
- Integration: 60% - 70%  
- E2E: 20% - 40%  

# References

[Static, Unit, Integration and End-to-End Tests Explained](https://medium.com/@lucas.paganini/static-unit-integration-and-end-to-end-tests-explained-f87a0ac40ca5)  
[End-to-End Testing Overview](https://aloa.co/blog/end-to-end-testing-overview)  
[Unit, Integration and End-to-End Testing Difference](https://www.twilio.com/en-us/blog/unit-integration-end-to-end-testing-difference)  
[Tudo Sobre Testes: Testes Unitários vs Testes de Integração vs Testes E2E](https://medium.com/rpedroni/tudo-sobre-testes-testes-unitários-vs-testes-de-integração-vs-testes-e2e-6a7cc955779)  
[A Pirâmide de Teste e os Testes End-to-End](https://medium.com/gtsw/a-pirâmide-de-teste-e-os-testes-end-to-end-38f77ad3d137)  
