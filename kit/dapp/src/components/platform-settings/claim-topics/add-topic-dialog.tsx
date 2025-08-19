import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { orpc, client } from "@/orpc/orpc-client";
import { TopicCreateInputSchema } from "@/orpc/routes/system/claim-topics/routes/topic.create.schema";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { toast } from "sonner";
import { z } from "zod";

interface AddTopicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Dialog component for adding new claim topics
 * Allows administrators to create custom topics for identity verification
 */
export function AddTopicDialog({ open, onOpenChange }: AddTopicDialogProps) {
  const queryClient = useQueryClient();

  // Create topic mutation
  const createMutation = useMutation({
    mutationFn: (data: z.infer<typeof TopicCreateInputSchema>) =>
      client.system.topicCreate(data),
    onSuccess: (result) => {
      toast.success(`Topic "${result.name}" created successfully`);
      // Invalidate and refetch topics data
      void queryClient.invalidateQueries({
        queryKey: orpc.system.topicList.queryKey(),
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(`Failed to create topic: ${error.message}`);
    },
  });

  const onValidate = useCallback(
    ({ value }: { value: z.infer<typeof TopicCreateInputSchema> }) => {
      const result = TopicCreateInputSchema.safeParse(value);
      if (result.error) {
        return result.error.issues.reduce<Record<string, string>>((acc, issue) => {
          acc[issue.path[0] as keyof typeof value] = issue.message;
          return acc;
        }, {});
      }
    },
    []
  );

  const form = useForm({
    defaultValues: {
      name: "",
      signature: "",
    },
    validators: {
      onChange: onValidate,
      onSubmit: onValidate,
    },
    onSubmit: ({ value }) => {
      createMutation.mutate(value);
    },
  });

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Claim Topic</DialogTitle>
          <DialogDescription>
            Create a new custom claim topic for identity verification.
            System topics (ID 1-100) are reserved and cannot be created.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field name="name">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  Topic Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onChange={(e) => { field.handleChange(e.target.value); }}
                  placeholder="e.g., Professional License"
                  disabled={createMutation.isPending}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors[0]}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  A unique, human-readable name for this claim topic.
                </p>
              </div>
            )}
          </form.Field>

          <form.Field name="signature">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  Function Signature <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onChange={(e) => { field.handleChange(e.target.value); }}
                  placeholder="e.g., hasLicense(address,bytes32)"
                  disabled={createMutation.isPending}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors[0]}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Function signature for claim verification. Must follow the format:
                  functionName(parameterTypes)
                </p>
              </div>
            )}
          </form.Field>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || !form.state.canSubmit}
            >
              {createMutation.isPending ? "Creating..." : "Create Topic"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}