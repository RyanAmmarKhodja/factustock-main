using factustock.DTOs;
using factustock.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace factustock.Controllers;

[ApiController]
[Route("api/products")]
[Authorize]
public class ProductController(IProductService productService) : ControllerBase
{
    // ── POST /api/products ───────────────────────────────────────────────────
    /// <summary>Create a new product. Admin only.</summary>
    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<ProductDetailDto>> CreateProduct(
        [FromBody] CreateProductRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var (data, error) = await productService.CreateProductAsync(request, GetUserId());

        if (error is not null) return Conflict(new { message = error });

        return CreatedAtAction(nameof(GetProduct), new { id = data!.Id }, data);
    }

    // ── PUT /api/products/{id} ───────────────────────────────────────────────
    /// <summary>Update product info. Admin only.</summary>
    [HttpPut("{id:int}")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<ProductDetailDto>> UpdateProduct(
        int id, [FromBody] UpdateProductRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var (data, error) = await productService.UpdateProductAsync(id, request, GetUserId());

        if (error is not null)
            return error.Contains("introuvable") ? NotFound(new { message = error })
                                                 : BadRequest(new { message = error });
        return Ok(data);
    }

    // ── GET /api/products/{id} ───────────────────────────────────────────────
    /// <summary>Full product detail including description, barcode, audit fields.</summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductDetailDto>> GetProduct(int id)
    {
        var (data, error) = await productService.GetProductAsync(id);

        if (error is not null) return NotFound(new { message = error });

        return Ok(data);
    }

    // ── GET /api/products ────────────────────────────────────────────────────
    /// <summary>
    /// Paginated product list with search and filters.
    /// Query params:
    ///   search        — name, code, barcode
    ///   category      — exact category string
    ///   active        — true (default) | false | omit for all
    ///   lowStockOnly  — true to show only low stock products
    ///   page / pageSize
    /// Examples:
    ///   GET /api/products
    ///   GET /api/products?search=café&category=Boissons
    ///   GET /api/products?lowStockOnly=true
    ///   GET /api/products?active=false   (archived products)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ProductPagedResult>> GetAllProducts(
        [FromQuery] string? search = null,
        [FromQuery] string? category = null,
        [FromQuery] bool? active = true,
        [FromQuery] bool lowStockOnly = false,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = new ProductQueryRequest(search, category, active, lowStockOnly, page, pageSize);
        var result = await productService.GetAllProductsAsync(query);

        return Ok(result);
    }

    // ── GET /api/products/low-stock ──────────────────────────────────────────
    /// <summary>
    /// All active products where stock ≤ minimum level.
    /// Used by the dashboard alert widget. Ordered worst-first.
    /// </summary>
    [HttpGet("low-stock")]
    public async Task<ActionResult<List<ProductDto>>> GetLowStockProducts()
    {
        var result = await productService.GetLowStockProductsAsync();
        return Ok(result);
    }

    // ── GET /api/products/categories ────────────────────────────────────────
    /// <summary>
    /// Distinct list of category strings for filter dropdowns.
    /// Only categories from active products.
    /// </summary>
    [HttpGet("categories")]
    public async Task<ActionResult<List<string>>> GetCategories()
    {
        var result = await productService.GetCategoriesAsync();
        return Ok(result);
    }

    // ── GET /api/products/search?term=... ────────────────────────────────────
    /// <summary>
    /// Lightweight product search for the invoice line-item picker.
    /// Returns max 20 results — only active products.
    /// </summary>
    [HttpGet("search")]
    public async Task<ActionResult<List<ProductPickerDto>>> SearchProducts(
        [FromQuery] string term = "")
    {
        if (string.IsNullOrWhiteSpace(term))
            return Ok(new List<ProductPickerDto>());

        var result = await productService.SearchProductsAsync(term);
        return Ok(result);
    }

    // ── GET /api/products/{id}/stock-history ─────────────────────────────────
    /// <summary>
    /// Full stock movement history for one product, newest first.
    /// Shows manual adjustments, invoice-driven changes, and opening stock.
    /// </summary>
    [HttpGet("{id:int}/stock-history")]
    public async Task<ActionResult<List<StockMovementDto>>> GetStockHistory(int id)
    {
        var (data, error) = await productService.GetStockHistoryAsync(id);

        if (error is not null) return NotFound(new { message = error });

        return Ok(data);
    }

    // ── PATCH /api/products/{id}/adjust-stock ────────────────────────────────
    /// <summary>
    /// Manual stock adjustment — enter the real physical count.
    /// Service computes delta and writes a StockMovement automatically.
    /// Admin only — employees cannot adjust stock manually.
    /// </summary>
    [HttpPatch("{id:int}/adjust-stock")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<ProductDto>> AdjustStock(
        int id, [FromBody] AdjustStockRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var (data, error) = await productService.AdjustStockAsync(id, request, GetUserId());

        if (error is not null)
            return error.Contains("introuvable") ? NotFound(new { message = error })
                                                 : BadRequest(new { message = error });
        return Ok(data);
    }

    // ── PATCH /api/products/{id}/archive ─────────────────────────────────────
    /// <summary>
    /// Soft-delete a product. Sets Active = false.
    /// Product stays linked to all existing invoices — history is never broken.
    /// Admin only.
    /// </summary>
    [HttpPatch("{id:int}/archive")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> ArchiveProduct(int id)
    {
        var (success, error) = await productService.ArchiveProductAsync(id, GetUserId());

        if (!success)
            return error!.Contains("introuvable") ? NotFound(new { message = error })
                                                  : BadRequest(new { message = error });
        return Ok(new { message = "Produit archivé avec succès." });
    }

    // ── PATCH /api/products/{id}/restore ─────────────────────────────────────
    /// <summary>Reactivate an archived product. Admin only.</summary>
    [HttpPatch("{id:int}/restore")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> RestoreProduct(int id)
    {
        var (success, error) = await productService.RestoreProductAsync(id, GetUserId());

        if (!success)
            return error!.Contains("introuvable") ? NotFound(new { message = error })
                                                  : BadRequest(new { message = error });
        return Ok(new { message = "Produit restauré avec succès." });
    }

    // ── PRIVATE ───────────────────────────────────────────────────────────────
    private int GetUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new InvalidOperationException("UserId claim missing."));
}