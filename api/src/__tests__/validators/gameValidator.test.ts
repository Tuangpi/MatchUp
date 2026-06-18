import { describe, it, expect, vi } from "vitest";
import { validateCreateGame, validateJoinGame } from "../../validators/gameValidator";
import type { Request, Response, NextFunction } from "express";

const mockResponse = {} as Response;
const mockNext = vi.fn();

describe("validateCreateGame", () => {
    it("should call next() when valid data is provided", () => {
        const req = {
            body: {
                title: "Futsal Match",
                location: "Sports Complex",
                dateTime: "2026-07-01T18:00:00Z",
            },
        } as Request;

        validateCreateGame(req, mockResponse, mockNext);

        expect(mockNext).toHaveBeenCalledWith();
    });

    it("should return 400 when title is missing", () => {
        const req = {
            body: {
                location: "Sports Complex",
                dateTime: "2026-07-01T18:00:00Z",
            },
        } as Request;

        validateCreateGame(req, mockResponse, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
            expect.objectContaining({
                message: "Title is required",
                statusCode: 400,
            })
        );
    });

    it("should return 400 when title is an empty string", () => {
        const req = {
            body: {
                title: "",
                location: "Sports Complex",
                dateTime: "2026-07-01T18:00:00Z",
            },
        } as Request;

        validateCreateGame(req, mockResponse, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
            expect.objectContaining({
                message: "Title is required",
                statusCode: 400,
            })
        );
    });

    it("should return 400 when title is not a string", () => {
        const req = {
            body: {
                title: 123,
                location: "Sports Complex",
                dateTime: "2026-07-01T18:00:00Z",
            },
        } as Request;

        validateCreateGame(req, mockResponse, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
            expect.objectContaining({
                message: "Title is required",
                statusCode: 400,
            })
        );
    });

    it("should return 400 when location is missing", () => {
        const req = {
            body: {
                title: "Futsal Match",
                dateTime: "2026-07-01T18:00:00Z",
            },
        } as Request;

        validateCreateGame(req, mockResponse, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
            expect.objectContaining({
                message: "Location is required",
                statusCode: 400,
            })
        );
    });

    it("should return 400 when dateTime is missing", () => {
        const req = {
            body: {
                title: "Futsal Match",
                location: "Sports Complex",
            },
        } as Request;

        validateCreateGame(req, mockResponse, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
            expect.objectContaining({
                message: "Valid dateTime is required (ISO string)",
                statusCode: 400,
            })
        );
    });

    it("should return 400 when dateTime is not a valid date string", () => {
        const req = {
            body: {
                title: "Futsal Match",
                location: "Sports Complex",
                dateTime: "not-a-date",
            },
        } as Request;

        validateCreateGame(req, mockResponse, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
            expect.objectContaining({
                message: "Valid dateTime is required (ISO string)",
                statusCode: 400,
            })
        );
    });
});

describe("validateJoinGame", () => {
    it("should call next() when team is TEAM_A", () => {
        const req = { body: { team: "TEAM_A" } } as Request;

        validateJoinGame(req, mockResponse, mockNext);

        expect(mockNext).toHaveBeenCalledWith();
    });

    it("should call next() when team is TEAM_B", () => {
        const req = { body: { team: "TEAM_B" } } as Request;

        validateJoinGame(req, mockResponse, mockNext);

        expect(mockNext).toHaveBeenCalledWith();
    });

    it("should return 400 when team is missing", () => {
        const req = { body: {} } as Request;

        validateJoinGame(req, mockResponse, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
            expect.objectContaining({
                message: "Team must be TEAM_A or TEAM_B",
                statusCode: 400,
            })
        );
    });

    it("should return 400 when team is invalid", () => {
        const req = { body: { team: "TEAM_C" } } as Request;

        validateJoinGame(req, mockResponse, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
            expect.objectContaining({
                message: "Team must be TEAM_A or TEAM_B",
                statusCode: 400,
            })
        );
    });
});
