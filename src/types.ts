export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface CosplayItem {
  name: string
  content: string
}
