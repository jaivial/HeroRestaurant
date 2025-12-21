import { memo } from 'react';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { Combobox } from '../Combobox/Combobox';
import type { ComboboxItem } from '../Combobox/Combobox';

/**
 * Layer 2: Functional Component - WorkspaceSwitcher
 * Manages workspace switching logic and renders the UI.
 */
export const WorkspaceSwitcher = memo(() => {
  const { 
    workspaces, 
    currentWorkspace, 
    switchWorkspace,
    isFetching 
  } = useWorkspaces();

  const comboboxItems: ComboboxItem[] = workspaces.map(w => ({
    ...w,
    id: w.id,
    name: w.name,
    image: w.logoUrl,
  }));

  const selectedItem: ComboboxItem | null = currentWorkspace ? {
    ...currentWorkspace,
    id: currentWorkspace.id,
    name: currentWorkspace.name,
    image: currentWorkspace.logoUrl,
  } : null;

  return (
    <div className="w-[200px] md:w-[240px]">
      <Combobox
        items={comboboxItems}
        selectedItem={selectedItem}
        onChange={(item) => switchWorkspace(item as any)}
        placeholder={isFetching ? 'Loading...' : 'Switch workspace...'}
        disabled={isFetching}
      />
    </div>
  );
});

WorkspaceSwitcher.displayName = 'WorkspaceSwitcher';
