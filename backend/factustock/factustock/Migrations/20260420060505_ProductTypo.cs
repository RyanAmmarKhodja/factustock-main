using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace factustock.Migrations
{
    /// <inheritdoc />
    public partial class ProductTypo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InvoiceItems_Produits_ProductId",
                table: "InvoiceItems");

            migrationBuilder.DropForeignKey(
                name: "FK_Produits_Company_CompanyId",
                table: "Produits");

            migrationBuilder.DropForeignKey(
                name: "FK_StockMovements_Produits_ProductId",
                table: "StockMovements");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Produits",
                table: "Produits");

            migrationBuilder.RenameTable(
                name: "Produits",
                newName: "Products");

            migrationBuilder.RenameIndex(
                name: "IX_Produits_CompanyId_Code",
                table: "Products",
                newName: "IX_Products_CompanyId_Code");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Products",
                table: "Products",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_InvoiceItems_Products_ProductId",
                table: "InvoiceItems",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Products_Company_CompanyId",
                table: "Products",
                column: "CompanyId",
                principalTable: "Company",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_StockMovements_Products_ProductId",
                table: "StockMovements",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InvoiceItems_Products_ProductId",
                table: "InvoiceItems");

            migrationBuilder.DropForeignKey(
                name: "FK_Products_Company_CompanyId",
                table: "Products");

            migrationBuilder.DropForeignKey(
                name: "FK_StockMovements_Products_ProductId",
                table: "StockMovements");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Products",
                table: "Products");

            migrationBuilder.RenameTable(
                name: "Products",
                newName: "Produits");

            migrationBuilder.RenameIndex(
                name: "IX_Products_CompanyId_Code",
                table: "Produits",
                newName: "IX_Produits_CompanyId_Code");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Produits",
                table: "Produits",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_InvoiceItems_Produits_ProductId",
                table: "InvoiceItems",
                column: "ProductId",
                principalTable: "Produits",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Produits_Company_CompanyId",
                table: "Produits",
                column: "CompanyId",
                principalTable: "Company",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_StockMovements_Produits_ProductId",
                table: "StockMovements",
                column: "ProductId",
                principalTable: "Produits",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
