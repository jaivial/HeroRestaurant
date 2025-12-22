import { useEffect, useRef } from 'react';
import { useInvitationPage } from './hooks/useInvitationPage';
import { Container, Text, Heading, Button, Card, Avatar, Divider } from '@/components/ui';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { cn } from '@/utils/cn';
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom';

const SUCCESS_LOTTIE_URL = "https://assets10.lottiefiles.com/packages/lf20_pqnfbxw9.json";

export function InvitationPage() {
  const theme = useAtomValue(themeAtom);
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const { status, invitation, error, countdown, isAuthenticated } = useInvitationPage();
  
  const cardRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === 'valid' || status === 'accepted') {
      gsap.fromTo(cardRef.current, 
        { opacity: 0, y: 40, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "back.out(1.7)" }
      );
    }
  }, [status]);

  useEffect(() => {
    if (status === 'accepted') {
      gsap.fromTo(successRef.current,
        { opacity: 0, scale: 0.5 },
        { opacity: 1, scale: 1, duration: 0.5, delay: 0.3, ease: "elastic.out(1, 0.5)" }
      );
    }
  }, [status]);

  if (status === 'validating') {
    return (
      <div className={cn("min-h-screen flex items-center justify-center", isDark ? "bg-[#0A0A0B]" : "bg-[#F5F5F7]")}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-apple-blue"></div>
      </div>
    );
  }

  if (status === 'invalid' || status === 'error') {
    return (
      <div className={cn("min-h-screen flex items-center justify-center p-4", isDark ? "bg-[#0A0A0B]" : "bg-[#F5F5F7]")}>
        <Card className="max-w-md w-full p-8 text-center rounded-[2.2rem] shadow-apple-float">
          <div className="w-16 h-16 bg-apple-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-apple-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <Heading level={2} className="mb-2">Invitation Error</Heading>
          <Text color="tertiary" className="mb-8">{error || 'This invitation is no longer valid.'}</Text>
          <Button onClick={() => navigate('/login')} className="w-full rounded-xl">Back to Login</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center p-4 relative overflow-hidden",
      isDark ? "bg-[#0A0A0B]" : "bg-[#F5F5F7]"
    )}>
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl max-h-4xl bg-apple-blue/5 rounded-full blur-[120px] pointer-events-none" />

      <div ref={cardRef} className="max-w-xl w-full relative z-10">
        <Card className={cn(
          "p-10 rounded-[2.2rem] shadow-apple-float text-center overflow-hidden border",
          "backdrop-blur-[20px] saturate-[180%]",
          isDark ? "bg-black/40 border-white/10" : "bg-white/85 border-black/[0.08]"
        )}>
          {status === 'accepted' && (
            <div ref={successRef} className="mb-6 flex flex-col items-center">
              <div className="w-24 h-24 bg-apple-green rounded-full flex items-center justify-center mb-4 shadow-lg shadow-apple-green/20">
                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <Heading level={2} className="text-apple-green mb-1">Welcome Aboard!</Heading>
              <Text weight="semibold" className="mb-6">You have joined {invitation?.restaurant.name}</Text>
            </div>
          )}

          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <Avatar 
                src={invitation?.restaurant.logoUrl} 
                name={invitation?.restaurant.name} 
                size="2xl" 
                className="ring-4 ring-apple-blue/20"
              />
              <div>
                <Text variant="caption1" weight="bold" color="secondary" className="uppercase tracking-[0.2em] mb-1">Workspace Invitation</Text>
                <Heading level={1} className="text-[34px] font-bold tracking-tight">
                  {invitation?.restaurant.name}
                </Heading>
              </div>
            </div>

            <Divider className={cn(
              "my-4",
              isDark ? 'border-white/20 bg-white/20' : 'border-black/[0.12] bg-black/[0.12]'
            )} />

            <div className="space-y-4">
              <Text variant="body" color="secondary" className="text-lg">
                <strong>{invitation?.inviter.name}</strong> invited you to join their workspace
                {invitation?.role && <span> as a <strong>{invitation.role.name}</strong></span>}.
              </Text>

              {!isAuthenticated && status === 'valid' && (
                <div className="pt-6 space-y-4">
                  <Text variant="callout" color="secondary" className="opacity-80">Please sign in or create an account to accept this invitation.</Text>
                  <Button 
                    onClick={() => navigate('/login', { state: { from: window.location.pathname } })} 
                    size="lg"
                    className="w-full rounded-2xl h-14 text-lg font-bold shadow-apple-md"
                  >
                    Login to Accept
                  </Button>
                </div>
              )}

              {status === 'accepted' && (
                <div className="pt-8 space-y-6">
                  <div className="relative h-1 w-full bg-apple-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-apple-blue transition-all duration-1000 ease-linear"
                      style={{ width: `${(1 - countdown / 20) * 100}%` }}
                    />
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Text variant="caption1" weight="bold" color="secondary" className="uppercase tracking-widest">
                      Redirecting in {countdown}s
                    </Text>
                    <Button 
                      variant="ghost" 
                      onClick={() => navigate(`/w/${invitation.restaurant.id}/dashboard`)}
                      className="text-apple-blue font-bold hover:bg-apple-blue/5"
                    >
                      Go to Dashboard Now
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
