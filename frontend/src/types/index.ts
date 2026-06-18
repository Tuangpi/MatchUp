export type GameStatus = "OPEN" | "FULL" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type TeamSide = "TEAM_A" | "TEAM_B";
export type Position = "GOALKEEPER" | "DEFENDER" | "MIDFIELDER" | "FORWARD";
export type AttendanceStatus = "JOINED" | "PRESENT" | "ABSENT";

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    avatar: string | null;
    rating: number;
    positions: Position[];
    createdAt: string;
    hostedGames?: Game[];
    gameParticipations?: GameParticipation[];
}

export interface GameParticipation {
    id: string;
    team: TeamSide;
    game: Pick<Game, "id" | "title" | "dateTime" | "status">;
    user?: Pick<User, "id" | "name" | "avatar" | "rating">;
    userId: string;
    attendanceStatus: AttendanceStatus;
}

export interface Game {
    id: string;
    hostId: string;
    host: Pick<User, "id" | "name" | "avatar" | "rating">;
    title: string;
    location: string;
    dateTime: string;
    maxPlayers: number;
    teamAPlayers: number;
    teamBPlayers: number;
    pricePerHead: number;
    status: GameStatus;
    notes: string | null;
    createdAt: string;
    participants?: GameParticipation[];
}

export interface ApiResponse<T> {
    data: T;
}

export interface Message {
    id: string;
    gameId: string;
    userId: string;
    user: Pick<User, "id" | "name" | "avatar">;
    content: string;
    createdAt: string;
}
