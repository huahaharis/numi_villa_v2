"use client";

import React, { useState, RefObject } from "react";
import { FileText, Download, Send, Loader2 } from "lucide-react";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  AlignmentType,
  WidthType,
  BorderStyle,
  convertInchesToTwip,
} from "docx";
import { formatCurrency } from "@/lib/utils/formatters";
import type { InvoiceData } from "@/data/invoiceData";

interface InvoiceExportButtonsProps {
  invoiceId: string;
  invoiceData: InvoiceData;
  invoiceRef: RefObject<HTMLDivElement | null>;
  guestEmail?: string;
  onSendEmail?: () => Promise<void>;
}

const COLORS = {
  foreground: "#1f2937",
  muted: "#6b7280",
  accent: "#111827",
  border: "#e5e7eb",
  white: "#ffffff",
};

const formatAmount = (amount: number, currency: string) =>
  formatCurrency(amount, currency);

function createLabelValueParagraph(label: string, value: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({ text: `${label}: `, color: COLORS.muted, size: 20 }),
      new TextRun({ text: value, color: COLORS.foreground, size: 20, bold: true }),
    ],
    alignment: AlignmentType.RIGHT,
    spacing: { after: 40 },
  });
}

export function InvoiceExportButtons({
  invoiceId,
  invoiceData,
  invoiceRef,
  guestEmail,
  onSendEmail,
}: InvoiceExportButtonsProps) {
  const [sending, setSending] = useState(false);
  const [downloading, setDownloading] = useState<"pdf" | "word" | null>(null);

  const handleDownloadWord = async () => {
    setDownloading("word");
    try {
      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: convertInchesToTwip(0.75),
                  right: convertInchesToTwip(0.75),
                  bottom: convertInchesToTwip(0.75),
                  left: convertInchesToTwip(0.75),
                },
              },
            },
            children: [
              // Header row: brand (left) + invoice info (right)
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                  bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                  left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                  right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                  insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                  insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        width: { size: 50, type: WidthType.PERCENTAGE },
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: "NUMI VILLA",
                                bold: true,
                                size: 36,
                                color: COLORS.foreground,
                                font: "Georgia",
                              }),
                            ],
                          }),
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: "Luxury Residences & Estates",
                                size: 18,
                                color: COLORS.muted,
                              }),
                            ],
                            spacing: { after: 120 },
                          }),
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: "Jalan Ibrahim No 88, Bali, Indonesia",
                                size: 18,
                                color: COLORS.muted,
                              }),
                            ],
                          }),
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: "+62 361 123 4567",
                                size: 18,
                                color: COLORS.muted,
                              }),
                            ],
                          }),
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: "reservations@numivilla.com",
                                size: 18,
                                color: COLORS.muted,
                              }),
                            ],
                          }),
                        ],
                      }),
                      new TableCell({
                        width: { size: 50, type: WidthType.PERCENTAGE },
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            children: [
                              new TextRun({
                                text: "INVOICE",
                                bold: true,
                                size: 52,
                                color: COLORS.foreground,
                                font: "Georgia",
                              }),
                            ],
                            spacing: { after: 120 },
                          }),
                          createLabelValueParagraph("Invoice #", invoiceData.invoiceNumber),
                          createLabelValueParagraph("Date", invoiceData.date),
                          createLabelValueParagraph("Due", invoiceData.dueDate),
                        ],
                      }),
                    ],
                  }),
                ],
              }),

              new Paragraph({
                border: {
                  bottom: {
                    color: COLORS.foreground,
                    space: 1,
                    style: BorderStyle.SINGLE,
                    size: 12,
                  },
                },
                spacing: { after: 200 },
              }),

              // Billed To & Stay Details
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                  bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                  left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                  right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                  insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                  insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        width: { size: 50, type: WidthType.PERCENTAGE },
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: "Billed To",
                                bold: true,
                                size: 18,
                                color: COLORS.muted,
                              }),
                            ],
                            spacing: { after: 80 },
                          }),
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: invoiceData.guestName,
                                bold: true,
                                size: 24,
                                color: COLORS.foreground,
                              }),
                            ],
                          }),
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: invoiceData.guestEmail,
                                size: 20,
                                color: COLORS.muted,
                              }),
                            ],
                          }),
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: invoiceData.guestPhone,
                                size: 20,
                                color: COLORS.muted,
                              }),
                            ],
                          }),
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: invoiceData.guestAddress,
                                size: 20,
                                color: COLORS.muted,
                              }),
                            ],
                          }),
                        ],
                      }),
                      new TableCell({
                        width: { size: 50, type: WidthType.PERCENTAGE },
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            children: [
                              new TextRun({
                                text: "Stay Details",
                                bold: true,
                                size: 18,
                                color: COLORS.muted,
                              }),
                            ],
                            spacing: { after: 80 },
                          }),
                          new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            children: [
                              new TextRun({
                                text: `${invoiceData.villaName} (${invoiceData.nights} Nights)`,
                                bold: true,
                                size: 22,
                                color: COLORS.foreground,
                              }),
                            ],
                          }),
                          new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            children: [
                              new TextRun({
                                text: `Check-in: ${invoiceData.checkIn}`,
                                size: 20,
                                color: COLORS.muted,
                              }),
                            ],
                          }),
                          new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            children: [
                              new TextRun({
                                text: `Check-out: ${invoiceData.checkOut}`,
                                size: 20,
                                color: COLORS.muted,
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),

              new Paragraph({ text: "", spacing: { after: 300 } }),

              // Line items table
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        width: { size: 50, type: WidthType.PERCENTAGE },
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: "Service Description",
                                bold: true,
                                color: COLORS.foreground,
                              }),
                            ],
                          }),
                        ],
                        borders: {
                          bottom: {
                            color: COLORS.foreground,
                            space: 1,
                            style: BorderStyle.SINGLE,
                            size: 12,
                          },
                        },
                      }),
                      new TableCell({
                        width: { size: 10, type: WidthType.PERCENTAGE },
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [new TextRun({ text: "Qty", bold: true, color: COLORS.foreground })],
                          }),
                        ],
                        borders: {
                          bottom: {
                            color: COLORS.foreground,
                            space: 1,
                            style: BorderStyle.SINGLE,
                            size: 12,
                          },
                        },
                      }),
                      new TableCell({
                        width: { size: 20, type: WidthType.PERCENTAGE },
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            children: [
                              new TextRun({
                                text: "Unit Price",
                                bold: true,
                                color: COLORS.foreground,
                              }),
                            ],
                          }),
                        ],
                        borders: {
                          bottom: {
                            color: COLORS.foreground,
                            space: 1,
                            style: BorderStyle.SINGLE,
                            size: 12,
                          },
                        },
                      }),
                      new TableCell({
                        width: { size: 20, type: WidthType.PERCENTAGE },
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            children: [new TextRun({ text: "Amount", bold: true, color: COLORS.foreground })],
                          }),
                        ],
                        borders: {
                          bottom: {
                            color: COLORS.foreground,
                            space: 1,
                            style: BorderStyle.SINGLE,
                            size: 12,
                          },
                        },
                      }),
                    ],
                  }),
                  ...invoiceData.lineItems.map(
                    (item) =>
                      new TableRow({
                        children: [
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: item.description,
                                    bold: true,
                                    color: COLORS.foreground,
                                  }),
                                ],
                              }),
                              item.detail
                                ? new Paragraph({
                                    children: [
                                      new TextRun({
                                        text: item.detail,
                                        color: COLORS.muted,
                                        size: 18,
                                      }),
                                    ],
                                  })
                                : new Paragraph({ text: "" }),
                            ],
                            borders: {
                              bottom: {
                                color: COLORS.border,
                                space: 1,
                                style: BorderStyle.SINGLE,
                                size: 6,
                              },
                            },
                          }),
                          new TableCell({
                            children: [
                              new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [new TextRun({ text: String(item.quantity) })],
                              }),
                            ],
                            borders: {
                              bottom: {
                                color: COLORS.border,
                                space: 1,
                                style: BorderStyle.SINGLE,
                                size: 6,
                              },
                            },
                          }),
                          new TableCell({
                            children: [
                              new Paragraph({
                                alignment: AlignmentType.RIGHT,
                                children: [
                                  new TextRun({ text: formatAmount(item.unitPrice, invoiceData.currency) }),
                                ],
                              }),
                            ],
                            borders: {
                              bottom: {
                                color: COLORS.border,
                                space: 1,
                                style: BorderStyle.SINGLE,
                                size: 6,
                              },
                            },
                          }),
                          new TableCell({
                            children: [
                              new Paragraph({
                                alignment: AlignmentType.RIGHT,
                                children: [
                                  new TextRun({
                                    text: formatAmount(item.amount, invoiceData.currency),
                                    bold: true,
                                  }),
                                ],
                              }),
                            ],
                            borders: {
                              bottom: {
                                color: COLORS.border,
                                space: 1,
                                style: BorderStyle.SINGLE,
                                size: 6,
                              },
                            },
                          }),
                        ],
                      })
                  ),
                ],
              }),

              new Paragraph({ text: "", spacing: { after: 300 } }),

              // Totals
              new Table({
                width: { size: 40, type: WidthType.PERCENTAGE },
                alignment: AlignmentType.RIGHT,
                borders: {
                  top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                  bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                  left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                  right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                  insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                  insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [new TextRun({ text: "Subtotal", color: COLORS.muted })],
                          }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            children: [
                              new TextRun({ text: formatAmount(invoiceData.subtotal, invoiceData.currency) }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: `Service Charge (${invoiceData.serviceChargeRate}%)`,
                                color: COLORS.muted,
                              }),
                            ],
                          }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            children: [
                              new TextRun({ text: formatAmount(invoiceData.serviceCharge, invoiceData.currency) }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({ text: `VAT (${invoiceData.vatRate}%)`, color: COLORS.muted }),
                            ],
                          }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            children: [new TextRun({ text: formatAmount(invoiceData.vat, invoiceData.currency) })],
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        borders: {
                          top: {
                            color: COLORS.foreground,
                            space: 1,
                            style: BorderStyle.SINGLE,
                            size: 12,
                          },
                        },
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({ text: "Total", bold: true, size: 24 }),
                            ],
                          }),
                        ],
                      }),
                      new TableCell({
                        borders: {
                          top: {
                            color: COLORS.foreground,
                            space: 1,
                            style: BorderStyle.SINGLE,
                            size: 12,
                          },
                        },
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            children: [
                              new TextRun({
                                text: formatAmount(invoiceData.total, invoiceData.currency),
                                bold: true,
                                size: 28,
                                color: COLORS.accent,
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),

              new Paragraph({ text: "", spacing: { after: 300 } }),

              // Payment Methods
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Payment Methods",
                    bold: true,
                    size: 20,
                    color: COLORS.muted,
                  }),
                ],
                spacing: { after: 120 },
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Bank: ", color: COLORS.muted }),
                  new TextRun({ text: invoiceData.bankName, bold: true }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Account Name: ", color: COLORS.muted }),
                  new TextRun({ text: invoiceData.accountName, bold: true }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Account Number: ", color: COLORS.muted }),
                  new TextRun({ text: invoiceData.accountNumber, bold: true }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Branch: ", color: COLORS.muted }),
                  new TextRun({ text: invoiceData.branch, bold: true }),
                ],
              }),

              new Paragraph({ text: "", spacing: { after: 300 } }),

              // Thank you message
              new Paragraph({
                border: {
                  left: {
                    color: COLORS.accent,
                    space: 12,
                    style: BorderStyle.SINGLE,
                    size: 24,
                  },
                },
                shading: {
                  fill: "f3f4f6",
                },
                spacing: { before: 120, after: 120 },
                indent: { left: 200 },
                children: [
                  new TextRun({
                    text: `"${invoiceData.thankYouMessage}"`,
                    italics: true,
                    color: COLORS.foreground,
                    size: 22,
                  }),
                ],
              }),
              new Paragraph({
                spacing: { before: 80 },
                children: [
                  new TextRun({ text: "— Management Team", bold: true, color: COLORS.muted }),
                ],
              }),

              new Paragraph({ text: "", spacing: { after: 400 } }),

              // Footer
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "Numi Villa · Jalan Ibrahim No 88 · Bali, Indonesia · www.numivilla.com",
                    size: 16,
                    color: COLORS.muted,
                  }),
                ],
              }),
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${invoiceData.invoiceNumber}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Word generation failed:", error);
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadPDF = async () => {
    const element = invoiceRef.current;
    if (!element) return;

    setDownloading("pdf");
    try {
      const [{ toPng }, { jsPDF }] = await Promise.all([
        import("html-to-image"),
        import("jspdf"),
      ]);

      const inner = element.firstElementChild as HTMLElement | null;

      const originalOuterWidth = element.style.width;
      const originalOuterMaxWidth = element.style.maxWidth;
      const originalOuterBoxShadow = element.style.boxShadow;
      const originalOuterMargin = element.style.margin;
      const originalInnerPadding = inner?.style.padding;

      element.style.width = "210mm";
      element.style.maxWidth = "210mm";
      element.style.boxShadow = "none";
      element.style.margin = "0";
      if (inner) {
        inner.style.padding = "24px";
      }

      const dataUrl = await toPng(element, {
        quality: 0.95,
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#ffffff",
      });

      element.style.width = originalOuterWidth;
      element.style.maxWidth = originalOuterMaxWidth;
      element.style.boxShadow = originalOuterBoxShadow;
      element.style.margin = originalOuterMargin;
      if (inner && originalInnerPadding !== undefined) {
        inner.style.padding = originalInnerPadding;
      }

      const pdf = new jsPDF({
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const img = new Image();
      img.src = dataUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
      });

      const imgWidthPx = img.width;
      const imgHeightPx = img.height;
      const scale = pageWidth / imgWidthPx;
      const imgHeightMm = imgHeightPx * scale;

      if (imgHeightMm <= pageHeight) {
        pdf.addImage(dataUrl, "PNG", 0, 0, pageWidth, imgHeightMm);
      } else if (imgHeightMm <= pageHeight + 10) {
        const scaleToFit = pageHeight / imgHeightMm;
        const fitWidth = pageWidth * scaleToFit;
        const xOffset = (pageWidth - fitWidth) / 2;
        pdf.addImage(dataUrl, "PNG", xOffset, 0, fitWidth, pageHeight);
      } else {
        let currentY = 0;
        while (currentY < imgHeightMm) {
          if (currentY > 0) {
            pdf.addPage();
          }
          pdf.addImage(dataUrl, "PNG", 0, -currentY, pageWidth, imgHeightMm);
          currentY += pageHeight;
        }
      }

      pdf.save(`${invoiceData.invoiceNumber}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setDownloading(null);
    }
  };

  const handleSendEmail = async () => {
    if (!guestEmail) return;
    setSending(true);
    try {
      if (onSendEmail) {
        await onSendEmail();
      } else {
        const response = await fetch("/api/send-invoice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: guestEmail,
            invoiceNumber: invoiceId,
            guestName: "Guest",
            totalAmount: "",
          }),
        });
        const data = await response.json();
        if (data.success) {
          console.log("Invoice sent successfully");
        }
      }
    } catch (error) {
      console.error("Failed to send invoice:", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleDownloadWord}
        disabled={downloading === "word"}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-(--foreground) bg-white border border-(--border) rounded-lg hover:bg-(--background) transition-colors disabled:opacity-50"
      >
        {downloading === "word" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileText className="w-4 h-4" />
        )}
        Download Word
      </button>

      <button
        onClick={handleDownloadPDF}
        disabled={downloading === "pdf"}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-(--foreground) bg-white border border-(--border) rounded-lg hover:bg-(--background) transition-colors disabled:opacity-50"
      >
        {downloading === "pdf" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        Download PDF
      </button>

      <button
        onClick={handleSendEmail}
        disabled={sending || !guestEmail}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-(--foreground) rounded-lg hover:bg-(--sidebar-bg) transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {sending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        Send to Guest
      </button>
    </div>
  );
}
