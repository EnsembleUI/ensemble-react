import axios, { AxiosError } from 'axios';
import { get } from 'lodash-es';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const TEMP_TOKEN_FILE = path.join(os.homedir(), '.ensemble_token.json');
export const WEB_API_KEY = 'AIzaSyC-YeNdc9IRMQpuxxVB27UkUIv9KcfpRVg';

export async function signInWithEmailPassword(email: string, password: string): Promise<string> {
  const signInUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${WEB_API_KEY}`;

  try {
    const response = await axios.post(signInUrl, {
      email,
      password,
      returnSecureToken: true,
    });

    const { idToken, refreshToken } = response.data;

    // Store the ID token and refresh token in a temporary file
    const tokenData = {
      idToken,
      refreshToken,
      timestamp: new Date().toISOString(),
    };

    storeTokenFile(tokenData);

    return idToken;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw new Error(`Login failed: ${get(axiosError.response?.data, "error.message") || axiosError.message}`);
  }
}

export function getStoredToken(): null | string {
  if (fs.existsSync(TEMP_TOKEN_FILE)) {
    const tokenData = JSON.parse(fs.readFileSync(TEMP_TOKEN_FILE, 'utf8'));
    return tokenData?.idToken || null;
  }

  return null;
}

export function storeTokenFile(tokenData: unknown): void {
  fs.writeFileSync(TEMP_TOKEN_FILE, JSON.stringify(tokenData));
}