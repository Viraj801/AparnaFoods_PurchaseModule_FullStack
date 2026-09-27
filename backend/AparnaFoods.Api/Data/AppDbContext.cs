using Microsoft.EntityFrameworkCore;
using AparnaFoods.Api.Models;

namespace AparnaFoods.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<PurchaseOrder> PurchaseOrders => Set<PurchaseOrder>();
        public DbSet<PurchaseOrderItem> PurchaseOrderItems => Set<PurchaseOrderItem>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<PurchaseOrderItem>()
                .Property(p => p.Amount)
                .HasComputedColumnSql("(weight_in_qtl * rate_per_qtl)", stored: true);

            modelBuilder.Entity<PurchaseOrder>()
                .HasMany(po => po.Items)
                .WithOne(item => item.PurchaseOrder)
                .HasForeignKey(item => item.PoId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}