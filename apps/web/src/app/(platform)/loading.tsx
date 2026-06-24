export default function PlatformLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-900 border-t-transparent" />
        <p className="text-sm font-medium text-gray-500">Loading data...</p>
      </div>
    </div>
  );
}
