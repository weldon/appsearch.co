export function AboutPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-4 py-8 text-left">
      <h1 className="text-3xl font-semibold text-gray-900">About AppSearch</h1>
      <p className="text-gray-700">
        AppSearch is a utility to quickly find the bundle ID of apps on the App
        Store. Enter an app name, choose iPhone, iPad, or Mac, and browse the
        results.
      </p>
      <p className="text-gray-700">
        This is a client-side web app built with React, TypeScript, and Vite.
        Styling uses Tailwind CSS. Routing is handled by React Router. Search
        results come from the public iTunes Search API, called directly from
        your browser.
      </p>
    </main>
  );
}
