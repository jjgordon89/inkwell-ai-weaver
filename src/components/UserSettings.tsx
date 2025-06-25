import React, { useEffect, useState } from 'react';
import database from '../lib/database';

interface Setting {
  key: string;
  value: string;
  category: string;
}

const PREFERENCE_KEYS = [
  { key: 'theme', label: 'Theme', category: 'appearance', type: 'select', options: ['system', 'light', 'dark'] },
  { key: 'auto_save', label: 'Auto Save', category: 'editor', type: 'select', options: ['true', 'false'] },
  { key: 'auto_save_interval', label: 'Auto Save Interval (ms)', category: 'editor', type: 'number' },
  { key: 'font_family', label: 'Font Family', category: 'appearance', type: 'text' },
  { key: 'font_size', label: 'Font Size', category: 'appearance', type: 'number' },
  { key: 'editor_theme', label: 'Editor Theme', category: 'editor', type: 'text' },
];

export default function UserSettings() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const all = await database.getAllSettings();
      setSettings(all);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleChange = (key: string, value: string) => {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      for (const pref of PREFERENCE_KEYS) {
        const setting = settings.find(s => s.key === pref.key);
        if (setting) {
          await database.setSetting(setting.key, setting.value, pref.category);
        }
      }
      setSuccess('Settings saved!');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-2">User Preferences</h2>
      {loading && <div className="text-blue-500">Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {success && <div className="text-green-600">{success}</div>}
      <form onSubmit={e => { e.preventDefault(); handleSave(); }} className="space-y-4">
        {PREFERENCE_KEYS.map(pref => {
          const setting = settings.find(s => s.key === pref.key) || { key: pref.key, value: '', category: pref.category };
          return (
            <div key={pref.key}>
              <label className="block font-medium mb-1">{pref.label}</label>
              {pref.type === 'select' ? (
                <select className="border p-1 w-full" value={setting.value} onChange={e => handleChange(pref.key, e.target.value)}>
                  {pref.options!.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : (
                <input className="border p-1 w-full" type={pref.type} value={setting.value} onChange={e => handleChange(pref.key, e.target.value)} />
              )}
            </div>
          );
        })}
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
      </form>
    </div>
  );
}
