import crypto from "crypto";

export function generateApiKey(): string {
  return `extr_live_${crypto.randomBytes(24).toString("base64url")}`;
}
