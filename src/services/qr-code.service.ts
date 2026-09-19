import QRCode from "qrcode";

export async function generateQRCode(payload: string): Promise<string> {
  return QRCode.toDataURL(payload);
}
