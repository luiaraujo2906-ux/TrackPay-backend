import {
  generateStaticBrCode,
  projectReceiverName,
  projectCity,
} from "@thiagoprazeres/pix-static-brcode";

interface GeneratePixData {
  amount: number;
}

export function generatePixCode(data: GeneratePixData): string {
  const pixKey = process.env.PIX_KEY;

  const receiverName = process.env.PIX_NAME;
  const receiverCity = process.env.PIX_CITY;

  if (!pixKey) {
    throw new Error("PIX_KEY is not configured");
  }

  if (!receiverName) {
    throw new Error("PIX_NAME is not configured");
  }

  if (!receiverCity) {
    throw new Error("PIX_CITY is not configured");
  }

  return generateStaticBrCode({
    pixKey,

    receiverName: projectReceiverName(receiverName),

    receiverCity: projectCity(receiverCity),

    referenceLabel: "***",

    amount: data.amount,
  });
}
