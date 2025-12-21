import { Modal, Text, Badge, DataTable, Divider, Button } from '@/components/ui';
import type { Column } from '@/components/ui';
import { useMemberShiftDetail } from '../../../hooks/useMemberShiftDetail';
import type { ShiftHistoryItem } from '../../../types';
import { Clock, Briefcase, Activity } from 'lucide-react';
import { safeParseDate, formatMinutes, formatTime } from '@/utils/time';
import { useAtomValue } from 'jotai';
import { timeFormatAtom } from '@/atoms/shiftAtoms';

interface MemberDetailModalProps {
  memberId: string;
  onClose: () => void;
}

export function MemberDetailModal({ memberId, onClose }: MemberDetailModalProps) {
  const { data, isLoading } = useMemberShiftDetail(memberId);
  const timeFormat = useAtomValue(timeFormatAtom);
  const use24h = timeFormat === '24h';

  const historyColumns: Column<ShiftHistoryItem>[] = [
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
      render: (s) => s.totalMinutes ? formatMinutes(s.totalMinutes) : 'Active'
    }
  ];

  const primaryText = 'text-[#1D1D1F] dark:text-white';

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Shift History Detail"
      size="xl"
      className="rounded-[2.2rem]"
    >
      <div className="space-y-6">
        {isLoading ? (
          <div className="p-12 text-center opacity-50">Loading history...</div>
        ) : !data ? (
          <div className="p-12 text-center text-red-500">
            Failed to load member shift details.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-[1.2rem] bg-black/[0.03] dark:bg-white/5 border border-black/[0.06] dark:border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={14} className="opacity-40" />
                  <Text variant="caption1" weight="bold" className="uppercase tracking-widest opacity-40 block">
                    Worked (30d)
                  </Text>
                </div>
                <Text variant="title2" weight="bold" className={primaryText}>
                  {(data.workedMinutes / 60).toFixed(1)}h
                </Text>
              </div>
              <div className="p-4 rounded-[1.2rem] bg-black/[0.03] dark:bg-white/5 border border-black/[0.06] dark:border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <Briefcase size={14} className="opacity-40" />
                  <Text variant="caption1" weight="bold" className="uppercase tracking-widest opacity-40 block">
                    Contracted
                  </Text>
                </div>
                <Text variant="title2" weight="bold" className={primaryText}>
                  {(data.contractedMinutes / 60).toFixed(1)}h
                </Text>
              </div>
              <div className="p-4 rounded-[1.2rem] bg-black/[0.03] dark:bg-white/5 border border-black/[0.06] dark:border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <Activity size={14} className="opacity-40" />
                  <Text variant="caption1" weight="bold" className="uppercase tracking-widest opacity-40 block">
                    Bank Status
                  </Text>
                </div>
                <Badge variant={data.status === 'healthy' ? 'success' : 'warning'} size="md">
                  {data.status.toUpperCase()}
                </Badge>
              </div>
            </div>

            <Divider />

            <div className="max-h-[400px] overflow-y-auto pr-2">
              <DataTable 
                data={data.history || []} 
                columns={historyColumns} 
                className="border-none shadow-none bg-transparent"
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={onClose} variant="secondary" className="rounded-full px-8">
                Close
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

