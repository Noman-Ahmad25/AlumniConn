import { Link } from "react-router-dom";

export default function NotFound({ message = "Page not found." }: { message?: string }) {
    return (
        <div className="flex h-screen flex-col items-center justify-center p-4 text-center">
            <h1 className="text-4xl font-bold text-slate-900">404</h1>
            <p className="mt-2 text-lg text-slate-600">{message}</p>
            <Link to="/" className="mt-6 font-semibold text-blue-600 hover:text-blue-800">
                Return Home
            </Link>
        </div>
    );
}
