import RequestCollegeForm from "../components/RequestCollegeForm"

export default function RequestCollege() {
  return (
    <div className="app-page">
      <main className="app-main-wide space-y-6">
        <div className="page-heading">
          <h1 className="page-title">College Onboarding</h1>
          <p className="page-subtitle">Submit a college and its first admin for super admin review.</p>
        </div>

        <RequestCollegeForm />
      </main>
    </div>
  )
}
