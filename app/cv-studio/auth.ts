import { getChatGPTUser } from "../chatgpt-auth";

export const CV_STUDIO_EMAIL = "chalifjacob@gmail.com";

export async function requireCvStudioUser() {
  const user = await getChatGPTUser();
  if (!user || user.email.toLowerCase() !== CV_STUDIO_EMAIL) return null;
  return user;
}
