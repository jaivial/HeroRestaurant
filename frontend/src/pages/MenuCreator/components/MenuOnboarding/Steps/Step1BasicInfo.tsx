// src/pages/MenuCreator/components/MenuOnboarding/Steps/Step1BasicInfo.tsx
import { useAtomValue } from 'jotai';
import { themeAtom } from '../../../../../atoms/themeAtoms';
import { useStep1BasicInfo } from '../../../hooks/useStep1BasicInfo';
import { Input } from '../../../../../components/ui/Input/Input';
import { Heading, Text, Label } from '../../../../../components/ui/Text/Text';
import { Card, CardContent } from '../../../../../components/ui/Card/Card';
import { cn } from '../../../../../utils/cn';

export function Step1BasicInfo() {
  // ✅ Layer 2: Business logic in custom hook
  const { menu, updateTitle, updateType, updatePrice } = useStep1BasicInfo();
  const theme = useAtomValue(themeAtom);
  const isDark = theme === 'dark';

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <Heading level={2} className="text-3xl font-bold tracking-tight">General Information</Heading>
        <Text color="secondary" className="text-lg">Start by giving your menu a name and selecting its type.</Text>
      </div>

      <div className="space-y-8">
        <div className="space-y-3">
          <Label htmlFor="menu-title" className="text-xl font-bold ml-1 text-content-primary">Menu Title</Label>
          <Input 
            id="menu-title"
            placeholder="e.g. Daily Lunch Menu, Summer Specials..." 
            value={menu?.title || ''}
            onChange={(e) => updateTitle(e.target.value)}
            autoFocus
            className={cn(
              "h-16 text-xl px-8 rounded-[2.2rem] border-2 transition-all shadow-apple-xl",
              isDark ? "bg-[#000000] border-[#616161] hover:border-[#9E9E9E] focus:border-apple-blue" : "bg-[#F5F5F7] border-[#BDBDBD] hover:border-[#757575] focus:border-apple-blue"
            )}
          />
        </div>

        <div className="space-y-4">
          <Label className="text-xl font-bold ml-1 text-content-primary">Menu Type</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card 
              className={cn(
                "cursor-pointer transition-all duration-500 border-2 p-2 rounded-[2.2rem]",
                menu?.type === 'fixed_price' 
                  ? isDark ? "border-apple-blue bg-[#252525] shadow-apple-xl scale-[1.02]" : "border-black bg-black/5 shadow-apple-xl scale-[1.02]"
                  : isDark ? "border-[#616161] bg-[#000000] hover:border-[#9E9E9E] hover:bg-[#252525] hover:scale-[1.01]" : "border-[#BDBDBD] bg-[#FFFFFF] hover:border-black/30 hover:bg-[#F2F2F7] hover:scale-[1.01]"
              )}
              onClick={() => updateType('fixed_price')}
            >
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors", menu?.type === 'fixed_price' ? isDark ? "border-apple-blue bg-apple-blue" : "border-black bg-black" : isDark ? "border-[#A1A1A6] bg-[#0A0A0B]" : "border-[#424245] bg-[#E5E5EA]")}>
                    {menu?.type === 'fixed_price' && <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />}
                  </div>
                  <Text weight="semibold" className={cn("text-xl", menu?.type === 'fixed_price' && (isDark ? "text-white" : "text-black"))}>Fixed Price Menu</Text>
                </div>
                <Text variant="footnote" color="secondary" className="text-base leading-relaxed">
                  Customers pay a single price for a combination of dishes (e.g. 1 Appetizer + 1 Main + 1 Dessert).
                </Text>
              </CardContent>
            </Card>

            <Card 
              className={cn(
                "cursor-pointer transition-all duration-500 border-2 p-2 rounded-[2.2rem]",
                menu?.type === 'open_menu' 
                  ? isDark ? "border-apple-blue bg-[#252525] shadow-apple-xl scale-[1.02]" : "border-black bg-black/5 shadow-apple-xl scale-[1.02]"
                  : isDark ? "border-[#616161] bg-[#000000] hover:border-[#9E9E9E] hover:bg-[#252525] hover:scale-[1.01]" : "border-[#BDBDBD] bg-[#FFFFFF] hover:border-black/30 hover:bg-[#F2F2F7] hover:scale-[1.01]"
              )}
              onClick={() => updateType('open_menu')}
            >
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors", menu?.type === 'open_menu' ? isDark ? "border-apple-blue bg-apple-blue" : "border-black bg-black" : isDark ? "border-[#A1A1A6] bg-[#0A0A0B]" : "border-[#424245] bg-[#E5E5EA]")}>
                    {menu?.type === 'open_menu' && <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />}
                  </div>
                  <Text weight="semibold" className={cn("text-xl", menu?.type === 'open_menu' && (isDark ? "text-white" : "text-black"))}>Open Menu (à la carte)</Text>
                </div>
                <Text variant="footnote" color="secondary" className="text-base leading-relaxed">
                  Each dish has its own price. Customers can choose as many dishes as they want.
                </Text>
              </CardContent>
            </Card>
          </div>
        </div>

        {menu?.type === 'fixed_price' && (
          <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
            <Label htmlFor="menu-price" className="text-lg font-semibold ml-1">Menu Price (€)</Label>
            <div className="relative max-w-[240px]">
              <Input 
                id="menu-price"
                type="number"
                placeholder="0.00"
                value={menu?.price || ''}
                onChange={(e) => updatePrice(parseFloat(e.target.value) || 0)}
                className={cn("h-14 text-xl px-6 pr-12 rounded-[2.2rem] border-2 transition-all shadow-apple-lg", isDark ? "bg-[#161617] border-[#616161] hover:border-[#9E9E9E] focus:border-apple-blue focus:bg-[#000000]" : "bg-[#F5F5F7] border-[#BDBDBD] hover:border-[#757575] focus:border-apple-blue focus:bg-[#FFFFFF]")}
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-content-tertiary font-semibold text-lg">€</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
