import Icon from "@/components/ui/icon";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const QuickStats = ({ stats }: { stats: any }) => {
  const statItems = [
    {
      label: "Active Deals",
      value: stats?.activeDeals || 0,
      icon: "Tag",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Total Savings",
      value: `$${(stats?.totalSavings || 0)?.toLocaleString()}`,
      icon: "DollarSign",
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      label: "Community Members",
      value: (stats?.communityMembers || 0)?.toLocaleString(),
      icon: "Users",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Deals Today",
      value: stats?.dealsToday || 0,
      icon: "TrendingUp",
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statItems?.map((item, index) => (
        <div
          key={index}
          className="bg-card border border-border rounded-lg p-4 card-hover-elevation transition-all duration-200"
        >
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-lg ${item?.bgColor} flex items-center justify-center`}
            >
              <Icon name={item?.icon} size={20} className={item?.color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">
                {item?.value}
              </p>
              <p className="text-sm text-muted-foreground">{item?.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuickStats;
