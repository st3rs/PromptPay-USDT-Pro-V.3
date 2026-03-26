import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/src/components/ui/Button";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6">
        <ShieldAlert className="w-10 h-10 text-rose-600" />
      </div>
      <h1 className="text-3xl font-bold text-black mb-2">Access Denied</h1>
      <p className="text-neutral-500 max-w-md mb-8">
        You don't have permission to access this page. Please contact your administrator if you believe this is an error.
      </p>
      <Link to="/dashboard">
        <Button size="lg">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-9xl font-bold text-neutral-200 mb-4">404</h1>
      <h2 className="text-3xl font-bold text-black mb-2">Page Not Found</h2>
      <p className="text-neutral-500 max-w-md mb-8">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link to="/">
        <Button size="lg">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </Link>
    </div>
  );
}
