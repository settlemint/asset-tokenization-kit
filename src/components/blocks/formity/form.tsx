import { type DefaultValues, type OnNext, type Resolver, type Step, type Variables, useFormity } from "formity";
import { AnimatePresence, motion } from "framer-motion";
import { type ReactElement, forwardRef, useCallback, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";

interface FormProps {
  step: Step;
  defaultValues: DefaultValues;
  resolver: Resolver;
  onNext: OnNext;
  children: ReactElement;
}

export default function Form({ step, defaultValues, resolver, onNext, children }: FormProps) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <MotionComponent
        key={step}
        defaultValues={defaultValues}
        resolver={resolver}
        onNext={onNext}
        initial={{ opacity: 0, x: 100 }}
        animate={{
          x: 0,
          opacity: 1,
          transition: { delay: 0.25, duration: 0.5 },
        }}
        exit={{
          x: -100,
          opacity: 0,
          transition: { delay: 0, duration: 0.25 },
        }}
      >
        {children}
      </MotionComponent>
    </AnimatePresence>
  );
}

interface ComponentProps {
  defaultValues: DefaultValues;
  resolver: Resolver;
  onNext: OnNext;
  children: ReactElement;
}

const Component = forwardRef<HTMLFormElement, ComponentProps>(function Component(
  { defaultValues, resolver, onNext, children },
  ref,
) {
  const form = useForm({ defaultValues, resolver });

  const { getFlow, step } = useFormity();

  useEffect(() => {
    const flow = getFlow(form.getValues());
    console.log(flow);
  }, [form, getFlow]);

  const handleSubmit = useCallback(
    (formData: Variables) => {
      console.log(formData);
      onNext(formData);
    },
    [onNext],
  );

  return (
    <form ref={ref} onSubmit={form.handleSubmit(handleSubmit)} className="h-full">
      <FormProvider {...form}>{children}</FormProvider>
    </form>
  );
});

const MotionComponent = motion(Component);
