
import { Request, Response } from 'express';
import { execute } from '../config/db';

export const getTasks = async (req: Request, res: Response) => {
  try {
    const { project_id } = req.query;

    const hasProjectFilter =
      typeof project_id === 'string' && project_id.trim().length > 0;

    const result = hasProjectFilter
      ? await execute(
          'SELECT * FROM tasks WHERE project_id = :project_id',
          { project_id: Number(project_id) }
        )
      : await execute('SELECT * FROM tasks');

    res.json(result.rows || []);
  } catch (err) {
    console.error('getTasks failed:', err);
    const message =
      err instanceof Error
        ? err.message
        : typeof err === 'string'
          ? err
          : 'Unknown error';
    res.status(500).json({ error: 'Failed to fetch tasks', details: message });
  }
};

export const getTaskById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await execute('SELECT * FROM tasks WHERE task_id = :id', [id]);
    if (!result.rows || result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('getTaskById failed:', err);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const { project_id, task_name, status, assigned_to } = req.body;
    // Oracle: get next task_id from sequence, then insert
    const seqResult = await execute('SELECT tasks_seq.NEXTVAL as id FROM dual');
    let task_id = null;
    if (seqResult.rows && seqResult.rows[0]) {
      // Oracle returns rows as array of arrays unless outFormat is set
      if (Array.isArray(seqResult.rows[0])) {
        task_id = seqResult.rows[0][0];
      } else if (typeof seqResult.rows[0] === 'object' && 'ID' in seqResult.rows[0]) {
        task_id = seqResult.rows[0]['ID'];
      } else if (typeof seqResult.rows[0] === 'object' && 'id' in seqResult.rows[0]) {
        task_id = seqResult.rows[0]['id'];
      }
    }
    if (!task_id) return res.status(500).json({ error: 'Failed to generate task id' });
    await execute(
      'INSERT INTO tasks (task_id, project_id, task_name, status, assigned_to) VALUES (:task_id, :project_id, :task_name, :status, :assigned_to)',
      { task_id, project_id, task_name, status, assigned_to },
      { autoCommit: true }
    );
    res.status(201).json({ ...req.body, task_id });
  } catch (err) {
    console.error('createTask failed:', err);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { project_id, task_name, status, assigned_to } = req.body;
    const result = await execute(
      'UPDATE tasks SET project_id = :project_id, task_name = :task_name, status = :status, assigned_to = :assigned_to WHERE task_id = :id',
      { project_id, task_name, status, assigned_to, id },
      { autoCommit: true }
    );
    if (result.rowsAffected === 0) return res.status(404).json({ error: 'Task not found' });
    res.json({ ...req.body, task_id: id });
  } catch (err) {
    console.error('updateTask failed:', err);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await execute('DELETE FROM tasks WHERE task_id = :id', { id }, { autoCommit: true });
    if (result.rowsAffected === 0) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error('deleteTask failed:', err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

