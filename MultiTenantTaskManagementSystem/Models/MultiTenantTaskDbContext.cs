using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using MultiTenantTaskManagementSystem.DTOs;

namespace MultiTenantTaskManagementSystem.Models
{
    public partial class MultiTenantTaskDbContext : DbContext
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public MultiTenantTaskDbContext() { }

        public MultiTenantTaskDbContext(DbContextOptions<MultiTenantTaskDbContext> options, IHttpContextAccessor httpContextAccessor)
            : base(options)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public DbSet<TaskWithUserDto> TaskWithUserDto { get; set; } = null!;
        public DbSet<AdminViewDto> AdminViewDtos { get; set; } = null!;
        public DbSet<DepartmentStatsDto> DepartmentStatsDtos { get; set; } = null!;
        public DbSet<UserProductivityDto> UserProductivityStats { get; set; } = null!;


        public virtual DbSet<Department> Departments { get; set; }
        public virtual DbSet<Role> Roles { get; set; }
        public virtual DbSet<Task> Tasks { get; set; }
        public virtual DbSet<TaskCategory> TaskCategories { get; set; }
        public virtual DbSet<TaskComment> TaskComments { get; set; }
        public virtual DbSet<User> Users { get; set; }


        /// <summary>
        /// Helper to extract TenantId from the current HTTP context
        /// </summary>
        private int GetTenantIdFromContext()
        {
            var tenantClaim = _httpContextAccessor?.HttpContext?.User?.FindFirst("TenantId");
            return (tenantClaim != null && int.TryParse(tenantClaim.Value, out var id)) ? id : 0;
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                // Configuration happens via DI in Program.cs
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<TaskWithUserDto>().HasNoKey().ToView(null);
            modelBuilder.Entity<AdminViewDto>().HasNoKey().ToView(null);
            modelBuilder.Entity<DepartmentStatsDto>().HasNoKey().ToView(null);
            modelBuilder.Entity<UserProductivityDto>().HasNoKey().ToView(null);

            // === Department ===
            modelBuilder.Entity<Department>(entity =>
            {
                entity.HasKey(e => e.DepartmentId).HasName("PK_Departments");
                entity.Property(e => e.Name).HasMaxLength(100);
                entity.Property(e => e.Description).HasMaxLength(255);
                entity.Property(e => e.CreatedAt)
                      .HasDefaultValueSql("(getdate())")
                      .HasColumnType("datetime");
            });

            // === Role ===
            modelBuilder.Entity<Role>(entity =>
            {
                entity.HasKey(e => e.RoleId).HasName("PK_Roles");
                entity.Property(e => e.RoleName).HasMaxLength(50);
            });

            // === User ===
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.UserId).HasName("PK_Users");
                entity.HasIndex(e => e.Username).IsUnique();
                entity.Property(e => e.Username).HasMaxLength(50);
                entity.Property(e => e.PasswordHash).HasMaxLength(255);
                entity.Property(e => e.CreatedAt)
                      .HasDefaultValueSql("(getdate())")
                      .HasColumnType("datetime");

                entity.HasOne(d => d.Role)
                      .WithMany(p => p.Users)
                      .HasForeignKey(d => d.RoleId)
                      .OnDelete(DeleteBehavior.ClientSetNull)
                      .HasConstraintName("FK_Users_RoleId");

                entity.HasOne(d => d.Tenant)
                      .WithMany(p => p.Users)
                      .HasForeignKey(d => d.TenantId)
                      .OnDelete(DeleteBehavior.ClientSetNull)
                      .HasConstraintName("FK_Users_TenantId");
            });

            // === TaskCategory ===
            modelBuilder.Entity<TaskCategory>(entity =>
            {
                entity.HasKey(e => e.CategoryId).HasName("PK_TaskCategories");
                entity.Property(e => e.Name).HasMaxLength(100);

                entity.HasOne(d => d.Tenant)
                      .WithMany(p => p.TaskCategories)
                      .HasForeignKey(d => d.TenantId)
                      .OnDelete(DeleteBehavior.ClientSetNull)
                      .HasConstraintName("FK_TaskCategories_TenantId");
            });

            // === Task ===
            modelBuilder.Entity<Task>(entity =>
            {
                entity.HasKey(e => e.TaskId).HasName("PK_Tasks");
                entity.Property(e => e.Title).HasMaxLength(200);
                entity.Property(e => e.Description).HasColumnType("nvarchar(max)");
                entity.Property(e => e.DueDate).HasColumnType("datetime");
                entity.Property(e => e.Status)
                      .HasMaxLength(50)
                      .HasDefaultValue("Pending");
                entity.Property(e => e.CreatedAt)
                      .HasDefaultValueSql("(getdate())")
                      .HasColumnType("datetime");

                entity.HasOne(d => d.AssignedToUser)
                      .WithMany(p => p.Tasks)
                      .HasForeignKey(d => d.AssignedToUserId)
                      .HasConstraintName("FK_Tasks_AssignedToUserId");

                entity.HasOne(d => d.Category)
                      .WithMany(p => p.Tasks)
                      .HasForeignKey(d => d.CategoryId)
                      .HasConstraintName("FK_Tasks_CategoryId");

                entity.HasOne(d => d.Tenant)
                      .WithMany(p => p.Tasks)
                      .HasForeignKey(d => d.TenantId)
                      .OnDelete(DeleteBehavior.ClientSetNull)
                      .HasConstraintName("FK_Tasks_TenantId");

                // Approval relationship
                entity.HasOne(t => t.ApprovedByUser)
                      .WithMany()
                      .HasForeignKey(t => t.ApprovedBy)
                      .OnDelete(DeleteBehavior.SetNull)
                      .HasConstraintName("FK_Tasks_ApprovedBy");
            });

            // === TaskComment ===
            modelBuilder.Entity<TaskComment>(entity =>
            {
                entity.HasKey(e => e.CommentId).HasName("PK_TaskComments");
                entity.Property(e => e.CommentText).HasColumnType("nvarchar(max)");
                entity.Property(e => e.CreatedAt)
                      .HasDefaultValueSql("(getdate())")
                      .HasColumnType("datetime");

                entity.HasOne(d => d.Task)
                      .WithMany(p => p.TaskComments)
                      .HasForeignKey(d => d.TaskId)
                      .OnDelete(DeleteBehavior.Cascade)
                      .HasConstraintName("FK_TaskComments_TaskId");

                entity.HasOne(d => d.CreatedByUser)
                      .WithMany(p => p.TaskComments)
                      .HasForeignKey(d => d.CreatedByUserId)
                      .HasConstraintName("FK_TaskComments_CreatedByUserId");
            });

            int tenantId = GetTenantIdFromContext();
            if (tenantId > 0)
            {
                modelBuilder.Entity<User>().HasQueryFilter(u => u.TenantId == tenantId);
                modelBuilder.Entity<Task>().HasQueryFilter(t => t.TenantId == tenantId);
                modelBuilder.Entity<TaskCategory>().HasQueryFilter(c => c.TenantId == tenantId);
                modelBuilder.Entity<TaskComment>().HasQueryFilter(c => c.Task.TenantId == tenantId);
            }

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}
