"use client";

export default function TestPage() {
  return (
    <div className="min-h-screen bg-[#225384] flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Tailwind CSS Test
        </h1>
        <div className="space-y-4">
          <div className="bg-red-500 text-white p-4 rounded">
            Red Background Test
          </div>
          <div className="bg-green-500 text-white p-4 rounded">
            Green Background Test
          </div>
          <div className="border-2 border-purple-500 p-4 rounded">
            Purple Border Test
          </div>
        </div>
      </div>
    </div>
  );
}
