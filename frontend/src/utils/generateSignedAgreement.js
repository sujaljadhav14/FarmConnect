import jsPDF from "jspdf";

/**
 * Generate a signed agreement PDF with digital signatures
 * @param {Object} order - The order object with populated fields
 * @param {Object} signatures - Signature data
 * @param {boolean} signatures.farmerSigned - Whether farmer has signed
 * @param {string} signatures.farmerName - Farmer's digital signature (typed name)
 * @param {Date} signatures.farmerSignedAt - When farmer signed
 * @param {boolean} signatures.traderSigned - Whether trader has signed
 * @param {string} signatures.traderName - Trader's digital signature (typed name)
 * @param {Date} signatures.traderSignedAt - When trader signed
 * @param {Object} agreement - Optional agreement object with quality details
 */
export const generateSignedAgreement = (order, signatures, agreement = null) => {
    const doc = new jsPDF("p", "mm", "a4");

    // Margins
    const left = 20;
    const right = 190;
    let y = 20;

    // ===== HEADER =====
    doc.setFont("times", "bold");
    doc.setFontSize(18);
    doc.text("AGRICULTURAL PRODUCE SALE AGREEMENT", 105, y, { align: "center" });

    y += 8;
    doc.setFontSize(10);
    doc.setFont("times", "normal");

    // Status indicator
    if (signatures.farmerSigned && signatures.traderSigned) {
        doc.setTextColor(0, 128, 0); // Green
        doc.text("✓ MUTUALLY SIGNED AGREEMENT - LEGALLY BINDING", 105, y, { align: "center" });
    } else if (signatures.farmerSigned) {
        doc.setTextColor(255, 165, 0); // Orange
        doc.text("⏳ PENDING TRADER CONFIRMATION", 105, y, { align: "center" });
    } else {
        doc.setTextColor(100, 100, 100);
        doc.text("DRAFT AGREEMENT", 105, y, { align: "center" });
    }
    doc.setTextColor(0, 0, 0); // Reset to black

    y += 6;
    doc.text("This agreement is generated electronically and is legally valid.", 105, y, {
        align: "center",
    });

    y += 8;
    doc.line(left, y, right, y);

    // ===== DATE & ORDER INFO =====
    y += 8;
    doc.setFontSize(11);
    doc.text(`Agreement Date: ${new Date().toLocaleDateString("en-IN")}`, left, y);
    y += 6;
    doc.text(`Order ID: ${order._id}`, left, y);
    y += 6;
    doc.text(`Order Date: ${new Date(order.orderDate || order.createdAt).toLocaleDateString("en-IN")}`, left, y);

    // ===== PARTIES =====
    y += 10;
    doc.setFont("times", "bold");
    doc.text("1. PARTIES TO THE AGREEMENT", left, y);

    y += 7;
    doc.setFont("times", "normal");
    doc.text(
        `This agreement is entered into between the following parties:`,
        left,
        y
    );

    y += 7;
    doc.setFont("times", "bold");
    doc.text(`SELLER (Farmer):`, left, y);
    doc.setFont("times", "normal");
    y += 5;
    doc.text(`Name: ${order.farmerId?.name || "N/A"}`, left + 5, y);
    y += 5;
    doc.text(`Phone: ${order.farmerId?.phone || "N/A"}`, left + 5, y);

    y += 7;
    doc.setFont("times", "bold");
    doc.text(`BUYER (Trader):`, left, y);
    doc.setFont("times", "normal");
    y += 5;
    doc.text(`Name: ${order.traderId?.name || "N/A"}`, left + 5, y);
    y += 5;
    doc.text(`Phone: ${order.traderId?.phone || "N/A"}`, left + 5, y);

    // ===== PRODUCT DETAILS =====
    y += 10;
    doc.setFont("times", "bold");
    doc.text("2. PRODUCT DETAILS", left, y);

    y += 7;
    doc.setFont("times", "normal");
    const productDetails = [
        ["Crop Name:", order.cropId?.cropName || "N/A"],
        ["Category:", order.cropId?.category || "N/A"],
        ["Quality Grade:", order.cropId?.quality || "Standard"],
        ["Quantity:", `${order.quantity} ${order.cropId?.unit || "kg"}`],
        ["Price per Unit:", `₹${order.pricePerUnit}`],
        ["Total Order Value:", `₹${order.totalPrice}`],
    ];

    productDetails.forEach(([label, value]) => {
        doc.text(`${label} ${value}`, left, y);
        y += 5;
    });

    // ===== PAYMENT TERMS =====
    y += 5;
    doc.setFont("times", "bold");
    doc.text("3. PAYMENT TERMS (30/70 SPLIT)", left, y);

    const advanceAmount = Math.round(order.totalPrice * 0.30);
    const finalAmount = order.totalPrice - advanceAmount;

    y += 7;
    doc.setFont("times", "normal");
    doc.text(`a) Advance Payment (30%): ₹${advanceAmount}`, left, y);
    y += 5;
    doc.text(`   - To be paid by Trader after both parties sign this agreement`, left, y);
    y += 5;
    doc.text(`b) Final Payment (70%): ₹${finalAmount}`, left, y);
    y += 5;
    doc.text(`   - To be paid after successful delivery of goods`, left, y);
    y += 5;
    doc.text(`c) Transport Cost: To be determined when transport is selected`, left, y);

    // ===== DELIVERY =====
    y += 10;
    doc.setFont("times", "bold");
    doc.text("4. DELIVERY DETAILS", left, y);

    y += 7;
    doc.setFont("times", "normal");
    doc.text(`Delivery Address: ${order.deliveryAddress}`, left, y, { maxWidth: 170 });
    y += 8;
    doc.text(
        `Expected Delivery: ${new Date(order.expectedDeliveryDate).toLocaleDateString("en-IN")}`,
        left,
        y
    );

    // ===== QUALITY COMMITMENT =====
    if (agreement?.farmerAgreement?.qualityCommitment) {
        y += 10;
        doc.setFont("times", "bold");
        doc.text("5. FARMER'S QUALITY COMMITMENT", left, y);
        y += 7;
        doc.setFont("times", "italic");
        doc.text(`"${agreement.farmerAgreement.qualityCommitment}"`, left, y, { maxWidth: 170 });
    }

    // ===== TERMS & CONDITIONS =====
    y += 10;
    doc.setFont("times", "bold");
    doc.text("6. TERMS AND CONDITIONS", left, y);

    y += 7;
    doc.setFont("times", "normal");
    const terms = [
        "a) The farmer agrees to supply the produce in agreed quantity and quality grade.",
        "b) The trader agrees to make advance payment (30%) within 24 hours of signing.",
        "c) Final payment (70%) is due immediately upon delivery confirmation.",
        "d) Any dispute shall be resolved mutually in good faith.",
        "e) Backing out after signing will affect platform ratings.",
    ];

    terms.forEach((term) => {
        doc.text(term, left, y, { maxWidth: 170 });
        y += 6;
    });

    // ===== DIGITAL SIGNATURES =====
    y += 10;
    doc.setFont("times", "bold");
    doc.text("7. DIGITAL SIGNATURES", left, y);

    y += 10;

    // Farmer signature box
    doc.rect(left, y, 75, 30);
    doc.setFont("times", "bold");
    doc.text("FARMER (SELLER)", left + 2, y + 5);
    doc.setFont("times", "normal");

    if (signatures.farmerSigned && signatures.farmerName) {
        doc.setFont("times", "bolditalic");
        doc.setFontSize(14);
        doc.text(signatures.farmerName, left + 5, y + 15);
        doc.setFontSize(9);
        doc.setFont("times", "normal");
        doc.text(`Signed: ${new Date(signatures.farmerSignedAt).toLocaleString("en-IN")}`, left + 2, y + 22);
        doc.setTextColor(0, 128, 0);
        doc.text("✓ SIGNED", left + 2, y + 28);
        doc.setTextColor(0, 0, 0);
    } else {
        doc.text("[ Pending Signature ]", left + 20, y + 15);
    }

    // Trader signature box
    doc.rect(115, y, 75, 30);
    doc.setFont("times", "bold");
    doc.setFontSize(11);
    doc.text("TRADER (BUYER)", 117, y + 5);
    doc.setFont("times", "normal");

    if (signatures.traderSigned && signatures.traderName) {
        doc.setFont("times", "bolditalic");
        doc.setFontSize(14);
        doc.text(signatures.traderName, 120, y + 15);
        doc.setFontSize(9);
        doc.setFont("times", "normal");
        doc.text(`Signed: ${new Date(signatures.traderSignedAt).toLocaleString("en-IN")}`, 117, y + 22);
        doc.setTextColor(0, 128, 0);
        doc.text("✓ SIGNED", 117, y + 28);
        doc.setTextColor(0, 0, 0);
    } else {
        doc.setFontSize(11);
        doc.text("[ Pending Signature ]", 130, y + 15);
    }

    // ===== FOOTER =====
    y += 40;
    doc.setFontSize(9);
    doc.setFont("times", "italic");
    doc.text(
        "This is a system-generated document with electronic signatures. Valid under the Information Technology Act, 2000.",
        105,
        y,
        { align: "center" }
    );

    y += 5;
    doc.text(
        `Generated on: ${new Date().toLocaleString("en-IN")} | Platform: FarmConnect`,
        105,
        y,
        { align: "center" }
    );

    // ===== SAVE =====
    const status = signatures.farmerSigned && signatures.traderSigned
        ? "Signed"
        : signatures.farmerSigned
            ? "Farmer_Signed"
            : "Draft";

    doc.save(`Agreement_${order._id.slice(-6)}_${status}.pdf`);
};

export default generateSignedAgreement;
