import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import AdminDashboard from "../pages/AdminDashboard";
import TechnicianHistory from "../pages/TechnicianHistory";
import TechnicianDetail from "../pages/TechnicianDetail";
import SpareParts from "../pages/SpareParts";

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

  it("renders /admin/spare-parts standalone without crashing", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/admin/spare-parts"]}>
        <Routes>
          <Route path="/admin/spare-parts" element={<SpareParts />} />
          <Route path="/spare-parts" element={<SpareParts />} />
        </Routes>
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  });

  it("renders /spare-parts standalone without crashing", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/spare-parts"]}>
        <Routes>
          <Route path="/admin/spare-parts" element={<SpareParts />} />
          <Route path="/spare-parts" element={<SpareParts />} />
        </Routes>
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  });

  it("renders /admin/checksheet with Admin sidebar without crashing", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/admin/checksheet"]}>
        <Routes>
          <Route path="/admin/checksheet" element={<AdminDashboard />} />
          <Route path="/checksheet" element={<AdminDashboard />} />
        </Routes>
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  });

  it("renders /checksheet with Admin sidebar without crashing", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/checksheet"]}>
        <Routes>
          <Route path="/admin/checksheet" element={<AdminDashboard />} />
          <Route path="/checksheet" element={<AdminDashboard />} />
        </Routes>
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  });
});
