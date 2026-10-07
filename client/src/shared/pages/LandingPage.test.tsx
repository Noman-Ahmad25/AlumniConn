import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import LandingPage from "./LandingPage";
import * as collegeApi from "../../features/college/api/college";

describe("LandingPage", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        window.scrollTo = vi.fn();
        vi.spyOn(collegeApi, "getColleges").mockResolvedValue([
            {
                id: 1,
                name: "National Institute of Technology, Karnataka",
                slug: "nitk",
                domain: "nitk.edu.in",
                location: "Surathkal, Karnataka",
                established_year: 1960,
                description: "Premier technology institute.",
                is_approved: true,
                branding: null
            }
        ]);
    });

    it("renders hero, value, features, and how it works sections", async () => {
        render(
            <BrowserRouter>
                <LandingPage />
            </BrowserRouter>
        );

        expect(screen.getAllByText("AlumniConn").length).toBeGreaterThan(0);
        expect(screen.getByText(/The modern network for your/i)).toBeInTheDocument();
        expect(screen.getByText("Built to Solve the Lifelong Alumni Engagement Challenge")).toBeInTheDocument();
        expect(screen.getByText("Complete Platform Capabilities")).toBeInTheDocument();
        expect(screen.getByText("How AlumniConn Works")).toBeInTheDocument();

        // Wait for real university card from DB
        await waitFor(() => {
            expect(screen.getByText("National Institute of Technology, Karnataka")).toBeInTheDocument();
            expect(screen.getByText("Surathkal, Karnataka")).toBeInTheDocument();
        });

        // Check university CTA link points to /c/nitk
        const visitLink = screen.getByRole("link", { name: /Visit Campus Portal/i });
        expect(visitLink).toHaveAttribute("href", "/c/nitk");
    });

    it("toggles mobile menu when hamburger button is clicked", async () => {
        render(
            <BrowserRouter>
                <LandingPage />
            </BrowserRouter>
        );

        const toggleBtn = screen.getByLabelText("Toggle navigation menu");
        await act(async () => {
            fireEvent.click(toggleBtn);
        });

        // Mobile menu should display links
        const mobileLinks = screen.getAllByText("Why AlumniConn");
        expect(mobileLinks.length).toBeGreaterThan(0);
    });

    it("opens and closes information modal on legal footer button click", async () => {
        render(
            <BrowserRouter>
                <LandingPage />
            </BrowserRouter>
        );

        const privacyBtn = screen.getByRole("button", { name: "Privacy Policy" });
        await act(async () => {
            fireEvent.click(privacyBtn);
        });

        expect(screen.getByText(/AlumniConn strictly protects member data/i)).toBeInTheDocument();

        const closeBtn = screen.getByRole("button", { name: "Close" });
        await act(async () => {
            fireEvent.click(closeBtn);
        });

        expect(screen.queryByText(/AlumniConn strictly protects member data/i)).not.toBeInTheDocument();
    });
});

