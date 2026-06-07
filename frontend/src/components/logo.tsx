import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  withText?: boolean;
  color?: string;
}

export function Logo({ size = 'md', className, withText = true, color }: LogoProps) {
  // Map sizes to responsive height dimensions
  const dimensions = {
    sm: { height: 120 },
    md: { height: 180 },
    lg: { height: 260 },
    xl: { height: 360 },
  };

  const { height } = dimensions[size];

  // If a custom dark/black color is requested, we can use CSS brightness(0) to turn the white logo solid black
  const isDarkLogo = color === 'black' || color === '#000' || color === '#000000';

  return (
    <div 
      className={cn('relative flex items-center justify-start overflow-visible w-max', className)}
      style={{
        height: `${height}px`,
      }}
    >
      <img
        src="/logo.png"
        alt="Ushers.eg"
        className={cn("h-full w-auto object-contain select-none pointer-events-none transition-all duration-300", 
          isDarkLogo ? 'brightness-0' : 'dark:invert-0 invert'
        )}
        style={{
          // If withText is false, we crop the tagline (the tagline is in the bottom part)
          ...(withText ? {} : {
            transform: 'scale(1.5) translateY(-15%)',
            transformOrigin: 'top center',
          })
        }}
      />
    </div>
  );
}
