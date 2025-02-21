'use client';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import { AddContactForm } from './form';

export function AddContactButton() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
      }}
    >
      <SheetTrigger asChild>
        <Button className="">Add Contact</Button>
      </SheetTrigger>
      <SheetContent className="min-w-[34rem]">
        <>
          <SheetHeader>
            <SheetTitle>Transfer</SheetTitle>
            <SheetDescription>Which asset do you want to transfer?</SheetDescription>
          </SheetHeader>
          <AddContactForm
            onCloseAction={() => {
              setOpen(false);
            }}
          />
        </>
      </SheetContent>
    </Sheet>
  );
}
