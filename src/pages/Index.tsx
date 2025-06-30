
import { Navigate } from "react-router-dom";

const Index = () => {
  // Redirect to Projects page
  return <Navigate to="/projects" replace />;
};

export default Index;
