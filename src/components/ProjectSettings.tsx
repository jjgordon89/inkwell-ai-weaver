
import React, { useEffect, useState } from 'react';
import database from '../lib/database';
import { useProject } from '@/contexts/ProjectContext';
import { AsyncFeedback } from '@/components/AsyncFeedback';

export default function ProjectSettings() {
  const { state, dispatch } = useProject();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [settings, setSettings] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (state.currentProject) {
      setTitle(state.currentProject.title || '');
      setDescription(state.currentProject.description || '');
      setSettings(state.currentProject.settings ? JSON.stringify(state.currentProject.settings, null, 2) : '');
    }
  }, [state.currentProject]);

  const handleSave = async () => {
    if (!state.currentProject) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      let parsedSettings = undefined;
      if (settings) {
        try {
          parsedSettings = JSON.parse(settings);
        } catch {
          setError('Settings must be valid JSON');
          setLoading(false);
          return;
        }
      }
      // @ts-expect-error: updateProject is implemented on SQLiteDatabase
      await database.updateProject(state.currentProject.id, {
        title,
        description,
        settings: parsedSettings,
      });
      
      // Update the current project in state
      const updatedProject = {
        ...state.currentProject,
        title,
        description,
        settings: parsedSettings,
        lastModified: new Date()
      };
      dispatch({ type: 'SET_CURRENT_PROJECT', payload: updatedProject });
      setSuccess('Project settings saved!');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save project settings');
    } finally {
      setLoading(false);
    }
  };

  if (!state.currentProject) return <div className="text-gray-500">No project loaded.</div>;

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-2">Project Settings</h2>
      <AsyncFeedback loading={loading} error={error} success={success} />
      <div className="space-y-3">
        <div>
          <label className="block font-medium mb-1">Title</label>
          <input className="border p-1 w-full" value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="block font-medium mb-1">Description</label>
          <input className="border p-1 w-full" value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <div>
          <label className="block font-medium mb-1">Settings (JSON)</label>
          <textarea className="border p-1 w-full" rows={4} value={settings} onChange={e => setSettings(e.target.value)} />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleSave} disabled={loading}>Save</button>
      </div>
    </div>
  );
}
