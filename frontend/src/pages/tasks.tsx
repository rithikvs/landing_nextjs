import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  type SelectChangeEvent
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface Task {
  task_id: number;
  project_id: number;
  task_name: string;
  status: string;
  assigned_to: number;
}

interface Project {
  project_id: number;
  project_name: string;
}

const statusOptions = ['Pending', 'In Progress', 'Completed'];

import { useRouter } from 'next/router';

const TasksPage: React.FC = () => {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(''); // '' = all projects
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [form, setForm] = useState({
    project_id: '',
    task_name: '',
    status: 'Pending',
    assigned_to: ''
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get('/api/projects');
      let data = res.data;
      // backend can return array-of-arrays depending on oracledb outFormat
      if (Array.isArray(data) && Array.isArray(data[0])) {
        data = data.map((row: any[]) => ({
          project_id: row[0],
          project_name: row[1],
        }));
      }
      const normalized: Project[] = Array.isArray(data)
        ? data
            .map((p: any) => ({
              project_id: Number(p?.project_id),
              project_name: String(p?.project_name ?? ''),
            }))
            .filter((p: Project) => Number.isFinite(p.project_id) && p.project_name.length > 0)
        : [];
      setProjects(normalized);
    } catch {
      // non-blocking: tasks page can still work if projects fail to load
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/tasks', {
        params: selectedProjectId ? { project_id: selectedProjectId } : undefined,
      });
      let data = res.data;
      // Oracle can return rows as array-of-arrays depending on outFormat
      if (Array.isArray(data) && Array.isArray(data[0])) {
        data = data.map((row: any[]) => ({
          // SELECT * FROM tasks -> column order in schema:
          // task_id, project_id, task_name, status, assigned_to
          task_id: row[0],
          project_id: row[1],
          task_name: row[2],
          status: row[3],
          assigned_to: row[4],
        }));
      }

      const normalized: Task[] = Array.isArray(data)
        ? data
            .map((t: any) => ({
              task_id: Number(t?.task_id),
              project_id: Number(t?.project_id),
              task_name: String(t?.task_name ?? ''),
              status: String(t?.status ?? ''),
              assigned_to: Number(t?.assigned_to),
            }))
            .filter(
              (t: Task) =>
                Number.isFinite(t.task_id) &&
                Number.isFinite(t.project_id) &&
                t.task_name.length > 0
            )
        : [];

      setTasks(normalized);
    } catch (e: any) {
      const message =
        e?.response?.data?.details ||
        e?.response?.data?.error ||
        e?.message ||
        'Failed to fetch tasks';
      setError(String(message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchProjects();
  }, []);

  useEffect(() => {
    void fetchTasks();
  }, [selectedProjectId]);

  const buildPayload = () => ({
    project_id: form.project_id === '' ? null : Number(form.project_id),
    task_name: form.task_name,
    status: form.status,
    assigned_to: form.assigned_to === '' ? null : Number(form.assigned_to),
  });

  const projectNameById = (id: number) =>
    projects.find((p) => p.project_id === id)?.project_name;

  const handleOpen = (task?: Task) => {
    if (task) {
      setEditTask(task);
      setForm({
        project_id: String(task.project_id),
        task_name: task.task_name,
        status: task.status,
        assigned_to: String(task.assigned_to)
      });
    } else {
      setEditTask(null);
      setForm({ project_id: '', task_name: '', status: 'Pending', assigned_to: '' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditTask(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setError(null);
    try {
      const payload = buildPayload();
      if (editTask) {
        await axios.put(`/api/tasks/${editTask.task_id}`, payload);
        showToast('success', 'Task updated');
      } else {
        await axios.post('/api/tasks', payload);
        showToast('success', 'Task created');
      }
      await fetchTasks();
      handleClose();
    } catch (e: any) {
      const message =
        e?.response?.data?.details ||
        e?.response?.data?.error ||
        e?.message ||
        'Failed to save task';
      setError(String(message));
      showToast('error', String(message));
    }
  };

  const handleDelete = async (id: number) => {
    setError(null);
    try {
      await axios.delete(`/api/tasks/${id}`);
      await fetchTasks();
      showToast('success', 'Task deleted');
    } catch (e: any) {
      const message =
        e?.response?.data?.details ||
        e?.response?.data?.error ||
        e?.message ||
        'Failed to delete task';
      setError(String(message));
      showToast('error', String(message));
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6fa' }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: '#23272f', color: '#fff', padding: '32px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '2px 0 8px rgba(0,0,0,0.04)' }}>
        <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 32, letterSpacing: 1 }}>PM Tool</h2>
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
              onClick={() => router.push('/projects')}
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
            >Tasks</li>
            <li style={{ padding: '12px 32px', margin: '0 16px 12px 16px', color: '#a0aec0', cursor: 'pointer' }}>Settings</li>
          </ul>
        </nav>
        <button onClick={handleLogout} style={{ marginTop: 'auto', marginBottom: 16, padding: '10px 32px', background: '#e53e3e', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Logout</button>
      </aside>
      {/* Main Content */}
      <main style={{ flex: 1, padding: '48px 32px', maxWidth: 900, margin: '0 auto' }}>
        <Typography variant="h4" gutterBottom>Tasks</Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <Typography variant="body1">Project</Typography>
          <Select
            size="small"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(String(e.target.value))}
            sx={{ minWidth: 240 }}
          >
            <MenuItem value="">All projects</MenuItem>
            {projects.map((p) => (
              <MenuItem key={p.project_id} value={String(p.project_id)}>
                {p.project_name} (#{p.project_id})
              </MenuItem>
            ))}
          </Select>
        </Box>
        <Button variant="contained" color="primary" onClick={() => handleOpen()} sx={{ mb: 2 }}>
          Add Task
        </Button>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Task Name</TableCell>
                <TableCell>Project ID</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5}>Loading…</TableCell>
                </TableRow>
              ) : tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>No tasks found.</TableCell>
                </TableRow>
              ) : tasks.map((task) => (
                <TableRow key={task.task_id}>
                  <TableCell>{task.task_name}</TableCell>
                  <TableCell>
                    {projectNameById(task.project_id)
                      ? `${projectNameById(task.project_id)} (#${task.project_id})`
                      : task.project_id}
                  </TableCell>
                  <TableCell>{task.status}</TableCell>
                  <TableCell>{Number.isFinite(task.assigned_to) ? task.assigned_to : ''}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpen(task)} disabled={loading}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => setConfirmDeleteId(task.task_id)} color="error" disabled={loading}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {/* Delete confirmation */}
        <Dialog open={confirmDeleteId !== null} onClose={() => setConfirmDeleteId(null)}>
          <DialogTitle>Delete task?</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Are you sure you want to delete this task? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
            <Button
              color="error"
              variant="contained"
              onClick={async () => {
                if (confirmDeleteId == null) return;
                const id = confirmDeleteId;
                setConfirmDeleteId(null);
                await handleDelete(id);
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>{editTask ? 'Edit Task' : 'Add Task'}</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="Task Name"
              name="task_name"
              value={form.task_name}
              onChange={handleInputChange}
              fullWidth
            />
            <Select
              name="project_id"
              value={form.project_id}
              onChange={handleSelectChange}
              fullWidth
              sx={{ mt: 2 }}
              displayEmpty
            >
              <MenuItem value="">
                <em>Select project</em>
              </MenuItem>
              {projects.map((p) => (
                <MenuItem key={p.project_id} value={String(p.project_id)}>
                  {p.project_name} (#{p.project_id})
                </MenuItem>
              ))}
            </Select>
            <Select
              margin="dense"
              label="Status"
              name="status"
              value={form.status}
              onChange={handleSelectChange}
              fullWidth
              sx={{ mt: 2 }}
            >
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </Select>
            <TextField
              margin="dense"
              label="Assigned To (User ID)"
              name="assigned_to"
              value={form.assigned_to}
              onChange={handleInputChange}
              fullWidth
              type="number"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {editTask ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          open={toast !== null}
          autoHideDuration={2500}
          onClose={() => setToast(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          {toast ? (
            <Alert
              onClose={() => setToast(null)}
              severity={toast.type}
              sx={{ width: '100%' }}
              variant="filled"
            >
              {toast.message}
            </Alert>
          ) : (
            // Snackbar requires a child; keep it valid
            <span />
          )}
        </Snackbar>
      </main>
    </div>
  );
};

export default TasksPage;
