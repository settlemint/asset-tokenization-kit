interface MiniProgressBarProps {
  totalSteps: number;
  currentStepIndex: number;
}

export default function MiniProgressBar({
  totalSteps,
  currentStepIndex,
}: MiniProgressBarProps) {
  return (
    <div className="absolute bottom-10 left-[61%] transform -translate-x-1/2 flex justify-center items-center gap-2 pointer-events-none">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={`transition-all duration-300 ${
            index === currentStepIndex
              ? "w-4 h-1.5 bg-primary rounded-full animate-pulse"
              : "w-1.5 h-1.5 bg-muted-foreground/30 rounded-full"
          }`}
        />
      ))}
    </div>
  );
}
