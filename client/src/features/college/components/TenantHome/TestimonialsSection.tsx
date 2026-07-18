export default function TestimonialsSection() {
    const testimonials = [
        {
            quote: "Staying connected via our alumni community helped me find my first engineering referral. It's a game changer.",
            author: "Jane Doe",
            role: "Software Engineer, Class of 2022"
        },
        {
            quote: "Mentoring final year students allows me to give back. The portal makes coordination smooth and easy.",
            author: "John Smith",
            role: "Product Lead, Class of 2015"
        }
    ];

    return (
        <section className="py-20 px-6 bg-white border-t border-slate-200/40">
            <div className="max-w-5xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-600/10 px-3 py-1 text-sm font-semibold text-emerald-700">
                        Success Stories
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                        Voices of Our Network
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {testimonials.map((t, idx) => (
                        <div key={idx} className="rounded-2xl bg-slate-50 border border-slate-100 p-8 relative flex flex-col justify-between shadow-sm">
                            <p className="text-slate-600 italic leading-relaxed mb-6">
                                "{t.quote}"
                            </p>
                            <div className="flex flex-col">
                                <span className="font-bold text-slate-800">{t.author}</span>
                                <span className="text-sm text-slate-500">{t.role}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
