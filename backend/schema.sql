-- Run this script in your Oracle Database to create the required table
-- Drop table, sequence, and trigger if they exist (run manually if needed)
-- DROP TABLE users;
-- DROP SEQUENCE users_seq;
-- DROP TRIGGER users_before_insert;

CREATE TABLE users (
    id NUMBER PRIMARY KEY,
    name VARCHAR2(50) NOT NULL,
    email VARCHAR2(100) UNIQUE NOT NULL,
    password_hash VARCHAR2(100) NOT NULL
);

CREATE SEQUENCE users_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;

CREATE OR REPLACE TRIGGER users_before_insert
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    SELECT users_seq.NEXTVAL INTO :NEW.id FROM dual;
END;
/

-- Drop table, sequence, and trigger for projects if they exist (run manually if needed)
-- DROP TABLE projects;
-- DROP SEQUENCE projects_seq;
-- DROP TRIGGER projects_before_insert;

CREATE TABLE projects (
    project_id NUMBER PRIMARY KEY,
    project_name VARCHAR2(100),
    description VARCHAR2(200),
    created_by NUMBER
);

CREATE SEQUENCE projects_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;

CREATE OR REPLACE TRIGGER projects_before_insert
BEFORE INSERT ON projects
FOR EACH ROW
BEGIN
    SELECT projects_seq.NEXTVAL INTO :NEW.project_id FROM dual;
END;
/

-- -----------------------------
-- Tasks
-- -----------------------------
-- Drop table, sequence, and trigger for tasks if they exist (run manually if needed)
-- DROP TABLE tasks;
-- DROP SEQUENCE tasks_seq;
-- DROP TRIGGER tasks_before_insert;

CREATE TABLE tasks (
    task_id NUMBER PRIMARY KEY,
    project_id NUMBER NOT NULL,
    task_name VARCHAR2(200) NOT NULL,
    status VARCHAR2(50) DEFAULT 'Pending' NOT NULL,
    assigned_to NUMBER,
    CONSTRAINT fk_tasks_project
        FOREIGN KEY (project_id) REFERENCES projects(project_id)
);

CREATE SEQUENCE tasks_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;

CREATE OR REPLACE TRIGGER tasks_before_insert
BEFORE INSERT ON tasks
FOR EACH ROW
BEGIN
    SELECT tasks_seq.NEXTVAL INTO :NEW.task_id FROM dual;
END;
/
