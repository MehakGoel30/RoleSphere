import React, { useEffect, useState } from "react";

const OverviewCards = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    pendingApprovals: 0,
  });

  useEffect(() => {
    fetch("/api/overview/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error("Error fetching overview data:", err));
  }, []);

  return (
    <div className="grid grid-cols-4 gap-4 p-4">
      <Card title="Total Employees" value={stats.totalEmployees} color="blue" />
      <Card title="Present Today" value={stats.presentToday} color="green" />
      <Card title="Absent Today" value={stats.absentToday} color="red" />
      <Card title="Pending Approvals" value={stats.pendingApprovals} color="yellow" />
    </div>
  );
};

const Card = ({ title, value, color }) => {
  return (
    <div className={`p-4 rounded-lg shadow-md bg-${color}-100 border-l-4 border-${color}-500`}>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

export default OverviewCards;
