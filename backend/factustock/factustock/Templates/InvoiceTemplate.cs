using factustock.DTOs;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace factustock.Templates;

/// <summary>
/// QuestPDF invoice template.
/// DataCell is a function returning the styled IContainer — callers chain content on the return value.
/// </summary>
public class InvoiceTemplate(InvoiceDocument data) : IDocument
{
    // ── Colours ───────────────────────────────────────────────────────────────
    private const string Primary   = "#2563EB";
    private const string White     = "#FFFFFF";
    private const string TextDark  = "#1E293B";
    private const string TextMuted = "#64748B";
    private const string BorderGray = "#E2E8F0";
    private const string RowAlt    = "#F8FAFC";
    private const string HeaderBg  = "#F1F5F9";

    public DocumentMetadata GetMetadata()
    {
        var meta = new DocumentMetadata();
        meta.Title  = $"Facture {data.InvoiceNumber}";
        meta.Author = data.Seller.LegalName;
        return meta;
    }

    public void Compose(IDocumentContainer container)
    {
        container.Page(page =>
        {
            page.Size(PageSizes.A4);
            page.Margin(40);
            page.DefaultTextStyle(x => x.FontSize(9).FontColor(TextDark));

            page.Header().Element(ComposeHeader);
            page.Content().Element(ComposeBody);
            page.Footer().Element(ComposeFooter);
        });
    }

    // ── HEADER ────────────────────────────────────────────────────────────────
    void ComposeHeader(IContainer container)
    {
        container.Column(col =>
        {
            col.Item().Row(row =>
            {
                // Seller block (left)
                row.RelativeItem().Column(seller =>
                {
                    seller.Item().Text(data.Seller.LegalName)
                        .FontSize(14).Bold().FontColor(TextDark);

                    if (!string.IsNullOrEmpty(data.Seller.Name) &&
                        data.Seller.Name != data.Seller.LegalName)
                        seller.Item().Text(data.Seller.Name)
                            .FontSize(9).FontColor(TextMuted);

                    if (data.Seller.Adresse is not null)
                        seller.Item().PaddingTop(4).Text(data.Seller.Adresse)
                            .FontSize(8).FontColor(TextMuted);

                    if (data.Seller.Tel is not null)
                        seller.Item().Text($"Tél : {data.Seller.Tel}")
                            .FontSize(8).FontColor(TextMuted);

                    if (data.Seller.Email is not null)
                        seller.Item().Text(data.Seller.Email)
                            .FontSize(8).FontColor(TextMuted);
                });

                row.ConstantItem(6);

                // Document title block (right)
                row.RelativeItem().AlignRight().Column(title =>
                {
                    title.Item()
                        .Background(Primary)
                        .Padding(12)
                        .AlignCenter()
                        .Text("FACTURE")
                        .FontSize(20).Bold().FontColor(White);

                    title.Item().PaddingTop(6).AlignRight()
                        .Text($"N° {data.InvoiceNumber}")
                        .FontSize(11).Bold().FontColor(TextDark);

                    title.Item().AlignRight()
                        .Text($"Date : {data.InvoiceDate:dd/MM/yyyy}")
                        .FontSize(9).FontColor(TextMuted);

                    if (data.DueDate.HasValue)
                        title.Item().AlignRight()
                            .Text($"Échéance : {data.DueDate.Value:dd/MM/yyyy}")
                            .FontSize(9).FontColor(TextMuted);

                    title.Item().PaddingTop(4).AlignRight()
                        .Text($"Règlement : {data.PaymentMethodLabel}")
                        .FontSize(9).FontColor(TextMuted);
                });
            });

            col.Item().PaddingVertical(12)
                .LineHorizontal(1).LineColor(BorderGray);

            // Seller legal IDs + Client block
            col.Item().Row(row =>
            {
                row.RelativeItem().Column(legal =>
                {
                    legal.Item().Text("Coordonnées du vendeur")
                        .FontSize(7).Italic().FontColor(TextMuted);

                    LegalRow(legal, "RC",  data.Seller.RC);
                    LegalRow(legal, "NIF", data.Seller.NIF);
                    LegalRow(legal, "NIS", data.Seller.NIS);
                    LegalRow(legal, "AI",  data.Seller.AI);
                });

                row.ConstantItem(20);

                row.RelativeItem()
                    .Border(1).BorderColor(BorderGray)
                    .Padding(10)
                    .Column(client =>
                    {
                        client.Item().Text("FACTURÉ À")
                            .FontSize(7).Bold().FontColor(Primary).Italic();

                        client.Item().PaddingTop(4)
                            .Text(data.Buyer.LegalName)
                            .FontSize(10).Bold();

                        var buyerFullName = $"{data.Buyer.FirstName} {data.Buyer.LastName}".Trim();
                        if (!string.IsNullOrWhiteSpace(buyerFullName))
                            client.Item().Text(buyerFullName)
                                .FontSize(9).FontColor(TextMuted);

                        if (data.Buyer.Adresse is not null)
                            client.Item().PaddingTop(3).Text(data.Buyer.Adresse)
                                .FontSize(8).FontColor(TextMuted);

                        if (data.Buyer.Tel is not null)
                            client.Item().Text($"Tél : {data.Buyer.Tel}")
                                .FontSize(8).FontColor(TextMuted);

                        if (data.Buyer.NIF is not null)
                            client.Item().Text($"NIF : {data.Buyer.NIF}")
                                .FontSize(8).FontColor(TextMuted);

                        if (data.Buyer.NIS is not null)
                            client.Item().Text($"NIS : {data.Buyer.NIS}")
                                .FontSize(8).FontColor(TextMuted);
                    });
            });

            col.Item().PaddingTop(16);
        });
    }

    // ── BODY ──────────────────────────────────────────────────────────────────
    void ComposeBody(IContainer container)
    {
        container.Column(col =>
        {
            col.Item().Element(ComposeTable);
            col.Item().PaddingTop(16);

            col.Item().Row(row =>
            {
                row.RelativeItem().Column(notes =>
                {
                    if (!string.IsNullOrWhiteSpace(data.Notes))
                    {
                        notes.Item().Text("Observations :")
                            .FontSize(8).Bold().FontColor(TextMuted);
                        notes.Item().PaddingTop(4)
                            .Text(data.Notes)
                            .FontSize(8).FontColor(TextMuted).Italic();
                    }
                });

                row.ConstantItem(20);
                row.ConstantItem(220).Element(ComposeTotals);
            });
        });
    }

    // ── LINE ITEMS TABLE ──────────────────────────────────────────────────────
    void ComposeTable(IContainer container)
    {
        container.Table(table =>
        {
            table.ColumnsDefinition(cols =>
            {
                cols.RelativeColumn(4);
                cols.RelativeColumn(1.2f);
                cols.RelativeColumn(1);
                cols.RelativeColumn(1.8f);
                cols.RelativeColumn(1);
                cols.RelativeColumn(1.8f);
                cols.RelativeColumn(1.8f);
            });

            // Header row
            table.Header(header =>
            {
                // Returns the styled container so the caller can set content on it
                IContainer HeaderCell(IContainer c) =>
                    c.Background(Primary).Padding(6).AlignCenter();

                header.Cell().Element(c => HeaderCell(c).Text("Désignation").FontColor(White).Bold().FontSize(8));
                header.Cell().Element(c => HeaderCell(c).Text("Qté").FontColor(White).Bold().FontSize(8));
                header.Cell().Element(c => HeaderCell(c).Text("Unité").FontColor(White).Bold().FontSize(8));
                header.Cell().Element(c => HeaderCell(c).Text("P.U. HT").FontColor(White).Bold().FontSize(8));
                header.Cell().Element(c => HeaderCell(c).Text("TVA %").FontColor(White).Bold().FontSize(8));
                header.Cell().Element(c => HeaderCell(c).Text("Total HT").FontColor(White).Bold().FontSize(8));
                header.Cell().Element(c => HeaderCell(c).Text("Total TTC").FontColor(White).Bold().FontSize(8));
            });

            // Data rows
            for (int i = 0; i < data.Lines.Count; i++)
            {
                var line = data.Lines[i];
                var bg = i % 2 == 0 ? White : RowAlt;

                // Returns the styled container — chain content on the return value
                IContainer DataCell(IContainer c) =>
                    c.Background(bg)
                     .BorderBottom(1).BorderColor(BorderGray)
                     .PaddingVertical(6).PaddingHorizontal(6);

                // Désignation — with reference sub-text
                table.Cell().Element(c => DataCell(c).Column(d =>
                {
                    d.Item().Text(line.Designation).Bold().FontSize(8);
                    if (!string.IsNullOrEmpty(line.Reference))
                        d.Item().Text($"Réf: {line.Reference}")
                            .FontSize(7).FontColor(TextMuted).Italic();
                }));

                table.Cell().Element(c => DataCell(c).AlignCenter()
                    .Text(line.Quantity.ToString("G29")).FontSize(8));

                table.Cell().Element(c => DataCell(c).AlignCenter()
                    .Text(line.Unit ?? "—").FontSize(8).FontColor(TextMuted));

                table.Cell().Element(c => DataCell(c).AlignRight()
                    .Text(FormatDA(line.PricePerUnit)).FontSize(8));

                table.Cell().Element(c => DataCell(c).AlignCenter()
                    .Text($"{line.TVARate:0.##}%").FontSize(8));

                table.Cell().Element(c => DataCell(c).AlignRight()
                    .Text(FormatDA(line.PriceHorsTaxe)).FontSize(8));

                table.Cell().Element(c => DataCell(c).AlignRight()
                    .Text(FormatDA(line.PriceTTC)).Bold().FontSize(8));
            }
        });
    }

    // ── TOTALS BLOCK ──────────────────────────────────────────────────────────
    void ComposeTotals(IContainer container)
    {
        container.Column(col =>
        {
            col.Item().Text("Récapitulatif TVA")
                .FontSize(7).Italic().FontColor(TextMuted);

            col.Item().PaddingTop(4).Table(tva =>
            {
                tva.ColumnsDefinition(c =>
                {
                    c.RelativeColumn();
                    c.RelativeColumn();
                    c.RelativeColumn();
                });

                tva.Header(h =>
                {
                    IContainer TVAHead(IContainer c) =>
                        c.Background(HeaderBg).Padding(4);

                    h.Cell().Element(c => TVAHead(c).Text("Taux").FontSize(7).Bold());
                    h.Cell().Element(c => TVAHead(c).Text("Base HT").FontSize(7).Bold());
                    h.Cell().Element(c => TVAHead(c).Text("TVA").FontSize(7).Bold());
                });

                foreach (var band in data.TVABreakdownLines)
                {
                    tva.Cell().Padding(4).Text($"{band.Rate:0.##}%").FontSize(7);
                    tva.Cell().Padding(4).AlignRight().Text(FormatDA(band.BaseHT)).FontSize(7);
                    tva.Cell().Padding(4).AlignRight().Text(FormatDA(band.TVAAmount)).FontSize(7);
                }
            });

            col.Item().PaddingTop(8).LineHorizontal(1).LineColor(BorderGray);

            TotalRow(col, "Total HT",  FormatDA(data.TotalHorsTaxe), bold: false);
            TotalRow(col, "Total TVA", FormatDA(data.TotalTVA),      bold: false);

            col.Item()
                .Background(Primary)
                .Padding(8)
                .Row(r =>
                {
                    r.RelativeItem()
                        .Text("TOTAL TTC")
                        .FontColor(White).Bold().FontSize(10);
                    r.RelativeItem().AlignRight()
                        .Text(FormatDA(data.TTC))
                        .FontColor(White).Bold().FontSize(10);
                });
        });
    }

    // ── FOOTER ────────────────────────────────────────────────────────────────
    void ComposeFooter(IContainer container)
    {
        container.Column(col =>
        {
            col.Item().LineHorizontal(1).LineColor(BorderGray);
            col.Item().PaddingTop(6).Row(row =>
            {
                row.RelativeItem()
                    .Text(data.GeneratedLabel)
                    .FontSize(7).FontColor(TextMuted).Italic();

                row.RelativeItem().AlignRight().Text(x =>
                {
                    x.Span("Page ").FontSize(7).FontColor(TextMuted);
                    x.CurrentPageNumber().FontSize(7).FontColor(TextMuted);
                    x.Span(" / ").FontSize(7).FontColor(TextMuted);
                    x.TotalPages().FontSize(7).FontColor(TextMuted);
                });
            });

            col.Item().PaddingTop(4)
                .Text("Tout litige relatif à cette facture est soumis aux juridictions compétentes du lieu du siège social du vendeur.")
                .FontSize(6).FontColor(TextMuted).Italic();
        });
    }

    // ── HELPERS ───────────────────────────────────────────────────────────────

    static void TotalRow(ColumnDescriptor col, string label, string value, bool bold)
    {
        col.Item().PaddingVertical(3).Row(r =>
        {
            if (bold)
            {
                r.RelativeItem().Text(label).FontSize(8).Bold().FontColor(TextMuted);
                r.RelativeItem().AlignRight().Text(value).FontSize(8).Bold();
            }
            else
            {
                r.RelativeItem().Text(label).FontSize(8).FontColor(TextMuted);
                r.RelativeItem().AlignRight().Text(value).FontSize(8);
            }
        });
    }

    static void LegalRow(ColumnDescriptor col, string label, string? value)
    {
        if (string.IsNullOrEmpty(value)) return;
        col.Item().Text($"{label} : {value}").FontSize(7).FontColor(TextMuted);
    }

    static string FormatDA(decimal amount) =>
        amount.ToString("N2", new System.Globalization.CultureInfo("fr-DZ")) + " DA";
}
