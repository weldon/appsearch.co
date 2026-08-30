import { Link, NavLink } from "react-router-dom";

export function SiteNav() {
  return (
    <nav className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
      <Link to="/" className="text-xl font-bold text-gray-900 no-underline">
        AppSearch
      </Link>
      <NavLink
        to="/about"
        className={({ isActive }) =>
          `rounded px-3 py-2 text-sm font-medium no-underline ${
            isActive
              ? "bg-gray-100 text-gray-900"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`
        }
      >
        About
      </NavLink>
    </nav>
  );
}
