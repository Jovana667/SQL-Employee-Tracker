INSERT INTO department (name) VALUES
('Engineering'),
('Finance'),
('Legal'),
('Sales');

INSERT INTO role (title, salary, department_id) VALUES
('Software Engineer', 85000, 1),
('Lead Engineer', 125000, 1),
('Accountant', 75000, 2),
('Financial Analyst', 95000, 2),
('Lawyer', 130000, 3),
('Legal Team Lead', 150000, 3),
('Sales Representative', 65000, 4),
('Sales Manager', 110000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
('John', 'Doe', 2, NULL),
('Jane', 'Smith', 1, 1),
('Mike', 'Johnson', 4, NULL),
('Sarah', 'Williams', 3, 3),
('David', 'Brown', 6, NULL),
('Emily', 'Davis', 5, 5),
('Chris', 'Wilson', 8, NULL),
('Amanda', 'Taylor', 7, 7);