using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace factustock.Migrations
{
    /// <inheritdoc />
    public partial class AddInvoicePdfPath : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "GeneratedPdfPath",
                table: "Invoices",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GeneratedPdfPath",
                table: "Invoices");
        }
    }
}
