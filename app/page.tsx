export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-md p-8 flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-blue-600">
          Tailwind v3 Working
        </h1>
        <p className="text-gray-500 text-sm">
          Logistics Management System
        </p>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Test Button
        </button>
      </div>
    </div>
  )
}