import { GameStatus } from "../../src/db/schema";

export const CURRENT_TIMESTAMP = "2025-08-15 02:29:56";
export const CURRENT_USER = "Thiago";

export const statusDisplayMap: Record<GameStatus, string> = {
  backlog: "Na Fila",
  playing: "Jogando",
  completed: "Concluído",
};
