import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";

interface TimelineContextType {
  defaultValue?: number;
}

const TimelineContext = React.createContext<TimelineContextType>({});

interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: number;
  children: React.ReactNode;
}

function Timeline({
  defaultValue,
  className,
  children,
  ...props
}: TimelineProps) {
  return (
    <TimelineContext.Provider value={{ defaultValue }}>
      <div
        className={cn("group/timeline", className)}
        data-orientation="vertical"
        {...props}
      >
        {children}
      </div>
    </TimelineContext.Provider>
  );
}

interface TimelineItemProps extends React.HTMLAttributes<HTMLDivElement> {
  step: number;
  children: React.ReactNode;
}

function TimelineItem({
  step,
  className,
  children,
  ...props
}: TimelineItemProps) {
  const { defaultValue } = React.useContext(TimelineContext);
  const isCompleted = defaultValue !== undefined ? step <= defaultValue : false;

  return (
    <div
      className={cn("group/timeline-item relative flex gap-4", className)}
      data-step={step}
      data-completed={isCompleted}
      {...props}
    >
      {children}
    </div>
  );
}

interface TimelineHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

function TimelineHeader({
  className,
  children,
  ...props
}: TimelineHeaderProps) {
  return (
    <div className={cn("flex items-center gap-4", className)} {...props}>
      {children}
    </div>
  );
}

interface TimelineSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

function TimelineSeparator({ className, ...props }: TimelineSeparatorProps) {
  return (
    <div
      className={cn(
        "absolute left-4 top-8 h-full w-px bg-border group-last/timeline-item:hidden",
        className
      )}
      {...props}
    />
  );
}

interface TimelineDateProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

function TimelineDate({ className, children, ...props }: TimelineDateProps) {
  return (
    <div className={cn("text-sm text-muted-foreground", className)} {...props}>
      {children}
    </div>
  );
}

interface TimelineTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

function TimelineTitle({ className, children, ...props }: TimelineTitleProps) {
  return (
    <h3 className={cn("font-semibold", className)} {...props}>
      {children}
    </h3>
  );
}

interface TimelineIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

function TimelineIndicator({
  className,
  children,
  ...props
}: TimelineIndicatorProps) {
  return (
    <div
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full border-2 bg-background",
        "group-data-[completed=true]/timeline-item:border-primary group-data-[completed=true]/timeline-item:bg-primary group-data-[completed=true]/timeline-item:text-primary-foreground",
        "group-data-[completed=false]/timeline-item:border-muted-foreground",
        className
      )}
      {...props}
    >
      {children || (
        <CheckIcon
          className="group-data-[completed=false]/timeline-item:hidden"
          size={16}
        />
      )}
    </div>
  );
}

interface TimelineContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

function TimelineContent({
  className,
  children,
  ...props
}: TimelineContentProps) {
  return (
    <div className={cn("text-sm text-muted-foreground", className)} {...props}>
      {children}
    </div>
  );
}

export {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
};
