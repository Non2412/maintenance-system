import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import AdminDashboard from "../pages/AdminDashboard";
import TechnicianHistory from "../pages/TechnicianHistory";
import TechnicianDetail from "../pages/TechnicianDetail";

describe("Admin routes rendering", () => {
  it("renders /admin/technician-history without crashing", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/admin/technician-history"]}>
        <Routes>
          <Route path="/admin/technician-history" element={<AdminDashboard defaultTab="technician-history" />} />
          <Route path="/admin/technician/:id" element={<AdminDashboard />} />
        </Routes>
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  });

  it("renders /admin/technician/TECH001 without crashing", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/admin/technician/TECH001"]}>
        <Routes>
          <Route path="/admin/technician-history" element={<AdminDashboard defaultTab="technician-history" />} />
          <Route path="/admin/technician/:id" element={<AdminDashboard />} />
        </Routes>
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  });

  it("renders TechnicianHistory standalone without crashing", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/"]}>
        <TechnicianHistory />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  });

  it("renders TechnicianDetail standalone without crashing", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/admin/technician/TECH001"]}>
        <Routes>
          <Route path="/admin/technician/:id" element={<TechnicianDetail />} />
        </Routes>
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  });
});
