using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace AparnaFoods.Api.Models
{
    [Table("purchase_order_items")]
    public class PurchaseOrderItem
    {
        [Key]
        [Column("item_id")]
        public int ItemId { get; set; }

        [Required]
        [Column("po_id")]
        public int PoId { get; set; }

        [Required]
        [MaxLength(150)]
        [Column("variant_name")]
        public string VariantName { get; set; } = string.Empty;

        [MaxLength(100)]
        [Column("item_type")]
        public string? ItemType { get; set; }

        [Column("no_of_bags")]
        public int NoOfBags { get; set; }

        [Column("weight_in_qtl", TypeName = "decimal(10,2)")]
        public decimal WeightInQtl { get; set; }

        [Column("rate_per_qtl", TypeName = "decimal(10,2)")]
        public decimal RatePerQtl { get; set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        [Column("amount", TypeName = "decimal(12,2)")]
        public decimal Amount { get; set; }

        [JsonIgnore]
        [ForeignKey(nameof(PoId))]
        public PurchaseOrder? PurchaseOrder { get; set; }
    }
}