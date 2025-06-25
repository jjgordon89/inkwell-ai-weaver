import React, { useEffect, useState } from 'react';
import database from '../lib/database';

interface Template {
  id: number;
  name: string;
  description: string;
  genre: string;
  tone: string;
  structure: string;
  template_json: object;
  createdAt: string;
  updatedAt: string;
}

export default function TemplateLibrary() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Template>>({});

  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await database.getProjectTemplates();
      setTemplates(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTemplates(); }, []);

  const handleEdit = (tpl: Template) => {
    setEditingId(tpl.id);
    setEditData({ ...tpl });
  };

  const handleEditChange = (field: keyof Template, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!editingId) return;
    setLoading(true);
    setError(null);
    try {
      await database.updateProjectTemplate(editingId, {
        name: editData.name,
        description: editData.description,
        genre: editData.genre,
        tone: editData.tone,
        structure: editData.structure,
        template_json: editData.template_json,
      });
      setEditingId(null);
      setEditData({});
      await fetchTemplates();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this template?')) return;
    setLoading(true);
    setError(null);
    try {
      // @ts-expect-error: deleteProjectTemplate is implemented on SQLiteDatabase
      await database.deleteProjectTemplate(id);
      await fetchTemplates();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to delete template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Template Library</h2>
      {loading && <div className="text-blue-500">Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <ul className="divide-y">
        {templates.map(tpl => (
          <li key={tpl.id} className="py-2">
            {editingId === tpl.id ? (
              <div className="space-y-1">
                <input className="border p-1 w-full" value={editData.name || ''} onChange={e => handleEditChange('name', e.target.value)} placeholder="Name" />
                <input className="border p-1 w-full" value={editData.description || ''} onChange={e => handleEditChange('description', e.target.value)} placeholder="Description" />
                <input className="border p-1 w-full" value={editData.genre || ''} onChange={e => handleEditChange('genre', e.target.value)} placeholder="Genre" />
                <input className="border p-1 w-full" value={editData.tone || ''} onChange={e => handleEditChange('tone', e.target.value)} placeholder="Tone" />
                <input className="border p-1 w-full" value={editData.structure || ''} onChange={e => handleEditChange('structure', e.target.value)} placeholder="Structure" />
                <textarea className="border p-1 w-full" value={JSON.stringify(editData.template_json, null, 2)} onChange={e => handleEditChange('template_json', e.target.value)} placeholder="Template JSON" rows={4} />
                <div className="space-x-2">
                  <button className="bg-green-500 text-white px-2 py-1 rounded" onClick={handleSave}>Save</button>
                  <button className="bg-gray-300 px-2 py-1 rounded" onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-semibold">{tpl.name}</div>
                  <div className="text-sm text-gray-600">{tpl.description}</div>
                  <div className="text-xs text-gray-500">Genre: {tpl.genre} | Tone: {tpl.tone} | Structure: {tpl.structure}</div>
                  <details className="mt-1">
                    <summary className="cursor-pointer text-blue-600">Preview JSON</summary>
                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">{JSON.stringify(tpl.template_json, null, 2)}</pre>
                  </details>
                </div>
                <div className="mt-2 md:mt-0 space-x-2">
                  <button className="bg-blue-500 text-white px-2 py-1 rounded" onClick={() => handleEdit(tpl)}>Edit</button>
                  <button className="bg-red-500 text-white px-2 py-1 rounded" onClick={() => handleDelete(tpl.id)}>Delete</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      {templates.length === 0 && !loading && <div className="text-gray-500">No templates found.</div>}
    </div>
  );
}
