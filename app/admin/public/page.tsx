export default function PublicAdminPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Public Admin Page
        </h1>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            This page should work without authentication
          </h2>
          <p className="text-gray-600 mb-4">
            If you can see this page, the admin routing is working correctly.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#225384]/10 p-4 rounded-lg">
              <h3 className="font-semibold text-[#225384]">Test 1</h3>
              <p className="text-2xl font-bold text-[#225384]">✅ Working</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900">Test 2</h3>
              <p className="text-2xl font-bold text-green-600">✅ Working</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-900">Test 3</h3>
              <p className="text-2xl font-bold text-orange-600">✅ Working</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
