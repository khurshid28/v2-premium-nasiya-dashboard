import React from "react";

// Super Imports
import MainDashboard from "views/admin/default";
import Profile from "views/admin/profile";
import Merchants from "views/admin/merchants";
import Agents from "views/admin/agents";
import Admins from "views/admin/admins";
import Fillials from "views/admin/fillials";
import Users from "views/admin/users";
import InfoPage from "views/admin/info";
import ReportsPage from "views/admin/reports";
// Auth import
import SignIn from "views/auth/SignIn";

// Admin imports - used in /super with real API
import Permissions from "views/admin/permissions";
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
    name: "Profile",
    layout: "/super",
    path: "profile",
    icon: <User size={20} />,
    component: <Profile />,
    hidden: true,
  },
  {
    name: "Merchantlar",
    layout: "/super",
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
    name: "Adminlar",
    layout: "/super",
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
    component: <CustomersWithApi />,
  },
  {
    name: "Arizalar",
    layout: "/super",
    path: "applications",
  icon: <FileText size={20} />,
    component: <DemoApplications />,
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
    name: "Ruxsat va Blocklar",
    layout: "/super",
    path: "permissions",
    icon: <ShieldLock size={20} />,
    component: <Permissions />,
  },
  {
    name: "Skoring modellari",
    layout: "/super",
    path: "scoring-models",
    icon: <Settings size={20} />,
    component: <ScoringModels />,
  },
  {
    name: "Skoring tarixi",
    layout: "/super",
    path: "scoring-history",
    icon: <Clock size={20} />,
    component: <ScoringHistory />,
  },
  {
    name: "Mahsulotlar",
    layout: "/super",
    path: "products",
    icon: <Package size={20} />,
    component: <Products />,
  },
  {
    name: "To'lovlar",
    layout: "/super",
    path: "payments",
    icon: <CreditCard size={20} />,
    component: <Payments />,
  },
  {
    name: "Qarzdorlik",
    layout: "/super",
    path: "debts",
    icon: <Receipt size={20} />,
    component: <Debts />,
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
];
export default routes;
