import React from 'react';
import { Target } from 'lucide-react';
import {
  Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  Tooltip, Legend
} from 'recharts';

const SkillGapRadarChart = ({ data }) => {
  // Map backend types to display names
  const categoryMap = {
    'KM_COURSE': 'Corporate KM',
    'LEARNING_ASSESS': 'Assessment',
    'INCENTIVE_REWARD': 'Incentives',
    'TRACKING_ANALYTICS': 'Analytics',
    'GOAL_PATH': 'Strategic Goals',
    'INTERNAL_COMM': 'Communication',
    // Fallback for new axes if explicitly defined
    'BUSINESS': 'Business',
    'SOFT_SKILLS': 'Soft Skills',
    'FUNCTIONAL': 'Functional',
    'LEADERSHIP': 'Leadership',
    'COMPLIANCE': 'Compliance',
    'DIGITAL': 'Digital'
  };

  const chartData = (data || []).map(item => ({
    subject: categoryMap[item.type] || item.type,
    A: item.average_mastery || 0,
    fullMark: 100,
  }));

  // Ensure we have at least 3 points for a radar chart
  if (chartData.length < 3) {
    const placeholders = ['Functional', 'Soft Skills', 'Leadership'].map(p => ({
      subject: p,
      A: 0,
      fullMark: 100
    }));
    chartData.push(...placeholders.slice(0, 3 - chartData.length));
  }

  return (
    <div className="card flex min-w-0 flex-col p-6 card-no-lift">
      <div className="flex items-center gap-2 mb-6">
        <Target size={20} className="text-primary" />
        <h3 className="text-lg font-bold">Skill Gap Analysis (Org Mastery)</h3>
      </div>
      
      <div className="h-[300px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              tick={false}
              axisLine={false}
            />
            <Radar
              name="Mastery Level"
              dataKey="A"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.6}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-xs text-muted font-medium italic">
          Target baseline is constant 100% for all competency areas.
        </p>
      </div>
    </div>
  );
};

export default SkillGapRadarChart;
