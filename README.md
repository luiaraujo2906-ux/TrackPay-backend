# TrackPay Payments API

A **Payments API do TrackPay** é o serviço responsável pelo processamento e acompanhamento dos pagamentos dentro do ecossistema TrackPay.

O TrackPay é concebido como um copiloto inteligente para motoristas de aplicativo, com funcionalidades como registro de corridas e rotas, cálculo de distâncias, controle de consumo, manutenção do veículo, gastos e organização financeira. Este repositório representa uma parte específica desse ecossistema: **a infraestrutura de pagamentos**.

A API foi desenvolvida em Node.js + TypeScript e atualmente concentra o fluxo de criação e confirmação de cobranças Pix. Ela permite gerar uma cobrança, persistir seus dados, receber a confirmação do PSP por webhook e notificar clientes em tempo real sobre mudanças no status do pagamento.

A integração atual utiliza o Asaas como PSP (provedor de serviços de pagamento). O fluxo pode ser testado de forma prática por meio do frontend de demonstração localizado em `public/demo`.

> **Escopo deste repositório:** pagamentos. Funcionalidades como rastreamento de rotas, registro de distâncias, manutenção, consumo, despesas e demais recursos do copiloto do motorista fazem parte do produto TrackPay, mas não são responsabilidades deste serviço.

## Papel dentro do ecossistema TrackPay

O TrackPay é o produto maior. A Payments API existe para resolver especificamente o domínio de pagamentos.

Uma visão simplificada do ecossistema é:

```text
TrackPay
│
├── Aplicação do motorista
│   ├── Corridas
│   ├── Rastreamento e rotas
│   ├── Distâncias
│   ├── Veículo
│   ├── Manutenção
│   ├── Gastos
│   └── Organização financeira
│
└── Payments API
    ├── Criação de cobranças Pix
    ├── QR Code Pix
    ├── Webhooks
    ├── Status de pagamento
    └── Notificações em tempo real
```

Uma corrida do TrackPay poderá futuramente utilizar este serviço para gerar uma cobrança com base na distância percorrida, utilizar um valor informado pelo motorista e manter a referência entre corrida e pagamento. Essa integração pertence ao domínio maior do TrackPay e não transforma este repositório em um sistema de rastreamento.

## Funcionalidades atuais

O sistema já implementa, no estado atual do código, as seguintes capacidades:

- Criação de pagamento Pix.
- Geração do QR Code Pix.
- Persistência do pagamento no MySQL.
- Status do pagamento em `PENDING`, `PAID`, `CANCELLED` e `EXPIRED`.
- Regras de transição de status.
- Webhook para receber confirmação do PSP.
- Integração com Asaas.
- Atualização do pagamento após webhook.
- WebSocket/Socket.IO para atualização do status em tempo real.
- Rooms do Socket.IO associadas ao `paymentId`.
- Frontend de demonstração.
- Validação de payloads com Zod.
- Testes unitários e de integração.

## Arquitetura

A arquitetura deste serviço é simples e direta:

```text
Cliente / aplicação do TrackPay
        ↓
Payments API (Express)
        ↓
Services
        ↓
Repositories
        ↓
MySQL
```

A origem da verdade financeira continua sendo o backend e o banco, com o PSP validando/confirmando a cobrança. O Socket.IO não é a fonte da verdade; ele apenas notifica o cliente sobre uma alteração de status.

Fluxo de confirmação real:

```text
Cliente paga Pix
        ↓
Asaas
        ↓
Webhook
        ↓
TrackPay
        ↓
MySQL
        ↓
Socket.IO
        ↓
Frontend
        ↓
PAID
```

O estado financeiro é controlado pelo backend, pelo banco e pelo PSP. O WebSocket apenas entrega a notificação ao cliente em tempo real.

## Stack

- Node.js
- TypeScript
- Express
- MySQL
- Zod
- Vitest
- Supertest
- Socket.IO
- Asaas
- QR Code
- HTML/CSS/JavaScript para a demo

## Estrutura do projeto

A estrutura principal do projeto é a seguinte:

```text
src/
├── controllers/
├── repositories/
├── routes/
├── services/
├── schemas/
├── types/
├── tests/
├── app.ts
├── server.ts
└── providers/

public/
└── demo/

database/
└── schema.sql
```

Principais responsabilidades:

- `src/controllers/`: processa requisições HTTP e delega a lógica de negócio.
- `src/routes/`: define as rotas da API.
- `src/services/`: contém a regra de negócio, geração de QR Code e atualização de status.
- `src/repositories/`: acesso e persistência em banco.
- `src/schemas/`: validação com Zod.
- `src/types/`: tipos compartilhados.
- `src/providers/`: integrações com PSPs e parsing de webhook.
- `src/tests/`: testes de integração e cenários de fluxo.
- `public/demo/`: interface simples para testar fluxo Pix em navegador.
- `database/schema.sql`: criação do banco e tabela `payments`.

## Pré-requisitos

Antes de executar o projeto localmente, você precisa ter instalado:

- Node.js
- npm
- MySQL
- Conta Asaas para testar o fluxo real de pagamento
- Chave Pix configurada no Asaas

Não use credenciais reais em repositórios públicos.

## Instalação

Clone o projeto e instale as dependências:

```bash
git clone <url-do-repositorio>
cd trackpay-payments-api
npm install
```

Se existir um arquivo `.env.example`, copie-o para `.env` e ajuste os valores de acordo com seu ambiente local.

```bash
cp .env.example .env
```

## Variáveis de ambiente

As variáveis de ambiente realmente utilizadas pelo projeto, conforme o código atual, são:

```env
PORT=3000

PIX_KEY=
PIX_NAME=
PIX_CITY=

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=trackpay

MERCADOPAGO_ACCESS_TOKEN=
PAYMENT_PROVIDER=asaas

ASAAS_API_KEY=
ASAAS_API_URL=https://api-sandbox.asaas.com/v3
RUN_ASAAS_TESTS=false
```

Descrição das principais variáveis:

- `PORT`: porta em que o servidor Express/Socket.IO será iniciado.
- `PIX_KEY`: chave Pix usada para geração do código Pix e para integração com PSPs.
- `PIX_NAME`: nome do favorecido para geração do payload Pix.
- `PIX_CITY`: cidade do favorecido para geração do payload Pix.
- `MYSQL_HOST`: host do banco MySQL.
- `MYSQL_PORT`: porta do MySQL.
- `MYSQL_USER`: usuário do banco.
- `MYSQL_PASSWORD`: senha do banco.
- `MYSQL_DATABASE`: nome do banco da aplicação.
- `MERCADOPAGO_ACCESS_TOKEN`: token de acesso do Mercado Pago, caso esse provedor seja usado.
- `PAYMENT_PROVIDER`: provedor ativo. Valores esperados no código: `asaas`, `mercadopago` ou `fake`.
- `ASAAS_API_KEY`: token de acesso da API do Asaas.
- `ASAAS_API_URL`: URL base da API do Asaas; neste projeto o valor padrão é o sandbox.
- `RUN_ASAAS_TESTS`: habilita testes de integração com a API real do Asaas quando configurado como `true`.

> Nunca exponha valores reais de API keys, senhas ou chaves Pix no repositório.

## Banco de dados

O projeto usa MySQL e o schema atual está em `database/schema.sql`.

### Criar o banco

Você pode criar o banco manualmente com SQL:

```sql
CREATE DATABASE IF NOT EXISTS trackpay
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE trackpay;

CREATE TABLE IF NOT EXISTS payments (
    id CHAR(36) PRIMARY KEY,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    pix_code TEXT NOT NULL,
    provider_reference VARCHAR(100) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (provider_reference)
);
```

### Configuração da conexão

A conexão com o banco está em `src/config/database.ts` e usa as variáveis:

- `MYSQL_HOST`
- `MYSQL_PORT`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_DATABASE`

Não há migrations definidas no projeto no momento. O SQL acima deve ser executado diretamente para preparar o banco.

## Asaas

O projeto está configurado para usar o Asaas como provedor principal de pagamento.

### Como configurar

1. Crie uma conta no Asaas e acesse o ambiente de sandbox ou produção.
2. Gere uma API key para uso da aplicação.
3. Configure `ASAAS_API_KEY` no `.env`.
4. Configure `PIX_KEY` com a chave Pix que será usada para gerar o QR Code Pix.
5. Configure `PAYMENT_PROVIDER=asaas`.
6. Ajuste `ASAAS_API_URL` conforme o ambiente desejado.

### Sandbox vs produção

O código atual usa `ASAAS_API_URL=https://api-sandbox.asaas.com/v3` por padrão. Isso indica que o projeto foi pensado para testes em ambiente sandbox antes de uso em produção.

### Como o TrackPay usa o Asaas

O provedor em `src/providers/asaas-payment.provider.ts` realiza uma requisição para a rota `/pix/qrCodes/static` do Asaas e recebe:

- `id`: referência do QR Code no provedor
- `payload`: código Pix gerado

Esse payload é salvo no banco e convertido em QR Code local via geração de imagem com a lib `qrcode`.

### Webhook do Asaas

O webhook do Asaas precisa apontar para um endpoint da aplicação, no caso atual:

```text
POST /webhooks/payment
```

Este endpoint recebe o payload do webhook, valida com Zod e atualiza o pagamento no banco. O status do pagamento pode mudar para `PAID` e, em seguida, o servidor emite uma notificação via Socket.IO para o frontend.

Para testar webhook em ambiente local, normalmente é necessário expor a aplicação via ngrok e configurar a URL pública gerada no painel do Asaas. Em outras palavras, o Asaas precisa alcançar um endpoint público, e o ngrok é uma forma simples de expor a porta local da aplicação, por exemplo:

```text
https://<subdominio>.ngrok-free.app/webhooks/payment
```

> O endpoint do webhook precisa ser acessível pela rede pública do Asaas para receber notificações reais. Em ambiente local, o ngrok costuma ser a solução mais prática para isso.

## Executando o projeto

Para iniciar o backend em desenvolvimento:

```bash
npm run dev
```

O servidor será iniciado normalmente em:

```text
http://localhost:3000
```

A API principal fica disponível em `http://localhost:3000` e o frontend de demonstração em:

```text
http://localhost:3000/demo/
```

A pasta `public/demo` contém uma interface simples para testar a criação de cobrança Pix, visualizar o QR Code e acompanhar o status em tempo real.

## Endpoints

### 1) POST /payments/pix

Objetivo: criar uma cobrança Pix.

Body esperado:

```json
{
  "amount": 25.5
}
```

Exemplo de requisição:

```bash
curl -X POST http://localhost:3000/payments/pix \
  -H "Content-Type: application/json" \
  -d '{"amount": 25.5}'
```

Exemplo de resposta:

```json
{
  "id": "d6c0d9aa-9de5-4d5d-9a24-4a7d0f252d3b",
  "amount": 25.5,
  "status": "PENDING",
  "pixCode": "000201...",
  "providerReference": "qr_123",
  "qrCode": "data:image/png;base64,..."
}
```

Possíveis códigos HTTP:

- `201`: pagamento criado com sucesso
- `400`: payload inválido
- `500`: erro interno ao criar o pagamento

### 2) POST /webhooks/payment

Objetivo: processar o webhook do provedor de pagamento.

O payload depende do provedor, mas o código atual entende o formato do Asaas e também suporta um payload fake.

Exemplo de requisição (payload de webhook Asaas):

```json
{
  "id": "evt_123",
  "event": "PAYMENT_RECEIVED",
  "payment": {
    "id": "pay_456",
    "status": "PAID",
    "pixQrCodeId": "qr_789"
  }
}
```

Possíveis códigos HTTP:

- `200`: webhook processado com sucesso
- `400`: payload inválido
- `404`: pagamento não encontrado
- `409`: transição de status inválida
- `500`: erro interno

A API atual expõe apenas os endpoints necessários ao fluxo real de pagamento e webhook. Rotas de teste internas foram removidas para manter a superfície da aplicação consistente com a execução real do sistema.

## WebSocket / Socket.IO

O frontend da demo se conecta ao Socket.IO no servidor principal.

### URL utilizada

```text
http://localhost:3000/socket.io/socket.io.js
```

### Eventos implementados

#### `payment.subscribe`

```js
socket.emit("payment.subscribe", {
  paymentId,
});
```

O servidor faz `socket.join("payment:<paymentId>")` para agrupar clientes por cobrança.

#### `payment.subscribed`

```js
socket.on("payment.subscribed", (data) => {
  console.log(data);
});
```

#### `payment.status.updated`

```js
socket.on("payment.status.updated", (data) => {
  console.log(data);
});
```

A estrutura da mensagem de atualização é algo como:

```json
{
  "paymentId": "d6c0d9aa-9de5-4d5d-9a24-4a7d0f252d3b",
  "status": "PAID"
}
```

### Rooms

As rooms são montadas no formato:

```text
payment:<paymentId>
```

Esse padrão permite que o backend notifique apenas os clientes ligados à cobrança específica.

## Testes

Os comandos reais do projeto são:

```bash
npm test
```

Executa a suíte de testes em modo interativo.

```bash
npm run test:run
```

Executa a suíte em modo não interativo.

```bash
npm run test:coverage
```

Executa os testes com cobertura.

### Tipos de teste

- Testes unitários: validam regras de negócio, geração de Pix, QR Code, schemas, transição de status e integrações de provider.
- Testes de integração: validam fluxo real de criação de pagamento e webhook em ambiente de aplicação.

Alguns testes de integração ficam condicionados a variáveis como `RUN_ASAAS_TESTS=true`, então é importante verificar o ambiente antes de executar cenários reais.

## Demo

O frontend em `public/demo` é uma interface de demonstração do backend.

Fluxo da demo:

1. Informar o valor da cobrança.
2. Criar a cobrança via `POST /payments/pix`.
3. Receber o QR Code e o payload Pix.
4. Aguardar o pagamento.
5. O webhook do provedor muda o status.
6. O backend emite `payment.status.updated` via Socket.IO.
7. A interface atualiza de `PENDING` para `PAID`.

A demo é um utilitário de demonstração e validação do backend, não um produto completo de checkout.

## Segurança

Algumas boas práticas importantes para o projeto:

- Nunca commitar `.env`.
- Nunca expor API keys no frontend.
- Nunca manter credenciais em código-fonte ou logs.
- Validar webhooks no backend.
- Usar HTTPS/WSS em produção.
- Restringir acessos a rotas de desenvolvimento e simulação.
- Implementar autenticação e autorização antes de transformar o projeto em um sistema multiusuário.

## Limitações atuais

O projeto é funcional como demonstração e protótipo da camada de pagamentos, mas ainda possui algumas limitações honestas:

- Autenticação de usuários não implementada.
- Autorização por perfil/role não implementada.
- Idempotência de webhook ainda não evidente no código.
- Reconciliação financeira avançada não está no escopo atual.
- Ledger financeiro e contabilidade não estão modelados.
- Gestão de usuários e contas ainda não existe.
- Monitoramento e observabilidade ainda são limitados.
- Tratamento completo de reconexão do frontend com Socket.IO não foi implementado como mecanismo robusto.
- Segurança e proteção avançada de WebSocket não estão no escopo atual.

## Possíveis evoluções futuras

As evoluções abaixo estão relacionadas ao domínio de pagamentos e à integração desta API com o restante do ecossistema TrackPay, dependendo de requisitos técnicos, regulatórios e comerciais:

- Autenticação e autorização.
- Contas de usuários.
- Multi-tenant.
- Ledger financeiro.
- Reconciliação de transações.
- Idempotência de webhooks.
- Histórico detalhado de pagamentos.
- Associação explícita entre pagamentos e corridas do TrackPay.
- Criação de cobranças a partir do valor calculado por uma corrida.
- Estorno e cancelamento de cobranças.
- Expiração e gestão de cobranças.
- Suporte a mais PSPs.
- Abstração de provedores de pagamento.
- Dashboard administrativo.
- Observabilidade e métricas.
- Rate limiting e prevenção de abuso.
- Deploy em produção com infraestrutura adequada.
- CI/CD.

## Como testar um pagamento real

Para testar um pagamento real com o Asaas:

1. Configure as variáveis do `.env` com a sua API key e a chave Pix do ambiente desejado.
2. Configure `PAYMENT_PROVIDER=asaas`.
3. Inicie o backend com `npm run dev`.
4. Acesse `http://localhost:3000/demo/`.
5. Informe um valor e gere uma cobrança Pix.
6. Abra o QR Code e complete o pagamento usando outra carteira ou banco.
7. O Asaas envia o webhook para `POST /webhooks/payment`.
8. O TrackPay atualiza o registro do pagamento no banco.
9. O servidor emite `payment.status.updated` via Socket.IO.
10. A interface da demo mostra a mudança de `PENDING` para `PAID`.

> Testes reais podem envolver valores financeiros e ambiente de produção. Use valores pequenos e cuide cuidadosamente das credenciais e acessos.

## Contribuição

Para colaborar com o projeto:

```bash
git clone <url-do-repositorio>
cd trackpay-payments-api
git checkout -b minha-feature
# faça alterações
npm test
git add .
git commit -m "Descrição da mudança"
git push origin minha-feature
```

Depois, abra um Pull Request com uma descrição clara do que foi alterado e por quê.

## Licença

Nenhuma licença foi definida explicitamente no projeto no momento. Consulte o repositório para confirmar o status atual antes de usar o código em produção ou em um ambiente compartilhado.

## Relação com o projeto TrackPay

Este repositório não representa o TrackPay completo. Ele representa a **API de pagamentos do TrackPay**.

O aplicativo principal do motorista será responsável por recursos como:

- Registro e acompanhamento de corridas.
- Coleta e processamento de localização.
- Cálculo de distância percorrida.
- Histórico de rotas.
- Controle de consumo.
- Planejamento e histórico de manutenções.
- Controle de gastos do veículo.
- Organização financeira.
- Integração com a Payments API quando uma corrida precisar gerar uma cobrança.

A Payments API deve permanecer focada em responsabilidades próprias do domínio de pagamentos, evitando transformar este serviço em um backend monolítico com todas as funcionalidades do produto.

## Observações importantes

- Este README reflete o código atual e os arquivos realmente presentes no projeto.
- Não foram inventados endpoints, variáveis, rotas ou comportamentos que não existam no código.
- O backend é a fonte principal de regra e persistência.
- O Socket.IO é usado como canal de atualização em tempo real e não substitui a validação do backend.
- O frontend de demonstração é simples e tem objetivo educacional e de teste.
- O projeto é adequado para estudo, prototipagem e demonstração de fluxo Pix, mas ainda não substitui um sistema financeiro completo de produção.

Se você quiser contribuir, testar localmente ou adaptar o fluxo para outro PSP, esta estrutura oferece um ponto de partida claro e documentado para o desenvolvimento.
