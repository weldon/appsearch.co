export function AboutPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-4 py-8 text-left">
      <h1 className="text-3xl font-semibold text-gray-900">About AppSearch</h1>
      <p className="text-gray-700">
        AppSearch is a utility to quickly find the bundle ID of apps on the App
        Store.
      </p>
      <p className="text-gray-700">
        This app is written in React and pulls data from the iTunes Search API.
      </p>
    </main>
  );
}
