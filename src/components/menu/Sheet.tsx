import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { clsx } from "clsx";

/**
 * Bottom sheet built on Radix Dialog: traps focus, closes on Esc and on a tap
 * outside, restores focus. (Replaces vaul to keep the page's JavaScript small.)
 */
export const Sheet = Dialog.Root;
export const SheetClose = Dialog.Close;

export function SheetContent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof Dialog.Content>) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
      <Dialog.Content
        className={clsx(
          "fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[88svh] max-w-[640px] flex-col rounded-t-[20px] bg-bg text-fg outline-none",
          "data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom data-[state=open]:duration-200",
          className,
        )}
        {...props}
      >
        <div aria-hidden className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-line" />
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  );
}

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("grid gap-1 px-5 pt-4 pb-2", className)} {...props} />;
}

export function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx("safe-bottom mt-auto flex flex-col gap-2 px-5 pt-3", className)}
      {...props}
    />
  );
}

export function SheetTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Dialog.Title>) {
  return (
    <Dialog.Title
      className={clsx("display text-[32px] leading-[1.05] text-title", className)}
      {...props}
    />
  );
}

export function SheetDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Dialog.Description>) {
  return (
    <Dialog.Description
      className={clsx("text-[14px] leading-[1.4] text-muted", className)}
      {...props}
    />
  );
}
