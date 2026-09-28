const form = document.querySelector("#payment-form");
const amountInput = document.querySelector("#amount");
const statusBox = document.querySelector("#status-box");
const statusLabel = document.querySelector("#status-label");
const emptyState = document.querySelector("#empty-state");
const paymentResult = document.querySelector("#payment-result");
const submitButton = document.querySelector("#submit-button");
const paymentAmount = document.querySelector("#payment-amount");
const paymentId = document.querySelector("#payment-id");
const qrImage = document.querySelector("#qr-image");
const pixCode = document.querySelector("#pix-code");
const paymentStatus = document.querySelector("#payment-status");
const copyButton = document.querySelector("#copy-button");
const resetButton = document.querySelector("#reset-button");

const state = {
  socket: null,
  paymentId: null,
};

function setStatus(message, variant = "idle") {
  statusBox.className = `status-box ${variant}`;
  statusLabel.textContent = message;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));
}

function normalizeStatus(value) {
  const statusMap = {
    PENDING: { label: "Pendente", className: "pending" },
    PAID: { label: "Pago", className: "success" },
    EXPIRED: { label: "Expirado", className: "expired" },
    CANCELLED: { label: "Cancelado", className: "cancelled" },
  };

  return statusMap[value] || { label: "Pendente", className: "pending" };
}

function updatePaymentStatusBadge(status) {
  const normalized = normalizeStatus(status);
  paymentStatus.textContent = normalized.label;
  paymentStatus.className = `status-pill ${normalized.className}`;
}

function clearPaymentResult() {
  paymentResult.classList.add("hidden");
  emptyState.classList.remove("hidden");
  paymentId.textContent = "-";
  paymentAmount.textContent = "R$ 0,00";
  qrImage.src = "";
  pixCode.textContent = "-";
  paymentStatus.textContent = "Pendente";
  paymentStatus.className = "status-pill pending";
  submitButton.disabled = false;
  submitButton.textContent = "Gerar cobrança";
  state.paymentId = null;
}

function renderPayment(data) {
  const amount = Number(data.amount || 0);
  const normalized = normalizeStatus(data.status || "PENDING");

  emptyState.classList.add("hidden");
  paymentResult.classList.remove("hidden");
  paymentAmount.textContent = formatCurrency(amount);
  paymentId.textContent = data.id;
  qrImage.src = data.qrCode;
  pixCode.textContent = data.pixCode;
  updatePaymentStatusBadge(data.status || "PENDING");
  submitButton.disabled = true;
  submitButton.textContent = "Aguardando pagamento";

  if (data.status === "PAID") {
    setStatus("Pagamento confirmado", "success");
  } else if (data.status === "PENDING") {
    setStatus("Aguardando pagamento", "warning");
  } else {
    setStatus(normalized.label, "error");
  }
}

function connectSocket() {
  if (state.socket) {
    return state.socket;
  }

  const socket = io("http://localhost:3000");

  socket.on("connect", () => {
    if (state.paymentId) {
      socket.emit("payment.subscribe", { paymentId: state.paymentId });
    }
  });

  socket.on("payment.subscribed", ({ paymentId: subscribedId }) => {
    if (subscribedId === state.paymentId) {
      setStatus("Aguardando pagamento", "warning");
    }
  });

  socket.on("payment.status.updated", (event) => {
    if (!state.paymentId || event.paymentId !== state.paymentId) {
      return;
    }

    updatePaymentStatusBadge(event.status);

    if (event.status === "PAID") {
      setStatus("Pagamento confirmado", "success");
      return;
    }

    setStatus(
      `Status atualizado: ${normalizeStatus(event.status).label}`,
      "warning",
    );
  });

  state.socket = socket;
  return socket;
}

async function createPayment(event) {
  event.preventDefault();

  if (state.paymentId) {
    setStatus("Aguardando pagamento", "warning");
    return;
  }

  const amount = Number(amountInput.value);

  if (!amount || amount <= 0) {
    setStatus("Informe um valor válido", "error");
    amountInput.focus();
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Gerando...";
  setStatus("Enviando cobrança...", "warning");

  try {
    const response = await fetch("/payments/pix", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Não foi possível criar o pagamento.");
    }

    state.paymentId = data.id;

    const socket = connectSocket();

    if (socket.connected) {
      socket.emit("payment.subscribe", { paymentId: state.paymentId });
    }

    renderPayment(data);
  } catch (error) {
    console.error(error);
    setStatus(error.message || "Erro ao criar o pagamento", "error");
    state.paymentId = null;
    submitButton.disabled = false;
    submitButton.textContent = "Gerar cobrança";
  }
}

async function copyPixCode() {
  const text = pixCode.textContent.trim();

  if (!text || text === "-") {
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    const previousText = copyButton.textContent;
    copyButton.textContent = "Copiado!";

    window.setTimeout(() => {
      copyButton.textContent = previousText;
    }, 1200);
  } catch (error) {
    console.error(error);
    setStatus("Não foi possível copiar o código Pix", "error");
  }
}

form.addEventListener("submit", createPayment);
copyButton.addEventListener("click", copyPixCode);
resetButton.addEventListener("click", () => {
  form.reset();
  amountInput.value = "25.00";
  clearPaymentResult();
  setStatus("Aguardando ação", "idle");
});

setStatus("Aguardando ação", "idle");
