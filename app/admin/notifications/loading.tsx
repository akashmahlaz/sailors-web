export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-4"></div>
      <div className="h-4 w-96 bg-gray-200 rounded animate-pulse mb-8"></div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between mb-6">
          <div className="h-10 w-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>

        <div className="mb-6 flex gap-4">
          <div className="h-10 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {[...Array(5)].map((_, i) => (
          <div key={i} className="mb-4 p-4 border rounded-lg">
            <div className="flex justify-between mb-2">
              <div className="h-6 w-64 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="flex justify-between">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="flex gap-2">
                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}

        <div className="mt-6 flex justify-between">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}
