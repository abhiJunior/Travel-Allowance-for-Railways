// controllers/journalController.js
import Journal from "../models/Journal.js";
import PDFDocument from "pdfkit-table";
import numberToWords from "number-to-words"
import User from "../models/User.js";

const {toWords} = numberToWords  // ✅ Correct import

// ------------------ ADD JOURNEY ENTRY ------------------

export const addJourneyEntry = async (req, res) => {
  try {
    const { date, trainNo, depTime, arrTime, fromStation, toStation, objectOfJourney, isStay } = req.body;

    // 1. Extract Month and Year from the date provided
    const entryDate = new Date(date);
    const monthYear = `${entryDate.getFullYear()}-${(entryDate.getMonth() + 1).toString().padStart(2, '0')}`;
    const displayMonth = entryDate.toLocaleString("default", { month: "long", year: "numeric" }).toUpperCase();

    // 2. Find the journal for this month OR create it (Upsert)
    const journal = await Journal.findOneAndUpdate(
      { userId: req.user.id, monthYear },
      {
        $set: { displayMonth },
        $push: {
          entries: { date, trainNo, depTime, arrTime, fromStation, toStation, objectOfJourney, isStay }
        }
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: "Entry added successfully", journal });
  } catch (err) {
    console.error("error", err.message);
    res.status(400).json({ error: err.message });
  }
};

// ------------------ GET MONTHLY JOURNAL ------------------
// url : base/api/journal/:monthYear
// method : GET
// export const getMonthlyJournal = async (req, res) => {
//   try {
//     const { monthYear } = req.params; // e.g., 2025-11
//     console.log("getting inside Month",monthYear)
//     const journal = await Journal.findOne({ userId: req.user.id, monthYear });
//     if (journal){
//       return res.status(200).send({status:true,message:"fetched successfully",data : journal})
//     }else{
//       return res.status(404).send({})
//     }
    
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// ------------------ GET JOURNAL SUMMARY ------------------
export const getJournalSummary = async (req, res) => {
  try {
    const journal = await Journal.findOne({
      userId: req.user.id,
      monthYear: req.params.monthYear
    });

    if (!journal) return res.status(404).json({ message: "No records found"});

    // Calculate totals
    const totalWorkingDays = journal.entries.length;
    const dailyRate = 1000; // Could come from User.rate
    const totalAmount = totalWorkingDays * dailyRate;

    res.status(200).json({
      journal,
      summary: {
        totalWorkingDays,
        totalAmount,
        rateApplied: dailyRate
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------ GENERATE TA PDF ------------------
// export const generateTAPdf = async (req, res) => {
//   try {
//     const {monthYear} = req.params;
//     const userId = req.user.id
//     console.log("download pdf api is called")
//     const user = await User.findById(userId)

//     const journal = await Journal.findOne({userId,monthYear})

//     if (!journal){
//       return res.status(404).send("Journal not found")
//     }
//     if (!user){
//       return res.status(404).send("User not found")
//     }
//     const doc = new PDFDocument({ margin: 30, size: "A4" });

//     // Stream the PDF directly to the browser
//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader("Content-Disposition", `attachment; filename=TA_Journal_${journal.monthYear}.pdf`);
//     doc.pipe(res);

//     // --- HEADER SECTION ---
//     doc.fontSize(12).text("SOUTH CENTRAL RAILWAY", { align: "center" });
//     doc.fontSize(10).text("TRAVELLING ALLOWANCE JOURNAL", { align: "center" });
//     doc.fontSize(8).text("G.A 31", { align: "right" });
//     doc.moveDown();

//     // User details
//     const startY = doc.y;
//     doc.text(`Name: ${user.fullName}`, 50, startY);
//     doc.text(`Designation: ${user.designation}`, 300, startY);
//     doc.text(`Headquarters: ${user.headquarters}`, 50, startY + 15);
//     doc.text(`Month: ${journal.displayMonth}`, 300, startY + 15);
//     doc.text(`Rate Of Pay: ${user.rateOfPay}`, 50, startY + 30);
//     doc.text(`P.F.No: ${user.pfNumber}`, 300, startY + 30);
//     doc.moveDown(4);

//     // --- JOURNEY TABLE ---
//     const table = {
//       headers: [
//         { label: "DATE", property: "date", width: 60 },
//         { label: "TRAIN NO.", property: "trainNo", width: 70 },
//         { label: "DEP", property: "depTime", width: 45 },
//         { label: "ARR", property: "arrTime", width: 45 },
//         { label: "FROM", property: "fromStation", width: 60 },
//         { label: "TO", property: "toStation", width: 60 },
//         { label: "RATE", property: "rate", width: 40 },
//         { label: "OBJECT OF JOURNEY", property: "object", width: 150 }
//       ],
//       datas: journal.entries.map(entry => ({
//         date: new Date(entry.date).toLocaleDateString("en-GB"),
//         trainNo: entry.isStay ? "Stay" : (entry.trainNo || ""),
//         depTime: entry.isStay ? "At" : (entry.depTime || ""),
//         arrTime: entry.isStay ? entry.fromStation : (entry.arrTime || ""),
//         fromStation: entry.isStay ? "" : entry.fromStation,
//         toStation: entry.toStation,
//         rate: entry.taRate || 1000,
//         object: entry.objectOfJourney
//       }))
//     };

//     await doc.table(table, {
//       prepareHeader: () => doc.fontSize(8).font("Helvetica-Bold"),
//       prepareRow: () => doc.fontSize(8).font("Helvetica")
//     });

//     // --- SUMMARY ---
//     const totalAmount = journal.entries.length * 1000;
//     doc.moveDown();
//     doc.fontSize(10).font("Helvetica-Bold")
//       .text(`Total No. of Working Days = ${journal.entries.length} Days`);
//     doc.text(`Total Amount = ${totalAmount}/-`);
//     doc.text(`Total Amount in Words = ${toWords(totalAmount).toUpperCase()} RUPEES ONLY.`);

//     // --- CERTIFICATES ---
//     doc.moveDown().fontSize(8).font("Helvetica-Oblique");
//     doc.text("CERTIFICATE:", { underline: true });
//     doc.text("1. Certified that no TA/DA or any other remuneration has been drawn from any other source...");
//     doc.text("2. Certified that the officer was actually and not merely constructively in camp on Sunday/holiday.");

//     doc.end();
//   } catch (err) {
//     res.status(500).send("Error generating PDF: " + err.message);
//   }
// };

/* -------------------- Helpers -------------------- */

// const formatRailwayDate = (date) => {
//   const d = new Date(date);
//   const dd = String(d.getDate()).padStart(2, "0");
//   const mm = String(d.getMonth() + 1).padStart(2, "0");
//   const yy = String(d.getFullYear()).slice(-2);
//   return `${dd}-${mm}-${yy}`;
// };

// const buildGA31Rows = (entries) => {
//   const rows = [];

//   entries.forEach(entry => {
//     if (entry.isStay) {
//       rows.push({
//         date: formatRailwayDate(entry.date),
//         trainNo: "",
//         dep: "Stay",
//         arr: "AT",
//         from: entry.fromStation,
//         to: "",
//         day: "1",
//         rate: entry.taRate,
//         object: entry.objectOfJourney
//       });
//     } else {
//       rows.push({
//         date: formatRailwayDate(entry.date),
//         trainNo: entry.trainNo || "",
//         dep: entry.depTime || "",
//         arr: entry.arrTime || "",
//         from: entry.fromStation || "",
//         to: entry.toStation || "",
//         day: entry.taRate ? "1" : "-",
//         rate: entry.taRate || "-",
//         object: entry.objectOfJourney || ""
//       });
//     }
//   });

//   return rows;
// };


// /* -------------------- Controller -------------------- */

// export const generateTAPdf = async (req, res) => {
//   try {
//     const { monthYear } = req.params;
//     const userId = req.user.id;

//     const user = await User.findById(userId);
//     const journal = await Journal.findOne({ userId, monthYear });

//     if (!user) return res.status(404).send("User not found");
//     if (!journal) return res.status(404).send("Journal not found");

//     const doc = new PDFDocument({ size: "A4", margin: 30 });

//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename=TA_Journal_${journal.monthYear}.pdf`
//     );

//     doc.pipe(res);

//     /* -------------------- HEADER -------------------- */

//     doc.fontSize(12).font("Helvetica-Bold").text("SOUTH CENTRAL RAILWAY", { align: "center" });
//     doc.fontSize(10).font("Helvetica-Bold").text("TRAVELLING ALLOWANCE JOURNAL", { align: "center" });
//     doc.fontSize(9).font("Helvetica").text("G.A 31", { align: "right" });
//     doc.moveDown(1);

//     const y = doc.y;

//     doc.fontSize(9).font("Helvetica");
//     doc.text(`Name: ${user.fullName}`, 40, y);
//     doc.text(`Designation: ${user.designation}`, 300, y);

//     doc.text(`Headquarters: ${user.headquarters}`, 40, y + 14);
//     doc.text(`Month: ${journal.displayMonth}`, 300, y + 14);

//     doc.text(`Rate Of Pay: ${user.rateOfPay}`, 40, y + 28);
//     doc.text(`P.F.No: ${user.pfNumber}`, 300, y + 28);

//     doc.moveDown(3);

//     /* -------------------- TABLE -------------------- */

//     const rows = buildGA31Rows(journal.entries);

//     await doc.table(
//   {
//     headers: [
//       { label: "DATE", property: "date", width: 48 },
//       { label: "TRAIN", property: "trainNo", width: 45 },
//       { label: "DEP", property: "dep", width: 38 },
//       { label: "ARR", property: "arr", width: 38 },
//       { label: "FROM", property: "from", width: 42 },
//       { label: "TO", property: "to", width: 42 },
//       { label: "D/S", property: "day", width: 28 },
//       { label: "AMT", property: "rate", width: 38 },
//       { label: "OBJECT OF JOURNEY", property: "object", width: 156 }
//     ],
//     datas: rows
//   },
//   {
//     prepareHeader: () => doc.fontSize(7.5).font("Helvetica-Bold"),
//     prepareRow: () => doc.fontSize(7.5).font("Helvetica"),
//     padding: 3,
//     columnSpacing: 2
//   }
// );


//     /* -------------------- SUMMARY -------------------- */

//     const paidDays = journal.entries.filter(e => e.taRate).length;
//     const taRate = paidDays ? journal.entries.find(e => e.taRate).taRate : 0;
//     const totalAmount = paidDays * taRate;

//     doc.moveDown(1);
//     doc.fontSize(9).font("Helvetica-Bold");
//     doc.text(`Total No. of Working Days = ${paidDays} Days`);
//     doc.text(`100% TA Work = ${paidDays} Days x ${taRate} = ${totalAmount} /-`);
//     doc.text(`Total Amount = ${totalAmount}/-`);
//     doc.text(
//       `Total Amount in Words = ${toWords(totalAmount).toUpperCase()} RUPEES ONLY.`
//     );

//     /* -------------------- CERTIFICATE -------------------- */

//     doc.moveDown(1);
//     doc.fontSize(8).font("Helvetica");
//     doc.text("CERTIFICATE", { underline: true });

//     const certificates = [
//       "Certified that no TA/DA or any other remuneration has been drawn from any other source in respect of journeys performed on duty pass and also for the halts for which TA/DA has been claimed in this bill.",
//       "Certified that the officer was actually and not merely constructively in camp on Sunday/Holiday.",
//       "Certified that the officer/staff was absent on duty from H.Q. Station during the period.",
//       "Competent Authority’s sanction has been obtained for performing journey.",
//       "Certified that the expenses have actually been incurred in the discharge of railway duties and the amount has been spent in the interest of administration."
//     ];

//     certificates.forEach(c => {
//       doc.moveDown(0.4).text(`• ${c}`);
//     });

//     /* -------------------- FOOTER -------------------- */

//     doc.moveDown(3);
//     doc.text("Controlling Officer", 40);
//     doc.text("Head of Office", 240);
//     doc.text("Signature of Employee Claiming TA", 380);

//     doc.end();
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error generating TA PDF");
//   }
// };



const formatRailwayDate = (date) => {
  const d = new Date(date);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}-${mm}-${yy}`;
};

const buildGA31Rows = (entries) => {
  const rows = [];

  entries.forEach((entry) => {
    if (entry.isStay) {
      rows.push({
        date: formatRailwayDate(entry.date),
        trainNo: "",
        dep: "Stay",
        arr: "At",
        from: entry.fromStation || "",
        to: "",
        days: "1",
        rate: String(entry.taRate || 1000),
        object: entry.objectOfJourney || "",
      });
    } else {
      rows.push({
        date: formatRailwayDate(entry.date),
        trainNo: entry.trainNo || "",
        dep: entry.depTime || "",
        arr: entry.arrTime || "",
        from: entry.fromStation || "",
        to: entry.toStation || "",
        days: entry.taRate ? "1" : "-",
        rate: entry.taRate ? String(entry.taRate) : "-",
        object: entry.objectOfJourney || "",
      });
    }
  });

  return rows;
};

/* -------------------- Controller -------------------- */

export const generateTAPdf = async (req, res) => {
  try {
    const { monthYear } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    const journal = await Journal.findOne({ userId, monthYear });

    if (!user) return res.status(404).send("User not found");
    if (!journal) return res.status(404).send("Journal not found");

    const doc = new PDFDocument({ size: "A4", margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=TA_Journal_${journal.monthYear}.pdf`
    );

    doc.pipe(res);

    // Page dimensions
    const pageWidth = 595.28; // A4 width in points
    const marginLeft = 40;
    const marginRight = 40;
    const contentWidth = pageWidth - marginLeft - marginRight;

    /* -------------------- HEADER -------------------- */

    doc.fontSize(9).font("Helvetica").text("G.A 31", { align: "right" });
    doc.moveDown(0.5);
    
    doc.fontSize(14).font("Helvetica-Bold").text("SOUTH CENTRAL RAILWAY", { 
      align: "center" 
    });
    doc.fontSize(12).font("Helvetica-Bold").text("TRAVELLING ALLOWANCE JOURNAL", { 
      align: "center" 
    });
    doc.moveDown(1);

    /* -------------------- USER INFO SECTION -------------------- */

    const infoY = doc.y;
    const col1X = marginLeft;
    const col2X = pageWidth / 2 + 20;

    doc.fontSize(9).font("Helvetica");
    
    // Row 1
    doc.text(`Name: ${user.fullName.toUpperCase()}`, col1X, infoY);
    doc.text(`T.No.: `, col2X, infoY);
    doc.text(`Bill Unit No: ${user.billUnitNo || ""}`, col2X + 100, infoY);
    
    // Row 2
    doc.text(`Headquarters: ${user.headquarters}`, col1X, infoY + 14);
    doc.text(`Designation: ${user.designation}`, col2X, infoY + 14);
    doc.text(`P.F.No: ${user.pfNumber}`, col2X + 150, infoY + 14);
    
    // Row 3
    doc.text(`Rate Of Pay: ${user.rateOfPay}`, col1X, infoY + 28);
    doc.text(`Month: ${journal.displayMonth}`, col2X, infoY + 28);
    doc.text(`Division: ${user.division || ""}`, col2X + 150, infoY + 28);

    doc.moveDown(4);

    /* -------------------- CUSTOM TABLE WITH CENTERED LAYOUT -------------------- */

    const rows = buildGA31Rows(journal.entries);
    
    // Define column widths (total should fit within contentWidth)
    const colWidths = {
      date: 55,
      trainNo: 45,
      dep: 40,
      arr: 40,
      from: 45,
      to: 45,
      days: 35,
      rate: 40,
      object: 150
    };
    
    const totalTableWidth = Object.values(colWidths).reduce((a, b) => a + b, 0);
    const tableStartX = (pageWidth - totalTableWidth) / 2; // CENTER THE TABLE

    const drawTable = (startX, startY) => {
      let currentY = startY;
      const rowHeight = 18;
      const headerHeight = 32; // Taller for grouped headers

      // Draw grouped header row
      doc.font("Helvetica-Bold").fontSize(8);

      // Header backgrounds
      doc.rect(startX, currentY, totalTableWidth, headerHeight).stroke();

      // Column positions
      let x = startX;
      
      // DATE
      doc.rect(x, currentY, colWidths.date, headerHeight).stroke();
      doc.text("DATE", x + 5, currentY + 12, { width: colWidths.date - 10, align: "center" });
      x += colWidths.date;

      // TRAIN NO.
      doc.rect(x, currentY, colWidths.trainNo, headerHeight).stroke();
      doc.text("TRAIN\nNO.", x + 2, currentY + 6, { width: colWidths.trainNo - 4, align: "center" });
      x += colWidths.trainNo;

      // TIME (grouped: DEP | ARR)
      const timeWidth = colWidths.dep + colWidths.arr;
      doc.rect(x, currentY, timeWidth, headerHeight / 2).stroke();
      doc.text("TIME", x, currentY + 4, { width: timeWidth, align: "center" });
      
      doc.rect(x, currentY + headerHeight / 2, colWidths.dep, headerHeight / 2).stroke();
      doc.text("DEP", x + 2, currentY + headerHeight / 2 + 4, { width: colWidths.dep - 4, align: "center" });
      
      doc.rect(x + colWidths.dep, currentY + headerHeight / 2, colWidths.arr, headerHeight / 2).stroke();
      doc.text("ARR", x + colWidths.dep + 2, currentY + headerHeight / 2 + 4, { width: colWidths.arr - 4, align: "center" });
      x += timeWidth;

      // STATION (grouped: from | To)
      const stationWidth = colWidths.from + colWidths.to;
      doc.rect(x, currentY, stationWidth, headerHeight / 2).stroke();
      doc.text("STATION", x, currentY + 4, { width: stationWidth, align: "center" });
      
      doc.rect(x, currentY + headerHeight / 2, colWidths.from, headerHeight / 2).stroke();
      doc.text("from", x + 2, currentY + headerHeight / 2 + 4, { width: colWidths.from - 4, align: "center" });
      
      doc.rect(x + colWidths.from, currentY + headerHeight / 2, colWidths.to, headerHeight / 2).stroke();
      doc.text("To", x + colWidths.from + 2, currentY + headerHeight / 2 + 4, { width: colWidths.to - 4, align: "center" });
      x += stationWidth;

      // DAYS
      doc.rect(x, currentY, colWidths.days, headerHeight).stroke();
      doc.text("DAY\nS", x + 2, currentY + 6, { width: colWidths.days - 4, align: "center" });
      x += colWidths.days;

      // RATE
      doc.rect(x, currentY, colWidths.rate, headerHeight).stroke();
      doc.text("RATE", x + 2, currentY + 12, { width: colWidths.rate - 4, align: "center" });
      x += colWidths.rate;

      // OBJECT OF JOURNEY
      doc.rect(x, currentY, colWidths.object, headerHeight).stroke();
      doc.text("OBJECT OF JOURNEY", x + 5, currentY + 12, { width: colWidths.object - 10, align: "center" });

      currentY += headerHeight;

      // Draw data rows
      doc.font("Helvetica").fontSize(7.5);

      rows.forEach((row) => {
        let x = startX;

        // Check for page break
        if (currentY + rowHeight > doc.page.height - 100) {
          doc.addPage();
          currentY = 50;
        }

        // DATE
        doc.rect(x, currentY, colWidths.date, rowHeight).stroke();
        doc.text(row.date, x + 3, currentY + 5, { width: colWidths.date - 6 });
        x += colWidths.date;

        // TRAIN NO
        doc.rect(x, currentY, colWidths.trainNo, rowHeight).stroke();
        doc.text(row.trainNo, x + 3, currentY + 5, { width: colWidths.trainNo - 6, align: "center" });
        x += colWidths.trainNo;

        // DEP
        doc.rect(x, currentY, colWidths.dep, rowHeight).stroke();
        doc.text(row.dep, x + 2, currentY + 5, { width: colWidths.dep - 4, align: "center" });
        x += colWidths.dep;

        // ARR
        doc.rect(x, currentY, colWidths.arr, rowHeight).stroke();
        doc.text(row.arr, x + 2, currentY + 5, { width: colWidths.arr - 4, align: "center" });
        x += colWidths.arr;

        // FROM
        doc.rect(x, currentY, colWidths.from, rowHeight).stroke();
        doc.text(row.from, x + 2, currentY + 5, { width: colWidths.from - 4, align: "center" });
        x += colWidths.from;

        // TO
        doc.rect(x, currentY, colWidths.to, rowHeight).stroke();
        doc.text(row.to, x + 2, currentY + 5, { width: colWidths.to - 4, align: "center" });
        x += colWidths.to;

        // DAYS
        doc.rect(x, currentY, colWidths.days, rowHeight).stroke();
        doc.text(row.days, x + 2, currentY + 5, { width: colWidths.days - 4, align: "center" });
        x += colWidths.days;

        // RATE
        doc.rect(x, currentY, colWidths.rate, rowHeight).stroke();
        doc.text(row.rate, x + 2, currentY + 5, { width: colWidths.rate - 4, align: "center" });
        x += colWidths.rate;

        // OBJECT
        doc.rect(x, currentY, colWidths.object, rowHeight).stroke();
        doc.text(row.object, x + 3, currentY + 5, { width: colWidths.object - 6 });

        currentY += rowHeight;
      });

      return currentY;
    };

    const tableEndY = drawTable(tableStartX, doc.y);
    doc.y = tableEndY + 15;

    /* -------------------- SUMMARY -------------------- */

    const paidDays = journal.entries.filter((e) => e.taRate).length;
    const taRate = paidDays ? journal.entries.find((e) => e.taRate).taRate : 0;
    const totalAmount = paidDays * taRate;

    doc.fontSize(9).font("Helvetica-Bold");
    doc.text(`Total No. of Working Days = ${paidDays} Days`, marginLeft);
    doc.text(`100% TA Work = ${paidDays} Days x ${taRate} = ${totalAmount} /-`);
    doc.text(`Total Amount = ${totalAmount}/-`);
    doc.text(
      `Total Amount in Words = ${toWords(totalAmount).toUpperCase()} RUPEES ONLY.`
    );

    /* -------------------- CERTIFICATE -------------------- */

    doc.moveDown(1);
    doc.fontSize(9).font("Helvetica-Bold").text("CERTIFICATE", { underline: true });
    doc.moveDown(0.3);

    doc.fontSize(8).font("Helvetica");
    const certificates = [
      "Certified that no TA/DA or any other remuneration has been drawn from any other source in respect of journeys performed on duty pass and also for the halts for which TA/DA has been claimed in this bill.",
      "Certified that the officer was actually and not merely constructively in camp on Sunday/Holiday.",
      "Certified that the officer/staff was absent on duty from H.Q. Station during the period.",
      "Competent Authority's sanction has been obtained for performing journey.",
      "Certified that the expenses have actually been incurred in the discharge of railway duties and the amount has been spent in the interest of administration.",
      `I hereby certify that the above-mentioned ${user.fullName} was absent on duty from his headquarters station during the period charged for in the on-Railway Premises.`
    ];

    certificates.forEach((c) => {
      doc.text(`• ${c}`, marginLeft, doc.y, { 
        width: contentWidth,
        align: "justify" 
      });
      doc.moveDown(0.3);
    });

    /* -------------------- FOOTER SIGNATURES -------------------- */

    doc.moveDown(2);
    const sigY = doc.y;
    doc.fontSize(9).font("Helvetica");
    doc.text("Controlling Officer", marginLeft, sigY);
    doc.text("Head Office", pageWidth / 2 - 30, sigY);
    doc.text("Signature of Employee Claiming TA", pageWidth - marginRight - 160, sigY);

    doc.end();
  } catch (error) {
    console.error("PDF Generation Error:", error);
    res.status(500).send("Error generating TA PDF");
  }
};




export const deleteEntry = async (req, res) => {
  try {
    const { entryId } = req.params; // This is the _id of the specific entry (e.g., 6956c66d...)
    console.log(req.user)
    
    const userId = req.user.id || req.user._id; // Corrected: getting ID from the user object
    console.log(`Deleting entry ${entryId} for user ${userId}`);

    // Use $pull to remove the object from the entries array where _id matches
    const updatedJournal = await Journal.findOneAndUpdate(
      { userId: userId, "entries._id": entryId }, 
      { 
        $pull: { entries: { _id: entryId } } 
      },
      { new: true } // returns the updated document
    );

    if (!updatedJournal) {
      return res.status(404).json({
        status: false,
        message: "Entry not found or you don't have permission to delete it"
      });
    }

    return res.status(200).json({
      status: true,
      message: "Entry deleted successfully",
      data: updatedJournal
    });
    
  } catch (e) {
    console.error("Delete Error:", e.message);
    return res.status(500).json({
      status: false,
      message: e.message
    });
  }
};

// controllers/journalController.js

export const updateEntry = async (req, res) => {
  try {
    const { id } = req.params; // Entry ID from URL
    const userId = req.user.id || req.user._id || req.user.userId;
    
    // Destructure the updated fields from the request body
    const { 
      date, trainNo, depTime, arrTime, 
      fromStation, toStation, objectOfJourney, isStay 
    } = req.body;

    // We use "entries._id" in the filter to find the right sub-document
    // The "$" in the update object refers to the index of the entry found
    const updatedJournal = await Journal.findOneAndUpdate(
      { userId: userId, "entries._id": id },
      {
        $set: {
          "entries.$.date": date,
          "entries.$.trainNo": isStay ? "" : trainNo,
          "entries.$.depTime": isStay ? null : depTime,
          "entries.$.arrTime": isStay ? null : arrTime,
          "entries.$.fromStation": fromStation,
          "entries.$.toStation": isStay ? "" : toStation,
          "entries.$.objectOfJourney": objectOfJourney,
          "entries.$.isStay": isStay,
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedJournal) {
      return res.status(404).json({
        status: false,
        message: "Entry not found or you are not authorized"
      });
    }

    return res.status(200).json({
      status: true,
      message: "Entry updated successfully",
      data: updatedJournal
    });

  } catch (e) {
    console.error("Update Error:", e.message);
    return res.status(500).json({ status: false, message: e.message });
  }
};