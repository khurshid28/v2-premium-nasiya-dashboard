import React from "react";

const AdminDashboard = (): JSX.Element => {
  // Placeholder dashboard for admin section
  return (
    <div>
      <h2 className="text-2xl font-semibold">Admin Section Dashboard</h2>
  {/* description removed per request */}

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <h3 className="mb-2 font-medium">Quick Stats</h3>
          <ul className="text-sm text-gray-700">
            <li>Fillials: 12</li>
            <li>Users: 254</li>
            <li>Active Admins: 3</li>
          </ul>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="mb-2 font-medium">Recent Activity</h3>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
