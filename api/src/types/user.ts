import type { $Enums } from "../lib/generated/prisma/client";

export interface CreateUserInput {
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    positions?: $Enums.Position[];
}

export interface UpdateUserInput {
    name?: string;
    phone?: string;
    avatar?: string;
    rating?: number;
    positions?: $Enums.Position[];
}

export interface UserResponse {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    avatar: string | null;
    rating: number;
    positions: $Enums.Position[];
    createdAt: Date;
}
