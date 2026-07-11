import { Link } from "react-router-dom";

export default function LandingPage() {
    return (
        <div className="flex min-h-screen flex-col bg-slate-50">
            {/* Header Navigation */}
            <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 opacity-95 backdrop-blur">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m3 8.5 9-4 9 4-9 4-9-4Z" />
                            <path d="M7 11v4.5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V11" />
                            <path d="M21 8.5v5" />
                        </svg>
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-900">AlumniConn</span>
                </div>
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
                    <a href="#" className="hover:text-blue-600 transition-colors">Home</a>
                    <a href="#" className="hover:text-blue-600 transition-colors">Features</a>
                    <a href="#" className="hover:text-blue-600 transition-colors">Universities</a>
                    <Link to="/request-college" className="hover:text-blue-600 transition-colors">Request University</Link>
                </nav>
            </header>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="max-w-3xl space-y-8">
                    <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
                        The modern network for your <span className="text-blue-600">campus community</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-slate-600 sm:text-xl">
                        AlumniConn provides universities with an enterprise-grade platform to connect students, alumni, and faculty in a thriving, private network.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link
                            to="/request-college"
                            className="w-full sm:w-auto rounded-lg bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all"
                        >
                            Request University Onboarding
                        </Link>
                    </div>
                    
                    <div className="mt-12 rounded-xl bg-blue-50 p-6 border border-blue-100 max-w-xl mx-auto">
                        <h3 className="font-semibold text-blue-900">Already have an account?</h3>
                        <p className="mt-2 text-sm text-blue-700">
                            Visit your university's dedicated URL to sign in (e.g. <code>alumniconn.com/c/stanford</code>).
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="mt-auto border-t border-slate-200 bg-white py-8">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row text-sm text-slate-500">
                    <p>© {new Date().getFullYear()} AlumniConn. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-slate-900 transition-colors">Terms of Service</a>
                        {/* Subtle Platform Admin Link */}
                        <Link to="/super-admin-login" className="hover:text-slate-900 transition-colors">
                            Platform Admin
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
