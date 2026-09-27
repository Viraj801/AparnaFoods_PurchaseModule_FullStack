using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AparnaFoods.Api.Data;
using AparnaFoods.Api.Models;
using AparnaFoods.Api.DTOs;

namespace AparnaFoods.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
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

            var po = new PurchaseOrder
            {
                PoNumber = dto.PoNumber,
                PoDate = dto.PoDate,
                PartyName = dto.PartyName,
                PurchasedBy = dto.PurchasedBy,
                Broker = dto.Broker,
                Brokerage = dto.Brokerage,
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
    }
}