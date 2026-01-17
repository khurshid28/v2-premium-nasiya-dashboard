import React from "react";

// Super Imports
import MainDashboard from "views/admin/default";
import Profile from "views/admin/profile";
import Merchants from "views/admin/merchants";
import Agents from "views/admin/agents";
import Admins from "views/admin/admins";
import Fillials from "views/admin/fillials";
import Users from "views/admin/users";
import Applications from "views/admin/applications";
import InfoPage from "views/admin/info";
import ReportsPage from "views/admin/reports";
// Auth import
import SignIn from "views/auth/SignIn";

// Admin imports
import CustomersAdmin from "views/admin/customers";

// Demo imports
import Permissions from "views/demo/permissions";
import Debts from "views/demo/debts";
import CustomersWithApi from "views/demo/customers/CustomersWithApi";
import ScoringHistory from "views/demo/scoringHistory";
import ScoringModels from "views/demo/scoringModels";
import Payments from "views/demo/payments";
import Products from "views/demo/products";
import DemoApplications from "views/demo/applications";
import ApplicationDetail from "views/demo/applications/detail";

// Icon Imports (Tabler icons)
import { LayoutDashboard, Home, User, FileText, Login, InfoCircle, Report, BuildingStore, Users as UsersIcon, UserCheck, ShieldLock, Receipt, Settings, CreditCard, Clock, Package } from "tabler-icons-react";

const routes = [
  {
    name: "Boshqaruv paneli",
    layout: "/super",
    path: "dashboard",
  icon: <LayoutDashboard size={20} />,
    component: <MainDashboard />,
  },
  {
    name: "Boshqaruv paneli",
    layout: "/demo",
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
    name: "Merchantlar",
    layout: "/super",
    path: "merchants",
    icon: <BuildingStore size={20} />,
    component: <Merchants />,
  },
  {
    name: "Merchantlar",
    layout: "/demo",
    path: "merchants",
    icon: <BuildingStore size={20} />,
    component: <Merchants />,
  },
  {
    name: "Agentlar",
    layout: "/super",
    path: "agents",
    icon: <UsersIcon size={20} />,
    component: <Agents />,
  },
  {
    name: "Agentlar",
    layout: "/demo",
    path: "agents",
    icon: <UsersIcon size={20} />,
    component: <Agents />,
  },
  {
    name: "Adminlar",
    layout: "/super",
    path: "admins",
    icon: <UserCheck size={20} />,
    component: <Admins />,
  },
  {
    name: "Adminlar",
    layout: "/demo",
    path: "admins",
    icon: <UserCheck size={20} />,
    component: <Admins />,
  },
  {
    name: "Filiallar",
    layout: "/super",
    path: "fillials",
  icon: <Home size={20} />,
    component: <Fillials />,
  },
  {
    name: "Filiallar",
    layout: "/demo",
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
    name: "Mijozlar",
    layout: "/super",
    path: "customers",
    icon: <UsersIcon size={20} />,
    component: <CustomersAdmin />,
  },
  {
    name: "Mijozlar",
    layout: "/admin",
    path: "customers",
    icon: <UsersIcon size={20} />,
    component: <CustomersAdmin />,
  },
  {
    name: "Operatorlar",
    layout: "/demo",
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
    name: "Ariza batafsil",
    layout: "/super",
    path: "applications/:id",
    icon: <FileText size={20} />,
    component: <ApplicationDetail />,
    hidden: true,
  },
  {
    name: "Arizalar",
    layout: "/demo",
    path: "applications",
  icon: <FileText size={20} />,
    component: <DemoApplications />,
  },
  {
    name: "Ariza batafsil",
    layout: "/demo",
    path: "applications/:id",
    icon: <FileText size={20} />,
    component: <ApplicationDetail />,
    hidden: true,
  },
  {
    name: "Ruxsat va Blocklar",
    layout: "/demo",
    path: "permissions",
    icon: <ShieldLock size={20} />,
    component: <Permissions />,
  },
  {
    name: "Qarzdorlik",
    layout: "/demo",
    path: "debts",
    icon: <Receipt size={20} />,
    component: <Debts />,
  },
  {
    name: "Skoring tarixi",
    layout: "/demo",
    path: "scoring-history",
    icon: <Clock size={20} />,
    component: <ScoringHistory />,
  },
  {
    name: "Skoring modellari",
    layout: "/demo",
    path: "scoring-models",
    icon: <Settings size={20} />,
    component: <ScoringModels />,
  },
  {
    name: "To'lovlar",
    layout: "/demo",
    path: "payments",
    icon: <CreditCard size={20} />,
    component: <Payments />,
  },
  {
    name: "Mahsulotlar",
    layout: "/demo",
    path: "products",
    icon: <Package size={20} />,
    component: <Products />,
  },
  {
    name: "Ma'lumot",
    layout: "/super",
    path: "info",
    icon: <InfoCircle size={20} />,
    component: <InfoPage />,
  },
  {
    name: "Ma'lumot",
    layout: "/demo",
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
    name: "Hisobotlar",
    layout: "/demo",
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
