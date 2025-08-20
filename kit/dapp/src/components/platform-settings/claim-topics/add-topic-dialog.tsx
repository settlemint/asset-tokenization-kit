import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppForm } from "@/hooks/use-app-form";
import { client, orpc } from "@/orpc/orpc-client";
import { TopicCreateInputSchema } from "@/orpc/routes/system/claim-topics/routes/topic.create.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

  const form = useAppForm({
    defaultValues: {
      name: "",
      signature: "",
    } as z.infer<typeof TopicCreateInputSchema>,
    validators: {
      onChange: TopicCreateInputSchema,
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
          </DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <div className="space-y-4">
            <form.AppField
              name="name"
              children={(field) => (
                <field.TextField
                  label="Topic Name"
                  required={true}
                  description="A unique, human-readable name for this claim topic. E.g., Professional License"
                />
              )}
            />

            <form.AppField
              name="signature"
              children={(field) => (
                <field.TextField
                  label="Function Signature"
                  required={true}
                  description="Function signature for claim verification. Must follow the format: functionName(parameterTypes). E.g., hasLicense(address,bytes32)"
                />
              )}
            />
          </div>

          <DialogFooter className="gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <form.Subscribe>
              {(state) => (
                <Button
                  type="button"
                  onClick={() => void form.handleSubmit()}
                  disabled={
                    createMutation.isPending ||
                    !state.canSubmit ||
                    Object.keys(state.errors).length > 0
                  }
                >
                  {createMutation.isPending ? "Creating..." : "Create Topic"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}
