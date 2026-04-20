using factustock.Data;
using factustock.DTOs;
using factustock.Enums;
using factustock.Models;
using factustock.Services;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace factustock.Services;

public class ProductService : IProductService
{
    private readonly AppDbContext _context;
    private readonly IAuditService _audit;

    public ProductService(AppDbContext context, IAuditService audit)
    {
        _context = context;
        _audit = audit;
    }
    private const int CompanyId = 1;

    // ─────────────────────────────────────────────────────────────────────────
    // CREATE
    // ─────────────────────────────────────────────────────────────────────────
    public async Task<(ProductDetailDto? Data, string? Error)> CreateProductAsync(
        CreateProductRequest request, int userId)
    {
        // Code must be unique per company
        var codeExists = await _context.Products.AnyAsync(p =>
            p.CompanyId == CompanyId &&
            p.Code == request.Code.Trim().ToUpper());

        if (codeExists)
            return (null, $"Un produit avec le code '{request.Code}' existe déjà.");

        // Barcode uniqueness (if provided)
        if (!string.IsNullOrWhiteSpace(request.Barcode))
        {
            var barcodeExists = await _context.Products.AnyAsync(p =>
                p.CompanyId == CompanyId &&
                p.Barcode == request.Barcode.Trim());

            if (barcodeExists)
                return (null, $"Un produit avec ce code-barres existe déjà.");
        }

        var product = new Product
        {
            CompanyId = CompanyId,
            Code = request.Code.Trim().ToUpper(),
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            Category = request.Category?.Trim(),
            Price = request.Price,
            Unit = request.Unit?.Trim(),
            DefaultTaxRate = request.DefaultTaxRate,
            StockQuantity = request.StockQuantity,
            MinStockLevel = request.MinStockLevel,
            Barcode = request.Barcode?.Trim(),
            Active = true,
            CreatedAt = DateTime.UtcNow,
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        // If initial stock > 0, record an opening stock movement
        if (request.StockQuantity > 0)
        {
            _context.StockMovements.Add(new StockMovement
            {
                ProductId = product.Id,
                UserId = userId,
                InvoiceId = null,
                Type = StockMovementType.In,
                Quantity = request.StockQuantity,
                QuantityBefore = 0,
                QuantityAfter = request.StockQuantity,
                Reason = "Stock initial à la création du produit",
                CreatedAt = DateTime.UtcNow,
            });
            await _context.SaveChangesAsync();
        }

        await _audit.LogAsync(
            userId: userId,
            entityType: "Product",
            entityId: product.Id,
            action: "Created",
            newValue: JsonSerializer.Serialize(new { product.Code, product.Name, product.Price }),
            details: $"Produit '{product.Name}' (code: {product.Code}) créé."
        );

        return (MapToDetailDto(product), null);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // UPDATE
    // ─────────────────────────────────────────────────────────────────────────
    public async Task<(ProductDetailDto? Data, string? Error)> UpdateProductAsync(
        int productId, UpdateProductRequest request, int userId)
    {
        var product = await _context.Products.FindAsync(productId);
        if (product is null || product.CompanyId != CompanyId)
            return (null, "Produit introuvable.");

        // Barcode uniqueness — exclude self
        if (!string.IsNullOrWhiteSpace(request.Barcode))
        {
            var barcodeExists = await _context.Products.AnyAsync(p =>
                p.CompanyId == CompanyId &&
                p.Barcode == request.Barcode.Trim() &&
                p.Id != productId);

            if (barcodeExists)
                return (null, "Un autre produit avec ce code-barres existe déjà.");
        }

        var before = JsonSerializer.Serialize(new
        {
            product.Name,
            product.Price,
            product.DefaultTaxRate,
            product.MinStockLevel,
            product.Active
        });

        product.Name = request.Name.Trim();
        product.Description = request.Description?.Trim();
        product.Category = request.Category?.Trim();
        product.Price = request.Price;
        product.Unit = request.Unit?.Trim();
        product.DefaultTaxRate = request.DefaultTaxRate;
        product.MinStockLevel = request.MinStockLevel;
        product.Barcode = request.Barcode?.Trim();
        product.Active = request.Active;

        await _context.SaveChangesAsync();

        var after = JsonSerializer.Serialize(new
        {
            product.Name,
            product.Price,
            product.DefaultTaxRate,
            product.MinStockLevel,
            product.Active
        });

        await _audit.LogAsync(
            userId: userId,
            entityType: "Product",
            entityId: product.Id,
            action: "Updated",
            oldValue: before,
            newValue: after
        );

        return (MapToDetailDto(product), null);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET SINGLE
    // ─────────────────────────────────────────────────────────────────────────
    public async Task<(ProductDetailDto? Data, string? Error)> GetProductAsync(int productId)
    {
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == productId && p.CompanyId == CompanyId);

        if (product is null)
            return (null, "Produit introuvable.");

        return (MapToDetailDto(product), null);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET ALL  (paginated + search + filter)
    // ─────────────────────────────────────────────────────────────────────────
    public async Task<ProductPagedResult> GetAllProductsAsync(ProductQueryRequest query)
    {
        var q = _context.Products
            .Where(p => p.CompanyId == CompanyId)
            .AsQueryable();

        // Active filter — default true (only show active products)
        if (query.Active.HasValue)
            q = q.Where(p => p.Active == query.Active.Value);

        // Category filter
        if (!string.IsNullOrWhiteSpace(query.Category))
            q = q.Where(p => p.Category == query.Category);

        // Low stock only
        if (query.LowStockOnly)
            q = q.Where(p => p.StockQuantity <= p.MinStockLevel);

        // Search — name, code, barcode
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.Trim().ToLower();
            q = q.Where(p =>
                p.Name.ToLower().Contains(term) ||
                p.Code.ToLower().Contains(term) ||
                (p.Barcode != null && p.Barcode.Contains(term)) ||
                (p.Category != null && p.Category.ToLower().Contains(term))
            );
        }

        // Low stock count across ALL products (not just this page) for dashboard badge
        var lowStockCount = await _context.Products
            .CountAsync(p => p.CompanyId == CompanyId && p.Active && p.StockQuantity <= p.MinStockLevel);

        var totalCount = await q.CountAsync();

        var items = await q
            .OrderBy(p => p.Name)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(p => new ProductDto(
                p.Id,
                p.Code,
                p.Name,
                p.Category,
                p.Price,
                p.Unit,
                p.DefaultTaxRate,
                p.StockQuantity,
                p.MinStockLevel,
                p.Active,
                p.StockQuantity <= p.MinStockLevel
            ))
            .ToListAsync();

        var totalPages = (int)Math.Ceiling((double)totalCount / query.PageSize);

        return new ProductPagedResult(items, totalCount, query.Page, query.PageSize, totalPages, lowStockCount);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ARCHIVE / RESTORE
    // ─────────────────────────────────────────────────────────────────────────
    public async Task<(bool Success, string? Error)> ArchiveProductAsync(int productId, int userId)
    {
        var product = await _context.Products.FindAsync(productId);
        if (product is null || product.CompanyId != CompanyId)
            return (false, "Produit introuvable.");

        if (!product.Active)
            return (false, "Ce produit est déjà archivé.");

        product.Active = false;
        await _context.SaveChangesAsync();

        await _audit.LogAsync(
            userId: userId,
            entityType: "Product",
            entityId: product.Id,
            action: "Archived",
            details: $"Produit '{product.Name}' archivé."
        );

        return (true, null);
    }

    public async Task<(bool Success, string? Error)> RestoreProductAsync(int productId, int userId)
    {
        var product = await _context.Products.FindAsync(productId);
        if (product is null || product.CompanyId != CompanyId)
            return (false, "Produit introuvable.");

        if (product.Active)
            return (false, "Ce produit est déjà actif.");

        product.Active = true;
        await _context.SaveChangesAsync();

        await _audit.LogAsync(
            userId: userId,
            entityType: "Product",
            entityId: product.Id,
            action: "Restored",
            details: $"Produit '{product.Name}' restauré."
        );

        return (true, null);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADJUST STOCK  (manual physical count correction)
    // ─────────────────────────────────────────────────────────────────────────
    public async Task<(ProductDto? Data, string? Error)> AdjustStockAsync(
        int productId, AdjustStockRequest request, int userId)
    {
        var product = await _context.Products.FindAsync(productId);
        if (product is null || product.CompanyId != CompanyId)
            return (null, "Produit introuvable.");

        if (!product.Active)
            return (null, "Impossible d'ajuster le stock d'un produit archivé.");

        var before = product.StockQuantity;
        var delta = request.NewQuantity - before;

        // No-op guard
        if (delta == 0)
            return (null, "La nouvelle quantité est identique au stock actuel.");

        product.StockQuantity = request.NewQuantity;

        _context.StockMovements.Add(new StockMovement
        {
            ProductId = product.Id,
            UserId = userId,
            InvoiceId = null,
            Type = StockMovementType.Adjustment,
            Quantity = Math.Abs(delta),
            QuantityBefore = before,
            QuantityAfter = request.NewQuantity,
            Reason = request.Reason.Trim(),
            CreatedAt = DateTime.UtcNow,
        });

        await _context.SaveChangesAsync();

        await _audit.LogAsync(
            userId: userId,
            entityType: "Product",
            entityId: product.Id,
            action: "StockAdjusted",
            oldValue: before.ToString("F3"),
            newValue: request.NewQuantity.ToString("F3"),
            details: $"Ajustement stock: {before} → {request.NewQuantity}. Raison: {request.Reason}"
        );

        return (MapToDto(product), null);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET STOCK HISTORY
    // ─────────────────────────────────────────────────────────────────────────
    public async Task<(List<StockMovementDto>? Data, string? Error)> GetStockHistoryAsync(int productId)
    {
        var productExists = await _context.Products
            .AnyAsync(p => p.Id == productId && p.CompanyId == CompanyId);

        if (!productExists)
            return (null, "Produit introuvable.");

        var movements = await _context.StockMovements
            .Include(m => m.User)
            .Include(m => m.Invoice)
            .Where(m => m.ProductId == productId)
            .OrderByDescending(m => m.CreatedAt)
            .Select(m => new StockMovementDto(
                m.Id,
                m.Type,
                m.Quantity,
                m.QuantityBefore,
                m.QuantityAfter,
                m.Reason,
                $"{m.User.FirstName} {m.User.LastName}",
                m.Invoice != null ? m.Invoice.InvoiceNumber : null,
                m.CreatedAt
            ))
            .ToListAsync();

        return (movements, null);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET LOW STOCK PRODUCTS
    // ─────────────────────────────────────────────────────────────────────────
    public async Task<List<ProductDto>> GetLowStockProductsAsync()
    {
        return await _context.Products
            .Where(p =>
                p.CompanyId == CompanyId &&
                p.Active &&
                p.StockQuantity <= p.MinStockLevel)
            .OrderBy(p => p.StockQuantity)        // worst first
            .Select(p => new ProductDto(
                p.Id, p.Code, p.Name, p.Category,
                p.Price, p.Unit, p.DefaultTaxRate,
                p.StockQuantity, p.MinStockLevel,
                p.Active, true
            ))
            .ToListAsync();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET CATEGORIES
    // ─────────────────────────────────────────────────────────────────────────
    public async Task<List<string>> GetCategoriesAsync()
    {
        return await _context.Products
            .Where(p => p.CompanyId == CompanyId && p.Active && p.Category != null)
            .Select(p => p.Category!)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SEARCH PRODUCTS  (for invoice line-item picker)
    // ─────────────────────────────────────────────────────────────────────────
    public async Task<List<ProductPickerDto>> SearchProductsAsync(string term)
    {
        var search = term.Trim().ToLower();

        return await _context.Products
            .Where(p =>
                p.CompanyId == CompanyId &&
                p.Active &&
                (p.Name.ToLower().Contains(search) ||
                 p.Code.ToLower().Contains(search) ||
                 (p.Barcode != null && p.Barcode.Contains(search))))
            .OrderBy(p => p.Name)
            .Take(20)                              // cap results for the picker dropdown
            .Select(p => new ProductPickerDto(
                p.Id,
                p.Code,
                p.Name,
                p.Unit,
                p.Price,
                p.DefaultTaxRate,
                p.StockQuantity,
                p.StockQuantity <= p.MinStockLevel
            ))
            .ToListAsync();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE MAPPERS
    // ─────────────────────────────────────────────────────────────────────────
    private static ProductDto MapToDto(Product p) => new(
        p.Id, p.Code, p.Name, p.Category, p.Price, p.Unit,
        p.DefaultTaxRate, p.StockQuantity, p.MinStockLevel,
        p.Active, p.StockQuantity <= p.MinStockLevel
    );

    private static ProductDetailDto MapToDetailDto(Product p) => new(
        p.Id, p.Code, p.Name, p.Description, p.Category, p.Price,
        p.Unit, p.DefaultTaxRate, p.StockQuantity, p.MinStockLevel,
        p.Barcode, p.Active, p.StockQuantity <= p.MinStockLevel, p.CreatedAt
    );
}