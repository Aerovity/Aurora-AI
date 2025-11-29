export interface Node {
  id: string
  label: string
  type: "agent" | "llm"
  x: number
  y: number
  state: "idle" | "thinking"
}

export interface Edge {
  id: string
  from: string
  to: string
}

export interface Message {
  id: string
  from: string
  to: string
  progress: number
}
