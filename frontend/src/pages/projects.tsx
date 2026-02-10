import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

interface Project {
  project_id: number;
  project_name: string;
  description: string;
  created_by: number;
  status?: string;
  created_by_name?: string;
}

const API_BASE = 'http://localhost:5000/api/projects';

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showDeleteId, setShowDeleteId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_BASE);
      let data = res.data;
      // If backend returns array of arrays, map to Project objects
      if (Array.isArray(data) && Array.isArray(data[0])) {
        data = data.map((row: any[]) => ({
          project_id: row[0],
          project_name: row[1],
          description: row[2],
          created_by_name: row[3],
          created_by: row[4],
        }));
      }
      setProjects(data);
    } catch (err) {
      showToast('error', 'Failed to fetch projects');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  };

  const handleCreate = async () => {
    const token = localStorage.getItem('token');
    let created_by = undefined;
    if (token) {
      const decoded: any = jwtDecode(token);
      created_by = decoded.id;
    }
    try {
      await axios.post(API_BASE, { project_name: name, description, created_by });
      setName('');
      setDescription('');
      fetchProjects();
      showToast('success', 'Project created');
    } catch (err) {
      showToast('error', 'Failed to create project');
    }
  };

  const handleUpdate = async (id: number) => {
    try {
      await axios.put(`${API_BASE}/${id}`, { project_name: name, description });
      setEditingId(null);
      setName('');
      setDescription('');
      fetchProjects();
      showToast('success', 'Project updated');
    } catch (err) {
      showToast('error', 'Failed to update project');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${API_BASE}/${id}`);
      fetchProjects();
      showToast('success', 'Project deleted');
    } catch (err) {
      showToast('error', 'Failed to delete project');
    }
    setShowDeleteId(null);
  };

  const startEdit = (project: Project) => {
    setEditingId(project.project_id);
    setName(project.project_name);
    setDescription(project.description);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const filteredProjects = projects.filter(p =>
    (p.project_name && p.project_name.toLowerCase().includes(search.toLowerCase())) ||
    (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Sidebar */}
      <aside style={{ width: 240, background: '#23272f', color: '#fff', padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '2px 0 12px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 32, letterSpacing: 1 }}>Project management</h2>
        <nav style={{ width: '100%' }}>
          <ul style={{ listStyle: 'none', padding: 0, width: '100%' }}>
            <li
              style={{
                padding: '12px 32px',
                background: router.pathname === '/projects' ? '#2d3748' : undefined,
                borderRadius: 8,
                margin: '0 16px 12px 16px',
                fontWeight: 600,
                cursor: 'pointer',
                color: router.pathname === '/projects' ? '#fff' : '#a0aec0'
              }}
            >Projects</li>
            <li
              style={{
                padding: '12px 32px',
                background: router.pathname === '/tasks' ? '#2d3748' : undefined,
                borderRadius: 8,
                margin: '0 16px 12px 16px',
                fontWeight: 600,
                cursor: 'pointer',
                color: router.pathname === '/tasks' ? '#fff' : '#a0aec0'
              }}
              onClick={() => router.push('/tasks')}
            >Tasks</li>
          </ul>
        </nav>
        <button onClick={handleLogout} style={{ marginTop: 'auto', marginBottom: 16, padding: '10px 32px', background: '#e53e3e', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Logout</button>
      </aside>
      {/* Main Content */}
      <main style={{ flex: 1, padding: '56px 48px', maxWidth: 1200, margin: '0 auto', background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', minHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#2d3748', letterSpacing: 1 }}>Projects</h1>
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: 10, border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 16, width: 240 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 20, marginBottom: 32 }}>
          <input
            placeholder="Project Name"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{ flex: 1, padding: 12, border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 16 }}
          />
          <input
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            style={{ flex: 2, padding: 12, border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 16 }}
          />
          {editingId ? (
            <>
              <button onClick={() => handleUpdate(editingId)} style={{ padding: '12px 20px', background: '#3182ce', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 16, marginRight: 8 }}>Update</button>
              <button onClick={() => { setEditingId(null); setName(''); setDescription(''); }} style={{ padding: '12px 20px', background: '#a0aec0', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 16 }}>Cancel</button>
            </>
          ) : (
            <button onClick={handleCreate} style={{ padding: '12px 20px', background: '#38a169', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 16 }}>Create</button>
          )}
        </div>
        {/* Toast Notification */}
        {toast && (
          <div style={{ position: 'fixed', top: 32, right: 32, zIndex: 1000, background: toast.type === 'success' ? '#38a169' : '#e53e3e', color: '#fff', padding: '16px 32px', borderRadius: 8, fontWeight: 600, fontSize: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
            {toast.message}
          </div>
        )}
        {/* Project List Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {loading ? (
            <p style={{ textAlign: 'center', fontSize: 18 }}>Loading...</p>
          ) : filteredProjects.length === 0 ? (
            <p style={{ textAlign: 'center', fontSize: 18, color: '#a0aec0' }}>No projects found.</p>
          ) : (
            filteredProjects.map(project => (
              <div
                key={project.project_id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#f9fafb',
                  borderRadius: 16,
                  boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
                  padding: 32,
                  transition: 'box-shadow 0.2s',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  position: 'relative',
                  gap: 32,
                  minHeight: 120
                }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.06)')}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 20, color: '#2d3748', marginBottom: 4 }}>{project.project_name}</div>
                  <div style={{ color: '#718096', fontSize: 15, marginBottom: 6 }}>{project.description}</div>
                  <span style={{ fontSize: 13, color: '#a0aec0', background: '#f1f5f9', borderRadius: 6, padding: '2px 10px', marginRight: 8 }}>ID: {project.project_id}</span>
                  {/* Show created_by as user name if available */}
                  {project.created_by && (
                    <span style={{ fontSize: 13, color: '#3182ce', background: '#e6f0fa', borderRadius: 6, padding: '2px 10px', marginLeft: 8 }}>
                      Created by: {project.created_by_name || project.created_by}
                    </span>
                  )}
                  {project.status && (
                    <span style={{ fontSize: 13, color: project.status === 'Active' ? '#38a169' : '#718096', background: project.status === 'Active' ? '#e6fffa' : '#f1f5f9', borderRadius: 6, padding: '2px 10px', marginLeft: 8 }}>{project.status}</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
                  <button onClick={() => startEdit(project)} title="Edit" style={{ padding: '8px 18px', background: '#3182ce', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 15, marginRight: 4, cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => setShowDeleteId(project.project_id)} title="Delete" style={{ padding: '8px 18px', background: '#e53e3e', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 15, marginRight: 4, cursor: 'pointer' }}>Delete</button>
               
                </div>
                {/* Delete Confirmation Modal */}
                {showDeleteId === project.project_id && (
                  <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: '#fff', padding: 32, borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.18)', minWidth: 320 }}>
                      <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>Delete Project?</h3>
                      <p style={{ color: '#4a5568', marginBottom: 24 }}>Are you sure you want to delete <b>{project.project_name}</b>? This action cannot be undone.</p>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                        <button onClick={() => setShowDeleteId(null)} style={{ padding: '10px 24px', background: '#a0aec0', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 16 }}>Cancel</button>
                        <button onClick={() => handleDelete(project.project_id)} style={{ padding: '10px 24px', background: '#e53e3e', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 16 }}>Delete</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
