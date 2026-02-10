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

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(''); // '' = all projects
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [form, setForm] = useState({
    project_id: '',
    task_name: '',
    status: 'Pending',
    assigned_to: ''
  });

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
      setTasks(Array.isArray(res.data) ? res.data : []);
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
      } else {
        await axios.post('/api/tasks', payload);
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
    }
  };

  const handleDelete = async (id: number) => {
    setError(null);
    try {
      await axios.delete(`/api/tasks/${id}`);
      await fetchTasks();
    } catch (e: any) {
      const message =
        e?.response?.data?.details ||
        e?.response?.data?.error ||
        e?.message ||
        'Failed to delete task';
      setError(String(message));
    }
  };

  return (
    <Box sx={{ p: 4 }}>
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
                <TableCell>{task.assigned_to}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(task)}><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDelete(task.task_id)} color="error"><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
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
    </Box>
  );
};

export default TasksPage;
