import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NewProjectPage = () => {
  const navigate = useNavigate();

  // Placeholder form state
  // In a real app, you would use useState and form validation

  return (
    <div className="max-w-xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6">Create New Project</h2>
      <form
        onSubmit={e => {
          e.preventDefault();
          // TODO: Save project logic here
          navigate("/projects");
        }}
        className="space-y-4"
      >
        <div>
          <label className="block mb-1 font-medium">Project Name</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            placeholder="Enter project name"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            placeholder="Describe your project (optional)"
            rows={3}
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit">Create Project</Button>
          <Button type="button" variant="outline" onClick={() => navigate("/projects")}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default NewProjectPage;
