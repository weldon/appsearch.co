import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main className="py-24 text-center">
      <h1 className="text-2xl font-semibold text-gray-900">Sorry, page not found!</h1>
      <p className="mt-4">
        <Link to="/" className="text-blue-600 hover:underline">
          Return to search
        </Link>
      </p>
    </main>
  );
}
