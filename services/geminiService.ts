import { InvestigationRecord, EvidenceItem, ChatMessage } from "../types";

export const runMultimodalInvestigation = async (
  title: string,
  description: string,
  evidences: EvidenceItem[]
): Promise<InvestigationRecord> => {
  const response = await fetch("/api/investigate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description, evidences }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Multimodal investigation failed.");
  }

  return response.json();
};

export const askAIInvestigator = async (
  history: ChatMessage[],
  message: string,
  investigationContext?: InvestigationRecord,
  mode: 'general' | 'deep' | 'fast' = 'general'
): Promise<{ text: string; modelUsed?: string; citations?: any[] }> => {
  const response = await fetch("/api/investigator-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ history, message, mode, investigationContext }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Failed to communicate with AI Investigator.");
  }

  return response.json();
};

export const fetchThreatIntelligence = async () => {
  const response = await fetch("/api/threat-intelligence");
  if (!response.ok) {
    throw new Error("Failed to fetch threat intelligence data.");
  }
  return response.json();
};

export const fetchDemoCases = async (): Promise<InvestigationRecord[]> => {
  const response = await fetch("/api/demo-cases");
  if (!response.ok) {
    throw new Error("Failed to fetch demo cases.");
  }
  return response.json();
};

export const findNearbyOffices = async (lat?: number | null, lng?: number | null, locationQuery?: string) => {
  const response = await fetch("/api/nearby-offices", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lat, lng, locationQuery }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Failed to locate nearby offices.");
  }

  return response.json();
};
