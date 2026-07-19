import { jsPDF } from "jspdf";
import api from "../api/client";

/**
 * Generates and downloads a beautifully styled Profit & Loss report PDF.
 * @param {Object} stats Overall store stats (from admin endpoint).
 * @param {Array} orders Array of all order objects.
 * @param {Number} costMargin Estimated product cost margin (percentage).
 * @param {Number} fixedExpenses Estimated operating costs (INR).
 */
export const generateProfitLossPDF = (stats, orders, costMargin, fixedExpenses) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  // Theme Colors (Wishly Purple + Dark design language)
  const purpleTheme = [141, 53, 255]; // --purple: #8d35ff
  const bgSoft = [14, 13, 19];       // --bg-soft: #0e0d13
  const darkText = [30, 30, 35];
  const mutedText = [100, 100, 110];
  const borderLight = [230, 225, 240];
  const rowAlternate = [248, 245, 255];

  // --- STATS CALCULATIONS ---
  let totalItemsPrice = 0;
  let totalShipping = 0;
  let totalTax = 0;
  let totalRevenue = 0;

  orders.forEach((order) => {
    // Only sum processing, packed, shipped, and delivered orders (skip failed payment or cancelled if they exist)
    if (order.paymentStatus === "Paid" || order.status !== "Cancelled") {
      totalItemsPrice += order.itemsPrice || 0;
      totalShipping += order.shippingPrice || 0;
      totalTax += order.taxPrice || 0;
      totalRevenue += order.totalPrice || 0;
    }
  });

  const cogs = totalItemsPrice * (costMargin / 100);
  const grossProfit = totalItemsPrice - cogs;
  const totalExpenses = cogs + totalTax + fixedExpenses;
  const netProfit = totalItemsPrice - cogs - totalTax - fixedExpenses; // Pass-through shipping/tax accounted for
  const isProfit = netProfit >= 0;

  // --- HEADER SECTION ---
  doc.setFillColor(...bgSoft);
  doc.rect(0, 0, 210, 45, "F");

  // Bottom Border on Header Bar
  doc.setFillColor(...purpleTheme);
  doc.rect(0, 45, 210, 1.5, "F");

  // Logo Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text("WISHLY", 15, 26);

  // Brand Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(201, 165, 255);
  doc.text("ADMIN BUSINESS INSIGHTS", 15, 33);

  // Report Title
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("PROFIT & LOSS STATEMENT", 115, 22);

  // Date and Scope (Right Aligned)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(230, 220, 245);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, 115, 29);
  doc.text(`Scope: All Active Orders (${orders.length})`, 115, 34);

  // --- KPI SUMMARY CARD SECTION ---
  let y = 60;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...purpleTheme);
  doc.text("BUSINESS PERFORMANCE SUMMARY:", 15, y);

  y += 6;
  const cardW = 56;
  const cardH = 20;
  const gap = 6;

  // Card 1: Total Sales Revenue
  doc.setFillColor(...rowAlternate);
  doc.rect(15, y, cardW, cardH, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...mutedText);
  doc.text("Gross Revenue (Inc. Shipping)", 19, y + 6);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11.5);
  doc.setTextColor(...darkText);
  doc.text(`INR ${totalRevenue.toFixed(2)}`, 19, y + 14);

  // Card 2: Total Operating Expenses
  doc.setFillColor(...rowAlternate);
  doc.rect(15 + cardW + gap, y, cardW, cardH, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...mutedText);
  doc.text("Total Outflows (COGS + Tax + Exp)", 15 + cardW + gap + 4, y + 6);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11.5);
  doc.setTextColor(239, 75, 116); // Red/danger
  doc.text(`INR ${totalExpenses.toFixed(2)}`, 15 + cardW + gap + 4, y + 14);

  // Card 3: Net Profit / Loss
  doc.setFillColor(...rowAlternate);
  doc.rect(15 + (cardW + gap) * 2, y, cardW, cardH, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...mutedText);
  doc.text(isProfit ? "Net Profit Margin" : "Net Loss Incurred", 15 + (cardW + gap) * 2 + 4, y + 6);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11.5);
  doc.setTextColor(...(isProfit ? [98, 217, 152] : [239, 75, 116])); // Green vs Red
  doc.text(`INR ${netProfit.toFixed(2)}`, 15 + (cardW + gap) * 2 + 4, y + 14);

  // --- DETAILED LEDGER SECTION ---
  y += 32;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...purpleTheme);
  doc.text("FINANCIAL STATEMENT BREAKDOWN:", 15, y);

  y += 6;
  // Table Header
  doc.setFillColor(...purpleTheme);
  doc.rect(15, y, 180, 8, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("Item / Account Category", 18, y + 5.5);
  doc.text("Value (INR)", 115, y + 5.5);
  doc.text("% of Sales", 165, y + 5.5);

  y += 8;

  const formatPercentage = (val) => {
    if (totalItemsPrice === 0) return "0.0%";
    return `${((val / totalItemsPrice) * 100).toFixed(1)}%`;
  };

  const ledgerRows = [
    { name: "Product Sales (Base revenue)", val: totalItemsPrice, pct: "100.0%", isBold: true },
    { name: "Cost of Goods Sold (COGS)", val: -cogs, pct: `-${costMargin.toFixed(1)}%`, isRed: true },
    { name: "Gross Profit Margin", val: grossProfit, pct: formatPercentage(grossProfit), isBold: true },
    { name: "Tax Liabilities Paid (GST / VAT)", val: -totalTax, pct: `-${formatPercentage(totalTax)}`, isRed: true },
    { name: "Fixed Operating Expenses (Rent, hosting, support)", val: -fixedExpenses, pct: `-${formatPercentage(fixedExpenses)}`, isRed: true },
    { name: "Net Profit / Loss", val: netProfit, pct: formatPercentage(netProfit), isBold: true, highlight: true }
  ];

  ledgerRows.forEach((row, index) => {
    // Alternate row colors
    if (index % 2 === 1) {
      doc.setFillColor(...rowAlternate);
      doc.rect(15, y, 180, 8.5, "F");
    }

    // Border line
    doc.setDrawColor(...borderLight);
    doc.setLineWidth(0.25);
    doc.line(15, y + 8.5, 195, y + 8.5);

    // Font setting
    if (row.isBold) {
      doc.setFont("helvetica", "bold");
    } else {
      doc.setFont("helvetica", "normal");
    }

    // Text color setting
    if (row.highlight) {
      doc.setTextColor(row.val >= 0 ? 98 : 239, row.val >= 0 ? 217 : 75, row.val >= 0 ? 152 : 116);
    } else if (row.isRed) {
      doc.setTextColor(239, 75, 116);
    } else {
      doc.setTextColor(...darkText);
    }

    doc.text(row.name, 18, y + 5.5);
    doc.text(`${row.val < 0 ? "-" : ""}INR ${Math.abs(row.val).toFixed(2)}`, 115, y + 5.5);
    doc.text(row.pct, 165, y + 5.5);

    y += 8.5;
  });

  // --- FOOTER AND SUPPORT SECTION ---
  y += 24;
  doc.setFillColor(...rowAlternate);
  doc.setDrawColor(...borderLight);
  doc.setLineWidth(0.2);
  doc.rect(15, y, 180, 16, "DF");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...mutedText);
  doc.text("This document is generated automatically by the Wishly Store Administration dashboard.", 105, y + 6, { align: "center" });
  doc.text("It represents internal bookkeeping calculations and should not be used as official tax filings.", 105, y + 11, { align: "center" });

  // Download PDF file directly via browser POST form to ensure correct filename in sandboxed environments
  const safeFilename = `wishly-financial-report-${Date.now()}.pdf`;
  try {
    const pdfData = doc.output("datauristring");
    const downloadUrl = `${api.defaults.baseURL}/uploads/download-pdf`;

    const form = document.createElement("form");
    form.method = "POST";
    form.action = downloadUrl;
    form.style.display = "none";

    const dataInput = document.createElement("input");
    dataInput.type = "hidden";
    dataInput.name = "pdfData";
    dataInput.value = pdfData;
    form.appendChild(dataInput);

    const fileInput = document.createElement("input");
    fileInput.type = "hidden";
    fileInput.name = "filename";
    fileInput.value = safeFilename;
    form.appendChild(fileInput);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  } catch (error) {
    console.error("Form download failed, falling back to doc.save", error);
    doc.save(safeFilename);
  }
};
