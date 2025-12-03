import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "components/navbar";
import Sidebar from "components/sidebar";
import routes from "routes";
import { useDemo } from "contexts/DemoContext";
import { setDemoData } from "lib/demoApi";

export default function DemoLayout(props: { [x: string]: any }) {
  const { ...rest } = props;
  const location = useLocation();
  const { demoData, isLoading, error } = useDemo();
  const [open, setOpen] = React.useState(window.innerWidth >= 1200);
  const [currentRoute, setCurrentRoute] = React.useState("Demo Dashboard");

  // Set demo data for demoApi to use
  useEffect(() => {
    if (demoData) {
      setDemoData(demoData);
      // Set a fake token for demo mode to avoid "Token topilmadi" errors
      localStorage.setItem('token', 'demo-mode-fake-token');
    }
  }, [demoData]);

  React.useEffect(() => {
    const handleResize = () => {
      setOpen(window.innerWidth >= 1200);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  React.useEffect(() => {
    getActiveRoute(routes ?? []);
  }, [location.pathname]);

  const getActiveRoute = (routes: RoutesType[] = []): string | boolean => {
    let activeRoute = "Demo Dashboard";
    if (!routes || routes.length === 0) return activeRoute;
    for (let i = 0; i < routes.length; i++) {
      if (
        window.location.href.indexOf(
          routes[i].layout + "/" + routes[i].path
        ) !== -1
      ) {
        setCurrentRoute(routes[i].name);
      }
    }
    return activeRoute;
  };

  const getActiveNavbar = (routes: RoutesType[] = []): string | boolean => {
    let activeNavbar = false;
    if (!routes || routes.length === 0) return activeNavbar;
    for (let i = 0; i < routes.length; i++) {
      if (
        window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
      ) {
        return routes[i].secondary;
      }
    }
    return activeNavbar;
  };

  const getRoutes = (routes: RoutesType[] = []): any => {
    if (!routes || routes.length === 0) return null;
    return routes.map((prop, key) => {
      if (prop.layout === "/demo") {
        return (
          <Route path={`/${prop.path}`} element={prop.component} key={key} />
        );
      } else {
        return null;
      }
    });
  };

  document.documentElement.dir = "ltr";

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-lightPrimary dark:!bg-navy-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-navy-700 dark:text-white mb-2">
            Demo ma'lumotlar yuklanmoqda...
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Iltimos kuting, barcha demo datalar bir martalik yuklanmoqda
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-lightPrimary dark:!bg-navy-900">
        <div className="text-center max-w-md px-4">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-navy-700 dark:text-white mb-2">
            Demo ma'lumotlarni yuklashda xatolik
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors"
          >
            Qayta urinish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="min-h-screen w-full bg-lightPrimary dark:!bg-navy-900">
        <main
          className={`mx-[12px] h-full flex-1 transition-all md:pr-2 xl:ml-[313px]`}
        >
          <div className="h-full flex flex-col">
            <Navbar
              onOpenSidenav={() => setOpen(true)}
              brandText={currentRoute + " (Demo)"}
              secondary={getActiveNavbar(routes)}
              {...rest}
            />
            <div className="pt-5 w-full flex-1 min-h-[84vh] p-2 md:pr-2">
              {/* Demo mode banner */}
              <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                      Demo rejim
                    </h3>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Bu demo ma'lumotlar. Hech qanday o'zgarishlar saqlanmaydi va real server'ga so'rov yuborilmaydi.
                    </p>
                  </div>
                </div>
              </div>

              <Routes>
                {getRoutes(routes)}
                <Route
                  path="/"
                  element={<Navigate to="/demo/dashboard" replace />}
                />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
