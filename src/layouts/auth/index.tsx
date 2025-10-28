import Footer from "components/footer/FooterAuthDefault";
import { Link, Routes, Route, Navigate } from "react-router-dom";
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
                  <Link to="/" className="mt-0 w-max">
                    <div className="mx-auto flex h-fit w-fit items-center hover:cursor-pointer">
                      <svg
                        width="8"
                        height="12"
                        viewBox="0 0 8 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6.70994 2.11997L2.82994 5.99997L6.70994 9.87997C7.09994 10.27 7.09994 10.9 6.70994 11.29C6.31994 11.68 5.68994 11.68 5.29994 11.29L0.709941 6.69997C0.319941 6.30997 0.319941 5.67997 0.709941 5.28997L5.29994 0.699971C5.68994 0.309971 6.31994 0.309971 6.70994 0.699971C7.08994 1.08997 7.09994 1.72997 6.70994 2.11997V2.11997Z"
                          fill="#A3AED0"
                        />
                      </svg>
                      <p className="ml-3 text-sm text-gray-600">Back to Dashboard</p>
                    </div>
                  </Link>
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
