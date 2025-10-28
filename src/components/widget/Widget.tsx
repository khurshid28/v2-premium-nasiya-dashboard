import Card from "components/card";

const Widget = (props: {
  icon: JSX.Element;
  title: string;
  subtitle: string;
}) => {
  const { icon, title, subtitle } = props;
  return (
    <Card extra="!flex-row flex-grow items-center rounded-[20px]">
      <div className="ml-[18px] flex items-center py-3">
        <div className="rounded-full bg-lightPrimary p-3 dark:bg-navy-700">
          <span className="flex items-center text-brand-500 dark:text-white">
            {icon}
          </span>
        </div>
      </div>

      <div className="ml-4 flex-1 flex flex-col justify-center py-3">
        <p className="font-dm text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-normal">{title}</p>
        <h4 className="text-xl font-bold text-navy-700 dark:text-white whitespace-normal">
          {subtitle}
        </h4>
      </div>
    </Card>
  );
};

export default Widget;
