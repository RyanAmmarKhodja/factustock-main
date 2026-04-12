using factustock.Models;
using Microsoft.EntityFrameworkCore;
using System.Data;
using System.Numerics;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace factustock.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    // ── DbSets ──────────────────────────────────────────────────────────────
    public DbSet<Plan> Plans => Set<Plan>();
    public DbSet<Subscription> Subscriptions => Set<Subscription>();
    public DbSet<Company> Company => Set<Company>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Client> Clients => Set<Client>();
    public DbSet<Supplier> Suppliers => Set<Supplier>();
    public DbSet<Product> Produits => Set<Product>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<InvoiceItem> InvoiceItems => Set<InvoiceItem>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<StockMovement> StockMovements => Set<StockMovement>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<SystemSettings> SystemSettings { get; set; }

    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);

        // ── PLAN ────────────────────────────────────────────────────────────
        b.Entity<Plan>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).HasMaxLength(50).IsRequired();
            e.Property(x => x.Price).HasPrecision(18, 2);
            e.Property(x => x.SetupFee).HasPrecision(18, 2);
        });

        // ── SUBSCRIPTION ────────────────────────────────────────────────────
        b.Entity<Subscription>(e =>
        {
            e.HasKey(x => x.Id);

            e.HasOne(x => x.Company)
             .WithOne(x => x.Subscription)
             .HasForeignKey<Subscription>(x => x.CompanyId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.Plan)
             .WithMany(x => x.Subscriptions)
             .HasForeignKey(x => x.PlanId)
             .OnDelete(DeleteBehavior.Restrict);

            e.Property(x => x.Status)
             .HasConversion<string>()
             .HasMaxLength(20);

            e.Property(x => x.BillingCycle)
             .HasConversion<string>()
             .HasMaxLength(20);
        });

        // ── COMPANY ─────────────────────────────────────────────────────────
        b.Entity<Company>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).HasMaxLength(200).IsRequired();
            e.Property(x => x.LegalName).HasMaxLength(200).IsRequired();
            e.Property(x => x.NIF).HasMaxLength(20);
            e.Property(x => x.NIS).HasMaxLength(20);
            e.Property(x => x.RC).HasMaxLength(50);
            e.Property(x => x.AI).HasMaxLength(50);

            // Relationship to Subscription is configured on Subscription side
        });

        // ── ROLE ─────────────────────────────────────────────────────────────
        b.Entity<Role>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).HasMaxLength(50).IsRequired();
            e.HasIndex(x => x.Name).IsUnique();
        });

        // ── USER ─────────────────────────────────────────────────────────────
        b.Entity<User>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Email).HasMaxLength(200).IsRequired();
            e.HasIndex(x => x.Email).IsUnique();
            e.Property(x => x.PasswordHash).IsRequired();
            e.Property(x => x.FirstName).HasMaxLength(100).IsRequired();
            e.Property(x => x.LastName).HasMaxLength(100).IsRequired();

            e.HasOne(x => x.Company)
             .WithMany(x => x.Users)
             .HasForeignKey(x => x.CompanyId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.Role)
             .WithMany(x => x.Users)
             .HasForeignKey(x => x.RoleId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── CLIENT ──────────────────────────────────────────────────────────
        b.Entity<Client>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.LegalName).HasMaxLength(200).IsRequired();
            e.Property(x => x.Type).HasConversion<string>().HasMaxLength(20);

            e.HasOne(x => x.Company)
             .WithMany(x => x.Clients)
             .HasForeignKey(x => x.CompanyId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── SUPPLIER ───────────────────────────────────────────────────────
        b.Entity<Supplier>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.LegalName).HasMaxLength(200).IsRequired();
            e.HasOne(x => x.Company)
             .WithMany(x => x.Suppliers)
             .HasForeignKey(x => x.CompanyId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── PRODUIT ──────────────────────────────────────────────────────────
        b.Entity<Product>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Code).HasMaxLength(50).IsRequired();
            e.Property(x => x.Name).HasMaxLength(200).IsRequired();
            e.Property(x => x.Price).HasPrecision(18, 2);
            e.Property(x => x.DefaultTaxRate).HasPrecision(5, 2);
            e.Property(x => x.StockQuantity).HasPrecision(18, 3);
            e.Property(x => x.MinStockLevel).HasPrecision(18, 3);

            e.HasIndex(x => new { x.CompanyId, x.Code }).IsUnique(); // code unique per company

            e.HasOne(x => x.Company)
             .WithMany(x => x.Products)
             .HasForeignKey(x => x.CompanyId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── INVOICE ──────────────────────────────────────────────────────────
        b.Entity<Invoice>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.InvoiceNumber).HasMaxLength(50).IsRequired();
            e.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
            e.Property(x => x.PaymentMethod).HasConversion<string>().HasMaxLength(30);
            e.Property(x => x.TotalHorsTaxe).HasPrecision(18, 2);
            e.Property(x => x.TTC).HasPrecision(18, 2);

            e.HasIndex(x => new { x.CompanyId, x.InvoiceNumber }).IsUnique();

            e.HasOne(x => x.Client)
             .WithMany(x => x.Invoices)
             .HasForeignKey(x => x.ClientId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.Company)
             .WithMany(x => x.Invoices)
             .HasForeignKey(x => x.CompanyId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.CreatedByUser)
             .WithMany()
             .HasForeignKey(x => x.CreatedByUserId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── INVOICE ITEM ─────────────────────────────────────────────────────
        b.Entity<InvoiceItem>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Quantity).HasPrecision(18, 3);
            e.Property(x => x.PricePerUnit).HasPrecision(18, 2);
            e.Property(x => x.TVA).HasPrecision(5, 2);
            e.Property(x => x.PriceHorsTaxe).HasPrecision(18, 2);
            e.Property(x => x.PriceTTC).HasPrecision(18, 2);

            e.HasOne(x => x.Invoice)
             .WithMany(x => x.Items)
             .HasForeignKey(x => x.InvoiceId)
             .OnDelete(DeleteBehavior.Cascade);    // items die with invoice

            e.HasOne(x => x.Product)
             .WithMany(x => x.InvoiceItems)
             .HasForeignKey(x => x.ProductId)
             .OnDelete(DeleteBehavior.Restrict);   // never delete a product that has been invoiced
        });

        // ── PAYMENT ──────────────────────────────────────────────────────────
        b.Entity<Payment>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Amount).HasPrecision(18, 2);
            e.Property(x => x.Method).HasConversion<string>().HasMaxLength(30);

            e.HasOne(x => x.Invoice)
             .WithMany(x => x.Payments)
             .HasForeignKey(x => x.InvoiceId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.RecordedByUser)
             .WithMany()
             .HasForeignKey(x => x.RecordedByUserId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── STOCK MOVEMENT ───────────────────────────────────────────────────
        b.Entity<StockMovement>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Quantity).HasPrecision(18, 3);
            e.Property(x => x.QuantityBefore).HasPrecision(18, 3);
            e.Property(x => x.QuantityAfter).HasPrecision(18, 3);
            e.Property(x => x.Type).HasConversion<string>().HasMaxLength(20);

            e.HasOne(x => x.Product)
             .WithMany(x => x.StockMovements)
             .HasForeignKey(x => x.ProductId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.User)
             .WithMany(x => x.StockMovements)
             .HasForeignKey(x => x.UserId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.Invoice)
             .WithMany(x => x.StockMovements)
             .HasForeignKey(x => x.InvoiceId)
             .IsRequired(false)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── AUDIT LOG ────────────────────────────────────────────────────────
        b.Entity<AuditLog>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.EntityType).HasMaxLength(100).IsRequired();
            e.Property(x => x.Action).HasMaxLength(50).IsRequired();
            e.Property(x => x.IpAddress).HasMaxLength(45);    // covers IPv6

            // Audit logs are immutable — no cascade, no update
            e.HasOne(x => x.User)
             .WithMany(x => x.AuditLogs)
             .HasForeignKey(x => x.UserId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── NOTIFICATION ─────────────────────────────────────────────────────
        b.Entity<Notification>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Message).HasMaxLength(500).IsRequired();
            e.Property(x => x.Type).HasConversion<string>().HasMaxLength(50);

            e.HasOne(x => x.User)
             .WithMany(x => x.Notifications)
             .HasForeignKey(x => x.UserId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.Invoice)
             .WithMany(x => x.Notifications)
             .HasForeignKey(x => x.InvoiceId)
             .IsRequired(false)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // ── SEED: Default Roles ───────────────────────────────────────────────
        b.Entity<Role>().HasData(
            new Role { Id = 1, Name = "superadmin", Description = "Full system access" },
            new Role { Id = 2, Name = "admin", Description = "Company admin access" },
            new Role { Id = 3, Name = "employee", Description = "Standard user access" }
        );

        // ── SEED: Default Plans ───────────────────────────────────────────────
        b.Entity<Plan>().HasData(
            new Plan { Id = 1, Name = "Starter", MaxAdminAccounts = 1, MaxUserAccounts = 2, MaxTotalAccounts = 3, Price = 5000, SetupFee = 30000, IsActive = true },
            new Plan { Id = 2, Name = "Business", MaxAdminAccounts = 1, MaxUserAccounts = 5, MaxTotalAccounts = 6, Price = 8000, SetupFee = 30000, IsActive = true },
            new Plan { Id = 3, Name = "Pro", MaxAdminAccounts = 2, MaxUserAccounts = 10, MaxTotalAccounts = 12, Price = 12000, SetupFee = 50000, IsActive = true }
        );
    }
}