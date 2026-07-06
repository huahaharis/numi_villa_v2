import { Resend } from "resend";
import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePDF } from "@/components/invoice/InvoicePDF";
import type { InvoiceData } from "@/data/invoiceData";

const resend = new Resend(process.env.RESEND_API_KEY);

function buildEmailHtml(invoice: InvoiceData) {
  const currency = invoice.currency === "IDR" ? "IDR" : "$";
  const total =
    invoice.currency === "IDR"
      ? invoice.total.toLocaleString("id-ID")
      : invoice.total.toLocaleString("en-US", { minimumFractionDigits: 2 });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Booking Invoice</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:#1f2937;padding:32px;text-align:center;color:white;">
              <h1 style="margin:0;font-size:26px;">${invoice.villaName}</h1>
              <p style="margin-top:10px;font-size:15px;color:#d1d5db;">Booking Invoice</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:40px;">
              <p style="margin-top:0;font-size:16px;">Dear <strong>${invoice.guestName}</strong>,</p>
              <p style="color:#555;line-height:1.7;">Thank you for choosing <strong>${invoice.villaName}</strong>. Please find your booking invoice attached to this email.</p>
              <table width="100%" cellpadding="10" cellspacing="0" style="margin:30px 0;border:1px solid #e5e7eb;border-collapse:collapse;">
                <tr style="background:#f9fafb;">
                  <td><strong>Invoice Number</strong></td>
                  <td>${invoice.invoiceNumber}</td>
                </tr>
                <tr>
                  <td><strong>Check-in</strong></td>
                  <td>${invoice.date}</td>
                </tr>
                <tr style="background:#f9fafb;">
                  <td><strong>Check-out</strong></td>
                  <td>${invoice.dueDate}</td>
                </tr>
                <tr>
                  <td><strong>Total Amount</strong></td>
                  <td><strong>${currency} ${total}</strong></td>
                </tr>
              </table>
              <p style="color:#555;line-height:1.7;">If you have any questions regarding your reservation or invoice, simply reply to this email and our team will be happy to assist you.</p>
              <p style="margin-top:40px;">We look forward to welcoming you!</p>
              <p>Best regards,<br><strong>${invoice.villaName}</strong></p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:24px;text-align:center;font-size:13px;color:#888;">
              ${invoice.villaName}<br>
              Cluster kaliandra no A-105, Pangandaran, Jawa Barat<br>
              081221882454<br>
              www.numivilla.my.id
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function POST(request: Request) {
  try {
    const { to, invoiceNumber, invoiceData } = await request.json();

    if (!to || !invoiceNumber || !invoiceData) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const data = invoiceData as InvoiceData;

    // Generate PDF buffer
    const pdfBuffer = await renderToBuffer(InvoicePDF({ invoice: data }));
    const pdfBase64 = pdfBuffer.toString("base64");

    const { data: emailData, error } = await resend.emails.send({
      from: "Numi Villa <no-reply@numivilla.my.id>",
      to,
      subject: `Invoice ${invoiceNumber} - Numi Villa`,
      html: buildEmailHtml(data),
      attachments: [
        {
          filename: `Invoice-${invoiceNumber}.pdf`,
          content: pdfBase64,
        },
      ],
    });

    if (error) return NextResponse.json({ error }, { status: 500 });
    return NextResponse.json({ success: true, id: emailData?.id });
  } catch (err: any) {
    console.error("Failed to send invoice email:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
