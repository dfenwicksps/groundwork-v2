import { Suspense } from "react";
import AuthForm from "./AuthForm";

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface-muted flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-navy/20 border-t-navy rounded-full animate-spin" />
      </div>
    }>
      <AuthForm />
    </Suspense>
  );
}
