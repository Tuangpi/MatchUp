import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card, CardHeader, CardContent } from "../../components/ui/Card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card>Content</Card>);
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("applies default classes", () => {
    render(<Card>Content</Card>);
    const card = screen.getByText("Content");
    expect(card.className).toContain("rounded-xl");
    expect(card.className).toContain("border");
    expect(card.className).toContain("shadow-sm");
  });

  it("applies additional className", () => {
    render(<Card className="custom-class">Content</Card>);
    expect(screen.getByText("Content").className).toContain("custom-class");
  });
});

describe("CardHeader", () => {
  it("renders children", () => {
    render(<CardHeader>Header</CardHeader>);
    expect(screen.getByText("Header")).toBeInTheDocument();
  });

  it("applies border class", () => {
    render(<CardHeader>Header</CardHeader>);
    expect(screen.getByText("Header").className).toContain("border-b");
  });
});

describe("CardContent", () => {
  it("renders children", () => {
    render(<CardContent>Body</CardContent>);
    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  it("applies padding classes", () => {
    render(<CardContent>Body</CardContent>);
    expect(screen.getByText("Body").className).toContain("px-5 py-4");
  });
});
