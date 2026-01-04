import { memo } from 'react';
import { Card, Badge, Text, DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui';
import type { MenuCardProps } from '../../../types';

export const MenuCard = memo(function MenuCard({ menu, onToggleStatus, onEdit, onDelete, onCopyLink, onPreview, onGenerateQR }: MenuCardProps) {
  return (
    <Card className="group overflow-hidden border-2 border-apple-gray-100 bg-surface-primary rounded-[2.2rem] hover:shadow-apple-xl hover:border-apple-blue/20 transition-all duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between p-8 gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[1.5rem] bg-apple-blue/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
            <svg className="w-8 h-8 text-apple-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <Text weight="bold" className="text-2xl">{menu.title}</Text>
              <Badge 
                variant={menu.type === 'fixed_price' ? 'default' : 'info'}
                className="rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              >
                {menu.type === 'fixed_price' ? 'Fixed Price' : 'Open'}
              </Badge>
            </div>
            <Text color="secondary" className="text-lg">
              {menu.price ? `${menu.price}€` : 'Open Prices'} • {menu.drinkIncluded ? 'Drink included' : 'No drink'}
            </Text>
          </div>
        </div>
        
        <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-6 md:pt-0">
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <Text color="tertiary" weight="bold" className="uppercase tracking-widest text-[9px] mb-1 block">
                Status
              </Text>
              <Text variant="subheadline" weight="bold" className={menu.isActive ? 'text-apple-green' : 'text-content-tertiary'}>
                {menu.isActive ? 'Active' : 'Inactive'}
              </Text>
            </div>
          </div>

          <DropdownMenu
            align="right"
            trigger={
              <button
                className="flex items-center justify-center w-[44px] h-[44px] rounded-full hover:bg-apple-blue/10 transition-all duration-200 active:scale-95"
                aria-label="Menu actions"
              >
                <svg className="w-6 h-6 text-content-primary" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="5" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="12" cy="19" r="2" />
                </svg>
              </button>
            }
          >
            <DropdownMenuItem
              onClick={() => onPreview(menu.id)}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              }
            >
              Preview Menu
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => onToggleStatus(menu.id, !menu.isActive)}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={menu.isActive 
                      ? "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    }
                  />
                </svg>
              }
            >
              {menu.isActive ? 'Deactivate Menu' : 'Activate Menu'}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => onEdit(menu.id)}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              }
            >
              Edit Menu
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => onCopyLink(menu.id)}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              }
            >
              Copy Link
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => onGenerateQR(menu.id, menu.title)}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                  />
                </svg>
              }
            >
              Generate QR Code
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              variant="danger"
              onClick={() => onDelete(menu.id)}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              }
            >
              Delete Menu
            </DropdownMenuItem>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
});

