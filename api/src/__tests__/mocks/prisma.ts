import { vi } from "vitest";

// Create a mock prisma client that can be used across tests
const createMockPrisma = () => {
    const mockModel = () => ({
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        deleteMany: vi.fn(),
        count: vi.fn(),
        upsert: vi.fn(),
    });

    const mockPrisma = {
        user: mockModel(),
        game: mockModel(),
        gameParticipant: mockModel(),
        message: mockModel(),
        refreshToken: mockModel(),
        $transaction: vi.fn((queries: any[]) => Promise.all(queries)),
    };

    return mockPrisma;
};

export const mockPrisma = createMockPrisma();

// Helper to setup mock before each test
export const setupPrismaMock = () => {
    vi.resetAllMocks();
    // Reset all mock functions
    Object.values(mockPrisma).forEach((model) => {
        if (typeof model === "object" && model !== null) {
            Object.values(model as Record<string, any>).forEach((fn) => {
                if (vi.isMockFunction(fn)) fn.mockReset();
            });
        }
    });
    if (vi.isMockFunction(mockPrisma.$transaction)) {
        mockPrisma.$transaction.mockReset();
    }
};
