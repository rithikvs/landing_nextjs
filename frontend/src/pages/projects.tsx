import { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/router';

interface Project {
  project_id: number;
  project_name: string;
  description: string;
  created_by: number;
}

interface DecodedToken {
  id: number;
  email: string;
  name: string;
  exp: number;
}

const API_BASE = 'http://localhost:5000/api/projects';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchProjects = async () => {
    setLoading(true);
    const res = await axios.get(API_BASE);
    setProjects(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async () => {
    const token = localStorage.getItem('token');
    let created_by = undefined;
    if (token) {
      const decoded = jwtDecode<DecodedToken>(token);
      created_by = decoded.id;
    }
    await axios.post(API_BASE, { project_name: name, description, created_by });
    setName('');
    setDescription('');
    fetchProjects();
  };

  const handleUpdate = async (id: number) => {
    await axios.put(`${API_BASE}/${id}`, { project_name: name, description });
    setEditingId(null);
    setName('');
    setDescription('');
    fetchProjects();
  };

  const handleDelete = async (id: number) => {
    await axios.delete(`${API_BASE}/${id}`);
    fetchProjects();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const startEdit = (project: Project) => {
    setEditingId(project.project_id);
    setName(project.project_name);
    setDescription(project.description);
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Projects</h1>
        <button onClick={handleLogout} style={{ padding: '6px 16px', background: '#e53e3e', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Logout</button>
      </div>
      <div style={{ marginBottom: 16 }}>
        <input
          placeholder="Project Name"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <input
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          style={{ marginRight: 8 }}
        />
        {editingId ? (
          <button onClick={() => handleUpdate(editingId)}>Update</button>
        ) : (
          <button onClick={handleCreate}>Create</button>
        )}
        {editingId && (
          <button onClick={() => { setEditingId(null); setName(''); setDescription(''); }}>Cancel</button>
        )}
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(project => (
              <tr key={project.project_id}>
                <td>{project.project_id}</td>
                <td>{project.project_name}</td>
                <td>{project.description}</td>
                <td>
                  <button onClick={() => startEdit(project)}>Edit</button>
                  <button onClick={() => handleDelete(project.project_id)} style={{ marginLeft: 8 }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
