/**
 * Contrato base para conectar Tati con un proveedor de IA (p.ej. OpenAI)
 * en una siguiente iteración.
 */
export interface AiProvider {
  summarizeConversation(conversationId: string): Promise<string>;
  suggestReply(conversationId: string): Promise<string>;
}

export const aiProvider: AiProvider | null = null;
