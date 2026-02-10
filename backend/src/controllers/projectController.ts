import { Request, Response } from 'express';
import { execute } from '../config/db';

// Create a new project
export const createProject = async (req: Request, res: Response) => {
  const { project_name, description, created_by } = req.body;
  try {
    const result = await execute(
      'INSERT INTO projects (project_name, description, created_by) VALUES (:1, :2, :3)',
      [project_name, description, created_by]
    );
    res.status(201).json({ message: 'Project created successfully', projectId: result.lastRowid });
  } catch (error) {
    console.error('Create Project Error:', error);
    res.status(500).json({ error: 'Failed to create project', details: error });
  }
};

// Get all projects
export const getProjects = async (req: Request, res: Response) => {
  try {
    const result = await execute(`
      SELECT p.project_id, p.project_name, p.description, u.name AS created_by
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
    `, []);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects', details: error });
  }
};

// Get a single project by ID
export const getProjectById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await execute(`
      SELECT p.project_id, p.project_name, p.description, u.name AS created_by
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.project_id = :1
    `, [id]);
    const rows = result.rows ?? [];
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project', details: error });
  }
};

// Update a project
export const updateProject = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { project_name, description } = req.body;
  try {
    await execute(
      'UPDATE projects SET project_name = :1, description = :2 WHERE project_id = :3',
      [project_name, description, id]
    );
    res.json({ message: 'Project updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project', details: error });
  }
};

// Delete a project
export const deleteProject = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await execute('DELETE FROM projects WHERE project_id = :1', [id]);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project', details: error });
  }
};
