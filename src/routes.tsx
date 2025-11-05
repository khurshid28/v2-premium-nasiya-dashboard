import React from "react";

// Super Imports
import MainDashboard from "views/admin/default";
import Profile from "views/admin/profile";
import Fillials from "views/admin/fillials";
import Users from "views/admin/users";
import Applications from "views/admin/applications";
import InfoPage from "views/admin/info";
import ReportsPage from "views/admin/reports";
// Auth import
import SignIn from "views/auth/SignIn";

// Icon Imports (Tabler icons)
import { LayoutDashboard, Home, User, FileText, Login, InfoCircle, Report } from "tabler-icons-react";

const routes = [
  {
    name: "Boshqaruv paneli",
    layout: "/super",
    path: "dashboard",
  icon: <LayoutDashboard size={20} />,
    component: <MainDashboard />,
  },
  // {
  //   name: "NFT Marketplace",
  //   layout: "/super",
  //   path: "nft-marketplace",
  //   icon: <MdOutlineShoppingCart className="h-6 w-6" />,
  //   component: <NFTMarketplace />,
  //   secondary: true,
  // },
  // {
  //   name: "Data Tables",
  //   layout: "/super",
  //   icon: <MdBarChart className="h-6 w-6" />,
  //   path: "data-tables",
  //   component: <DataTables />,
  // },
  {
    name: "Profile",
    layout: "/super",
    path: "profile",
    icon: <User size={20} />,
    component: <Profile />,
    hidden: true,
  },
  // {
  //   name: "Super Dashboard",
  //   layout: "/super",
  //   path: "super-dashboard",
  //   icon: <MdBarChart className="h-6 w-6" />,
  //   component: <SuperDashboard />,
  // },
  {
    name: "Filiallar",
    layout: "/super",
    path: "fillials",
  icon: <Home size={20} />,
    component: <Fillials />,
  },
  {
    name: "Operatorlar",
    layout: "/super",
    path: "users",
  icon: <User size={20} />,
    component: <Users />,
  },
  {
    name: "Arizalar",
    layout: "/super",
    path: "applications",
  icon: <FileText size={20} />,
    component: <Applications />,
  },
  {
    name: "Ma'lumot",
    layout: "/super",
    path: "info",
    icon: <InfoCircle size={20} />,
    component: <InfoPage />,
  },
  {
    name: "Hisobotlar",
    layout: "/super",
    path: "reports",
    icon: <Report size={20} />,
    component: <ReportsPage />,
  },
  {
    name: "Kirish",
    layout: "/auth",
    path: "sign-in",
  icon: <Login size={20} />,
    component: <SignIn />,
  },
  // {
  //   name: "Sign In",
  //   layout: "/auth",
  //   path: "sign-in",
  //   icon: <MdLock className="h-6 w-6" />,
  //   component: <SignIn />,
  // },
  // {
  //   name: "RTL Admin",
  //   layout: "/rtl",
  //   path: "rtl",
  //   icon: <MdHome className="h-6 w-6" />,
  //   component: <RTLDefault />,
  // },
];
export default routes;
