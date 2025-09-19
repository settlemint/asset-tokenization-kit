import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, Clock3 } from "lucide-react";

interface IdentityProgressStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface IdentityProgressCardProps {
  steps: IdentityProgressStep[];
  title: string;
  description?: string;
  cta?: {
    label: string;
    href: string;
  };
}

export function IdentityProgressCard({
  steps,
  title,
  description,
  cta,
}: IdentityProgressCardProps) {
  const totalSteps = steps.length;
  const completedSteps = steps.filter((step) => step.completed).length;
  const progress = Math.round((completedSteps / totalSteps) * 100);

  return (
    <Card className="border-border/60 bg-muted/50">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {description ? (
              <CardDescription className="text-sm text-muted-foreground">
                {description}
              </CardDescription>
            ) : null}
          </div>
          <div className="text-right text-sm font-medium text-muted-foreground">
            {completedSteps}/{totalSteps}
          </div>
        </div>
        <Progress
          value={progress}
          className="mt-3"
          aria-valuetext={`${progress}%`}
        />
      </CardHeader>
      <CardContent className="space-y-5">
        <ul className="space-y-4">
          {steps.map((step) => {
            const Icon = step.completed ? CheckCircle2 : Clock3;
            return (
              <li key={step.id} className="flex items-start gap-3">
                <Icon
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 h-5 w-5",
                    step.completed
                      ? "text-success"
                      : "text-muted-foreground"
                  )}
                />
                <div className="space-y-1">
                  <p className="font-medium leading-none text-sm">
                    {step.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
        {cta ? (
          <Button asChild size="sm" className="shadow-none">
            <Link to={cta.href}>{cta.label}</Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
