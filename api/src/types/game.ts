import type { $Enums } from "../lib/generated/prisma/client";

export interface CreateGameInput {
    title: string;
    location: string;
    dateTime: string; // ISO string
    maxPlayers?: number;
    teamAPlayers?: number;
    teamBPlayers?: number;
    pricePerHead?: number;
    notes?: string;
}

export interface UpdateGameInput {
    title?: string;
    location?: string;
    dateTime?: string;
    maxPlayers?: number;
    teamAPlayers?: number;
    teamBPlayers?: number;
    pricePerHead?: number;
    status?: $Enums.GameStatus;
    notes?: string;
}

export interface JoinGameInput {
    team: $Enums.TeamSide;
}
