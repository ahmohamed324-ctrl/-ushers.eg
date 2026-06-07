using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UshersEg.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUsherProfileExtendedFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Age",
                table: "UsherProfiles",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CasualPhotoUrl",
                table: "UsherProfiles",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FormalPhotoUrl",
                table: "UsherProfiles",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "School",
                table: "UsherProfiles",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "University",
                table: "UsherProfiles",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Age",
                table: "UsherProfiles");

            migrationBuilder.DropColumn(
                name: "CasualPhotoUrl",
                table: "UsherProfiles");

            migrationBuilder.DropColumn(
                name: "FormalPhotoUrl",
                table: "UsherProfiles");

            migrationBuilder.DropColumn(
                name: "School",
                table: "UsherProfiles");

            migrationBuilder.DropColumn(
                name: "University",
                table: "UsherProfiles");
        }
    }
}
