import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { I18nProvider, useI18n } from "@/contexts/I18nContext";

const TestComponent = () => {
  const { t, toggleLocale, locale } = useI18n();
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="translated">{t("app.name")}</span>
      <button data-testid="toggle" onClick={toggleLocale}>
        Toggle
      </button>
    </div>
  );
};

describe("I18nContext", () => {
  it("provides English translations by default", () => {
    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );
    expect(screen.getByTestId("locale")).toHaveTextContent("en");
    expect(screen.getByTestId("translated")).toHaveTextContent("EcoMind AI");
  });

  it("toggles to Hindi and back", () => {
    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );
    fireEvent.click(screen.getByTestId("toggle"));
    expect(screen.getByTestId("locale")).toHaveTextContent("hi");
    expect(screen.getByTestId("translated")).toHaveTextContent("इकोमाइंड AI");
    fireEvent.click(screen.getByTestId("toggle"));
    expect(screen.getByTestId("locale")).toHaveTextContent("en");
  });
});
