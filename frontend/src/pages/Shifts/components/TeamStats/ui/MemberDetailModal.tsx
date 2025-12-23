import { Modal, Text, Badge, DataTable, Divider, Button, ModalFooter } from '@/components/ui';
import type { Column } from '@/components/ui';
import { useMemberShiftDetail } from '../../../hooks/useMemberShiftDetail';
import type { ShiftHistoryItem } from '../../../types';
import { Clock, Briefcase, Activity } from 'lucide-react';
import { safeParseDate, formatMinutes, formatTime } from '@/utils/time';
import { useAtomValue } from 'jotai';
import { timeFormatAtom } from '@/atoms/shiftAtoms';
import { themeAtom } from '@/atoms/themeAtoms';
import { cn } from '@/utils/cn';

interface MemberDetailModalProps {
  memberId: string;
  onClose: () => void;
}

export function MemberDetailModal({ memberId, onClose }: MemberDetailModalProps) {
  const { data, isLoading } = useMemberShiftDetail(memberId);
  const timeFormat = useAtomValue(timeFormatAtom);
  const theme = useAtomValue(themeAtom);
  const use24h = timeFormat === '24h';
  const isDark = theme === 'dark';

  const historyColumns: Column<ShiftHistoryItem>[] = [
// ... (rest of columns) ...
    {
      header: 'Date',
      key: 'punchInAt',
      render: (s) => safeParseDate(s.punchInAt).toLocaleDateString()
    },
    {
      header: 'Punch In',
      key: 'punchInAtTime',
      render: (s) => formatTime(s.punchInAt, use24h)
    },
    {
      header: 'Punch Out',
      key: 'punchOutAt',
      render: (s) => s.punchOutAt 
        ? formatTime(s.punchOutAt, use24h)
        : '-'
    },
    {
      header: 'Total',
      key: 'totalMinutes',
      render: (s) => s.totalMinutes ? `${formatMinutes(s.totalMinutes)}h` : 'Active'
    }
  ];

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Shift History Detail"
      size="xl"
    >
      <div className="space-y-6">
        {isLoading ? (
          <Text align="center" color="tertiary" className="p-12">
            Loading history...
          </Text>
        ) : !data ? (
          <Text align="center" color="red" className="p-12">
            Failed to load member shift details.
          </Text>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={cn(
                "p-4 rounded-[1rem] border backdrop-blur-[20px] saturate-[180%]",
                isDark ? "bg-white/10 border-white/20 text-white" : "bg-black/[0.03] border-black/[0.08] text-black"
              )}>
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={14} className={isDark ? "text-white/40" : "text-black/40"} />
                  <Text variant="caption1" weight="bold" color="tertiary" className="uppercase tracking-widest block">
                    Worked (30d)
                  </Text>
                </div>
                <Text variant="title2" weight="bold">
                  {(data.workedMinutes / 60).toFixed(1)}h
                </Text>
              </div>
              <div className={cn(
                "p-4 rounded-[1rem] border backdrop-blur-[20px] saturate-[180%]",
                isDark ? "bg-white/10 border-white/20 text-white" : "bg-black/[0.03] border-black/[0.08] text-black"
              )}>
                <div className="flex items-center gap-2 mb-1">
                  <Briefcase size={14} className={isDark ? "text-white/40" : "text-black/40"} />
                  <Text variant="caption1" weight="bold" color="tertiary" className="uppercase tracking-widest block">
                    Contracted
                  </Text>
                </div>
                <Text variant="title2" weight="bold">
                  {(data.contractedMinutes / 60).toFixed(1)}h
                </Text>
              </div>
              <div className={cn(
                "p-4 rounded-[1rem] border backdrop-blur-[20px] saturate-[180%]",
                isDark ? "bg-white/10 border-white/20 text-white" : "bg-black/[0.03] border-black/[0.08] text-black"
              )}>
                <div className="flex items-center gap-2 mb-1">
                  <Activity size={14} className={isDark ? "text-white/40" : "text-black/40"} />
                  <Text variant="caption1" weight="bold" color="tertiary" className="uppercase tracking-widest block">
                    Bank Status
                  </Text>
                </div>
                <Badge variant={data.status === 'healthy' ? 'success' : 'warning'} size="md">
                  {data.status.toUpperCase()}
                </Badge>
              </div>
            </div>

            <Divider />

            <DataTable 
              data={data.history || []} 
              columns={historyColumns} 
              className="border-none shadow-none bg-transparent"
            />

            <ModalFooter>
              <Button onClick={onClose} variant="secondary" className="px-8">
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </div>
    </Modal>
  );
}

