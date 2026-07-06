import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { InvoiceData } from "@/data/invoiceData";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1f2937",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 30,
  },
  brand: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1f2937",
  },
  brandSub: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: 4,
    letterSpacing: 1,
  },
  brandInfo: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: 12,
    lineHeight: 1.5,
  },
  invoiceTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
  },
  invoiceMeta: {
    alignItems: "flex-end",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 24,
    marginBottom: 4,
  },
  metaLabel: {
    color: "#6b7280",
    textAlign: "right",
  },
  metaValue: {
    fontWeight: "medium",
    width: 100,
    textAlign: "right",
  },
  divider: {
    borderBottomWidth: 2,
    borderBottomColor: "#1f2937",
    marginVertical: 20,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  guestName: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  muted: {
    color: "#6b7280",
    marginBottom: 2,
  },
  stayName: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
  stayRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 24,
    marginBottom: 4,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "#1f2937",
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 8,
  },
  colDescription: {
    flex: 1,
  },
  colQty: {
    width: 50,
    textAlign: "center",
  },
  colPrice: {
    width: 90,
    textAlign: "right",
  },
  colAmount: {
    width: 90,
    textAlign: "right",
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  totals: {
    alignItems: "flex-end",
    marginTop: 24,
    marginBottom: 24,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 40,
    marginBottom: 6,
  },
  totalLabel: {
    color: "#6b7280",
    textAlign: "right",
  },
  totalValue: {
    width: 100,
    textAlign: "right",
  },
  grandTotal: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 40,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: "#1f2937",
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: "bold",
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: "bold",
    width: 100,
    textAlign: "right",
  },
  bankSection: {
    marginBottom: 24,
  },
  bankBox: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    padding: 16,
  },
  bankRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  bankLabel: {
    color: "#6b7280",
    width: 110,
  },
  thankYou: {
    borderLeftWidth: 4,
    borderLeftColor: "#1f2937",
    backgroundColor: "#f3f4f6",
    padding: 16,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    marginBottom: 24,
  },
  thankYouText: {
    fontStyle: "italic",
    lineHeight: 1.5,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 16,
    textAlign: "center",
    color: "#6b7280",
    fontSize: 9,
  },
});

function formatMoney(amount: number | undefined | null, currency: string) {
  const value = amount ?? 0;
  if (currency === "IDR") {
    return `IDR ${value.toLocaleString("id-ID")}`;
  }
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

interface InvoicePDFProps {
  invoice: InvoiceData;
}

export function InvoicePDF({ invoice }: InvoicePDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>NUMI VILLA</Text>
            <Text style={styles.brandSub}>Luxury Residences & Estates</Text>
            <View style={styles.brandInfo}>
              <Text>Cluster kaliandra no A-105, Pangandaran, Jawa Barat</Text>
              <Text>081221882454</Text>
              <Text>www.numivilla.my.id</Text>
            </View>
          </View>
          <View style={styles.invoiceMeta}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Invoice #</Text>
              <Text style={styles.metaValue}>{invoice.invoiceNumber}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Date</Text>
              <Text style={styles.metaValue}>{invoice.date}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Due</Text>
              <Text style={styles.metaValue}>{invoice.dueDate}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Billed To & Stay Details */}
        <View style={styles.sectionRow}>
          <View>
            <Text style={styles.sectionTitle}>Billed To</Text>
            <Text style={styles.guestName}>{invoice.guestName}</Text>
            <Text style={styles.muted}>{invoice.guestEmail}</Text>
            <Text style={styles.muted}>{invoice.guestPhone}</Text>
            {invoice.guestAddress && invoice.guestAddress !== "—" && (
              <Text style={styles.muted}>{invoice.guestAddress}</Text>
            )}
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.sectionTitle}>Stay Details</Text>
            <Text style={styles.stayName}>
              {invoice.villaName} ({invoice.nights} Nights)
            </Text>
            <View style={styles.stayRow}>
              <Text style={styles.muted}>Check-in</Text>
              <Text>{invoice.checkIn}</Text>
            </View>
            <View style={styles.stayRow}>
              <Text style={styles.muted}>Check-out</Text>
              <Text>{invoice.checkOut}</Text>
            </View>
          </View>
        </View>

        {/* Line Items */}
        <View>
          <View style={styles.tableHeader}>
            <Text style={[styles.colDescription, styles.tableHeaderText]}>
              Service Description
            </Text>
            <Text style={[styles.colQty, styles.tableHeaderText]}>Qty</Text>
            <Text style={[styles.colPrice, styles.tableHeaderText]}>
              Unit Price
            </Text>
            <Text style={[styles.colAmount, styles.tableHeaderText]}>
              Amount
            </Text>
          </View>
          {invoice.lineItems.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <View style={styles.colDescription}>
                <Text>{item.description}</Text>
                {item.detail && (
                  <Text style={{ fontSize: 9, color: "#6b7280", marginTop: 2 }}>
                    {item.detail}
                  </Text>
                )}
              </View>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>
                {formatMoney(item.unitPrice, invoice.currency)}
              </Text>
              <Text style={styles.colAmount}>
                {formatMoney(item.amount, invoice.currency)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>
              {formatMoney(invoice.subtotal, invoice.currency)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              Service Charge ({invoice.serviceChargeRate}%)
            </Text>
            <Text style={styles.totalValue}>
              {formatMoney(invoice.serviceCharge, invoice.currency)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>VAT ({invoice.vatRate}%)</Text>
            <Text style={styles.totalValue}>
              {formatMoney(invoice.vat, invoice.currency)}
            </Text>
          </View>
          <View style={styles.grandTotal}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>
              {formatMoney(invoice.total, invoice.currency)}
            </Text>
          </View>
        </View>

        {/* Bank Details */}
        <View style={styles.bankSection}>
          <Text style={styles.sectionTitle}>Payment Methods</Text>
          <View style={styles.bankBox}>
            <Text style={{ fontWeight: "bold", marginBottom: 8 }}>
              Bank Transfer
            </Text>
            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>Bank:</Text>
              <Text>{invoice.bankName}</Text>
            </View>
            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>Account Name:</Text>
              <Text>{invoice.accountName}</Text>
            </View>
            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>Account Number:</Text>
              <Text>{invoice.accountNumber}</Text>
            </View>
            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>Branch:</Text>
              <Text>{invoice.branch}</Text>
            </View>
          </View>
        </View>

        {/* Thank You */}
        <View style={styles.thankYou}>
          <Text style={styles.thankYouText}>
            &ldquo;{invoice.thankYouMessage}&rdquo;
          </Text>
          <Text
            style={{
              fontSize: 9,
              fontWeight: "bold",
              color: "#6b7280",
              marginTop: 12,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            — Management Team
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Numi Villa · Cluster kaliandra no A-105 · Pangandaran, Jawa Barat ·
            www.numivilla.my.id
          </Text>
        </View>
      </Page>
    </Document>
  );
}
