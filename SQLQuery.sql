USE [MultiTenantTaskDB];
GO

/* ───────────────────────────────────────────────
   1) ROLES (3 rows)
   ─────────────────────────────────────────────── */
SET NOCOUNT ON;
SET IDENTITY_INSERT [Roles] ON;
INSERT INTO [Roles] (RoleId, RoleName) VALUES
    (1, N'SuperAdmin'),
    (2, N'Admin'),
    (3, N'User');
SET IDENTITY_INSERT [Roles] OFF;
GO

/* ───────────────────────────────────────────────
   2) DEPARTMENTS  (6 rows: 5 real‐tenants + “Global”)
   ─────────────────────────────────────────────── */
SET IDENTITY_INSERT [Departments] ON;
INSERT INTO [Departments] (DepartmentId, Name, Description, CreatedAt) VALUES
    (1,  N'Bengaluru IT',           N'Engineering & Platform',           GETUTCDATE()),
    (2,  N'Mumbai Finance',         N'Accounts & Compliance',            GETUTCDATE()),
    (3,  N'Delhi HR',               N'People Operations',                GETUTCDATE()),
    (4,  N'Hyderabad Support',      N'Customer Success',                 GETUTCDATE()),
    (5,  N'Pune Sales & Marketing', N'Growth & Partnerships',            GETUTCDATE()),
    (99, N'Global',                 N'Root tenant for Super Admins',     GETUTCDATE());
SET IDENTITY_INSERT [Departments] OFF;
GO

/* ───────────────────────────────────────────────
   3) TASK CATEGORIES (10 rows)
   ─────────────────────────────────────────────── */
SET IDENTITY_INSERT [TaskCategories] ON;
INSERT INTO [TaskCategories] (CategoryId, TenantId, Name) VALUES
    (1,  1, N'Bug'),
    (2,  1, N'Feature'),
    (3,  1, N'Refactor'),
    (4,  2, N'Invoice'),
    (5,  2, N'Forecast'),
    (6,  3, N'Recruitment'),
    (7,  3, N'Policy'),
    (8,  4, N'Incident'),
    (9,  4, N'Feedback'),
    (10, 5, N'Campaign');
SET IDENTITY_INSERT [TaskCategories] OFF;
GO

/* ───────────────────────────────────────────────
   4) USERS (20 rows: 1 SuperAdmin, 10 Admins, 9 Users)
   ─────────────────────────────────────────────── */
SET IDENTITY_INSERT [Users] ON;

-- 4.1  Super Admin (TenantId = 99, RoleId = 1)
INSERT INTO [Users]
    (UserId, Username, PasswordHash, Email, TenantId, RoleId, CreatedAt)
VALUES
    (1,  N'superadmin', N'superpassword',  N'superadmin@example.com', 99, 1, GETUTCDATE());

-- 4.2  Department Admins (2 per department, RoleId = 2)
INSERT INTO [Users] (UserId, Username, PasswordHash, Email, TenantId, RoleId, CreatedAt) VALUES
    (2,  N'itadmin1',   N'password123',  N'itadmin1@bengaluru.example.in', 1, 2, GETUTCDATE()),
    (3,  N'itadmin2',   N'password123',  N'itadmin2@bengaluru.example.in', 1, 2, GETUTCDATE()),
    (4,  N'finadmin1',  N'password123',  N'finadmin1@mumbai.example.in',   2, 2, GETUTCDATE()),
    (5,  N'finadmin2',  N'password123',  N'finadmin2@mumbai.example.in',   2, 2, GETUTCDATE()),
    (6,  N'hradmin1',   N'password123',  N'hradmin1@delhi.example.in',     3, 2, GETUTCDATE()),
    (7,  N'hradmin2',   N'password123',  N'hradmin2@delhi.example.in',     3, 2, GETUTCDATE()),
    (8,  N'supadmin1',  N'password123',  N'supadmin1@hyderabad.example.in',4, 2, GETUTCDATE()),
    (9,  N'supadmin2',  N'password123',  N'supadmin2@hyderabad.example.in',4, 2, GETUTCDATE()),
    (10, N'salesad1',   N'password123',  N'salesad1@pune.example.in',      5, 2, GETUTCDATE()),
    (11, N'salesad2',   N'password123',  N'salesad2@pune.example.in',      5, 2, GETUTCDATE());

-- 4.3  Regular Users (RoleId = 3, spread across depts)
INSERT INTO [Users] (UserId, Username, PasswordHash, Email, TenantId, RoleId, CreatedAt) VALUES
    (12, N'venkat.r',  N'password123',  N'venkat.r@bengaluru.example.in',  1, 3, GETUTCDATE()),
    (13, N'nikita.p',  N'password123',  N'nikita.p@bengaluru.example.in',  1, 3, GETUTCDATE()),
    (14, N'rahul.k',   N'password123',  N'rahul.k@mumbai.example.in',      2, 3, GETUTCDATE()),
    (15, N'arpita.d',  N'password123',  N'arpita.d@mumbai.example.in',     2, 3, GETUTCDATE()),
    (16, N'ananya.s',  N'password123',  N'ananya.s@delhi.example.in',      3, 3, GETUTCDATE()),
    (17, N'rohan.v',   N'password123',  N'rohan.v@delhi.example.in',       3, 3, GETUTCDATE()),
    (18, N'priya.c',   N'password123',  N'priya.c@hyderabad.example.in',   4, 3, GETUTCDATE()),
    (19, N'kishore.b', N'password123',  N'kishore.b@hyderabad.example.in', 4, 3, GETUTCDATE()),
    (20, N'sahil.m',   N'password123',  N'sahil.m@pune.example.in',        5, 3, GETUTCDATE());

SET IDENTITY_INSERT [Users] OFF;
GO

/* ───────────────────────────────────────────────
   5) TASKS (10 rows)
   ─────────────────────────────────────────────── */
SET IDENTITY_INSERT [Tasks] ON;
INSERT INTO [Tasks]
    (TaskId, TenantId, Title, Description, DueDate, Priority, Status, CategoryId, AssignedToUserId, CreatedAt, IsApproved, ApprovedBy)
VALUES
    (1,  1, N'Fix login bug',        N'Null pointer on MSAL callback',      DATEADD(day, 3,  SYSDATETIME()), 1, N'Open',          1, 12, SYSDATETIME(), 0, NULL),
    (2,  1, N'Add dark-mode',        N'Implement CSS variables theming',    DATEADD(day, 10, SYSUTCDATETIME()), 2, N'Open',        2, 13, SYSDATETIME(), 0, NULL),
    (3,  2, N'Reconcile Q1 GST',     N'File GST returns for Q1 2025',       DATEADD(day, 5,  SYSUTCDATETIME()), 1, N'Open',          4, 14, SYSDATETIME(), 0, NULL),
    (4,  2, N'Budget forecast',      N'Prepare FY25 projections',           DATEADD(day, 15, SYSUTCDATETIME()), 2, N'Open',         5, 15, SYSDATETIME(), 0, NULL),
    (5,  3, N'Hire SDE-II',          N'Source 5 qualified candidates',      DATEADD(day, 20, SYSUTCDATETIME()), 2, N'Open',          6, 16, SYSDATETIME(), 0, NULL),
    (6,  3, N'Update leave policy',  N'Align with new labour laws',         DATEADD(day, 12, SYSUTCDATETIME()), 3, N'Open',          7, 17, SYSDATETIME(), 0, NULL),
    (7,  4, N'Incident #4582',       N'Payment gateway timeout spike',      DATEADD(day, 2,  SYSUTCDATETIME()), 1, N'Open',          8, 18, SYSDATETIME(), 0, NULL),
    (8,  4, N'CSAT survey',          N'Roll out monthly satisfaction form', DATEADD(day, 8,  SYSUTCDATETIME()), 3, N'Open',          9, 19, SYSDATETIME(), 0, NULL),
    (9,  5, N'July ad campaign',     N'Google Ads + LinkedIn creatives',    DATEADD(day, 25, SYSUTCDATETIME()), 2, N'Open',         10, 20, SYSDATETIME(), 0, NULL),
    (10, 5, N'Partner onboarding',   N'Prep demo deck for ResellerX',       DATEADD(day, 6,  SYSUTCDATETIME()), 1, N'Open',          10, 20, SYSDATETIME(), 0, NULL);
SET IDENTITY_INSERT [Tasks] OFF;
GO

/* ───────────────────────────────────────────────
   6) TASK COMMENTS 
   ─────────────────────────────────────────────── */
SET IDENTITY_INSERT [TaskComments] ON;
INSERT INTO [TaskComments]
    (CommentId, TaskId, CommentText, CreatedByUserId, CreatedAt)
VALUES
    (1,  1, N'Investigating stack-trace; suspect null MSAL account.', 12, SYSDATETIME()),
    (2,  3, N'Will attach GST filings draft by tomorrow.',            14, SYSDATETIME());
SET IDENTITY_INSERT [TaskComments] OFF;


GO
DELETE FROM [TaskComments];
DELETE FROM [Tasks];
DELETE FROM [TaskCategories];
DELETE FROM [Users];
DELETE FROM [Roles];
DELETE FROM [Departments];
GO
DBCC CHECKIDENT('TaskComments',   RESEED, 0);
DBCC CHECKIDENT('Tasks',          RESEED, 0);
DBCC CHECKIDENT('TaskCategories', RESEED, 0);
DBCC CHECKIDENT('Users',          RESEED, 0);
DBCC CHECKIDENT('Roles',          RESEED, 0);
DBCC CHECKIDENT('Departments',    RESEED, 0);
GO
SELECT * FROM Tasks
WHERE AssignedToUserId IS NOT NULL
AND TenantId = 4;

GO
SELECT * FROM [TaskComments];
SELECT * FROM [Tasks];
SELECT * FROM [TaskCategories];
SELECT * FROM [Users] 
SELECT * FROM [Roles];
SELECT * FROM [Departments];
GO

USE [MultiTenantTaskDB];
GO

  
GO
CREATE TABLE Employee(
id int primary key,
name varchar(20),
);
insert INTO Employee (id,name)VALUES (1,'arshad');
GO

SELECT u.TenantId,d.Name FROM Users u  
LEFT JOIN Departments d on d.DepartmentId = d.DepartmentId

SELECT e.Name, d.Name AS Department FROM Employees e
INNER JOIN Departments d ON e.DeptID = d.ID;

SELECT * FROM Users;
SELECT * FROM Departments;
SELECT * FROM Tasks WHERE AssignedToUserId = 18;
SELECT * FROM Departments
SELECT * FROM Roles




SELE