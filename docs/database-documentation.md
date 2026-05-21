# Database Documentation

> ASP.NET Core Web API — Entity Framework Core — PostgreSQL

## Overview

The database consists of **15 tables** organized around a multi-tenant architecture where `Company` is the root tenant entity. Every business entity (Clients, Suppliers, Products, Invoices) is scoped to a Company. The schema enforces data integrity through foreign keys, unique constraints, and cascade rules designed to prevent accidental data loss (especially for invoiced records).

---

## Entity Relationship Diagram

![UML Diagram](../preview/uml.png)

A PlantUML source file is available at `docs/database-uml.puml`.  
Rendered diagram: `docs/database-uml.png`.

---

## Entity Catalog

### 1. Company (Tenant)

The root entity. Each installation/company is a tenant that owns all related data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | `int` | PK, auto-increment | Primary key |
| SubscriptionId | `int?` | FK → Subscription, unique | Current subscription |
| Name | `string` | Required, max 200 | Company display name |
| LegalName | `string?` | max 200 | Registered legal name |
| Email | `string?` | | Contact email |
| Tel | `string?` | | Phone number |
| Adresse | `string?` | | Physical address |
| RC | `string?` | max 50 | Registre de Commerce |
| AI | `string?` | max 50 | Article d'Imposition |
| NIF | `string?` | max 20 | Numero d'Identification Fiscale |
| NIS | `string?` | max 20 | Numero d'Identification Statistique |
| N_BL | `string?` | | Numero de Bulletin de Livraison |
| N_BP | `string?` | | |
| LogoUrl | `string?` | | Branding logo path |
| Website | `string?` | | Company website |

**Relationships:** 1:1 with Subscription, 1:M with Users, Clients, Suppliers, Products, Invoices

---

### 2. Plan

Subscription tier definitions (Starter, Business, Pro).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | `int` | PK, auto-increment | Primary key |
| Name | `string` | Required, max 50 | Plan name |
| MaxAdminAccounts | `int` | | Max admin users allowed |
| MaxUserAccounts | `int` | | Max regular users allowed |
| MaxTotalAccounts | `int` | | Total user limit |
| Price | `decimal` | Precision(18,2) | Monthly/yearly price (DZD) |
| SetupFee | `decimal` | Precision(18,2) | One-time setup fee (DZD) |
| IsActive | `bool` | Default true | Whether plan is available |

**Seed data:**

| Id | Name | MaxAdmin | MaxUser | MaxTotal | Price | SetupFee |
|----|------|----------|---------|----------|-------|---------|
| 1 | Starter | 1 | 2 | 3 | 5 000 DA | 30 000 DA |
| 2 | Business | 1 | 5 | 6 | 8 000 DA | 30 000 DA |
| 3 | Pro | 2 | 10 | 12 | 12 000 DA | 50 000 DA |

**Relationships:** 1:M with Subscription

---

### 3. Subscription

Links a Company to a Plan with billing and status tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | `int` | PK, auto-increment | Primary key |
| CompanyId | `int` | FK → Company, unique index | Owning company |
| PlanId | `int` | FK → Plan | Selected plan |
| StartDate | `DateTime` | | Subscription start |
| RenewalDate | `DateTime` | | Next renewal date |
| PaidUntil | `DateTime` | | Paid-through date |
| Status | `SubscriptionStatus` | string, max 20 | Active/Suspended/Cancelled/Trial |
| BillingCycle | `BillingCycle` | string, max 20 | Monthly/Yearly |

**Relationships:** 1:1 with Company, M:1 with Plan

---

### 4. Role

Flexible roles with JSON-based permission definitions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | `int` | PK, auto-increment | Primary key |
| Name | `string` | Required, max 50, unique | Role name |
| Description | `string?` | | Human-readable description |
| Permissions | `string?` | JSON | Flexible permission definitions |

**Seed data:**

| Id | Name | Description |
|----|------|-------------|
| 1 | superadmin | Full system access |
| 2 | admin | Company admin access |
| 3 | employee | Standard user access |

**Relationships:** 1:M with User

---

### 5. User

Authenticated users scoped to a company with a role.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | `int` | PK, auto-increment | Primary key |
| CompanyId | `int` | FK → Company | Owning company |
| RoleId | `int` | FK → Role | Assigned role |
| Email | `string` | Required, max 200, unique | Login email |
| PasswordHash | `string` | Required | BCrypt/etc hash |
| FirstName | `string` | Required, max 100 | |
| LastName | `string` | Required, max 100 | |
| Phone | `string?` | | Contact number |
| Active | `bool` | Default true | Account enabled |
| CreatedAt | `DateTime` | Default UtcNow | Account creation |
| LastLoginAt | `DateTime?` | | Last successful login |

**Relationships:** M:1 with Company, M:1 with Role, 1:M with AuditLog, StockMovement, Notification

---

### 6. Client

Customers (individuals or companies) linked to invoices.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | `int` | PK, auto-increment | Primary key |
| CompanyId | `int` | FK → Company | Owning company |
| Type | `ClientType` | string, max 20 | Individual or Company |
| LegalName | `string` | Required, max 200 | Business name |
| LastName | `string?` | | Surname (individual) |
| FirstName | `string?` | | Given name (individual) |
| Email | `string?` | | Contact email |
| Tel | `string?` | | Phone number |
| Adresse | `string?` | | Address |
| RC | `string?` | | Registre de Commerce |
| AI | `string?` | | Article d'Imposition |
| NIF | `string?` | | Numero d'Identification Fiscale |
| NIS | `string?` | | Numero d'Identification Statistique |
| N_BL | `string?` | | |
| N_BP | `string?` | | |
| CreatedAt | `DateTime` | Default UtcNow | Record creation |
| IsArchived | `bool` | Default false | Soft-delete flag |
| ArchivedAt | `DateTime?` | | When archived |

**Relationships:** M:1 with Company, 1:M with Invoice

---

### 7. Supplier

Vendors/ suppliers that provide goods or services.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | `int` | PK, auto-increment | Primary key |
| CompanyId | `int` | FK → Company | Owning company |
| LegalName | `string` | Required, max 200 | Business name |
| LastName | `string?` | | Surname (individual) |
| FirstName | `string?` | | Given name (individual) |
| Email | `string?` | | Contact email |
| Tel | `string?` | | Phone number |
| Adresse | `string?` | | Address |
| RC | `string?` | | Registre de Commerce |
| AI | `string?` | | Article d'Imposition |
| NIF | `string?` | | Numero d'Identification Fiscale |
| NIS | `string?` | | Numero d'Identification Statistique |
| N_BL | `string?` | | |
| N_BP | `string?` | | |
| CreatedAt | `DateTime` | Default UtcNow | Record creation |
| IsArchived | `bool` | Default false | Soft-delete flag |
| ArchivedAt | `DateTime?` | | When archived |

**Relationships:** M:1 with Company, 1:M with Invoice

---

### 8. Product

Catalog items with pricing, tax, and stock tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | `int` | PK, auto-increment | Primary key |
| CompanyId | `int` | FK → Company | Owning company |
| Code | `string` | Required, max 50 | SKU / product code |
| Name | `string` | Required, max 200 | Product name |
| Description | `string?` | | Detailed description |
| Category | `string?` | | Product category |
| Price | `decimal` | Precision(18,2) | Unit selling price |
| Unit | `string?` | | Unit of measure (kg, pcs, L) |
| DefaultTaxRate | `decimal` | Precision(5,2), default 19 | Default VAT rate (%) |
| StockQuantity | `decimal` | Precision(18,3), default 0 | Current stock level |
| MinStockLevel | `decimal` | Precision(18,3), default 0 | Low-stock threshold |
| Barcode | `string?` | | Barcode / EAN |
| Active | `bool` | Default true | Product enabled |
| CreatedAt | `DateTime` | Default UtcNow | Record creation |

**Unique constraint:** Composite unique index on `(CompanyId, Code)` — each product code is unique per company.

**Relationships:** M:1 with Company, 1:M with InvoiceItem, StockMovement

---

### 9. Invoice

Legal document with snapshot totals. Once issued, totals are frozen.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | `int` | PK, auto-increment | Primary key |
| ClientId | `int` | FK → Client | Customer |
| SupplierId | `int?` | FK → Supplier | Optional supplier |
| CompanyId | `int` | FK → Company | Owning company |
| CreatedByUserId | `int` | FK → User | Who created it |
| InvoiceNumber | `string` | Required, max 50 | Human-readable number |
| InvoiceDate | `DateTime` | | Date of issue |
| DueDate | `DateTime` | | Payment due date |
| Status | `InvoiceStatus` | string, max 20 | Draft/Sent/Paid/Overdue/Cancelled |
| PaymentMethod | `PaymentMethod?` | string, max 30 | Cash/BankTransfer/Cheque/CIB/Edahabia |
| TotalHorsTaxe | `decimal` | Precision(18,2) | Subtotal (HT) — snapshot |
| TTC | `decimal` | Precision(18,2) | Total incl. tax (TTC) — snapshot |
| Notes | `string?` | | Additional notes |
| GeneratedPdfPath | `string?` | | Path to generated PDF |
| CreatedAt | `DateTime` | Default UtcNow | Record creation |

**Unique constraint:** Composite unique index on `(CompanyId, InvoiceNumber)`.

**Design note:** `TotalHorsTaxe` and `TTC` are stored as **snapshots** and never recomputed from line items after the invoice is issued. This is a legal requirement for accounting documents.

**Relationships:** M:1 with Client, Company, User; 1:M with InvoiceItem (Cascade), Payment (Restrict), Notification (SetNull), StockMovement (Restrict)

---

### 10. InvoiceItem

Line items on an invoice. Prices are snapshots at sale time.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | `int` | PK, auto-increment | Primary key |
| InvoiceId | `int` | FK → Invoice (Cascade) | Parent invoice |
| ProductId | `int` | FK → Product (Restrict) | Reference product |
| Reference | `string` | Required | Product code/reference at sale time |
| Designation | `string` | Required | Product description at sale time |
| Quantity | `decimal` | Precision(18,3) | Quantity |
| Unit | `string?` | | Unit of measure |
| PricePerUnit | `decimal` | Precision(18,2) | Price per unit — snapshot |
| TVA | `decimal` | Precision(5,2) | VAT rate applied — snapshot |
| PriceHorsTaxe | `decimal` | Precision(18,2) | Line subtotal (HT) — snapshot |
| PriceTTC | `decimal` | Precision(18,2) | Line total incl. tax — snapshot |

**Design note:** All price fields are **snapshots** captured at the time of sale. If product prices change later, existing invoice line items are unaffected.

**Relationships:** M:1 with Invoice, M:1 with Product

---

### 11. Payment

Payments recorded against invoices. Partial payments are supported.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | `int` | PK, auto-increment | Primary key |
| InvoiceId | `int` | FK → Invoice (Restrict) | Target invoice |
| RecordedByUserId | `int` | FK → User (Restrict) | Who recorded the payment |
| Amount | `decimal` | Precision(18,2) | Payment amount |
| PaymentDate | `DateTime` | | When payment was received |
| Method | `PaymentMethod` | string, max 30 | Cash/BankTransfer/Cheque/CIB/Edahabia |
| Reference | `string?` | | External reference (check no, transaction id) |
| Notes | `string?` | | Additional notes |
| CreatedAt | `DateTime` | Default UtcNow | Record creation |

**Relationships:** M:1 with Invoice, M:1 with User

---

### 12. StockMovement

Audit trail for every stock change (in, out, adjustment).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | `int` | PK, auto-increment | Primary key |
| ProductId | `int` | FK → Product (Restrict) | Affected product |
| UserId | `int` | FK → User (Restrict) | Who performed the movement |
| InvoiceId | `int?` | FK → Invoice (Restrict) | Related invoice (if applicable) |
| Type | `StockMovementType` | string, max 20 | In/Out/Adjustment |
| Quantity | `decimal` | Precision(18,3) | Quantity moved |
| QuantityBefore | `decimal` | Precision(18,3) | Stock level before movement |
| QuantityAfter | `decimal` | Precision(18,3) | Stock level after movement |
| Reason | `string?` | | Reason for adjustment |
| CreatedAt | `DateTime` | Default UtcNow | Record creation |

**Design note:** Stock quantity on the Product record is never silently updated. Every change is recorded as a StockMovement, providing a complete audit trail.

**Relationships:** M:1 with Product, User, Invoice

---

### 13. AuditLog

Immutable log of all critical entity changes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | `int` | PK, auto-increment | Primary key |
| UserId | `int` | FK → User (Restrict) | Who performed the action |
| EntityType | `string` | Required, max 100 | Entity name (e.g. "Invoice", "Client") |
| EntityId | `int` | | Entity primary key |
| Action | `string` | Required, max 50 | Action (Create/Update/Delete) |
| OldValue | `string?` | JSON | State before change |
| NewValue | `string?` | JSON | State after change |
| Details | `string?` | | Additional context |
| IpAddress | `string?` | max 45 | Client IP (supports IPv6) |
| CreatedAt | `DateTime` | Default UtcNow | Timestamp |

**Design note:** AuditLog records are immutable — no cascade delete, no updates. They persist permanently.

**Relationships:** M:1 with User

---

### 14. Notification

In-app alerts for users (overdue invoices, low stock, etc.).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | `int` | PK, auto-increment | Primary key |
| UserId | `int` | FK → User (Cascade) | Recipient |
| InvoiceId | `int?` | FK → Invoice (SetNull) | Related invoice |
| Type | `NotificationType` | string, max 50 | InvoiceOverdue/InvoiceDueSoon/LowStock/PaymentReceived/System |
| Message | `string` | Required, max 500 | Notification text |
| IsRead | `bool` | Default false | Read status |
| CreatedAt | `DateTime` | Default UtcNow | Creation timestamp |

**Relationships:** M:1 with User, M:1 with Invoice

---

### 15. SystemSettings

Singleton configuration for the application instance.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | `int` | PK, auto-increment | Primary key |
| SetupCompleted | `bool` | Default false | Initial setup flag |
| LicenseKey | `string?` | | Software license key |
| Version | `string?` | Default "1.0.0" | Current version |
| InstalledAt | `DateTime` | Default UtcNow | Installation timestamp |

No relationships.

---

## Relationship Matrix

| Parent | Child | Type | FK Column | Delete Behavior |
|--------|-------|------|-----------|----------------|
| Plan | Subscription | 1:M | PlanId | Restrict |
| Company | Subscription | 1:1 | Subscription.CompanyId (unique) | — |
| Company | User | 1:M | CompanyId | Restrict |
| Company | Client | 1:M | CompanyId | Restrict |
| Company | Supplier | 1:M | CompanyId | Restrict |
| Company | Product | 1:M | CompanyId | Restrict |
| Company | Invoice | 1:M | CompanyId | Restrict |
| Role | User | 1:M | RoleId | Restrict |
| Client | Invoice | 1:M | ClientId | Restrict |
| Supplier | Invoice | 1:M | SupplierId | None (nullable) |
| User | Invoice | 1:M | CreatedByUserId | — |
| User | Payment | 1:M | RecordedByUserId | — |
| User | AuditLog | 1:M | UserId | Restrict |
| User | StockMovement | 1:M | UserId | Restrict |
| User | Notification | 1:M | UserId | **Cascade** |
| Invoice | InvoiceItem | 1:M | InvoiceId | **Cascade** |
| Invoice | Payment | 1:M | InvoiceId | Restrict |
| Invoice | Notification | 1:M | InvoiceId | **SetNull** |
| Invoice | StockMovement | 1:M | InvoiceId | Restrict |
| Product | InvoiceItem | 1:M | ProductId | Restrict |
| Product | StockMovement | 1:M | ProductId | Restrict |

---

## Enum Types

All enums are stored as **strings** in the database for readability.

| Enum | Values | Used By |
|------|--------|---------|
| `InvoiceStatus` | Draft, Sent, Paid, Overdue, Cancelled | Invoice |
| `PaymentMethod` | Cash, BankTransfer, Cheque, CIB, Edahabia | Invoice, Payment |
| `ClientType` | Individual, Company | Client |
| `StockMovementType` | In, Out, Adjustment | StockMovement |
| `NotificationType` | InvoiceOverdue, InvoiceDueSoon, LowStock, PaymentReceived, System | Notification |
| `SubscriptionStatus` | Active, Suspended, Cancelled, Trial | Subscription |
| `BillingCycle` | Monthly, Yearly | Subscription |

---

## Key Design Decisions

1. **Snapshot pricing**: Invoice and InvoiceItem amounts are frozen at issuance — never recomputed from current product prices.
2. **Stock audit trail**: Every stock change produces a StockMovement record. Product.StockQuantity is never silently updated.
3. **Immutable audit logs**: AuditLog records are never deleted or updated once created.
4. **Product protection**: Products referenced by any InvoiceItem cannot be deleted (Restrict FK), preserving invoice data integrity.
5. **Soft-delete for clients & suppliers**: Both entities use `IsArchived`/`ArchivedAt` rather than hard deletion.
6. **Cascade on Invoice → InvoiceItem**: Deleting an invoice removes its line items.
7. **Cascade on User → Notification**: Deleting a user removes their notifications.
8. **SetNull on Invoice → Notification**: Deleting an invoice preserves notifications but nulls the invoice reference.
9. **JSON permissions**: Role.Permissions stores flexible JSON for permission definitions without code changes.
10. **Unique product codes**: Composite unique index `(CompanyId, Code)` ensures product codes are unique per tenant.

---

## Conventions

- **Primary keys**: Always `Id` (`int`, auto-increment)
- **Foreign keys**: `RelatedEntityId` naming convention
- **Timestamps**: `CreatedAt` on most tables, defaults to `UtcNow`
- **Soft-delete**: `IsArchived` + `ArchivedAt` pattern
- **Enums**: Stored as human-readable strings, not integers
- **Decimal precision**: `Precision(18,2)` for monetary values, `Precision(18,3)` for quantities, `Precision(5,2)` for tax rates
