import React, { useEffect, useState } from "react";
import database from "@/lib/database";
import { Button } from "@/components/ui/button";

interface AIProvider {
  id: number;
  name: string;
  api_key: string;
  endpoint: string;
  model: string;
  is_active: boolean;
  is_local: boolean;
  configuration: string;
}

const AIProviderSettings: React.FC = () => {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [editing, setEditing] = useState<AIProvider | null>(null);
  const [form, setForm] = useState<Partial<AIProvider>>({});
  const [error, setError] = useState<string | null>(null);

  const loadProviders = async () => {
    const rows = await database.listAIProviders();
    setProviders(rows);
  };

  useEffect(() => {
    loadProviders();
  }, []);

  const handleEdit = (prov: AIProvider) => {
    setEditing(prov);
    setForm({ ...prov, api_key: "" }); // Do not show key
  };

  const handleDelete = async (id: number) => {
    await database.deleteAIProvider(id);
    loadProviders();
  };

  const handleSetActive = async (id: number) => {
    await database.setActiveAIProvider(id);
    loadProviders();
  };

  const handleChange = (field: keyof AIProvider) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (!form.name) throw new Error("Name is required");
      await database.saveAIProvider({
        name: form.name,
        api_key: form.api_key || editing?.api_key || "",
        endpoint: form.endpoint || "",
        model: form.model || "",
        is_active: !!form.is_active,
        is_local: !!form.is_local,
        configuration: form.configuration ? JSON.parse(form.configuration) : undefined,
      });
      setEditing(null);
      setForm({});
      loadProviders();
    } catch (err: any) {
      setError(err.message || "Failed to save provider");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6">AI Provider Settings</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <form onSubmit={handleSave} className="mb-8 space-y-2">
        <input className="w-full border rounded px-3 py-2" placeholder="Name" value={form.name || ""} onChange={handleChange("name")} />
        <input className="w-full border rounded px-3 py-2" placeholder="Endpoint" value={form.endpoint || ""} onChange={handleChange("endpoint")} />
        <input className="w-full border rounded px-3 py-2" placeholder="Model" value={form.model || ""} onChange={handleChange("model")} />
        <input className="w-full border rounded px-3 py-2" placeholder="API Key" value={form.api_key || ""} onChange={handleChange("api_key")} type="password" autoComplete="new-password" />
        <textarea className="w-full border rounded px-3 py-2" placeholder="Configuration (JSON)" value={form.configuration || ""} onChange={handleChange("configuration")} />
        <div className="flex gap-2">
          <Button type="submit">{editing ? "Update" : "Add"} Provider</Button>
          {editing && <Button type="button" variant="outline" onClick={() => { setEditing(null); setForm({}); }}>Cancel</Button>}
        </div>
      </form>
      <h3 className="text-lg font-semibold mb-2">Your Providers</h3>
      <div className="space-y-2">
        {providers.map((prov) => (
          <div key={prov.id} className={`border rounded p-4 flex items-center justify-between ${prov.is_active ? "border-primary bg-primary/10" : ""}`}>
            <div>
              <div className="font-semibold">{prov.name} {prov.is_active && <span className="text-xs text-green-600">(Active)</span>}</div>
              <div className="text-xs text-muted-foreground">Endpoint: {prov.endpoint || "-"} | Model: {prov.model || "-"}</div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => handleEdit(prov)}>Edit</Button>
              <Button size="sm" variant="outline" onClick={() => handleSetActive(prov.id)} disabled={prov.is_active}>Set Active</Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(prov.id)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIProviderSettings;
