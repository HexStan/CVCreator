import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../utils/api.js';
import { ALL_PRESET_KEYS, getPresetField } from '../utils/presetFields.js';

const ResumeContext = createContext(null);

const DEFAULT_DATA = () => ({
  data: {
    basicInfo: {
      avatar: '',
      fields: ALL_PRESET_KEYS.map((key) => {
        const p = getPresetField(key);
        return { key, label: p.label, value: p.defaultValue, width: p.width };
      }),
      deletedPresetKeys: [],
    },
    markdown: '',
  },
  template: 'classic',
  updatedAt: null,
});

export function ResumeProvider({ children }) {
  const [resume, setResume] = useState(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSave, setLastSave] = useState(null);
  const saveTimer = useRef(null);
  const resumeRef = useRef(resume);
  resumeRef.current = resume;

  useEffect(() => {
    api.resume.get()
      .then((d) => {
        if (d.data && (d.data.basicInfo || d.data.markdown !== undefined)) {
          const data = d.data;
          if (data.basicInfo && !data.basicInfo.deletedPresetKeys) {
            data.basicInfo.deletedPresetKeys = [];
          }
          if (data.basicInfo && !data.basicInfo.avatar) {
            data.basicInfo.avatar = '';
          }
          setResume({ data: d.data, template: d.template || 'classic', updatedAt: d.updatedAt });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const doSave = useCallback(async (data) => {
    setSaving(true);
    try {
      const result = await api.resume.save(data);
      setLastSave(result.updatedAt);
    } catch (e) {
      console.error('保存失败:', e);
    } finally {
      setSaving(false);
    }
  }, []);

  const saveNow = useCallback(() => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    doSave({ data: resumeRef.current.data, template: resumeRef.current.template });
  }, [doSave]);

  const updateResume = useCallback((updater) => {
    setResume((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      return next;
    });

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      doSave({ data: resumeRef.current.data, template: resumeRef.current.template });
    }, 2000);
  }, [doSave]);

  const updateTemplate = useCallback((template) => {
    setResume((prev) => ({ ...prev, template }));
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      doSave({ data: resumeRef.current.data, template });
    }, 2000);
  }, [doSave]);

  const importData = useCallback((data) => {
    if (data.basicInfo) {
      if (!data.basicInfo.deletedPresetKeys) data.basicInfo.deletedPresetKeys = [];
      if (!data.basicInfo.avatar) data.basicInfo.avatar = '';
    }
    setResume((prev) => ({ ...prev, data }));
    saveNow();
  }, [saveNow]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  return (
    <ResumeContext.Provider value={{ resume, loading, saving, lastSave, updateResume, updateTemplate, importData, saveNow }}>
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const ctx = useContext(ResumeContext);
  if (!ctx) throw new Error('useResume must be used within ResumeProvider');
  return ctx;
}
