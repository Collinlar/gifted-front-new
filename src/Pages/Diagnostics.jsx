import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";

const courseNames = [
  "Introduction to Computer Science", "Data Science & Machine Learning",  "Physics Fundamentals", "Engineering Basics", "Mathematics for Scientists",
  "Artificial Intelligence", "Cybersecurity Essentials", "Renewable Energy Technologies"
];

// Generate random data
const generateData = () => {
  return courseNames.map((course) => ({
    name: course,
    progress: Math.floor(Math.random() * 100),
    score: Math.floor(Math.random() * 100),
    engagement: Math.floor(Math.random() * 100),
    timeSpent: Math.floor(Math.random() * 20) + 5,
  }));
};

const data = generateData();

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const Diagnostics = () => {
  return (
    <div className="p-6 min-h-screen items-center w-[100%]">
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">LMS Analytics Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Course Progress (Line Chart) */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-center">Course Progress</h2>
          <LineChart width={400} height={250} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="progress" stroke="#0088FE" strokeWidth={2} />
          </LineChart>
        </div>

        {/* Quiz Performance (Bar Chart) */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-center">Quiz Performance</h2>
          <BarChart width={400} height={250} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="score" fill="#FF8042" />
          </BarChart>
        </div>

        {/* Engagement Metrics (Pie Chart) */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-center">Engagement Metrics</h2>
          <PieChart width={400} height={250}>
            <Pie data={data} dataKey="engagement" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>

        {/* Time Spent (Area Chart) */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-center">Time Spent on Platform</h2>
          <AreaChart width={400} height={250} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="timeSpent" stroke="#00C49F" fill="#00C49F" />
          </AreaChart>
        </div>
      </div>
    </div>
  );
};

export default Diagnostics;