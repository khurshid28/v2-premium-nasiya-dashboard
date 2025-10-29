import Footer from "components/footer/FooterAuthDefault";
import { Routes, Route, Navigate } from "react-router-dom";
import routes from "routes";
import FixedPlugin from "components/fixedPlugin/FixedPlugin";

export default function Auth() {
  const getRoutes = (routes: RoutesType[]): any => {
    return routes.map((prop, key) => {
      if (prop.layout === "/auth") {
        return (
          <Route path={`/${prop.path}`} element={prop.component} key={key} />
        );
      } else {
        return null;
      }
    });
  };
  document.documentElement.dir = "ltr";
  return (
    <div>
  <div className="relative h-full min-h-screen w-full !bg-white dark:!bg-navy-900">
        <FixedPlugin />
  <main className="w-full min-h-screen">
          <div className="relative flex w-full min-h-screen">
              <div className="flex w-full">
              {/* Left: centered form (full width on small screens, half on md+) */}
              <div className="w-full md:w-1/2 flex items-center justify-center h-screen">
                <div className="w-full max-w-[420px] px-6 py-12">
                  <Routes>
                    {getRoutes(routes)}
                    <Route path="/" element={<Navigate to="/sign-in" replace />} />
                  </Routes>
                </div>
              </div>

              {/* Right: image panel (hidden on small screens) */}
              <div
                className="hidden md:block md:w-1/2 h-screen bg-center bg-cover relative"
                style={{ backgroundImage: `url('/pp.png')` }}
              >
                {/* Overlay to ensure readability and dark-mode tint */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-transparent dark:from-black/40 dark:via-black/30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="mx-6 w-full max-w-[640px] p-6 rounded-lg bg-white/10 dark:bg-black/20 backdrop-blur-sm border border-white/10" aria-hidden>
                    {/* decorative cover area - left intentionally minimal to show the image */}
                  </div>
                </div>
              </div>
            </div>
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
}
