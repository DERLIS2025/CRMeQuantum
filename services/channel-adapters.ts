/**
 * Punto de extensión para futuras integraciones (Meta, WhatsApp, Instagram, Messenger).
 * En el MVP inicial solo dejamos contrato y estructura de trabajo.
 */
export interface ChannelAdapter {
  sendMessage(conversationId: string, text: string): Promise<void>;
}

export const channelAdaptersRegistry: Record<string, ChannelAdapter> = {};
