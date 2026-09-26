# Migração do TrackPay para Pix QR Code estático

Este arquivo consolida as alterações realizadas para remover o modelo antigo de `payer` e migrar o projeto para o fluxo de QR Code Pix estático do Asaas.

## 1) Contrato do domínio

### Arquivo: src/types/payment.types.ts

```ts
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

export interface CreatePayment {
  id: string;
  amount: number;
  status: PaymentStatus;
  pixCode: string;
  providerQrCodeId: string;
}

export interface Payment extends CreatePayment {
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentData {
  amount: number;
}

export interface PaymentWebhookData {
  providerQrCodeId: string;
  status: PaymentStatus;
}
```

### O que mudou

- Removeu completamente o domínio `payer`
- Removeu `providerPaymentId` do domínio
- Introduziu `providerQrCodeId` como identificador do QR Code estático gerado pelo provedor

---

## 2) Validação do schema de criação

### Arquivo: src/schemas/payment.schema.ts

```ts
export const createPaymentSchema = z
  .object({
    amount: z.number().min(1, "Amount must be at least R$ 1.00"),
  })
  .strict();
```

### O que mudou

- Aceita somente `{ amount: number }`
- Mantém a regra de valor mínimo de R$ 1,00
- Removeu qualquer validação de payer
- Mantém o payload estritamente controlado por Zod

---

## 3) Interface do PaymentProvider

### Arquivo: src/providers/payment.provider.ts

```ts
export interface PaymentProvider {
  createPayment(data: CreatePaymentData): Promise<{
    providerQrCodeId: string;
    pixCode: string;
  }>;
}
```

### O que mudou

- O contrato agora passou a receber apenas `amount`
- O retorno passou a usar `providerQrCodeId` em vez de `providerPaymentId`
- Mantém a abstração do provider sem regras específicas do Asaas

---

## 4) Fluxo de criação do pagamento

### Arquivo: src/services/payment.service.ts

```ts
export async function createPixPayment(data: CreatePaymentData) {
  const paymentId = crypto.randomUUID();

  const providerPayment = await paymentProvider.createPayment({
    amount: data.amount,
  });

  const paymentData: CreatePayment = {
    id: paymentId,
    amount: data.amount,
    status: "PENDING",
    pixCode: providerPayment.pixCode,
    providerQrCodeId: providerPayment.providerQrCodeId,
  };

  await paymentRepository.createPayment(paymentData);

  const qrCode = await generateQRCode(providerPayment.pixCode);

  return {
    ...paymentData,
    qrCode,
  };
}
```

### O que mudou

- Geração do `paymentId` continua com `crypto.randomUUID()`
- Status inicial continua `PENDING`
- Persistência continua no repository
- Geração do QR Code serializado e retornado ao cliente
- Provider recebe somente `{ amount }`

---

## 5) Provider Asaas migrado para QR Code Pix estático

### Arquivo: src/providers/asaas-payment.provider.ts

```ts
export class AsaasPaymentProvider implements PaymentProvider {
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly pixKey: string;

  constructor() {
    const apiUrl = process.env.ASAAS_API_URL;
    const apiKey = process.env.ASAAS_API_KEY;
    const pixKey = process.env.PIX_KEY;

    if (!apiUrl) {
      throw new Error("ASAAS_API_URL is not defined");
    }

    if (!apiKey) {
      throw new Error("ASAAS_API_KEY is not defined");
    }

    if (!pixKey) {
      throw new Error("PIX_KEY is not defined");
    }

    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
    this.pixKey = pixKey;
  }

  async createPayment(data: CreatePaymentData) {
    const qrCode = await this.request<{
      id: string;
      payload: string;
    }>("/pix/qrCodes/static", {
      method: "POST",
      body: JSON.stringify({
        addressKey: this.pixKey,
        value: data.amount,
        format: "PAYLOAD",
        allowsMultiplePayments: false,
      }),
    });

    return {
      providerQrCodeId: qrCode.id,
      pixCode: qrCode.payload,
    };
  }
}
```

### O que mudou

- Removido o fluxo antigo de: customer → payment → Pix QR Code
- Não usa mais `/customers`
- Não usa mais `/payments`
- Não usa mais payer
- Usa o endpoint `/pix/qrCodes/static`
- Usa `PIX_KEY` do ambiente
- Mantém o padrão da request interna `request<T>()`

---

## 6) Alteração no banco e no repository

### Arquivo: database/schema.sql

```sql
CREATE TABLE IF NOT EXISTS payments (
    id CHAR(36) PRIMARY KEY,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    pix_code TEXT NOT NULL,
    provider_qr_code_id VARCHAR(100) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Arquivo: src/repositories/payment.repository.ts

```ts
export async function createPayment(payment: CreatePayment): Promise<void> {
  await db.execute(
    `
      INSERT INTO payments (
        id,
        provider_qr_code_id,
        amount,
        status,
        pix_code
      )
      VALUES (?, ?, ?, ?, ?)
    `,
    [
      payment.id,
      payment.providerQrCodeId,
      payment.amount,
      payment.status,
      payment.pixCode,
    ],
  );
}

export async function findPaymentByProviderQrCodeId(
  providerQrCodeId: string,
): Promise<Payment | null> {
  const [rows] = await db.execute(
    `
      SELECT
        id,
        amount,
        status,
        pix_code AS pixCode,
        provider_qr_code_id AS providerQrCodeId,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM payments
      WHERE provider_qr_code_id = ?
    `,
    [providerQrCodeId],
  );

  const payments = rows as Payment[];

  return payments[0] ?? null;
}
```

### O que mudou

- Renomeou a coluna de persistência para `provider_qr_code_id`
- Atualizou os SELECT/INSERT/lookup por identificador do QR Code estático
- Mantém a semântica correta para o novo fluxo

---

## 7) Webhook atualizado

### Arquivo: src/providers/asaas-webhook.provider.ts

```ts
export class AsaasWebhookProvider implements WebhookProvider {
  parseWebhook(data: unknown): PaymentWebhookData {
    const result = asaasWebhookSchema.safeParse(data);

    if (!result.success) {
      throw new Error("Invalid webhook payload");
    }

    const payment = result.data.payment;
    const providerQrCodeId =
      payment.qrCodeId ?? payment.pixQrCode?.id ?? payment.id;

    if (
      result.data.event === "PAYMENT_RECEIVED" &&
      payment.status === "RECEIVED" &&
      providerQrCodeId
    ) {
      return {
        providerQrCodeId,
        status: "PAID",
      };
    }

    throw new Error("Unsupported webhook event");
  }
}
```

### Arquivo: src/services/webhook.service.ts

```ts
export async function processPaymentWebhook(data: PaymentWebhookData) {
  const payment = await paymentRepository.findPaymentByProviderQrCodeId(
    data.providerQrCodeId,
  );

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (!canTransitionPaymentStatus(payment.status, data.status)) {
    throw new Error("Invalid payment status transition");
  }

  await paymentRepository.updatePaymentStatus(payment.id, data.status);
}
```

### O que mudou

- O webhook não mais procura por `providerPaymentId`
- Busca o pagamento pelo `providerQrCodeId`
- Mantém a abstração do webhook dentro do provider e não espalha regra do Asaas no service

---

## 8) Variável de ambiente Pix

### Arquivo: .env.example

```env
PIX_KEY=
PIX_NAME=
PIX_CITY=
```

### O que mudou

- Mantém a chave Pix no ambiente sem expor valor real
- Reaproveita a variável existente do projeto em vez de duplicar

---

## 9) Fake provider ajustado

### Arquivo: src/providers/fake-payment.provider.ts

```ts
export class FakePaymentProvider implements PaymentProvider {
  async createPayment(data: CreatePaymentData) {
    const providerQrCodeId = crypto.randomUUID();

    const pixCode = generatePixCode({
      amount: data.amount,
    });

    return {
      providerQrCodeId,
      pixCode,
    };
  }
}
```

### O que mudou

- Removeu qualquer uso de payer
- Usa novo identificador do QR Code no retorno
- Mantém o fake provider consistente com o contrato novo

---

## 10) Arquivos ajustados em conjunto

- src/types/payment.types.ts
- src/schemas/payment.schema.ts
- src/providers/payment.provider.ts
- src/services/payment.service.ts
- src/providers/asaas-payment.provider.ts
- src/providers/mercado-pago.provider.ts
- src/providers/fake-payment.provider.ts
- src/repositories/payment.repository.ts
- src/providers/webhook.provider.ts
- src/providers/asaas-webhook.provider.ts
- src/providers/fake-webhook.provider.ts
- src/services/webhook.service.ts
- src/schemas/webhook.schema.ts
- database/schema.sql
- database/migrations/001_add_provider_payment_id.sql
- .env.example
- testes relacionados em src/providers/, src/services/, src/tests/, src/schemas/, src/repositories/

---

## 11) Resultado esperado

O fluxo final passou a ser:

```text
POST /payments/pix
{
  "amount": 50
}

→ TrackPay gera paymentId
→ PaymentProvider cria QR Code Pix estático
→ salva providerQrCodeId + pixCode
→ retorna QR Code para o cliente
→ webhook do Asaas é mapeado para o QR Code estático
→ status atualiza PENDING → PAID
```

---

## 12) Validação executada

Comando executado:

```bash
cd c:/Users/Luis/projetos/trackpay ; npx vitest run src/schemas/payment.schema.test.ts src/providers/asaas-payment.provider.test.ts src/providers/asaas-webhook.provider.test.ts src/providers/fake-payment.provider.test.ts src/providers/mercado-pago.provider.test.ts src/services/payment.service.test.ts
```

Resultado observado:

- 6 arquivos passaram
- 29 testes passaram
- 0 falhas na execução do novo contrato

> A validação completa de integração com banco depende de um ambiente MySQL acessível localmente, e não foi possível validar esta parte no container atual porque o cliente `mysql` não está instalado no ambiente executado.
