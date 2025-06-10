USE MultiTenantTaskDB
/* -----------------------------
   0.  PREP: turn on identity insert 
----------------------------- */
SET NOCOUNT ON;

/* -----------------------------
   1.  ROLES  (3 rows)
----------------------------- */
SET IDENTITY_INSERT Roles ON;
INSERT INTO Roles (RoleId, RoleName) VALUES
  (1, 'SuperAdmin'),
  (2, 'Admin'),
  (3, 'User');
SET IDENTITY_INSERT Roles OFF;

/* -----------------------------
   2.  DEPARTMENTS  (5 rows)
----------------------------- */
SET IDENTITY_INSERT Departments ON;
INSERT INTO Departments (DepartmentId, Name, Description) VALUES
  (1, N'Bengaluru IT',           N'Engineering & Platform'),
  (2, N'Mumbai Finance',         N'Accounts & Compliance'),
  (3, N'Delhi HR',               N'People Operations'),
  (4, N'Hyderabad Support',      N'Customer Success'),
  (5, N'Pune Sales & Marketing', N'Growth & Partnerships');
SET IDENTITY_INSERT Departments OFF;

/* -----------------------------
   Add a synthetic “Global” tenant
----------------------------- */
SET IDENTITY_INSERT Departments ON;
IF NOT EXISTS (SELECT 1 FROM Departments WHERE DepartmentId = 99)
INSERT INTO Departments (DepartmentId, Name, Description)
VALUES (99, N'Global', N'Root tenant for Super Admins');
SET IDENTITY_INSERT Departments OFF;

/* -----------------------------
   3.  TASK CATEGORIES  (10 rows)
----------------------------- */
SET IDENTITY_INSERT TaskCategories ON;
INSERT INTO TaskCategories (CategoryId, TenantId /*DepartmentId*/, Name) VALUES
  (1, 1, N'Bug'),
  (2, 1, N'Feature'),
  (3, 1, N'Refactor'),
  (4, 2, N'Invoice'),
  (5, 2, N'Forecast'),
  (6, 3, N'Recruitment'),
  (7, 3, N'Policy'),
  (8, 4, N'Incident'),
  (9, 4, N'Feedback'),
  (10,5, N'Campaign');
SET IDENTITY_INSERT TaskCategories OFF;

/* -----------------------------
   4.  USERS  (20 rows: 1 SA, 10 Admins, 9 Users)
----------------------------- */
SET IDENTITY_INSERT Users ON;
-- 4.1  Super Admin (tenant-agnostic; TenantId = NULL)
INSERT INTO Users 
  (UserId, Username, PasswordHash, TenantId, RoleId, CreatedAt, Email)
VALUES
  (1, N'superadmin', N'hashed_pwd', 99, 1, SYSDATETIME(), N'arshaduzzamashaik@outlook.com');

-- 4.2  Department Admins (2 per dept)
INSERT INTO Users  
  (UserId, Username, PasswordHash, TenantId, RoleId, CreatedAt, Email) VALUES
  (2 , N'itadmin1',   N'hashed_pwd', 1, 2, SYSDATETIME(), N'itadmin1@bengaluru.example.in'),
  (3 , N'itadmin2',   N'hashed_pwd', 1, 2, SYSDATETIME(), N'itadmin2@bengaluru.example.in'),
  (4 , N'finadmin1',  N'hashed_pwd', 2, 2, SYSDATETIME(), N'finadmin1@mumbai.example.in'),
  (5 , N'finadmin2',  N'hashed_pwd', 2, 2, SYSDATETIME(), N'finadmin2@mumbai.example.in'),
  (6 , N'hradmin1',   N'hashed_pwd', 3, 2, SYSDATETIME(), N'hradmin1@delhi.example.in'),
  (7 , N'hradmin2',   N'hashed_pwd', 3, 2, SYSDATETIME(), N'hradmin2@delhi.example.in'),
  (8 , N'supadmin1',  N'hashed_pwd', 4, 2, SYSDATETIME(), N'supadmin1@hyderabad.example.in'),
  (9 , N'supadmin2',  N'hashed_pwd', 4, 2, SYSDATETIME(), N'supadmin2@hyderabad.example.in'),
  (10, N'salesad1',   N'hashed_pwd', 5, 2, SYSDATETIME(), N'salesad1@pune.example.in'),
  (11, N'salesad2',   N'hashed_pwd', 5, 2, SYSDATETIME(), N'salesad2@pune.example.in');

-- 4.3  Regular Users (9 in total, sprinkled across depts)
INSERT INTO Users  
  (UserId, Username, PasswordHash, TenantId, RoleId, CreatedAt, Email) VALUES
  (12, N'venkat.r',  N'hashed_pwd', 1, 3, SYSDATETIME(), N'venkat.r@bengaluru.example.in'),
  (13, N'nikita.p',  N'hashed_pwd', 1, 3, SYSDATETIME(), N'nikita.p@bengaluru.example.in'),
  (14, N'rahul.k',   N'hashed_pwd', 2, 3, SYSDATETIME(), N'rahul.k@mumbai.example.in'),
  (15, N'arpita.d',  N'hashed_pwd', 2, 3, SYSDATETIME(), N'arpita.d@mumbai.example.in'),
  (16, N'ananya.s',  N'hashed_pwd', 3, 3, SYSDATETIME(), N'ananya.s@delhi.example.in'),
  (17, N'rohan.v',   N'hashed_pwd', 3, 3, SYSDATETIME(), N'rohan.v@delhi.example.in'),
  (18, N'priya.c',   N'hashed_pwd', 4, 3, SYSDATETIME(), N'priya.c@hyderabad.example.in'),
  (19, N'kishore.b', N'hashed_pwd', 4, 3, SYSDATETIME(), N'kishore.b@hyderabad.example.in'),
  (20, N'sahil.m',   N'hashed_pwd', 5, 3, SYSDATETIME(), N'sahil.m@pune.example.in');
SET IDENTITY_INSERT Users OFF;

/* -----------------------------
   5.  TASKS  (10 rows)
----------------------------- */
SET IDENTITY_INSERT Tasks ON;
INSERT INTO Tasks
  (TaskId, TenantId, Title,        Description,                            DueDate,        Priority, Status, CategoryId, AssignedToUserId, CreatedAt, IsApproved)
VALUES
  (1 , 1, N'Fix login bug',        N'Null pointer on MSAL callback',       DATEADD(day, 3,  SYSUTCDATETIME()), 1, N'Open', 1 , 12, SYSDATETIME(), 0),
  (2 , 1, N'Add dark-mode',        N'Implement CSS variables theming',     DATEADD(day, 10, SYSUTCDATETIME()), 2, N'Open', 2 , 13, SYSDATETIME(), 0),
  (3 , 2, N'Reconcile Q1 GST',     N'File GST returns for Q1 2025',        DATEADD(day, 5,  SYSUTCDATETIME()), 1, N'Open', 4 , 14, SYSDATETIME(), 0),
  (4 , 2, N'Budget forecast',      N'Prepare FY25 projections',            DATEADD(day, 15, SYSUTCDATETIME()), 2, N'Open', 5 , 15, SYSDATETIME(), 0),
  (5 , 3, N'Hire SDE-II',          N'Source 5 qualified candidates',       DATEADD(day, 20, SYSUTCDATETIME()), 2, N'Open', 6 , 16, SYSDATETIME(), 0),
  (6 , 3, N'Update leave policy',  N'Align with new labour laws',          DATEADD(day, 12, SYSUTCDATETIME()), 3, N'Open', 7 , 17, SYSDATETIME(), 0),
  (7 , 4, N'Incident #4582',       N'Payment gateway timeout spike',       DATEADD(day, 2,  SYSUTCDATETIME()), 1, N'Open', 8 , 18, SYSDATETIME(), 0),
  (8 , 4, N'CSAT survey',          N'Roll out monthly satisfaction form',  DATEADD(day, 8,  SYSUTCDATETIME()), 3, N'Open', 9 , 19, SYSDATETIME(), 0),
  (9 , 5, N'July ad campaign',     N'Google Ads + LinkedIn creatives',     DATEADD(day, 25, SYSUTCDATETIME()), 2, N'Open', 10, 20, SYSDATETIME(), 0),
  (10, 5, N'Partner onboarding',   N'Prep demo deck for ResellerX',        DATEADD(day, 6,  SYSUTCDATETIME()), 1, N'Open', 10, 20, SYSDATETIME(), 0);
SET IDENTITY_INSERT Tasks OFF;

/* -----------------------------
   6.  TASK COMMENTS  (2 rows)
----------------------------- */
SET IDENTITY_INSERT TaskComments ON;
INSERT INTO TaskComments
  (CommentId, TaskId, CommentText, CreatedByUserId, CreatedAt)
VALUES
  (1, 1, N'Investigating stack-trace; suspect null MSAL account.', 12, SYSDATETIME()),
  (2, 3, N'Will attach GST filings draft by tomorrow.',            14, SYSDATETIME());
SET IDENTITY_INSERT TaskComments OFF;

/* -----------------------------
   DONE!  50 rows inserted.
----------------------------- */
PRINT 'Seed data inserted successfully.';


SELECT * FROM Users WHERE RoleId = 2;
SELECT * FROM Tasks WHERE TaskId = 11;

USE MultiTenantTaskDB;
GO

IF OBJECT_ID('dbo.sp_GetTaskStatsForProductivityChart', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_GetTaskStatsForProductivityChart;
GO

CREATE PROCEDURE sp_GetTaskStatsForProductivityChart
    @TenantId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        t.TaskId,
        t.Title,
        t.AssignedToUserId,
        u.Username AS AssignedToUserUsername,
        t.Status,
        t.DueDate,
        t.Priority
    FROM Tasks t
    LEFT JOIN Users u ON t.AssignedToUserId = u.UserId
    WHERE t.TenantId = @TenantId;
END;
GO
ALTER PROCEDURE sp_UpdateTask
    @TaskId INT,
    @Title NVARCHAR(200) = NULL,
    @Description NVARCHAR(MAX) = NULL,
    @DueDate DATETIME = NULL,
    @Priority INT = NULL,
    @Status NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Tasks
    SET 
        Title       = ISNULL(@Title, Title),
        Description = ISNULL(@Description, Description),
        DueDate     = ISNULL(@DueDate, DueDate),
        Priority    = ISNULL(@Priority, Priority),
        Status      = ISNULL(@Status, Status)
    WHERE TaskId = @TaskId;

    SELECT * FROM Tasks WHERE TaskId = @TaskId;
END;

ALTER PROCEDURE sp_UpdateUser
    @UserId INT,
    @TenantId INT,
    @Username NVARCHAR(50),
    @PasswordHash NVARCHAR(255),
    @RoleId INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Users
    SET Username = @Username,
        PasswordHash = @PasswordHash,
        RoleId = @RoleId
    WHERE UserId = @UserId AND TenantId = @TenantId;

    SELECT * FROM Users WHERE UserId = @UserId;
END;
