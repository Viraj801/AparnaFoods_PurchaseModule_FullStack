using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using AparnaFoods.Api.Data;
using AparnaFoods.Api.Models;
using AparnaFoods.Api.DTOs;

namespace AparnaFoods.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PurchaseOrdersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PurchaseOrdersController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/purchaseorders
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PurchaseOrder>>> GetPurchaseOrders()
        {
            return await _context.PurchaseOrders
                .Include(po => po.Items)
                .OrderByDescending(po => po.PoId)
                .ToListAsync();
        }

        // GET: api/purchaseorders/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PurchaseOrder>> GetPurchaseOrder(int id)
        {
            var po = await _context.PurchaseOrders
                .Include(po => po.Items)
                .FirstOrDefaultAsync(p => p.PoId == id);

            if (po == null) return NotFound(new { message = $"PO with ID {id} not found." });
            return Ok(po);
        }

        // GET: api/purchaseorders/dashboard-metrics
        [HttpGet("dashboard-metrics")]
        public async Task<ActionResult<DashboardSummaryDto>> GetDashboardMetrics()
        {
            var summary = await _context.PurchaseOrders
                .Select(po => new
                {
                    Bags = po.Items.Sum(i => i.NoOfBags),
                    Weight = po.Items.Sum(i => i.WeightInQtl),
                    Amount = po.Items.Sum(i => i.WeightInQtl * i.RatePerQtl)
                })
                .ToListAsync();

            return Ok(new DashboardSummaryDto
            {
                TotalOrders = summary.Count,
                TotalBags = summary.Sum(s => s.Bags),
                TotalWeightQtl = summary.Sum(s => s.Weight),
                TotalAmount = summary.Sum(s => s.Amount)
            });
        }

        // POST: api/purchaseorders
        [HttpPost]
        public async Task<ActionResult<PurchaseOrder>> CreatePurchaseOrder([FromBody] CreatePurchaseOrderDto dto)
        {
            if (await _context.PurchaseOrders.AnyAsync(p => p.PoNumber == dto.PoNumber))
            {
                return Conflict(new { message = $"PO number '{dto.PoNumber}' already exists." });
            }

            // Parse incoming PoDate (frontend sends ISO date string 'yyyy-MM-dd')
            DateOnly parsedDate;
            if (!DateOnly.TryParse(dto.PoDate, out parsedDate))
            {
                // fallback: try parse as DateTime then take date portion
                if (DateTime.TryParse(dto.PoDate, out var dt))
                {
                    parsedDate = DateOnly.FromDateTime(dt);
                }
                else
                {
                    parsedDate = DateOnly.FromDateTime(DateTime.UtcNow);
                }
            }

            var po = new PurchaseOrder
            {
                PoNumber = dto.PoNumber,
                PoDate = parsedDate,
                PartyName = dto.PartyName,
                PurchasedBy = dto.PurchasedBy,
                Broker = dto.Broker,
                Brokerage = dto.Brokerage,
                Status = string.IsNullOrWhiteSpace(dto.Status) ? "Pending" : dto.Status,
                PaymentTerms = dto.PaymentTerms,
                DanaCut = dto.DanaCut,
                Cd = dto.Cd,
                FreightPartyOrSelf = dto.FreightPartyOrSelf,
                Remarks = dto.Remarks,
                Bardana = dto.Bardana,
                Village = dto.Village,
                FarmerName = dto.FarmerName,
                MobileNumber = dto.MobileNumber,
                Company = dto.Company,
                Items = dto.Items.Select(item => new PurchaseOrderItem
                {
                    VariantName = item.VariantName,
                    ItemType = item.ItemType,
                    NoOfBags = item.NoOfBags,
                    WeightInQtl = item.WeightInQtl,
                    RatePerQtl = item.RatePerQtl
                }).ToList()
            };

            _context.PurchaseOrders.Add(po);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPurchaseOrder), new { id = po.PoId }, po);
        }

        // PUT: api/purchaseorders/5
        // Update an existing Purchase Order and replace its items with the provided list.
        [HttpPut("{id}")]
        public async Task<ActionResult<PurchaseOrder>> UpdatePurchaseOrder(int id, [FromBody] CreatePurchaseOrderDto dto)
        {
            var po = await _context.PurchaseOrders
                .Include(p => p.Items)
                .FirstOrDefaultAsync(p => p.PoId == id);

            if (po == null) return NotFound(new { message = $"PO with ID {id} not found." });

            // Prevent duplicate PO numbers for other records
            if (!string.Equals(po.PoNumber, dto.PoNumber, StringComparison.OrdinalIgnoreCase))
            {
                if (await _context.PurchaseOrders.AnyAsync(p => p.PoNumber == dto.PoNumber && p.PoId != id))
                {
                    return Conflict(new { message = $"PO number '{dto.PoNumber}' already exists on another record." });
                }
            }

            // Parse incoming PoDate
            DateOnly parsedDate;
            if (!DateOnly.TryParse(dto.PoDate, out parsedDate))
            {
                if (DateTime.TryParse(dto.PoDate, out var dt))
                {
                    parsedDate = DateOnly.FromDateTime(dt);
                }
                else
                {
                    parsedDate = DateOnly.FromDateTime(DateTime.UtcNow);
                }
            }

            // Update scalar fields
            po.PoNumber = dto.PoNumber;
            po.PoDate = parsedDate;
            po.PartyName = dto.PartyName;
            po.PurchasedBy = dto.PurchasedBy;
            po.Broker = dto.Broker;
            po.Status = string.IsNullOrWhiteSpace(dto.Status) ? po.Status : dto.Status;
            po.Brokerage = dto.Brokerage;
            po.PaymentTerms = dto.PaymentTerms;
            po.DanaCut = dto.DanaCut;
            po.Cd = dto.Cd;
            po.FreightPartyOrSelf = dto.FreightPartyOrSelf;
            po.Remarks = dto.Remarks;
            po.Bardana = dto.Bardana;
            po.Village = dto.Village;
            po.FarmerName = dto.FarmerName;
            po.MobileNumber = dto.MobileNumber;
            po.Company = dto.Company;
            po.UpdatedAt = DateTime.UtcNow;

            // Replace items: remove existing and add new from DTO
            if (po.Items != null && po.Items.Any())
            {
                _context.RemoveRange(po.Items);
            }

            po.Items = dto.Items.Select(item => new PurchaseOrderItem
            {
                VariantName = item.VariantName,
                ItemType = item.ItemType,
                NoOfBags = item.NoOfBags,
                WeightInQtl = item.WeightInQtl,
                RatePerQtl = item.RatePerQtl
            }).ToList();

            await _context.SaveChangesAsync();

            // Reload with items to return up-to-date entity
            var updated = await _context.PurchaseOrders
                .Include(p => p.Items)
                .FirstOrDefaultAsync(p => p.PoId == id);

            return Ok(updated);
        }

        // DELETE: api/purchaseorders/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePurchaseOrder(int id)
        {
            var po = await _context.PurchaseOrders.FindAsync(id);
            if (po == null) return NotFound();

            _context.PurchaseOrders.Remove(po);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DEBUG: GET: api/purchaseorders/records
        // Returns purchase orders with their items in a compact JSON shape (convenient for debugging)
        [HttpGet("records")]
        public async Task<ActionResult<IEnumerable<object>>> GetPurchaseOrderRecords()
        {
            var records = await _context.PurchaseOrders
                .Include(po => po.Items)
                .OrderByDescending(po => po.PoId)
                .Select(po => new
                {
                    poId = po.PoId,
                    poNumber = po.PoNumber,
                    poDate = po.PoDate,
                    partyName = po.PartyName,
                    purchasedBy = po.PurchasedBy,
                    broker = po.Broker,
                    brokerage = po.Brokerage,
                    paymentTerms = po.PaymentTerms,
                    danaCut = po.DanaCut,
                    cd = po.Cd,
                    freightPartyOrSelf = po.FreightPartyOrSelf,
                    bardana = po.Bardana,
                    remarks = po.Remarks,
                    village = po.Village,
                    farmerName = po.FarmerName,
                    mobileNumber = po.MobileNumber,
                    company = po.Company,
                    createdAt = po.CreatedAt,
                    updatedAt = po.UpdatedAt,
                    items = po.Items.Select(i => new
                    {
                        itemId = i.ItemId,
                        variantName = i.VariantName,
                        itemType = i.ItemType,
                        noOfBags = i.NoOfBags,
                        weightInQtl = i.WeightInQtl,
                        ratePerQtl = i.RatePerQtl,
                        amount = i.Amount
                    }).ToList()
                    ,
                    status = po.Status
                })
                .ToListAsync();

            return Ok(records);
        }
    }
}