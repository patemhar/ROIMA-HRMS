import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  exp: number;
  sub: string;
  email?: string;
  role?: string;
}

export function decodeToken(token: string): JwtPayload | null {
    try {
        return jwtDecode<JwtPayload>(token);
    } catch (error) {
        console.error("Failed to decode JWT:", error);
        return null;
    }
}

export function isTokenNearExpiryOrExpired(
    token: string,
    bufferMinutes = 1
) : boolean {

    const decoded = decodeToken(token);

    if(!decoded) return true;

    const now = Math.floor(Date.now() / 1000);

    const expiresIn = decoded.exp - now;

    const bufferSeconds = bufferMinutes * 60;

    return expiresIn <= bufferSeconds;
}