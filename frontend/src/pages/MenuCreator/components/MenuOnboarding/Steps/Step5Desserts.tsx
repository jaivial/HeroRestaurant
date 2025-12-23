// src/pages/MenuCreator/components/MenuOnboarding/Steps/Step5Desserts.tsx
import { useAtomValue } from 'jotai';
import { themeAtom } from '../../../../../atoms/themeAtoms';
import { useStep5Desserts } from '../../../hooks/useStep5Desserts';
import { Heading, Text, Label } from '../../../../../components/ui/Text/Text';
import { Card, CardContent } from '../../../../../components/ui/Card/Card';
import { cn } from '../../../../../utils/cn';

export function Step5Desserts() {
  // ✅ Layer 2: Business logic in custom hook
  const { dessertSource, setDessertSource } = useStep5Desserts();
  const theme = useAtomValue(themeAtom);
  const isDark = theme === 'dark';

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <Heading level={2} className="text-3xl font-bold tracking-tight">Dessert Options</Heading>
        <Text color="primary" className="text-lg opacity-80">Finalize how desserts are handled in this menu.</Text>
      </div>

      <div className="space-y-8">
        <div className="space-y-4">
          <Label className="text-xl font-bold ml-1 text-content-primary">Where should desserts come from?</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card 
              className={cn(
                "cursor-pointer transition-all duration-500 border-2 p-2 rounded-[2.2rem]",
                dessertSource === 'internal'
                  ? "border-apple-blue bg-apple-blue/5 shadow-apple-xl scale-[1.02]"
                  : cn(
                      "bg-surface-primary hover:border-apple-blue/30 hover:bg-apple-gray-50 hover:scale-[1.01]",
                      isDark ? "border-apple-gray-700" : "border-apple-gray-300"
                    )
              )}
              onClick={() => setDessertSource('internal')}
            >
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors", 
                    dessertSource === 'internal' 
                      ? "border-apple-blue bg-apple-blue" 
                      : cn(
                          "bg-apple-gray-100",
                          isDark ? "border-apple-gray-400 bg-apple-gray-800" : "border-apple-gray-500 bg-apple-gray-100"
                        )
                  )}>
                    {dessertSource === 'internal' && <div className={cn("w-2.5 h-2.5 rounded-full shadow-sm", isDark ? "bg-apple-gray-900" : "bg-white")} />}
                  </div>
                  <Text weight="semibold" className="text-xl">Menu's Own Desserts</Text>
                </div>
                <Text variant="footnote" color="primary" className="text-base leading-relaxed opacity-70">
                  Create a specific list of desserts just for this menu.
                </Text>
              </CardContent>
            </Card>

            <Card 
              className={cn(
                "cursor-pointer transition-all duration-500 border-2 p-2 rounded-[2.2rem]",
                dessertSource === 'external'
                  ? "border-apple-blue bg-apple-blue/5 shadow-apple-xl scale-[1.02]"
                  : cn(
                      "bg-surface-primary hover:border-apple-blue/30 hover:bg-apple-gray-50 hover:scale-[1.01]",
                      isDark ? "border-apple-gray-700" : "border-apple-gray-300"
                    )
              )}
              onClick={() => setDessertSource('external')}
            >
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors", 
                    dessertSource === 'external' 
                      ? "border-apple-blue bg-apple-blue" 
                      : cn(
                          "bg-apple-gray-100",
                          isDark ? "border-apple-gray-400 bg-apple-gray-800" : "border-apple-gray-500 bg-apple-gray-100"
                        )
                  )}>
                    {dessertSource === 'external' && <div className={cn("w-2.5 h-2.5 rounded-full shadow-sm", isDark ? "bg-apple-gray-900" : "bg-white")} />}
                  </div>
                  <Text weight="semibold" className="text-xl">Dessert List Menu</Text>
                </div>
                <Text variant="footnote" color="primary" className="text-base leading-relaxed opacity-70">
                  Use the general dessert menu configured in the restaurant settings.
                </Text>
              </CardContent>
            </Card>
          </div>
        </div>

        {dessertSource === 'internal' ? (
          <div className={cn(
            "p-8 rounded-[2.2rem] border-2 flex items-start gap-4 animate-in fade-in slide-in-from-top-2 duration-300",
            isDark ? "bg-info-bg-blue-dark border-info-border-blue-dark" : "bg-info-bg-blue-light border-info-border-blue-light"
          )}>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
              isDark ? "bg-info-border-blue-dark" : "bg-info-border-blue-light"
            )}>
              <svg className={cn(
                "w-5 h-5",
                isDark ? "text-info-text-blue-dark" : "text-info-text-blue-light"
              )} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth={2} strokeLinecap="round" />
              </svg>
            </div>
            <Text variant="footnote" weight="medium" className={cn(
              "text-lg leading-relaxed",
              isDark ? "text-info-text-blue-dark" : "text-info-text-blue-light"
            )}>
              You already configured desserts in the structure step. They will be included in the final menu display.
            </Text>
          </div>
        ) : (
          <div className={cn(
            "p-8 rounded-[2.2rem] border-2 flex items-start gap-4 animate-in fade-in slide-in-from-top-2 duration-300",
            isDark ? "bg-info-bg-orange-dark border-info-border-orange-dark" : "bg-info-bg-orange-light border-info-border-orange-light"
          )}>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
              isDark ? "bg-info-border-orange-dark" : "bg-info-border-orange-light"
            )}>
              <svg className={cn(
                "w-5 h-5",
                isDark ? "text-info-text-orange-dark" : "text-info-text-orange-light"
              )} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeWidth={2} strokeLinecap="round" />
              </svg>
            </div>
            <Text variant="footnote" weight="medium" className={cn(
              "text-lg leading-relaxed",
              isDark ? "text-info-text-orange-dark" : "text-info-text-orange-light"
            )}>
              The "Desserts" section will be linked to your global dessert catalog. Make sure you have it updated in the Store settings.
            </Text>
          </div>
        )}
      </div>
    </div>
  );
}
