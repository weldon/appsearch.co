import { SiteNav } from "./components/SiteNav";
import { AppRoutes } from "./routes";

export default function App() {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-4 text-center">
      <SiteNav />
      <AppRoutes />
    </div>
  );
}
