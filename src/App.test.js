import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders EUTR brand", () => {
  render(<App />);
  const brand = screen.getByText(/EUTR/i);
  expect(brand).toBeInTheDocument();
});
