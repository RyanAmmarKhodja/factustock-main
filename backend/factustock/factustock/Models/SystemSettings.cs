namespace factustock.Models
{
    public class SystemSettings
    {
        public int Id { get; set; }

        public bool SetupCompleted { get; set; } = false;

        public string? LicenseKey { get; set; }

        public string? Version { get; set; } = "1.0.0";

        public DateTime InstalledAt { get; set; } = DateTime.UtcNow;
    }
}
