import { BaseMessagePanelType } from './BaseMessagePanelType';

/**
 * Custom type declaration representing a message for panel.
 */
export type MessagePanelType = {
  content?: string;
} & BaseMessagePanelType;
