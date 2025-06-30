import React, { useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );

    // Auto-redirect to projects page after 5 seconds
    const redirectTimer = setTimeout(() => {
      navigate("/projects", { replace: true });
    }, 5000);

    return () => clearTimeout(redirectTimer);
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto p-6">
        <FileQuestion className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-primary mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          You will be redirected to the Projects page in 5 seconds...
        </p>
        <Link to="/projects">
          <Button className="mx-auto">Return to Projects</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
