import { describe, it, expect, vi } from "vitest";
import { validateCreateUser, validateUpdateUser } from "../../validators/userValidator";
import type { Request, Response, NextFunction } from "express";

const mockResponse = {} as Response;
const mockNext = vi.fn();

describe("validateCreateUser", () => {
    it("should call next() when valid data is provided", () => {
        const req = {
            body: {
                name: "John Doe",
                email: "john@example.com",
                password: "password123",
            },
        } as Request;

        validateCreateUser(req, mockResponse, mockNext);

        expect(mockNext).toHaveBeenCalledWith();
    });

    it("should return 400 when name is missing", () => {
        const req = {
            body: { email: "john@example.com" },
        } as Request;

        validateCreateUser(req, mockResponse, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
            expect.objectContaining({
                message: "Name is required",
                statusCode: 400,
            })
        );
    });

    it("should return 400 when name is an empty string", () => {
        const req = {
            body: { name: "", email: "john@example.com" },
        } as Request;

        validateCreateUser(req, mockResponse, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
            expect.objectContaining({
                message: "Name is required",
                statusCode: 400,
            })
        );
    });

    it("should return 400 when name is not a string", () => {
        const req = {
            body: { name: 123, email: "john@example.com" },
        } as Request;

        validateCreateUser(req, mockResponse, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
            expect.objectContaining({
                message: "Name is required",
                statusCode: 400,
            })
        );
    });

    it("should return 400 when email is missing", () => {
        const req = {
            body: { name: "John Doe" },
        } as Request;

        validateCreateUser(req, mockResponse, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
            expect.objectContaining({
                message: "Valid email is required",
                statusCode: 400,
            })
        );
    });

    it("should return 400 when email is not a string", () => {
        const req = {
            body: { name: "John Doe", email: 123 },
        } as Request;

        validateCreateUser(req, mockResponse, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
            expect.objectContaining({
                message: "Valid email is required",
                statusCode: 400,
            })
        );
    });

    it("should return 400 when email is missing @ symbol", () => {
        const req = {
            body: { name: "John Doe", email: "notanemail" },
        } as Request;

        validateCreateUser(req, mockResponse, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
            expect.objectContaining({
                message: "Valid email is required",
                statusCode: 400,
            })
        );
    });
});

describe("validateUpdateUser", () => {
    it("should call next() when body has fields", () => {
        const req = {
            body: { name: "New Name" },
        } as Request;

        validateUpdateUser(req, mockResponse, mockNext);

        expect(mockNext).toHaveBeenCalledWith();
    });

    it("should return 400 when body has no fields", () => {
        const req = {
            body: {},
        } as Request;

        validateUpdateUser(req, mockResponse, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
            expect.objectContaining({
                message: "No fields to update",
                statusCode: 400,
            })
        );
    });
});
