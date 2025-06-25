import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import database from "@/lib/database";

const NewProjectPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await database.addProject({ name, description });
      navigate("/projects");
    } catch (error) {
      alert("Failed to create project. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6">Create New Project</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Project Name</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            placeholder="Enter project name"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={isSaving}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            placeholder="Describe your project (optional)"
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            disabled={isSaving}
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={isSaving}>{isSaving ? "Creating..." : "Create Project"}</Button>
          <Button type="button" variant="outline" onClick={() => navigate("/projects")}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default NewProjectPage;
