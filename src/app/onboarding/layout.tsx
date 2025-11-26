import { CeloBargainLogo } from '@/components/icons';

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <header className="absolute top-0 left-0 w-full p-4">
            <div className="container mx-auto flex items-center gap-2">
                <CeloBargainLogo className="h-8 w-8 text-accent" />
                <span className="text-xl font-bold font-headline text-white">
                Barcel
                </span>
            </div>
        </header>
        <main className="flex flex-1 flex-col items-center justify-center">
            {children}
        </main>
    </div>
  );
}
