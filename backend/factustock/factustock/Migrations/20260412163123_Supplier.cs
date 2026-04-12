using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace factustock.Migrations
{
    /// <inheritdoc />
    public partial class Supplier : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "N_Facture",
                table: "Company");

            migrationBuilder.DropColumn(
                name: "N_Facture",
                table: "Clients");

            migrationBuilder.AddColumn<int>(
                name: "SupplierId",
                table: "Invoices",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Suppliers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CompanyId = table.Column<int>(type: "integer", nullable: false),
                    LegalName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    LastName = table.Column<string>(type: "text", nullable: true),
                    FirstName = table.Column<string>(type: "text", nullable: true),
                    Email = table.Column<string>(type: "text", nullable: true),
                    Tel = table.Column<string>(type: "text", nullable: true),
                    Adresse = table.Column<string>(type: "text", nullable: true),
                    RC = table.Column<string>(type: "text", nullable: true),
                    AI = table.Column<string>(type: "text", nullable: true),
                    NIF = table.Column<string>(type: "text", nullable: true),
                    NIS = table.Column<string>(type: "text", nullable: true),
                    N_BL = table.Column<string>(type: "text", nullable: true),
                    N_BP = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsArchived = table.Column<bool>(type: "boolean", nullable: false),
                    ArchivedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Suppliers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Suppliers_Company_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Company",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_SupplierId",
                table: "Invoices",
                column: "SupplierId");

            migrationBuilder.CreateIndex(
                name: "IX_Suppliers_CompanyId",
                table: "Suppliers",
                column: "CompanyId");

            migrationBuilder.AddForeignKey(
                name: "FK_Invoices_Suppliers_SupplierId",
                table: "Invoices",
                column: "SupplierId",
                principalTable: "Suppliers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Invoices_Suppliers_SupplierId",
                table: "Invoices");

            migrationBuilder.DropTable(
                name: "Suppliers");

            migrationBuilder.DropIndex(
                name: "IX_Invoices_SupplierId",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "SupplierId",
                table: "Invoices");

            migrationBuilder.AddColumn<string>(
                name: "N_Facture",
                table: "Company",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "N_Facture",
                table: "Clients",
                type: "text",
                nullable: true);
        }
    }
}
