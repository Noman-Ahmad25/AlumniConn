import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getColleges, type CollegeResponse } from "../../features/college/api/college";
import DemoAccountPicker from "../../features/auth/components/DemoAccountPicker";

export default function LandingPage() {
    const [colleges, setColleges] = useState<CollegeResponse[]>([]);
    const [loadingColleges, setLoadingColleges] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [infoModal, setInfoModal] = useState<{ title: string; content: string } | null>(null);

    useEffect(() => {
        let isMounted = true;
        const fetchCollegesList = async () => {
            try {
                const data = await getColleges(0, 50);
                if (isMounted) {
                    // Only show approved colleges on the public homepage
                    const approved = data.filter((c) => c.is_approved);
                    setColleges(approved);
                }
            } catch (err) {
                console.error("Failed to fetch colleges for homepage", err);
            } finally {
                if (isMounted) setLoadingColleges(false);
            }
        };

        fetchCollegesList();
        return () => {
            isMounted = false;
        };
    }, []);

    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        setMobileMenuOpen(false);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        } else if (id === "top") {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handleOpenModal = (title: string, content: string) => {
        setInfoModal({ title, content });
    };

    return (
        <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
            {/* Header Navigation */}
            <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-white/95 backdrop-blur-md transition-all">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">
                    {/* Brand Logo */}
                    <a
                        href="#top"
                        onClick={(e) => scrollToSection(e, "top")}
                        className="flex items-center gap-2.5 text-slate-900 transition-opacity hover:opacity-90"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/20">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m3 8.5 9-4 9 4-9 4-9-4Z" />
                                <path d="M7 11v4.5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V11" />
                                <path d="M21 8.5v5" />
                            </svg>
                        </div>
                        <span className="text-xl font-extrabold tracking-tight">AlumniConn</span>
                    </a>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
                        <a
                            href="#top"
                            onClick={(e) => scrollToSection(e, "top")}
                            className="hover:text-blue-600 transition-colors"
                        >
                            Home
                        </a>
                        <a
                            href="#value"
                            onClick={(e) => scrollToSection(e, "value")}
                            className="hover:text-blue-600 transition-colors"
                        >
                            Why AlumniConn
                        </a>
                        <a
                            href="#features"
                            onClick={(e) => scrollToSection(e, "features")}
                            className="hover:text-blue-600 transition-colors"
                        >
                            Features
                        </a>
                        <a
                            href="#how-it-works"
                            onClick={(e) => scrollToSection(e, "how-it-works")}
                            className="hover:text-blue-600 transition-colors"
                        >
                            How It Works
                        </a>
                        <a
                            href="#universities"
                            onClick={(e) => scrollToSection(e, "universities")}
                            className="hover:text-blue-600 transition-colors"
                        >
                            Universities
                        </a>
                    </nav>

                    {/* Desktop Header Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        <a
                            href="#universities"
                            onClick={(e) => scrollToSection(e, "universities")}
                            className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors"
                        >
                            Find Campus
                        </a>
                        <Link
                            to="/request-college"
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all hover:shadow-md"
                        >
                            Request University
                        </Link>
                    </div>

                    {/* Mobile Hamburger Button */}
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
                        aria-label="Toggle navigation menu"
                    >
                        {mobileMenuOpen ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="4" y1="6" x2="20" y2="6" />
                                <line x1="4" y1="12" x2="20" y2="12" />
                                <line x1="4" y1="18" x2="20" y2="18" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Mobile Dropdown Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-slate-200 bg-white px-4 py-5 shadow-xl transition-all">
                        <div className="flex flex-col space-y-3 text-base font-semibold text-slate-700">
                            <a
                                href="#top"
                                onClick={(e) => scrollToSection(e, "top")}
                                className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-blue-600 transition-colors"
                            >
                                Home
                            </a>
                            <a
                                href="#value"
                                onClick={(e) => scrollToSection(e, "value")}
                                className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-blue-600 transition-colors"
                            >
                                Why AlumniConn
                            </a>
                            <a
                                href="#features"
                                onClick={(e) => scrollToSection(e, "features")}
                                className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-blue-600 transition-colors"
                            >
                                Features
                            </a>
                            <a
                                href="#how-it-works"
                                onClick={(e) => scrollToSection(e, "how-it-works")}
                                className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-blue-600 transition-colors"
                            >
                                How It Works
                            </a>
                            <a
                                href="#universities"
                                onClick={(e) => scrollToSection(e, "universities")}
                                className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-blue-600 transition-colors"
                            >
                                Universities
                            </a>
                            <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
                                <a
                                    href="#universities"
                                    onClick={(e) => scrollToSection(e, "universities")}
                                    className="w-full text-center px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                                >
                                    Find Your Campus
                                </a>
                                <Link
                                    to="/request-college"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="w-full text-center px-4 py-2.5 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-500 transition-colors"
                                >
                                    Request University
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-1">
                {/* 1. Hero Section */}
                <section id="top" className="relative overflow-hidden bg-white border-b border-slate-200/80 px-4 sm:px-6 py-16 sm:py-24">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                            {/* Hero Text */}
                            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                                
                                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl leading-[1.15]">
                                    The modern network for your{" "}
                                    <span className="text-blue-600">campus community</span>
                                </h1>
                                <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                                    AlumniConn empowers educational institutions with private, branded communities for alumni, students, and mentors to connect, collaborate, and advance their careers.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                                    <Link
                                        to="/request-college"
                                        className="w-full sm:w-auto rounded-lg bg-blue-600 px-7 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-blue-500 transition-all hover:shadow-md text-center"
                                    >
                                        Request University Onboarding
                                    </Link>
                                    <a
                                        href="#universities"
                                        onClick={(e) => scrollToSection(e, "universities")}
                                        className="w-full sm:w-auto rounded-lg border border-slate-300 bg-white px-7 py-3.5 text-base font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all text-center"
                                    >
                                        Explore Universities
                                    </a>
                                </div>
                                <div className="pt-2 text-xs text-slate-500 flex items-center justify-center lg:justify-start gap-6">
                                    <div className="flex items-center gap-1.5">
                                        <svg className="h-4 w-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        <span>Verified Academic Domains</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <svg className="h-4 w-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        <span>Private Tenant Boundaries</span>
                                    </div>
                                </div>
                            </div>

                            {/* Hero Interactive Mockup Preview */}
                            <div className="lg:col-span-5 w-full">
                                <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 shadow-xl backdrop-blur-sm">
                                    {/* Mock Window Header */}
                                    <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-3 px-1">
                                        <div className="flex items-center gap-1.5">
                                            <div className="h-2.5 w-2.5 rounded-full bg-rose-400"></div>
                                            <div className="h-2.5 w-2.5 rounded-full bg-amber-400"></div>
                                            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400"></div>
                                        </div>
                                        <span className="text-[11px] font-medium text-slate-400">alumniconn.com/c/campus</span>
                                        <div className="w-10"></div>
                                    </div>

                                    {/* Mock Content Snippets */}
                                    <div className="space-y-3">
                                        {/* Mock Profile Card */}
                                        <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                                                    AK
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-xs font-bold text-slate-900 truncate">Ananya Kulkarni</h4>
                                                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">Verified Alumni</span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 truncate">Staff Engineer • Silicon Valley</p>
                                                </div>
                                            </div>
                                            <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                                                <span className="text-slate-500">Mentoring in Distributed Systems</span>
                                                <span className="font-semibold text-blue-600">Connected</span>
                                            </div>
                                        </div>

                                        {/* Mock AI Recommendation Snippet */}
                                        <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3.5 shadow-sm">
                                            <div className="flex items-start gap-2.5">
                                                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-600 text-white">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">AI Match Suggestion</span>
                                                    <p className="text-xs text-slate-700 font-medium mt-0.5">Matched based on major & skills: Cloud Architecture</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Mock Community Feed Snippet */}
                                        <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <div className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                                    RS
                                                </div>
                                                <span className="text-xs font-semibold text-slate-800">Rahul Sharma</span>
                                                <span className="text-[10px] text-slate-400">• Referral Opportunity</span>
                                            </div>
                                            <p className="text-xs text-slate-600 leading-snug line-clamp-2">
                                                "Our engineering team is actively seeking new grad software engineers for Fall 2026. Happy to refer fellow alumni!"
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 1-Click Evaluation / Demo Accounts */}
                        <div id="demo" className="mt-12 pt-8 border-t border-slate-100 scroll-mt-20">
                            <DemoAccountPicker />
                        </div>
                    </div>
                </section>

                {/* 2. Platform Value / Trust Section */}
                <section id="value" className="py-16 sm:py-20 px-4 sm:px-6 bg-slate-50 border-b border-slate-200/80">
                    <div className="mx-auto max-w-7xl">
                        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Platform Value</span>
                            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                                Built to Solve the Lifelong Alumni Engagement Challenge
                            </h2>
                            <p className="mt-3 text-base sm:text-lg text-slate-600">
                                Universities struggle with outdated contact spreadsheets and disconnected graduates. AlumniConn provides an active, self-sustaining campus ecosystem.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100/70 text-blue-700 mb-4">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect width="18" height="18" x="3" y="3" rx="2" />
                                        <path d="M3 9h18" />
                                        <path d="M9 21V9" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Dedicated Multi-Tenancy</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Each institution receives a completely isolated, white-labeled portal scoped to verified institutional domains.
                                </p>
                            </div>

                            <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100/70 text-emerald-700 mb-4">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Student & Alumni Mentorship</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Bridges the gap between current students and established professionals for career advice, resume reviews, and coaching.
                                </p>
                            </div>

                            <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100/70 text-indigo-700 mb-4">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect width="20" height="14" x="2" y="7" rx="2" />
                                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Opportunity Referrals</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Accelerates graduate placement rates by enabling graduates to share high-intent job openings and referral pathways.
                                </p>
                            </div>

                            <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100/70 text-amber-700 mb-4">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 20v-6M6 20V10M18 20V4" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Live Community Data</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Maintains live profiles of graduate locations, companies, and roles, eliminating dead alumni database registries.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. Comprehensive Features Section */}
                <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 bg-white border-b border-slate-200/80">
                    <div className="mx-auto max-w-7xl">
                        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Enterprise Features</span>
                            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                                Complete Platform Capabilities
                            </h2>
                            <p className="mt-3 text-base sm:text-lg text-slate-600">
                                Every capability is engineered specifically for university networking, multi-tenant security, and career mobility.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Feature 1 */}
                            <div className="rounded-xl border border-slate-200 p-6 bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-md transition-all">
                                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600 text-white mb-4">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="11" cy="11" r="8" />
                                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                    </svg>
                                </div>
                                <h3 className="text-base font-bold text-slate-900 mb-2">Alumni Directory</h3>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                    Filter and locate graduates across departments, industries, graduation classes, and global metropolitan areas.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="rounded-xl border border-slate-200 p-6 bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-md transition-all">
                                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600 text-white mb-4">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                                        <rect x="2" y="9" width="4" height="12" />
                                        <circle cx="4" cy="4" r="2" />
                                    </svg>
                                </div>
                                <h3 className="text-base font-bold text-slate-900 mb-2">1-to-1 Connections</h3>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                    Seamlessly send, receive, and accept connection requests within your university network.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="rounded-xl border border-slate-200 p-6 bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-md transition-all">
                                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600 text-white mb-4">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-base font-bold text-slate-900 mb-2">Real-time Messaging</h3>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                    Direct peer messaging powered by low-latency WebSockets with live online status indicators.
                                </p>
                            </div>

                            {/* Feature 4 */}
                            <div className="rounded-xl border border-slate-200 p-6 bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-md transition-all">
                                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600 text-white mb-4">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                                        <circle cx="12" cy="12" r="4" />
                                    </svg>
                                </div>
                                <h3 className="text-base font-bold text-slate-900 mb-2">AI Match Recommendations</h3>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                    Vector-based semantic matching connecting students with alumni based on skills, career paths, and industries.
                                </p>
                            </div>

                            {/* Feature 5 */}
                            <div className="rounded-xl border border-slate-200 p-6 bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-md transition-all">
                                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600 text-white mb-4">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                        <line x1="16" y1="13" x2="8" y2="13" />
                                        <line x1="16" y1="17" x2="8" y2="17" />
                                        <polyline points="10 9 9 9 8 9" />
                                    </svg>
                                </div>
                                <h3 className="text-base font-bold text-slate-900 mb-2">Community Feeds</h3>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                    Publish campus updates, academic milestones, questions, articles, and community discussions.
                                </p>
                            </div>

                            {/* Feature 6 */}
                            <div className="rounded-xl border border-slate-200 p-6 bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-md transition-all">
                                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600 text-white mb-4">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                    </svg>
                                </div>
                                <h3 className="text-base font-bold text-slate-900 mb-2">Career Opportunities</h3>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                    Dedicated opportunity flags for verified alumni to share open roles, internships, and company referrals.
                                </p>
                            </div>

                            {/* Feature 7 */}
                            <div className="rounded-xl border border-slate-200 p-6 bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-md transition-all">
                                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600 text-white mb-4">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-base font-bold text-slate-900 mb-2">Campus Branding</h3>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                    White-labeled institutional themes with customized color schemes, official university crests, and mottos.
                                </p>
                            </div>

                            {/* Feature 8 */}
                            <div className="rounded-xl border border-slate-200 p-6 bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-md transition-all">
                                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600 text-white mb-4">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    </svg>
                                </div>
                                <h3 className="text-base font-bold text-slate-900 mb-2">Admin Governance</h3>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                    Administrative consoles to review student alumni upgrade requests and manage campus member access.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. How It Works Section */}
                <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 bg-slate-50 border-b border-slate-200/80">
                    <div className="mx-auto max-w-7xl">
                        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Onboarding Process</span>
                            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                                How AlumniConn Works
                            </h2>
                            <p className="mt-3 text-base sm:text-lg text-slate-600">
                                A simple, structured pathway for institutions to launch and nurture their private alumni community.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Step 1 */}
                            <div className="relative rounded-2xl border border-slate-200/90 bg-white p-8 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <span className="text-4xl font-extrabold text-blue-600/30">01</span>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold text-sm">
                                        1
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">University Onboarding</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    The university administrator submits an onboarding request with academic domain details. Once verified, the campus receives an isolated portal at <code className="text-xs bg-slate-100 text-blue-600 px-1 py-0.5 rounded">/c/:slug</code>.
                                </p>
                            </div>

                            {/* Step 2 */}
                            <div className="relative rounded-2xl border border-slate-200/90 bg-white p-8 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <span className="text-4xl font-extrabold text-blue-600/30">02</span>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold text-sm">
                                        2
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Profiles & Verification</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Students and alumni register via institutional email verification. Graduating students submit alumni transition requests reviewed by campus administrators.
                                </p>
                            </div>

                            {/* Step 3 */}
                            <div className="relative rounded-2xl border border-slate-200/90 bg-white p-8 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <span className="text-4xl font-extrabold text-blue-600/30">03</span>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold text-sm">
                                        3
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Connect & Advance</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Community members discover mentors through AI recommendations, message in real-time, form connections, and post referral opportunities.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. Partner Universities Section (Real Database Data) */}
                <section id="universities" className="py-16 sm:py-24 px-4 sm:px-6 bg-white border-b border-slate-200/80">
                    <div className="mx-auto max-w-7xl">
                        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Demo Environment</span>
                            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                                Explore Demo Universities
                            </h2>
                            <p className="mt-3 text-base sm:text-lg text-slate-600">
                                Discover campuses in the AlumniConn demo environment. All universities and users shown here are fictional and provided for demonstration purposes.
                            </p>
                        </div>

                        {loadingColleges ? (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-3"></div>
                                <span className="text-sm">Loading active universities...</span>
                            </div>
                        ) : colleges.length === 0 ? (
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-12 text-center max-w-lg mx-auto">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 mx-auto mb-4">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="m3 8.5 9-4 9 4-9 4-9-4Z" />
                                        <path d="M7 11v4.5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V11" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">No Campuses Live Yet</h3>
                                <p className="text-sm text-slate-600 mb-6">
                                    Be the first institution to establish your private network on AlumniConn.
                                </p>
                                <Link
                                    to="/request-college"
                                    className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all inline-block"
                                >
                                    Request Your University
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {colleges.map((college) => (
                                    <div
                                        key={college.id}
                                        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-start justify-between gap-4 mb-4">
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-700 font-bold text-base">
                                                    {college.branding?.logo_url ? (
                                                        <img
                                                            src={college.branding.logo_url}
                                                            alt={`${college.name} Logo`}
                                                            className="h-full w-full object-contain p-1"
                                                        />
                                                    ) : (
                                                        college.name.substring(0, 2).toUpperCase()
                                                    )}
                                                </div>
                                                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                                                    Demo Network
                                                </span>
                                            </div>

                                            <h3 className="text-lg font-bold text-slate-900 leading-snug mb-1">
                                                {college.name}
                                            </h3>

                                            <div className="text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1 mb-3">
                                                {college.location && (
                                                    <span className="flex items-center gap-1">
                                                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                            <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                                                            <circle cx="12" cy="10" r="3" />
                                                        </svg>
                                                        {college.location}
                                                    </span>
                                                )}
                                                {college.established_year && (
                                                    <span>Est. {college.established_year}</span>
                                                )}
                                            </div>

                                            <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mb-6 leading-relaxed">
                                                {college.description || "Private alumni network connecting students, alumni, and campus leadership."}
                                            </p>
                                        </div>

                                        <div className="pt-4 border-t border-slate-100">
                                            <Link
                                                to={`/c/${college.slug}`}
                                                className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-50 text-blue-700 px-4 py-2.5 text-sm font-semibold hover:bg-blue-600 hover:text-white transition-all text-center"
                                            >
                                                <span>Visit Campus Portal</span>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                                </svg>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-12 text-center">
                            <p className="text-sm text-slate-600">
                                Don't see your alma mater listed?{" "}
                                <Link to="/request-college" className="font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-4">
                                    Request university onboarding here
                                </Link>
                                .
                            </p>
                        </div>
                    </div>
                </section>

                {/* 6. CTA Section */}
                <section id="cta" className="py-16 sm:py-20 px-4 sm:px-6 bg-blue-600 text-white text-center relative overflow-hidden">
                    <div className="mx-auto max-w-4xl relative z-10 space-y-6">
                        <h2 className="text-3xl font-extrabold sm:text-4xl md:text-5xl tracking-tight leading-tight">
                            Ready to Modernize Your Campus Network?
                        </h2>
                        <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
                            Join educational institutions leveraging AlumniConn to drive student mentorship, lifelong graduate engagement, and career opportunities.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                            <Link
                                to="/request-college"
                                className="w-full sm:w-auto rounded-lg bg-white px-8 py-3.5 text-base font-bold text-blue-600 shadow-md hover:bg-blue-50 transition-all text-center"
                            >
                                Request University Onboarding
                            </Link>
                            <a
                                href="#universities"
                                onClick={(e) => scrollToSection(e, "universities")}
                                className="w-full sm:w-auto rounded-lg border border-white/40 bg-white/10 px-8 py-3.5 text-base font-bold text-white hover:bg-white/20 transition-all text-center"
                            >
                                Explore Demo Campuses
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-200 bg-white py-12 px-4 sm:px-6">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        {/* Column 1: Brand Info */}
                        <div className="space-y-3 md:col-span-1">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="m3 8.5 9-4 9 4-9 4-9-4Z" />
                                        <path d="M7 11v4.5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V11" />
                                    </svg>
                                </div>
                                <span className="text-lg font-bold text-slate-900">AlumniConn</span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                The enterprise multi-tenant networking platform connecting students, graduates, and universities worldwide.
                            </p>
                        </div>

                        {/* Column 2: Navigation */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Platform</h4>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li>
                                    <a href="#top" onClick={(e) => scrollToSection(e, "top")} className="hover:text-blue-600 transition-colors">Home</a>
                                </li>
                                <li>
                                    <a href="#value" onClick={(e) => scrollToSection(e, "value")} className="hover:text-blue-600 transition-colors">Why AlumniConn</a>
                                </li>
                                <li>
                                    <a href="#features" onClick={(e) => scrollToSection(e, "features")} className="hover:text-blue-600 transition-colors">Platform Features</a>
                                </li>
                                <li>
                                    <a href="#how-it-works" onClick={(e) => scrollToSection(e, "how-it-works")} className="hover:text-blue-600 transition-colors">How It Works</a>
                                </li>
                            </ul>
                        </div>

                        {/* Column 3: Institutions */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Institutions</h4>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li>
                                    <a href="#universities" onClick={(e) => scrollToSection(e, "universities")} className="hover:text-blue-600 transition-colors">Demo Campuses</a>
                                </li>
                                <li>
                                    <Link to="/request-college" className="hover:text-blue-600 transition-colors">Request University</Link>
                                </li>
                                <li>
                                    <Link to="/verify-college-email" className="hover:text-blue-600 transition-colors">Verify Campus Email</Link>
                                </li>
                            </ul>
                        </div>

                        {/* Column 4: Administration & Legal */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Administration & Trust</h4>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li>
                                    <Link to="/super-admin-login" className="hover:text-blue-600 transition-colors">
                                        Super Admin Console
                                    </Link>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => handleOpenModal("Privacy Policy", "AlumniConn strictly protects member data within dedicated institutional boundaries. Academic records and profile communications remain isolated to each respective university network.")}
                                        className="hover:text-blue-600 transition-colors text-left"
                                    >
                                        Privacy Policy
                                    </button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => handleOpenModal("Terms of Service", "By accessing AlumniConn campus portals, members agree to authentic representations of academic credentials, respectful communication, and compliance with institutional community guidelines.")}
                                        className="hover:text-blue-600 transition-colors text-left"
                                    >
                                        Terms of Service
                                    </button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => handleOpenModal("Contact Support", "For institutional onboarding inquiries or support assistance, reach out to support@alumniconn.com or submit a request via our university onboarding portal.")}
                                        className="hover:text-blue-600 transition-colors text-left"
                                    >
                                        Contact Support
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1">
                            <span>© {new Date().getFullYear()} AlumniConn. All rights reserved.</span>
                            <span>•</span>
                            <span className="font-medium text-slate-700">Built by Noman Ahmad</span>
                            <span>•</span>
                            <a
                                href="https://github.com/Noman-Ahmad25"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-600 hover:text-blue-600 transition-colors font-medium"
                            >
                                GitHub
                            </a>
                            <span>•</span>
                            <a
                                href="https://github.com/Noman-Ahmad25/AlumniConn"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 transition-colors font-medium inline-flex items-center gap-1"
                            >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                                    <path d="M9 18c-4.51 2-5-2-7-2" />
                                </svg>
                                View source on GitHub
                            </a>
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/90 text-slate-500 text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>Interactive Demo • Fictional Universities • Synthetic Data</span>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Informational Modal */}
            {infoModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900">{infoModal.title}</h3>
                            <button
                                type="button"
                                onClick={() => setInfoModal(null)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                aria-label="Close dialog"
                            >
                                ✕
                            </button>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            {infoModal.content}
                        </p>
                        <div className="pt-2 text-right">
                            <button
                                type="button"
                                onClick={() => setInfoModal(null)}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

