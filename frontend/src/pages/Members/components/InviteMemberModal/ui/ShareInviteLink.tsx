import { Text, Button } from '@/components/ui';
import { cn } from '@/utils/cn';
import { useState } from 'react';

interface ShareInviteLinkProps {
  inviteLink: string | null;
  onGenerate: () => Promise<void>;
  isGenerating: boolean;
  isDark: boolean;
}

export function ShareInviteLink({ inviteLink, onGenerate, isGenerating, isDark }: ShareInviteLinkProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      ),
      color: 'bg-[#25D366]',
      href: (link: string) => `https://wa.me/?text=${encodeURIComponent('Join our workspace: ' + link)}`,
    },
    {
      name: 'Instagram',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.805.249 2.227.412.56.216.96.474 1.38.894.42.42.678.82.894 1.38.163.422.358 1.057.412 2.227.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.054 1.17-.249 1.805-.412 2.227-.216.56-.474.96-.894 1.38-.42.42-.82.678-1.38.894-.422.163-1.057.358-2.227.412-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.054-1.805-.249-2.227-.412-.56-.216-.96-.474-1.38-.894-.42-.42-.678-.82-.894-1.38-.163-.422-.358-1.057-.412-2.227-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.054-1.17.249-1.805.412-2.227.216-.56.474-.96.894-1.38.42-.42.82-.678 1.38-.894.422-.163 1.057-.358 2.227-.412 1.266-.058 1.646-.07 4.85-.07M12 0C8.741 0 8.333.014 7.053.072 5.775.131 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.014 8.333 0 8.741 0 12s.014 3.667.072 4.947c.059 1.278.261 2.148.558 2.913.306.789.717 1.459 1.384 2.126s1.334 1.077 2.126 1.384c.765.297 1.635.499 2.913.558C8.333 23.986 8.741 24 12 24s3.667-.014 4.947-.072c1.278-.059 2.148-.261 2.913-.558.789-.306 1.459-.717 2.126-1.384s1.077-1.334 1.384-2.126c.297-.765.499-1.635.558-2.913.058-1.28.072-1.687.072-4.947s-.014-3.667-.072-4.947c-.059-1.278-.261-2.148-.558-2.913-.306-.789-.717-1.459-1.384-2.126s-1.334-1.077-2.126-1.384c-.765-.297-1.635-.499-2.913-.558C15.667.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
        </svg>
      ),
      color: 'bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]',
      href: (_link: string) => `https://www.instagram.com/`, // Instagram doesn't support direct link sharing via URL
    },
    {
      name: 'Email',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      color: 'bg-apple-blue',
      href: (link: string) => `mailto:?subject=${encodeURIComponent('Join our workspace')}&body=${encodeURIComponent('Join our workspace using this link: ' + link)}`,
    },
  ];

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between px-1">
        <Text variant="caption1" weight="bold" color="secondary" className="uppercase tracking-widest">
          Share Invitation Link
        </Text>
        {!inviteLink && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onGenerate} 
            loading={isGenerating}
            className="text-apple-blue h-auto py-1 font-bold hover:bg-apple-blue/5"
          >
            Generate Link
          </Button>
        )}
      </div>

      {inviteLink ? (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className={cn(
            "flex items-center gap-3 p-4 rounded-2xl border",
            isDark 
              ? "bg-white/10 border-white/20 shadow-inner" 
              : "bg-black/[0.08] border-black/[0.12] shadow-inner"
          )}>
            <div className="flex-1 truncate">
              <Text className={cn(
                "text-[15px] font-medium truncate",
                isDark ? "text-white/90" : "text-[#1D1D1F]/90"
              )}>{inviteLink}</Text>
            </div>
            <Button 
              onClick={handleCopy} 
              variant={copied ? "filled" : "tinted"} 
              color={copied ? "green" : "blue"}
              size="sm"
              className="rounded-xl font-bold min-w-[80px] h-9"
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {shareOptions.map((option) => (
              <a 
                key={option.name}
                href={option.href(inviteLink)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 group"
              >
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center text-white transition-transform group-hover:scale-110 active:scale-95 shadow-lg",
                  option.color
                )}>
                  {option.icon}
                </div>
                <Text variant="caption2" color="secondary" className="font-bold">{option.name}</Text>
              </a>
            ))}
          </div>
        </div>
      ) : (
        <div className={cn(
          "h-24 rounded-2xl border border-dashed flex items-center justify-center",
          isDark ? "border-white/20 bg-white/5" : "border-black/20 bg-black/5"
        )}>
          <Text variant="caption1" color="secondary" className="opacity-70">Generate a unique link to share with others</Text>
        </div>
      )}
    </div>
  );
}
