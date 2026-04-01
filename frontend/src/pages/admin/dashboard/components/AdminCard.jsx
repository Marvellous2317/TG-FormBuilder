const AdminCard = ({ icon, title, count }) => {
  return (
    <div className="flex w-full items-center gap-3 p-5 border border-secondary-200 rounded-2xl transition-all duration-150 ease-in-out hover:bg-gray-100/35">
      <div className="p-4 bg-secondary-700 rounded-xl">
        <img src={icon} alt="icon" className="w-5 h-5" />
      </div>
      <div className="flex flex-col gap-3">
        <h1 className="text-sm font-geist text-tertiary">{title}</h1>
        <h1 className="text-primary font-medium font-geist text-3xl">
          {count}
        </h1>
      </div>
    </div>
  );
};

export default AdminCard;
