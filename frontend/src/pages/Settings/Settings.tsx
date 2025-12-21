import { memo, useState } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { Container } from '@/components/ui/Container';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs/Tabs';
import { Text } from '@/components/ui/Text/Text';
import { Button } from '@/components/ui/Button/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card/Card';
import { useSettingsForm } from './hooks/useSettingsForm';
import { useSettingsActions } from './hooks/useSettingsActions';
import { useWorkspaceAreaData } from '../WorkspaceArea/hooks/useWorkspaceAreaData';
import { cn } from '@/utils/cn';

// Section Components
import { GeneralSection } from './components/sections/GeneralSection';
import { BrandingSection } from './components/sections/BrandingSection';
import { ContactSection } from './components/sections/ContactSection';
import { LocalizationSection } from './components/sections/LocalizationSection';
import { ScheduleSection } from './components/sections/ScheduleSection';
import { SocialSection } from './components/sections/SocialSection';

/**
 * Settings Page
 * Organizes workspace settings into tabs for better accessibility.
 */
export const Settings = memo(() => {
  const theme = useAtomValue(themeAtom);
  const isDark = theme === 'dark';
  
  const { workspace, isLoading: isDataLoading } = useWorkspaceAreaData();
  const { updateWorkspace, isUpdating } = useSettingsActions();
  const { 
    formData, 
    handleChange, 
    handleScheduleChange,
    handleMealChange,
    handleSubmit 
  } = useSettingsForm(workspace, updateWorkspace);

  const [activeTab, setActiveTab] = useState('general');

  if (!workspace && isDataLoading) {
    return (
      <Container className="py-8 max-w-7xl mx-auto">
        <Text variant="largeTitle" weight="bold">Settings</Text>
        <div className="mt-8 animate-pulse space-y-4">
          <div className="h-10 w-64 bg-black/10 dark:bg-white/10 rounded-lg" />
          <div className="h-[400px] w-full bg-black/5 dark:bg-white/5 rounded-2xl" />
        </div>
      </Container>
    );
  }

  if (!workspace) return null;

  return (
    <Container className="py-8 space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col space-y-2">
        <div className="flex items-center gap-3">
          <Text variant="largeTitle" weight="bold">Settings</Text>
          {isUpdating && <span className="animate-pulse opacity-50 text-[34px]">...</span>}
        </div>
        <Text variant="body" color="secondary">
          Configure your workspace preferences, branding, and operational schedules.
        </Text>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Tabs value={activeTab} onChange={setActiveTab} defaultValue="general">
          <TabsList className="mb-8" variant="glass">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="localization">Localization</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="danger" className="text-red-500 hover:text-red-600">Danger Zone</TabsTrigger>
          </TabsList>

          <div className="min-h-[400px]">
            <TabsContent value="general">
              <GeneralSection formData={formData} onChange={handleChange} />
            </TabsContent>
            
            <TabsContent value="branding">
              <BrandingSection formData={formData} onChange={handleChange} />
            </TabsContent>
            
            <TabsContent value="contact">
              <ContactSection formData={formData} onChange={handleChange} />
            </TabsContent>

            <TabsContent value="localization">
              <LocalizationSection formData={formData} onChange={handleChange} />
            </TabsContent>

            <TabsContent value="schedule">
              <ScheduleSection 
                formData={formData} 
                onChange={handleChange} 
                onScheduleChange={handleScheduleChange}
                onMealChange={handleMealChange}
              />
            </TabsContent>

            <TabsContent value="social">
              <SocialSection formData={formData} onChange={handleChange} />
            </TabsContent>

            <TabsContent value="danger">
              <Card className={cn(
                "border-2",
                isDark ? "border-[#FF453A]/20" : "border-[#FF3B30]/20"
              )}>
                <CardHeader>
                  <div className="space-y-1">
                    <Text weight="bold" color="red">Danger Zone</Text>
                    <Text variant="caption" color="secondary">Irreversible and destructive actions.</Text>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <Text weight="semibold">Delete Workspace</Text>
                      <Text variant="caption" color="secondary">
                        Once you delete a workspace, there is no going back. Please be certain.
                      </Text>
                    </div>
                    <Button 
                      type="button"
                      variant="gray" 
                      className={cn(
                        "hover:bg-[#FF3B30] hover:text-white transition-colors",
                        isDark ? "hover:bg-[#FF453A]" : "hover:bg-[#FF3B30]"
                      )}
                    >
                      Delete Workspace
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>

        {activeTab !== 'danger' && (
          <div className="sticky bottom-8 z-10 flex justify-center">
            <Button
              type="submit"
              variant="filled"
              className="px-12 py-6 rounded-full shadow-2xl scale-110 hover:scale-[1.15] transition-transform"
              disabled={isUpdating}
            >
              {isUpdating ? 'Saving Changes...' : 'Save All Changes'}
            </Button>
          </div>
        )}
      </form>
    </Container>
  );
});

Settings.displayName = 'Settings';

export default Settings;

