using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AparnaFoods.Api.Models
{
    [Table("purchase_orders")]
    public class PurchaseOrder
    {
        [Key]
        [Column("po_id")]
        public int PoId { get; set; }

        [Required]
        [MaxLength(50)]
        [Column("po_number")]
        public string PoNumber { get; set; } = string.Empty;

        [Required]
        [Column("po_date")]
        public DateOnly PoDate { get; set; }

        [MaxLength(150)]
        [Column("party_name")]
        public string? PartyName { get; set; }

        [MaxLength(100)]
        [Column("purchased_by")]
        public string? PurchasedBy { get; set; }

        [MaxLength(100)]
        [Column("broker")]
        public string? Broker { get; set; }

        [Column("brokerage", TypeName = "decimal(10,2)")]
        public decimal Brokerage { get; set; } = 0.00m;

        [MaxLength(255)]
        [Column("payment_terms")]
        public string? PaymentTerms { get; set; }

        [MaxLength(100)]
        [Column("dana_cut")]
        public string? DanaCut { get; set; }

        [MaxLength(100)]
        [Column("cd")]
        public string? Cd { get; set; }

        [MaxLength(50)]
        [Column("freight_party_or_self")]
        public string? FreightPartyOrSelf { get; set; }

        [Column("remarks", TypeName = "TEXT")]
        public string? Remarks { get; set; }

        [MaxLength(100)]
        [Column("bardana")]
        public string? Bardana { get; set; }

        [MaxLength(100)]
        [Column("village")]
        public string? Village { get; set; }

        [MaxLength(150)]
        [Column("farmer_name")]
        public string? FarmerName { get; set; }

        [MaxLength(20)]
        [Column("mobile_number")]
        public string? MobileNumber { get; set; }

        [MaxLength(150)]
        [Column("company")]
        public string? Company { get; set; }

        [MaxLength(50)]
        [Column("status")]
        public string Status { get; set; } = "Pending";

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public List<PurchaseOrderItem> Items { get; set; } = new();
    }
}