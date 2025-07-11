import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loading";
import { VariantProps } from "class-variance-authority";

interface LoadingButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof import("@/components/ui/button").buttonVariants> {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  asChild?: boolean;
}

export function LoadingButton({
  loading = false,
  loadingText,
  children,
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <Button disabled={disabled || loading} {...props}>
      {loading && <Spinner size="sm" />}
      {loading && loadingText ? loadingText : children}
    </Button>
  );
}
