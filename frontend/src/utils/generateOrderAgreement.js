import jsPDF from "jspdf";

export const generateOrderAgreement = (order) => {
  const doc = new jsPDF("p", "mm", "a4");

  // Margins
  const left = 20;
  let y = 25;

  // ===== HEADER =====
  doc.setFont("times", "bold");
  doc.setFontSize(18);
  doc.text("AGRICULTURAL PRODUCE SALE AGREEMENT", 105, y, { align: "center" });

  y += 8;
  doc.setFontSize(10);
  doc.setFont("times", "normal");
  doc.text("This agreement is generated electronically and is legally valid.", 105, y, {
    align: "center",
  });

  y += 10;
  doc.line(left, y, 190, y);

  // ===== DATE & ORDER INFO =====
  y += 10;
  doc.setFontSize(11);
  doc.text(`Agreement Date: ${new Date().toLocaleDateString()}`, left, y);
  y += 6;
  doc.text(`Order ID: ${order._id}`, left, y);

  // ===== PARTIES =====
  y += 12;
  doc.setFont("times", "bold");
  doc.text("1. Parties to the Agreement", left, y);

  y += 7;
  doc.setFont("times", "normal");
  doc.text(
    `This agreement is entered into between the following parties:`,
    left,
    y
  );

  y += 7;
  doc.text(
    `Farmer (Seller): ${order.farmerId?.name} | Phone: ${order.farmerId?.phone || "N/A"}`,
    left,
    y
  );

  y += 6;
  doc.text(
    `Trader (Buyer): ${order.traderId?.name} | Phone: ${order.traderId?.phone || "N/A"}`,
    left,
    y
  );

  // ===== ORDER DETAILS =====
  y += 12;
  doc.setFont("times", "bold");
  doc.text("2. Order Details", left, y);

  y += 7;
  doc.setFont("times", "normal");
  doc.text(`Crop Name: ${order.cropId?.cropName}`, left, y);
  y += 6;
  doc.text(`Quantity: ${order.quantity} ${order.cropId?.unit}`, left, y);
  y += 6;
  doc.text(`Price per Unit: ₹${order.pricePerUnit}`, left, y);
  y += 6;
  doc.text(`Total Order Value: ₹${order.totalPrice}`, left, y);

  // ===== PAYMENT TERMS =====
  y += 12;
  doc.setFont("times", "bold");
  doc.text("3. Payment Terms", left, y);

  y += 7;
  doc.setFont("times", "normal");
  doc.text(
    `Payment Method: ${order.paymentMethod}`,
    left,
    y
  );

  y += 6;
  doc.text(
    `Payment Status: ${order.paymentStatus}`,
    left,
    y
  );

  // ===== DELIVERY =====
  y += 12;
  doc.setFont("times", "bold");
  doc.text("4. Delivery Details", left, y);

  y += 7;
  doc.setFont("times", "normal");
  doc.text(
    `Delivery Address: ${order.deliveryAddress}`,
    left,
    y,
    { maxWidth: 170 }
  );

  y += 6;
  doc.text(
    `Expected Delivery Date: ${new Date(order.expectedDeliveryDate).toLocaleDateString()}`,
    left,
    y
  );

  // ===== TERMS & CONDITIONS =====
  y += 12;
  doc.setFont("times", "bold");
  doc.text("5. Terms and Conditions", left, y);

  y += 7;
  doc.setFont("times", "normal");
  doc.text(
    "a) The farmer agrees to supply the produce in agreed quantity and quality.",
    left,
    y
  );
  y += 6;
  doc.text(
    "b) The trader agrees to make payment as per the selected payment method and agreed timelines..",
    left,
    y
  );
  y += 6;
  doc.text(
    "c) Any dispute shall be resolved mutually in good faith.",
    left,
    y
  );
  y += 6;
  doc.text(
    "d) If either the farmer or the trader backs out before order completion, their platform rating will be decreased.",
    left,
    y
  );

  // ===== DECLARATION =====
  y += 12;
  doc.setFont("times", "bold");
  doc.text("6. Declaration", left, y);

  y += 7;
  doc.setFont("times", "normal");
  doc.text(
    "Both parties acknowledge that the information provided above is accurate and agree to abide by the terms mentioned in this agreement.",
    left,
    y,
    { maxWidth: 170 }
  );

  // ===== SIGNATURES =====
  y += 20;
  doc.line(left, y, left + 60, y);
  doc.line(120, y, 180, y);

  y += 5;
  doc.text("Farmer Signature", left, y);
  doc.text("Trader Signature", 120, y);

  // ===== FOOTER =====
  y += 10;
  doc.setFontSize(9);
  doc.text(
    "This is a system-generated document and does not require physical signatures.",
    105,
    y,
    { align: "center" }
  );

  // ===== SAVE =====
  doc.save(`Order_Agreement_${order._id.slice(-6)}.pdf`);
};
