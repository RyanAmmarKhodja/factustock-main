using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace factustock.Migrations
{
    /// <inheritdoc />
    public partial class ClientArchivedAt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ArchivedAt",
                table: "Clients",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsArchived",
                table: "Clients",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ArchivedAt",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "IsArchived",
                table: "Clients");
        }
    }
}
