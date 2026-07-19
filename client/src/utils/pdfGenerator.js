import { jsPDF } from "jspdf";
import api from "../api/client";

/**
 * Generates and downloads a beautifully styled PDF invoice for an order.
 * @param {Object} order The order object containing items, shippingAddress, totals, etc.
 */
export const generateInvoicePDF = (order) => {
  if (!order) return;

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

  // --- HEADER SECTION ---
  // Background Header Bar
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
  doc.setTextColor(201, 165, 255); // Purple Glow
  doc.text("PREMIUM MEN'S FASHION STORE", 15, 33);

  // Invoice Title
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("INVOICE", 150, 22);

  // Invoice Metadata (Right Aligned)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(230, 220, 245);
  
  const shortOrderId = order._id ? order._id.toUpperCase() : "N/A";
  doc.text(`Order ID: #${shortOrderId.slice(-8)}`, 150, 29);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString("en-IN")}`, 150, 34);
  doc.text(`Status: ${order.status || "Processing"}`, 150, 39);

  // --- ADDRESSES & PAYMENT SECTION ---
  let y = 60;
  
  // Shipping Details (Left)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...purpleTheme);
  doc.text("BILL TO (SHIPPING DETAILS):", 15, y);

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...darkText);
  
  const addr = order.shippingAddress || {};
  doc.text(addr.fullName || "N/A", 15, y);
  
  y += 5;
  doc.text(`Phone: ${addr.phone || "N/A"}`, 15, y);
  
  y += 5;
  const line2Str = addr.line2 ? `, ${addr.line2}` : "";
  const addressLine = `${addr.line1 || ""}${line2Str}`;
  // Auto-wrap address line if too long
  const addressLines = doc.splitTextToSize(addressLine, 95);
  doc.text(addressLines, 15, y);
  
  y += addressLines.length * 5 - 1;
  doc.text(`${addr.city || ""}, ${addr.state || ""} - ${addr.postalCode || ""}`, 15, y);
  
  y += 5;
  doc.text(addr.country || "India", 15, y);

  // Payment Details (Right)
  let py = 60;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...purpleTheme);
  doc.text("PAYMENT INFORMATION:", 120, py);

  py += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...darkText);
  doc.text(`Method: ${order.paymentMethod || "COD"}`, 120, py);
  
  py += 5;
  doc.text(`Payment Status: ${order.paymentStatus || "Pending"}`, 120, py);
  
  if (order.paymentResult && order.paymentResult.transactionId) {
    py += 5;
    doc.text(`Transaction ID:`, 120, py);
    py += 4.5;
    doc.setFont("courier", "normal");
    doc.setFontSize(8.5);
    doc.text(order.paymentResult.transactionId, 120, py);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
  }

  // Adjust Y coordinate based on which section was taller
  y = Math.max(y, py) + 12;

  // --- ITEMS TABLE SECTION ---
  // Table Header
  doc.setFillColor(...purpleTheme);
  doc.rect(15, y, 180, 8, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("Item Details", 18, y + 5.5);
  doc.text("Size", 120, y + 5.5);
  doc.text("Qty", 140, y + 5.5);
  doc.text("Unit Price", 155, y + 5.5);
  doc.text("Subtotal", 178, y + 5.5);

  y += 8;

  // Table Body Rows
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...darkText);

  const items = order.items || [];
  items.forEach((item, index) => {
    // Alternating background row color for clean layout
    if (index % 2 === 1) {
      doc.setFillColor(...rowAlternate);
      doc.rect(15, y, 180, 8.5, "F");
    }
    
    // Draw row bottom line
    doc.setDrawColor(...borderLight);
    doc.setLineWidth(0.25);
    doc.line(15, y + 8.5, 195, y + 8.5);

    // Write text values
    const itemName = item.name || "Product";
    const displayName = itemName.length > 52 ? itemName.slice(0, 49) + "..." : itemName;
    doc.text(displayName, 18, y + 5.5);
    doc.text(item.size || "Standard", 120, y + 5.5);
    doc.text(String(item.quantity || 1), 140, y + 5.5);
    doc.text(`INR ${Number(item.price || 0).toFixed(2)}`, 155, y + 5.5);
    
    const subtotal = Number(item.price || 0) * Number(item.quantity || 1);
    doc.text(`INR ${subtotal.toFixed(2)}`, 178, y + 5.5);

    y += 8.5;
  });

  y += 8;

  // --- SUMMARY SECTION ---
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...mutedText);
  
  // Right side totals alignment
  const labelX = 135;
  const valX = 175;

  doc.text("Subtotal:", labelX, y);
  doc.setTextColor(...darkText);
  doc.text(`INR ${Number(order.itemsPrice || 0).toFixed(2)}`, valX, y);

  y += 5.5;
  doc.setTextColor(...mutedText);
  doc.text("Shipping Fee:", labelX, y);
  doc.setTextColor(...darkText);
  doc.text(`INR ${Number(order.shippingPrice || 0).toFixed(2)}`, valX, y);

  y += 5.5;
  doc.setTextColor(...mutedText);
  doc.text("Tax Amount:", labelX, y);
  doc.setTextColor(...darkText);
  doc.text(`INR ${Number(order.taxPrice || 0).toFixed(2)}`, valX, y);

  // Grand Total Line
  y += 4;
  doc.setDrawColor(...purpleTheme);
  doc.setLineWidth(0.4);
  doc.line(130, y, 195, y);
  
  y += 6.5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...purpleTheme);
  doc.text("Grand Total:", labelX, y);
  doc.text(`INR ${Number(order.totalPrice || 0).toFixed(2)}`, valX, y);

  // --- FOOTER SECTION ---
  y += 24;
  
  // Guarantee/Support Box
  doc.setFillColor(...rowAlternate);
  doc.setDrawColor(...borderLight);
  doc.setLineWidth(0.2);
  doc.rect(15, y - 8, 180, 14, "DF");
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...mutedText);
  doc.text("If you have any questions regarding this invoice, please email support@wishly.com", 105, y, { align: "center" });

  y += 18;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...purpleTheme);
  doc.text("THANK YOU FOR SHOPPING WITH WISHLY!", 105, y, { align: "center" });

  // Download PDF file directly via browser POST form to ensure correct filename in sandboxed environments
  const safeFilename = `wishly-invoice-${order._id || Date.now()}.pdf`;
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
