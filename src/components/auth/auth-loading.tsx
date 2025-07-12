import { AuthLayout } from "./auth-layout";
import { Card, CardContent } from "@/components/ui/card";

export function AuthLoading() {
  const loadingIcon = (
    <svg
      className="w-6 h-6 text-primary animate-pulse"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  );

  return (
    <AuthLayout
      title="Loading..."
      subtitle="Please wait while we set up your experience"
      icon={loadingIcon}
    >
      <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Loading skeleton for form fields */}
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse w-20" />
                  <div className="h-11 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>

            {/* Loading skeleton for button */}
            <div className="h-11 bg-muted rounded animate-pulse" />

            {/* Loading skeleton for divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-4 text-muted-foreground font-medium">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Loading skeleton for Google button */}
            <div className="h-11 bg-muted rounded animate-pulse" />

            {/* Loading skeleton for link */}
            <div className="mt-8 text-center">
              <div className="h-4 bg-muted rounded animate-pulse w-48 mx-auto" />
            </div>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
