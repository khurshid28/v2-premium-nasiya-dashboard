import Card from "components/card";
import { useUser } from "contexts/UserContext";

const General = () => {
  const { user } = useUser();

  return (
    <Card extra={"w-full h-full p-3"}>
      {/* Header */}
      <div className="mt-2 mb-8 w-full">
        <h4 className="px-2 text-xl font-bold text-navy-700 dark:text-white">
          General Information
        </h4>
        <p className="mt-2 px-2 text-base text-gray-600">
          User profile information and account details. This information can be updated through the edit profile modal.
        </p>
      </div>
      {/* Cards */}
      <div className="grid grid-cols-2 gap-4 px-2">
        <div className="flex flex-col items-start justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
          <p className="text-sm text-gray-600">Full Name</p>
          <p className="text-base font-medium text-navy-700 dark:text-white">
            {user?.fullname || "Not provided"}
          </p>
        </div>

        <div className="flex flex-col justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
          <p className="text-sm text-gray-600">Phone Number</p>
          <p className="text-base font-medium text-navy-700 dark:text-white">
            {user?.phone || "Not provided"}
          </p>
        </div>

        <div className="flex flex-col items-start justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
          <p className="text-sm text-gray-600">Role</p>
          <p className="text-base font-medium text-navy-700 dark:text-white">
            {user?.role || "USER"}
          </p>
        </div>

        <div className="flex flex-col justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
          <p className="text-sm text-gray-600">Work Status</p>
          <p className="text-base font-medium text-navy-700 dark:text-white">
            {user?.work_status || "WORKING"}
          </p>
        </div>

        <div className="flex flex-col items-start justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
          <p className="text-sm text-gray-600">User ID</p>
          <p className="text-base font-medium text-navy-700 dark:text-white">
            {user?.id || "N/A"}
          </p>
        </div>

        <div className="flex flex-col justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
          <p className="text-sm text-gray-600">Profile Image</p>
          <p className="text-base font-medium text-navy-700 dark:text-white">
            {user?.image ? "Uploaded" : "Default"}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default General;
