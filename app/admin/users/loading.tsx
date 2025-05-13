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

        <div className="border rounded-lg overflow-hidden">
          <div className="h-12 bg-gray-100 flex items-center px-4">
            <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {[...Array(5)].map((_, i) => (
            <div key={i} className="border-t px-4 py-3 flex items-center">
              <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-between">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}
