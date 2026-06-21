import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Slider } from "@/components/ui/slider";

describe("Slider", () => {
  it("renders with label and value", () => {
    render(
      <Slider
        label="Test Slider"
        displayValue="5 units"
        min={0}
        max={10}
        value={5}
        onChange={jest.fn()}
      />
    );
    expect(screen.getByText("Test Slider")).toBeInTheDocument();
    expect(screen.getByText("5 units")).toBeInTheDocument();
  });

  it("has correct ARIA attributes", () => {
    render(
      <Slider
        label="ARIA Slider"
        min={0}
        max={100}
        value={50}
        onChange={jest.fn()}
      />
    );
    const input = screen.getByRole("slider");
    expect(input).toHaveAttribute("aria-valuemin", "0");
    expect(input).toHaveAttribute("aria-valuemax", "100");
    expect(input).toHaveAttribute("aria-valuenow", "50");
  });

  it("calls onChange when value changes", () => {
    const handleChange = jest.fn();
    render(
      <Slider
        label="Change Test"
        min={0}
        max={10}
        value={5}
        onChange={handleChange}
      />
    );
    const input = screen.getByRole("slider");
    fireEvent.change(input, { target: { value: "7" } });
    expect(handleChange).toHaveBeenCalledWith(7);
  });
});
