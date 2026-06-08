import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const PID_KEY = 'doc2web_projectId';

interface ProjectContextValue {
  projectId: string | null;
  setProjectId: (id: string) => void;
  clearProjectId: () => void;
}

const ProjectCtx = createContext<ProjectContextValue>({
  projectId: null,
  setProjectId: () => {},
  clearProjectId: () => {},
});

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projectId, setProjectId] = useState<string | null>(() => {
    try { return sessionStorage.getItem(PID_KEY); } catch { return null; }
  });

  const persistProjectId = useCallback((id: string) => {
    setProjectId(id);
    try { sessionStorage.setItem(PID_KEY, id); } catch {}
  }, []);

  const clearProjectId = useCallback(() => {
    setProjectId(null);
    try { sessionStorage.removeItem(PID_KEY); } catch {}
  }, []);

  return <ProjectCtx.Provider value={{ projectId, setProjectId: persistProjectId, clearProjectId }}>{children}</ProjectCtx.Provider>;
}

export function useProject() {
  return useContext(ProjectCtx);
}
