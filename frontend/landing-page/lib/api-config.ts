/**
 * EcoVision AI Centralized API Configuration
 * Ensures calls always reach the live Render backend if local/env backend is unreachable.
 */

export const PRODUCTION_BACKEND_URL = "https://ecovision-intelligence-platform-backend.onrender.com";

export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || process.env.VITE_API_URL || "";
  
  // If no env is set, or if it points to localhost:8000 while user is using cloud deployment
  if (!envUrl || envUrl.includes("localhost:8000") || envUrl.includes("127.0.0.1:8000")) {
    return PRODUCTION_BACKEND_URL;
  }
  
  return envUrl.replace(/\/$/, "");
}

export const API_BASE = getApiBaseUrl();
