namespace AparnaFoods.Api.DTOs
{
    public class CreatePurchaseOrderItemDto
    {
        public string VariantName { get; set; } = string.Empty;
        public string? ItemType { get; set; }
        public int NoOfBags { get; set; }
        public decimal WeightInQtl { get; set; }
        public decimal RatePerQtl { get; set; }
    }

    public class CreatePurchaseOrderDto
    {
        public string PoNumber { get; set; } = string.Empty;
        // Use string for incoming dates from frontend (ISO 'yyyy-MM-dd') and parse in controller
        public string PoDate { get; set; } = string.Empty;
        public string? PartyName { get; set; }
        public string? PurchasedBy { get; set; }
        public string? Broker { get; set; }
        public decimal Brokerage { get; set; }
        public string? PaymentTerms { get; set; }
        public string? DanaCut { get; set; }
        public string? Cd { get; set; }
        public string? FreightPartyOrSelf { get; set; }
        public string? Remarks { get; set; }
        public string? Bardana { get; set; }
        public string? Village { get; set; }
        public string? FarmerName { get; set; }
        public string? MobileNumber { get; set; }
        public string? Company { get; set; }
        // Optional status provided by frontend (e.g. "Pending", "Verified", "Processed")
        public string? Status { get; set; } = "Pending";
        public List<CreatePurchaseOrderItemDto> Items { get; set; } = new();
    }

    public class DashboardSummaryDto
    {
        public int TotalOrders { get; set; }
        public int TotalBags { get; set; }
        public decimal TotalWeightQtl { get; set; }
        public decimal TotalAmount { get; set; }
    }
}