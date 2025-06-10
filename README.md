<<<<<<< HEAD
# MultiTenantTaskFrontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.12.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
=======
### 📄 Full `README.md` (Copy from below):

```markdown
# 🚀 Multi-Tenant Task Management System

A full-stack task management system that supports **multi-department (tenant)** task management with **role-based access** for Users, Admins, and Super Admins.

## 🛠️ Tech Stack

- **Frontend:** Angular 19, Bootstrap 5, Chart.js, SweetAlert2, MSAL.js
- **Backend:** ASP.NET Core Web API (.NET 8), Entity Framework Core
- **Database:** SQL Server with Stored Procedures
- **Authentication:** JWT Tokens + Microsoft Login (OAuth 2.0)

---

## 📁 Folder Structure

```

CAPSTONE-Project/
├── multi-tenant-task-frontend/   # Angular frontend
└── multi-tenant-task-backend/    # ASP.NET Core backend

````

---

## 👥 Roles and Features

### 👤 User
- Create and manage personal tasks
- Post task comments
- View task status and pie charts
- Microsoft login support

### 🛠️ Admin
- Manage users (CRUD)
- Assign tasks, approve/reject tasks
- Create/edit categories
- View department-level charts and reports

### 🧑‍💼 Super Admin
- Manage departments and admins
- Approve new categories
- System-wide settings (max tasks per user, approvals)
- Global dashboards and usage analytics

---

## 📊 Dashboard Features

- Pie charts and bar graphs for:
  - Task status (Completed, In-Progress, To-Do)
  - User productivity reports
  - Department-level statistics
- Comment threads under each task
- Task assignment & approval workflow
- SweetAlert2 modals for feedback and confirmations

---

## 🚀 Getting Started

### 📦 Backend (ASP.NET Core API)
```bash
cd multi-tenant-task-backend
dotnet restore
dotnet ef database update
dotnet run
````

> Make sure your `appsettings.json` has the correct SQL Server connection string.

---

### 🌐 Frontend (Angular 19)

```bash
cd multi-tenant-task-frontend
npm install
ng serve
```

> The frontend connects to `https://localhost:7134` by default and uses MSAL.js for Microsoft login.

---

## 📸 Screenshots (Coming Soon!)

---

## ⚙️ Configuration Tips

* Microsoft Login setup uses:

  * MSAL client ID and tenant ID in `msal.config.ts`
  * Token exchange with backend for JWT
* Use `appsettings.json` for backend JWT secret, DB connection, etc.
* CORS enabled for `https://localhost:4200`

---

## ✅ TODO

* [x] Frontend and backend integration
* [x] Microsoft login via MSAL
* [x] Role-based UI and APIs
* [x] Chart visualizations
* [ ] Add screenshots
* [ ] Deploy to Azure or IIS

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 👤 Author

**Arshad Shaik**
📫 GitHub: [arshadshaik0000](https://github.com/arshadshaik0000)

---

````

---

### ✅ Next Steps:
1. Save this file as `README.md` in the root of your `CAPSTONE-Project`.
2. Then run:
   ```bash
   git add README.md
   git commit -m "Added project README"
   git push origin main
>>>>>>> 7e2c9e7461554397ee0c61ebe23b6cd802083f3c
