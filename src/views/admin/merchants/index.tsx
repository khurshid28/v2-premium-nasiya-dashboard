import React from "react";

const Merchants = (): JSX.Element => {
  return (
    <div className="mt-5 grid h-full">
      <div className="col-span-1 h-fit w-full rounded-xl bg-white p-6 dark:bg-navy-800">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-navy-700 dark:text-white">
            Merchantlar
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Tizimda ro'yxatdan o'tgan merchantlarni boshqarish
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-gray-600 dark:text-gray-400">
            Merchantlar ro'yxati tez orada qo'shiladi...
          </p>
        </div>
      </div>
    </div>
  );
};

export default Merchants;
