const inquirer = require('inquirer');
const { Client } = require('pg');
const cTable = require('console.table');

// Database connection configuration
const dbConfig = {
  user: 'postgres',  // Update this if your username is different
  host: 'localhost',
  database: 'employee_tracker',
  password: 'Xyauchiha667',  // Replace with your actual password
  port: 5432,
};

// Connect to the database
const client = new Client(dbConfig);

// Main menu options
const menuChoices = [
  'View all departments',
  'View all roles',
  'View all employees',
  'Add a department',
  'Add a role',
  'Add an employee',
  'Update an employee role',
  'Exit'
];

// Main application function
async function runApp() {
  try {
    await client.connect();
    console.log('Connected to the database successfully.');

    while (true) {
      const { choice } = await inquirer.prompt([
        {
          type: 'list',
          name: 'choice',
          message: 'What would you like to do?',
          choices: menuChoices
        }
      ]);

      switch (choice) {
        case 'View all departments':
          await viewAllDepartments();
          break;
        case 'View all roles':
          await viewAllRoles();
          break;
        case 'View all employees':
          await viewAllEmployees();
          break;
        case 'Add a department':
          await addDepartment();
          break;
        case 'Add a role':
          await addRole();
          break;
        case 'Add an employee':
          await addEmployee();
          break;
        case 'Update an employee role':
          await updateEmployeeRole();
          break;
        case 'Exit':
          console.log('Goodbye!');
          await client.end();
          return;
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
    await client.end();
    process.exit(1);
  }
}

// Function to view all departments
async function viewAllDepartments() {
  const result = await client.query('SELECT * FROM department');
  console.table(result.rows);
}

// Function to view all roles
async function viewAllRoles() {
  const query = `
    SELECT role.id, role.title, department.name AS department, role.salary 
    FROM role 
    JOIN department ON role.department_id = department.id
  `;
  const result = await client.query(query);
  console.table(result.rows);
}

// Function to view all employees
async function viewAllEmployees() {
  const query = `
    SELECT 
      e.id, 
      e.first_name, 
      e.last_name, 
      role.title, 
      department.name AS department, 
      role.salary, 
      CONCAT(m.first_name, ' ', m.last_name) AS manager
    FROM employee e
    LEFT JOIN role ON e.role_id = role.id
    LEFT JOIN department ON role.department_id = department.id
    LEFT JOIN employee m ON e.manager_id = m.id
  `;
  const result = await client.query(query);
  console.table(result.rows);
}

// Function to add a department
async function addDepartment() {
  const { name } = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Enter the name of the new department:'
    }
  ]);

  await client.query('INSERT INTO department (name) VALUES ($1)', [name]);
  console.log(`Added department: ${name}`);
}

// Function to add a role
async function addRole() {
  const departments = await client.query('SELECT * FROM department');
  
  const { title, salary, departmentId } = await inquirer.prompt([
    {
      type: 'input',
      name: 'title',
      message: 'Enter the title of the new role:'
    },
    {
      type: 'number',
      name: 'salary',
      message: 'Enter the salary for this role:'
    },
    {
      type: 'list',
      name: 'departmentId',
      message: 'Select the department for this role:',
      choices: departments.rows.map(dept => ({ name: dept.name, value: dept.id }))
    }
  ]);

  await client.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [title, salary, departmentId]);
  console.log(`Added role: ${title}`);
}

// Function to add an employee
async function addEmployee() {
  const roles = await client.query('SELECT * FROM role');
  const employees = await client.query('SELECT * FROM employee');

  const { firstName, lastName, roleId, managerId } = await inquirer.prompt([
    {
      type: 'input',
      name: 'firstName',
      message: "Enter the employee's first name:"
    },
    {
      type: 'input',
      name: 'lastName',
      message: "Enter the employee's last name:"
    },
    {
      type: 'list',
      name: 'roleId',
      message: "Select the employee's role:",
      choices: roles.rows.map(role => ({ name: role.title, value: role.id }))
    },
    {
      type: 'list',
      name: 'managerId',
      message: "Select the employee's manager:",
      choices: [
        { name: 'None', value: null },
        ...employees.rows.map(emp => ({ name: `${emp.first_name} ${emp.last_name}`, value: emp.id }))
      ]
    }
  ]);

  await client.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [firstName, lastName, roleId, managerId]);
  console.log(`Added employee: ${firstName} ${lastName}`);
}

// Function to update an employee's role
async function updateEmployeeRole() {
  const employees = await client.query('SELECT * FROM employee');
  const roles = await client.query('SELECT * FROM role');

  const { employeeId, newRoleId } = await inquirer.prompt([
    {
      type: 'list',
      name: 'employeeId',
      message: 'Select the employee to update:',
      choices: employees.rows.map(emp => ({ name: `${emp.first_name} ${emp.last_name}`, value: emp.id }))
    },
    {
      type: 'list',
      name: 'newRoleId',
      message: 'Select the new role:',
      choices: roles.rows.map(role => ({ name: role.title, value: role.id }))
    }
  ]);

  await client.query('UPDATE employee SET role_id = $1 WHERE id = $2', [newRoleId, employeeId]);
  console.log(`Updated employee's role`);
}

// Run the application
runApp().catch(console.error);