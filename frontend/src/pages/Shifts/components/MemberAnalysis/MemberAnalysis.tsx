// frontend/src/pages/Shifts/components/MemberAnalysis/MemberAnalysis.tsx

import { useMemo } from 'react';
import { useTeamShifts } from '../../hooks/useTeamShifts';
import type { MemberAnalysisProps, MemberAnalysisUIProps } from '../../types';
import { MemberAnalysisUI } from './ui/MemberAnalysisUI';

export function MemberAnalysis({ memberId, restaurantId, memberStats }: MemberAnalysisProps) {
  const { members, isLoading } = useTeamShifts(restaurantId);

  const analysisData = useMemo(() => {
    if (isLoading || members.length === 0) return [];

    // Calculate team averages
    const totalMembers = members.length;
    const teamAvgWorked = members.reduce((sum, m) => sum + (m.totalWorkedThisWeek || 0), 0) / totalMembers;
    const teamAvgBank = members.reduce((sum, m) => sum + (m.totalBankOfHours || 0), 0) / totalMembers;

    const stats: MemberAnalysisUIProps['memberStats'] = [
      {
        label: 'Weekly Hours',
        value: memberStats.workedMinutes / 60,
        teamAvg: teamAvgWorked / 60,
        unit: 'h',
        description: 'Comparison of your total worked hours this week against the team average.',
        trend: (memberStats.workedMinutes / 60) >= (teamAvgWorked / 60) ? 'up' : 'down'
      },
      {
        label: 'Bank Balance',
        value: memberStats.differenceMinutes / 60,
        teamAvg: teamAvgBank / 60,
        unit: 'h',
        description: 'Your current hour balance compared to the collective team balance average.',
        trend: memberStats.differenceMinutes >= teamAvgBank ? 'up' : 'down'
      },
      {
        label: 'Engagement Score',
        value: Math.min(100, (memberStats.workedMinutes / (teamAvgWorked || 1)) * 100),
        teamAvg: 100,
        unit: '%',
        description: 'Estimated engagement based on shift consistency and participation.',
        trend: 'neutral'
      }
    ];

    return stats;
  }, [members, isLoading, memberStats]);

  return (
    <MemberAnalysisUI 
      memberStats={analysisData}
    />
  );
}
