
# Testes

por _Álvaro Alves_

---

# Tipos de Testes

## Estáticos
Testes responsáveis por checar a aplicação sem precisar executá-la, como testes de linting e tipagem.  
> Rápidos e fáceis de testar em toda a aplicação, podem ser considerados como o mínimo para a execução do projeto.  

## Unitários
Testes responsáveis por testar uma unidade ou módulo de código. Nesse tipo de teste podemos focar em testar cada linha de código e ter o máximo de cobertura possível para seus casos, validando todo o comportamento do código (lógicas, validações, definições, retornos).  

### Mocks
Por testar apenas uma unidade, acabam por depender muito de mocks para o teste de diferentes cenários.  
O ideal é evitar utilizar qualquer recurso que atrapalhe a assertividade dos testes, como bibliotecas, funções de frameworks ou mocks com desvios condicionais.  

### Valor x Custo
Uma vez que seu escopo se limita às unidades testadas e possuem muitos mocks, os testes unitários possuem pouco **valor** de apuração e exigem grande esforço de criação e manutenção (**custo**).  
> Ideais para testar trechos muito utilizados em diferentes contextos com diferentes inputs.  

## Integração
Testes responsáveis por testar a integração entre diversas unidades ou módulos do código. Nesse tipo de teste devemos focar em testar diversos fluxos e como cada fluxo impacta na integração dos módulos que compõem o objeto de teste (fluxos, possíveis erros, definições, retornos).  

### Mocks
Por testar um conjunto de unidades, costumam depender menos de mocks do que os testes unitários, porém ainda precisam de mocks, principalmente se tratando de conexões com backing services.  
Se tratando de testes que buscam se aproximar o máximo da aplicação como um todo, é comum a utilização de recursos como bibliotecas, funções de frameworks ou mocks de serviços externos que podem causar com desvios de fluxo (algo que precisamos testar).  

### Valor x Custo
Uma vez que seu escopo não se limita a apenas uma unidade por teste e possuem poucos mocks, os testes de integração possuem um bom **valor** de apuração e têm um menor **custo** de criação e manutenção.  
> Ideais para testar vários fluxos da aplicação fazendo o caminho quase completo.  

## End-to-End
Testes responsáveis por testar todo um fluxo da aplicação, do início ao fim. Nesse tipo de teste o foco é testar um ou mais fluxos de forma completa, focando menos em cobertura e mais em resultado (requisições, validações, respostas).  

- Vertical  
Tem como foco testar todas as camadas da aplicação e pode se limitar a um único fluxo (o caminho feliz).  

- Horizontal  
Tem como foco testar diversos fluxos em um contexto da aplicação e pode ignorar algumas camadas mais internas (já validadas nos testes unitários).  

### Mocks
Por ser um teste de ponta-a-ponta, não deve-se utilizar de mocks para funcionar.  
O ideal é utilizar a mesma codebase e um ambiente que simule o ambiente de produção.  

### Valor x Custo
Uma vez que faz parte de seu escopo testar todo um fluxo da aplicação, os testes end-to-end (ou E2E) possuem o mais alto **valor** de apuração e possuem um menor **custo** de criação e manutenção.  
> Ideais para testar requisições de diversos fluxos da aplicação.  

# Coverage Recomendado

- Unit.: 80% - 90%  
- Integ.: 60% - 70%  
- E2E.: 20% - 40%  

# Escopo de Testes para essa Aplicação

```txt
modules
├── api (integ)
│   ├── controllers
│   ├── dto
│   ├── filters
│   ├── guards
│   ├── middlewares
│   ├── pipes
│   └── schemas
├── app
│   └── ***
│       ├── api (integ)
│       │   ├── controllers
│       │   ├── dto
│       │   ├── pipes
│       │   └── schemas
│       ├── repositories (integ)
│       ├── services (integ)
│       ├── strategies (unit)
│       └── usecases (unit)
├── common (unit)
│   └── ***
├── core
│   ├── configs (integ)
│   ├── cron
│   │   ├── jobs (E2E)
│   │   └── tasks (integ)
│   ├── errors (unit)
│   ├── infra
│   │   ├── cache (E2E)
│   │   ├── data (E2E)
│   │   ├── database (E2E)
│   │   │   ├── models (E2E)
│   │   │   └── repositories (integ)
│   │   ├── integration
│   │   │   ├── aws (E2E)
│   │   │   └── rest (integ)
│   │   └── providers (E2E)
│   ├── logging (integ)
│   ├── security (unit)
│   └── start (integ)
├── domain
│   ├── entities (unit)
│   └── enums (unit)
├── events
│   ├── queue
│   │   ├── consumers (E2E)
│   │   ├── handlers (integ)
│   │   │   └── schemas (integ)
│   │   └── producers (E2E)
│   └── websocket
│       ├── client (E2E)
│       ├── guards (integ)
│       └── server (E2E)
└── graphql
    └── ***
        ├── dto
        ├── resolvers (integ)
        └── services (integ)
```

# Referências

[Static, Unit, Integration and End-to-End Tests Explained](https://medium.com/@lucas.paganini/static-unit-integration-and-end-to-end-tests-explained-f87a0ac40ca5)  
[End-to-End Testing Overview](https://aloa.co/blog/end-to-end-testing-overview)  
[Unit, Integration and End-to-End Testing Difference](https://www.twilio.com/en-us/blog/unit-integration-end-to-end-testing-difference)  
[Tudo Sobre Testes: Testes Unitários vs Testes de Integração vs Testes E2E](https://medium.com/rpedroni/tudo-sobre-testes-testes-unitários-vs-testes-de-integração-vs-testes-e2e-6a7cc955779)  
[A Pirâmide de Teste e os Testes End-to-End](https://medium.com/gtsw/a-pirâmide-de-teste-e-os-testes-end-to-end-38f77ad3d137)  
