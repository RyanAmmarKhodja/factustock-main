using factustock.Data;
using factustock.Models;
using factustock.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// ── DATABASE ─────────────────────────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// ── JWT AUTHENTICATION ────────────────────────────────────────────────────────
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("Jwt:Key is not configured in appsettings.");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "FactuStock";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtIssuer,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew = TimeSpan.Zero   // no grace period — token expiry is exact
    };

    // Return clean 401 JSON instead of redirect (important for React SPA)
    options.Events = new JwtBearerEvents
    {
        OnChallenge = async context =>
        {
            context.HandleResponse();
            context.Response.StatusCode = 401;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync("{\"message\":\"Unauthorized. Please log in.\"}");
        },
        OnForbidden = async context =>
        {
            context.Response.StatusCode = 403;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync("{\"message\":\"You do not have permission to perform this action.\"}");
        }
    };
});

builder.Services.AddAuthorization();

// ── SERVICES (Dependency Injection) ──────────────────────────────────────────
builder.Services.AddScoped<IAuditService, AuditService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ISystemSettingsService, SystemSettingsService>();
builder.Services.AddScoped<IClientService, ClientService>();
builder.Services.AddScoped<ISupplierService, SupplierService>();
builder.Services.AddScoped<IProductService, ProductService>();
// Future modules: add their services here
// builder.Services.AddScoped<IInvoiceService, InvoiceService>();

// ── CORS ──────────────────────────────────────────────────────────────────────
// Local installation: React dev server on 5173, production on same host
builder.Services.AddCors(options =>
{
    options.AddPolicy("LocalApp", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:3000",    // CRA dev server (fallback)
                "http://127.0.0.1:5173",
                "http://127.0.0.1:3000"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// ── CONTROLLERS & SWAGGER ─────────────────────────────────────────────────────
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
}); ;
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "FactuStock API",
        Version = "v1",
        Description = "Invoicing and stock management for Algerian businesses"
    });

    // Allow pasting JWT token in Swagger UI for testing
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Enter: Bearer {your_token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id   = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ─────────────────────────────────────────────────────────────────────────────
var app = builder.Build();

// ── MIDDLEWARE PIPELINE ───────────────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "FactuStock API v1");
        c.RoutePrefix = "swagger";   // access at /swagger
    });
}

app.UseCors("LocalApp");

app.UseAuthentication();   // ORDER MATTERS: Authentication before Authorization
app.UseAuthorization();

app.MapControllers();

// ── AUTO MIGRATE ON STARTUP ───────────────────────────────────────────────────
// Applies pending migrations automatically when the app starts.
// Safe for local installation — no manual dotnet ef commands needed after deploy.
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    dbContext.Database.Migrate();

    if (!dbContext.SystemSettings.Any())
    {
        dbContext.SystemSettings.Add(new SystemSettings
        {
            SetupCompleted = false,
            Version = "1.0.0"
        });

        dbContext.SaveChanges();
    }
}

app.Run();
