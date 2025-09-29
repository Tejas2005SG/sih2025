import React, { useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  FileText, 
  Heart, 
  TrendingUp, 
  Activity,
  Pill,
  Users,
  Target,
  Scale,
  Utensils
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarRadiusAxis,
  Radar
} from 'recharts';

import { useDashboardStore } from '../../stores/dashboardStore';
import { useAuthStore } from '../../stores/authStore';

const DOSHA_COLORS = {
  Vata: '#8B5CF6',   // purple
  Pitta: '#F59E0B',  // orange
  Kapha: '#10B981',  // teal
};

const CHART_COLORS = ['#8B5CF6', '#F59E0B', '#10B981', '#EF4444', '#3B82F6', '#F97316', '#84CC16', '#EC4899'];

const QuickStats = () => {
  const { healthStats, quickStats, upcomingAppointments } = useDashboardStore();
  const { 
    user, 
    registrationStats, 
    registrationStatsLoading, 
    registrationStatsError, 
    fetchRegistrationStats 
  } = useAuthStore();

  useEffect(() => {
    fetchRegistrationStats({ scope: 'me' });
  }, [fetchRegistrationStats]);

  // Merge backend stats into the top cards with hardcoded fallbacks
  const mergedStats = useMemo(() => {
    return {
      totalAppointments: healthStats?.totalAppointments || 12,
      healthScore: registrationStats?.healthScore ?? healthStats?.healthScore ?? 85,
      activePrescriptions: registrationStats?.counts?.currentMedications ?? healthStats?.activePrescriptions ?? 3,
      wellnessJourneyDays: registrationStats?.wellnessJourneyDays ?? healthStats?.wellnessJourneyDays ?? 45,
    };
  }, [healthStats, registrationStats]);

  const stats = [
    {
      name: 'Total Appointments',
      value: mergedStats.totalAppointments,
      change: '+12%',
      changeType: 'increase',
      icon: Calendar,
      color: 'blue',
      description: 'Consultations booked'
    },
    {
      name: 'Health Score',
      value: `${mergedStats.healthScore}%`,
      change: '+5%',
      changeType: 'increase',
      icon: Heart,
      color: 'green',
      description: 'Overall wellness rating'
    },
    {
      name: 'Active Prescriptions',
      value: mergedStats.activePrescriptions,
      change: 'No change',
      changeType: 'neutral',
      icon: Pill,
      color: 'purple',
      description: 'Current medications'
    },
    {
      name: 'Wellness Journey',
      value: `${mergedStats.wellnessJourneyDays} days`,
      change: 'Since start',
      changeType: 'neutral',
      icon: TrendingUp,
      color: 'yellow',
      description: 'On your wellness path'
    }
  ];

  const todayStats = [
    {
      name: "Today's Appointments",
      value: quickStats?.todaysAppointments ?? 2,
      icon: Clock,
      color: 'bg-blue-500'
    },
    {
      name: 'Pending Tasks',
      value: quickStats?.pendingTasks ?? 4,
      icon: FileText,
      color: 'bg-orange-500'
    },
    {
      name: 'Unread Messages',
      value: quickStats?.unreadMessages ?? 7,
      icon: Users,
      color: 'bg-green-500'
    },
    {
      name: 'Health Alerts',
      value: quickStats?.healthAlerts ?? 1,
      icon: Activity,
      color: 'bg-red-500'
    }
  ];

  // ========= Hardcoded Recharts data =========

  // Dosha pie data - hardcoded
  const doshaPieData = [
    { name: 'Vata', value: 45, fill: DOSHA_COLORS.Vata },
    { name: 'Pitta', value: 35, fill: DOSHA_COLORS.Pitta },
    { name: 'Kapha', value: 20, fill: DOSHA_COLORS.Kapha },
  ];

  // Exercise frequency bar data - hardcoded
  const exerciseBarData = [
    { freq: '1-2 times/week', count: 25 },
    { freq: '3-4 times/week', count: 35 },
    { freq: '5+ times/week', count: 20 },
    { freq: 'Daily', count: 15 },
    { freq: 'Never', count: 5 }
  ];

  // Health concerns bar data - hardcoded
  const healthConcernsData = [
    { concern: 'Stress & Anxiety', count: 45 },
    { concern: 'Digestive Issues', count: 38 },
    { concern: 'Sleep Problems', count: 32 },
    { concern: 'Fatigue', count: 28 },
    { concern: 'Joint Pain', count: 25 },
    { concern: 'Headaches', count: 22 },
    { concern: 'Weight Management', count: 20 },
    { concern: 'Blood Pressure', count: 18 }
  ];

  // Dietary preferences pie data - hardcoded
  const dietaryPieData = [
    { name: 'Vegetarian', value: 40, fill: CHART_COLORS[0] },
    { name: 'Vegan', value: 25, fill: CHART_COLORS[1] },
    { name: 'Omnivore', value: 20, fill: CHART_COLORS[2] },
    { name: 'Gluten-Free', value: 10, fill: CHART_COLORS[3] },
    { name: 'Keto', value: 5, fill: CHART_COLORS[4] }
  ];

  // BMI distribution data - hardcoded
  const bmiData = [
    { range: 'Underweight', count: 8, fill: '#3B82F6' },
    { range: 'Normal', count: 52, fill: '#10B981' },
    { range: 'Overweight', count: 28, fill: '#F59E0B' },
    { range: 'Obese', count: 12, fill: '#EF4444' }
  ];

  // Wellness goals progress data - hardcoded
  const wellnessGoalsData = [
    { goal: 'Weight Management', progress: 75, target: 100 },
    { goal: 'Stress Reduction', progress: 60, target: 100 },
    { goal: 'Better Sleep', progress: 80, target: 100 },
    { goal: 'Energy Boost', progress: 45, target: 100 },
    { goal: 'Digestive Health', progress: 90, target: 100 },
    { goal: 'Mental Clarity', progress: 55, target: 100 }
  ];

  // Symptom severity radar data - hardcoded
  const symptomRadarData = [
    { symptom: 'Fatigue', severity: 7, fullLabel: 'Chronic Fatigue' },
    { symptom: 'Stress', severity: 6, fullLabel: 'Stress & Anxiety' },
    { symptom: 'Sleep Issues', severity: 5, fullLabel: 'Sleep Problems' },
    { symptom: 'Digestive', severity: 4, fullLabel: 'Digestive Issues' },
    { symptom: 'Joint Pain', severity: 3, fullLabel: 'Joint & Muscle Pain' },
    { symptom: 'Headaches', severity: 4, fullLabel: 'Frequent Headaches' }
  ];

  // Health trends line data - hardcoded with more realistic progression
  const healthTrendsData = [
    { month: 'Jan', healthScore: 72, energy: 65, mood: 68, sleep: 60 },
    { month: 'Feb', healthScore: 75, energy: 70, mood: 72, sleep: 65 },
    { month: 'Mar', healthScore: 78, energy: 75, mood: 75, sleep: 70 },
    { month: 'Apr', healthScore: 82, energy: 78, mood: 78, sleep: 75 },
    { month: 'May', healthScore: 85, energy: 82, mood: 80, sleep: 78 },
    { month: 'Jun', healthScore: 88, energy: 85, mood: 83, sleep: 82 }
  ];

  // Sleep and stress gauges - hardcoded
  const avgSleepHours = 7.5;
  const stressLevel = 'Moderate';
  const stressNumeric = 6;

  // Hardcoded dosha info
  const doshaInfo = {
    primary: 'Vata',
    secondary: 'Pitta'
  };

  const sleepQuality = 'Good';

  // ========= UI helpers =========
  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      red: 'bg-red-50 text-red-600 border-red-200'
    };
    return colorMap[color] || colorMap.green;
  };

  const getChangeColor = (changeType) => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Health Overview</h2>

        {registrationStatsError && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            {registrationStatsError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <div className="flex items-baseline">
                      <p className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </p>
                      <p className={`ml-2 text-sm font-medium ${getChangeColor(stat.changeType)}`}>
                        {stat.change}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Today's Quick Stats */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Today's Summary</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {todayStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-600">{stat.name}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Health Trends */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Health Trends Over Time</h3>
        <div className="h-80">
          <ResponsiveContainer>
            <LineChart data={healthTrendsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="healthScore" stroke="#10B981" strokeWidth={2} name="Health Score" />
              <Line type="monotone" dataKey="energy" stroke="#F59E0B" strokeWidth={2} name="Energy Level" />
              <Line type="monotone" dataKey="mood" stroke="#8B5CF6" strokeWidth={2} name="Mood" />
              <Line type="monotone" dataKey="sleep" stroke="#3B82F6" strokeWidth={2} name="Sleep Quality" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Lifestyle & Dosha Insights */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Lifestyle & Dosha Insights</h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dosha Breakdown */}
          <div className="border border-gray-100 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Dosha Breakdown</h4>
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={doshaPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {doshaPieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Primary: <span className="font-medium">{doshaInfo.primary}</span>
              <> • Secondary: <span className="font-medium">{doshaInfo.secondary}</span></>
            </p>
          </div>

          {/* Exercise Frequency */}
          <div className="border border-gray-100 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Exercise Frequency Distribution</h4>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={exerciseBarData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="freq" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#60A5FA" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sleep & Stress Gauges */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-gray-100 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Avg Sleep</h4>
              <div className="h-64 relative">
                <ResponsiveContainer>
                  <RadialBarChart
                    startAngle={180}
                    endAngle={0}
                    innerRadius="70%"
                    outerRadius="100%"
                    data={[{ name: 'Sleep', value: avgSleepHours, fill: '#10B981' }]}
                  >
                    <PolarAngleAxis type="number" domain={[0, 10]} tick={false} />
                    <RadialBar dataKey="value" background cornerRadius={8} />
                    <Tooltip />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="text-2xl font-semibold text-gray-900">{avgSleepHours}h</div>
                  <div className="text-xs text-gray-500">{sleepQuality}</div>
                </div>
              </div>
            </div>

            <div className="border border-gray-100 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Stress Level</h4>
              <div className="h-64 relative">
                <ResponsiveContainer>
                  <RadialBarChart
                    startAngle={180}
                    endAngle={0}
                    innerRadius="70%"
                    outerRadius="100%"
                    data={[{ name: 'Stress', value: stressNumeric, fill: stressNumeric >= 8 ? '#EF4444' : stressNumeric >= 6 ? '#F59E0B' : '#10B981' }]}
                  >
                    <PolarAngleAxis type="number" domain={[0, 10]} tick={false} />
                    <RadialBar dataKey="value" background cornerRadius={8} />
                    <Tooltip />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="text-sm text-gray-500">Stress</div>
                  <div className="text-xl font-semibold text-gray-900">{stressLevel}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Health Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Concerns */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-red-500" />
            Top Health Concerns
          </h3>
          <div className="h-80">
            <ResponsiveContainer>
              <BarChart data={healthConcernsData} layout="horizontal" margin={{ top: 10, right: 30, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="concern" type="category" tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#EF4444" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dietary Preferences */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Utensils className="w-5 h-5 mr-2 text-green-500" />
            Dietary Preferences
          </h3>
          <div className="h-80">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={dietaryPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {dietaryPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* BMI & Wellness Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BMI Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Scale className="w-5 h-5 mr-2 text-blue-500" />
            BMI Distribution
          </h3>
          <div className="h-80">
            <ResponsiveContainer>
              <BarChart data={bmiData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {bmiData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Wellness Goals Progress */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-purple-500" />
            Wellness Goals Progress
          </h3>
          <div className="space-y-4">
            {wellnessGoalsData.map((goal, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{goal.goal}</span>
                  <span className="text-gray-500">{goal.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Symptom Analysis */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Symptom Severity Analysis</h3>
        <div className="h-96">
          <ResponsiveContainer>
            <RadarChart data={symptomRadarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="symptom" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis angle={90} domain={[0, 10]} tick={false} />
              <Radar
                name="Severity"
                dataKey="severity"
                stroke="#EF4444"
                fill="#EF4444"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                        <p className="text-sm font-medium text-gray-900">{data.fullLabel}</p>
                        <p className="text-sm text-red-600">Severity: {data.severity}/10</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Upcoming Appointments Preview */}
      {upcomingAppointments?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Upcoming Appointments</h3>
            <a href="/appointments" className="text-sm text-green-600 hover:text-green-700 font-medium">
              View all →
            </a>
          </div>
          <div className="space-y-3">
            {upcomingAppointments.slice(0, 3).map((appointment, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {appointment.doctorName || 'Dr. Ayurveda Specialist'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(appointment.dateTime).toLocaleDateString()} at{' '}
                    {new Date(appointment.dateTime).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    appointment.type === 'video' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {appointment.type || 'In-person'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickStats;