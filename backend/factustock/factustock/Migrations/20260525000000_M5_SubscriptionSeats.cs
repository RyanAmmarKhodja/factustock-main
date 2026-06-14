using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace factustock.Migrations
{
    /// <inheritdoc />
    public partial class M5_SubscriptionSeats : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ActiveAdmins",
                table: "Subscriptions",
                type: "integer",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<int>(
                name: "ActiveUsers",
                table: "Subscriptions",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ActiveAdmins",
                table: "Subscriptions");

            migrationBuilder.DropColumn(
                name: "ActiveUsers",
                table: "Subscriptions");
        }
    }
}
