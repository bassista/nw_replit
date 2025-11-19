import StatisticsChart from '../StatisticsChart';

export default function StatisticsChartExample() {
  const pieData = [
    { name: 'Proteine', value: 30 },
    { name: 'Carboidrati', value: 50 },
    { name: 'Grassi', value: 20 },
  ];

  const lineData = [
    { name: 'Lun', calories: 1800 },
    { name: 'Mar', calories: 2100 },
    { name: 'Mer', calories: 1950 },
    { name: 'Gio', calories: 2200 },
    { name: 'Ven', calories: 1880 },
    { name: 'Sab', calories: 2050 },
    { name: 'Dom', calories: 1900 },
  ];

  return (
    <div className="p-4 space-y-4">
      <StatisticsChart 
        type="pie"
        data={pieData}
        title="Distribuzione Macronutrienti"
      />
      <StatisticsChart 
        type="line"
        data={lineData}
        title="Andamento Calorie"
        onPeriodChange={(period) => console.log('Period changed:', period)}
      />
    </div>
  );
}
