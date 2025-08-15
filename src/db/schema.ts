export type GameStatus =
  | "backlog"
  | "playing"
  | "completed"
  | "dropped"
  | "on_hold";

export interface Game {
  id: number;
  title: string;
  platform: string | null;
  status: GameStatus;
  rating: number | null;
  hours: number;
  notes: string | null;
  release_year: number | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  deleted: 0 | 1;
  genre?: string | null;
}

export interface GameSession {
  id: number;
  game_id: number;
  minutes: number;
  note: string | null;
  played_at: string;
  created_at: string;
}
