import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

/**
 * Generate a PDF report matching the CERT-In & ICAN template.
 * Uses PDFKit for fast, in-process PDF generation (no browser needed).
 *
 * @param {Object} data - Form submission data (20 fields)
 * @returns {Promise<Buffer>} - PDF file as buffer
 */
export async function generatePDF(data) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 40, bottom: 40, left: 36, right: 36 },
        info: {
          Title: 'CERT-In & ICAN Indigenous Cybersecurity Product Report',
          Author: 'CERT-In & ICAN Registry Portal',
          Subject: `Product Submission: ${data.productName || 'N/A'}`,
        },
      });

      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

      // ── Header with logos ──
      const logosDir = path.join(process.cwd(), 'public', 'logos');
      const certinLogo = path.join(logosDir, 'certin-logo.png');
      const itelLogo = path.join(logosDir, 'itel-logo.png');
      const logoHeight = 40;

      if (fs.existsSync(certinLogo)) {
        try {
          doc.image(certinLogo, doc.page.margins.left, doc.y, { fit: [200, logoHeight] });
        } catch { }
      }

      if (fs.existsSync(itelLogo)) {
        try {
          doc.image(itelLogo, doc.page.margins.left, doc.y, { fit: [pageWidth, logoHeight], align: 'right' });
        } catch { }
      }

      doc.moveDown(3.5);

      // ── Title ──
      doc
        .font('Helvetica-Bold')
        .fontSize(13)
        .fillColor('#1a365d')
        .text('CERT-In & ICAN Joint Call for Information on', { align: 'center' })
        .text('Indigenous Cybersecurity Tools / Product', { align: 'center' })
        .text('– Information Report', { align: 'center' });

      doc.moveDown(0.3);

      // Orange divider line
      const dividerY = doc.y;
      doc
        .moveTo(doc.page.margins.left, dividerY)
        .lineTo(doc.page.margins.left + pageWidth, dividerY)
        .strokeColor('#f97316')
        .lineWidth(2.5)
        .stroke();

      doc.moveDown(0.6);

      // ── Subtitle ──
      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor('#555')
        .text(
          'This report is to be submitted as part of the initiative to identify, compile, showcase and promote indigenous cybersecurity products, platforms and solutions developed in India.',
          { align: 'left', lineGap: 2 }
        );

      doc.moveDown(0.8);

      // ── Section Header ──
      const sectionY = doc.y;
      doc
        .rect(doc.page.margins.left, sectionY, pageWidth, 20)
        .fill('#1a365d');
      doc
        .font('Helvetica-Bold')
        .fontSize(9)
        .fillColor('#ffffff')
        .text('1. PRODUCT / ORGANIZATION INFORMATION', doc.page.margins.left, sectionY + 5, {
          width: pageWidth,
          align: 'center',
        });

      doc.y = sectionY + 24;

      // ── Table Header ──
      const colNo = 30;
      const colInfo = 200;
      const colDetail = pageWidth - colNo - colInfo;
      const startX = doc.page.margins.left;

      const drawTableHeader = () => {
        const headerY = doc.y;
        doc.rect(startX, headerY, pageWidth, 18).fill('#f97316');
        doc
          .font('Helvetica-Bold')
          .fontSize(8)
          .fillColor('#ffffff');
        doc.text('No.', startX, headerY + 5, { width: colNo, align: 'center' });
        doc.text('Information Requested', startX + colNo, headerY + 5, { width: colInfo, align: 'center' });
        doc.text('Details (To be filled by Applicant)', startX + colNo + colInfo, headerY + 5, { width: colDetail, align: 'center' });
        doc.y = headerY + 18;
      };

      drawTableHeader();

      // ── Table Rows ──
      const rows = [
        ['1', 'Organization Name', data.organizationName || ''],
        ['2', 'Contact Person Name', data.contactPersonName || ''],
        ['3', 'Contact Email Address', data.contactEmail || ''],
        ['4', 'Product / Tool Name', data.productName || ''],
        ['5', 'Product Category', Array.isArray(data.productCategory) ? data.productCategory.join(', ') : (data.productCategory || '')],
        ['6', 'Specify Product Category (If Other)', data.productCategoryOther || 'N/A'],
        ['7', 'Deployment Model', data.deploymentModel || ''],
        ['8', 'Brief Description of the Product (Max 200 Words)', data.briefDescription || ''],
        ['9', 'Key Features and Capabilities', data.keyFeatures || ''],
        ['10', 'Percentage of Indigenous Content (%)', data.indigenousContent || ''],
        ['11', 'Details of Intellectual Property Ownership', data.ipOwnership || ''],
        ['12', 'Details of Foreign-Origin Components (if any)', data.foreignComponents || ''],
        ['13', 'Software Bill of Materials (SBOM) Availability', typeof data.sbomAvailability === 'boolean' ? (data.sbomAvailability ? 'Yes' : 'No') : ''],
        ['14', 'If Available, SBOM Format', data.sbomFormat || 'N/A'],
        ['15', 'Availability for Demonstration and PoC', typeof data.pocAvailability === 'boolean' ? (data.pocAvailability ? 'Yes' : 'No') : ''],
        ['16', 'Awards, Recognitions, or Certifications Received', data.awards || 'N/A'],
        ['17', 'Product Benchmarking & References', data.benchmarking || 'N/A'],
        ['18', 'Existing Deployments / Installations', data.deployments || 'N/A'],
        ['19', 'AI-Assisted VA & Source Code Assessment', data.aiAssessment || ''],
        ['20', 'Responsible Vulnerability Disclosure (RVD) Policy', typeof data.rvdPolicy === 'boolean' ? (data.rvdPolicy ? 'Yes' : 'No') : ''],
      ];

      for (let i = 0; i < rows.length; i++) {
        const [no, info, detail] = rows[i];

        // Measure text heights to determine row height
        const infoH = doc.heightOfString(info, { width: colInfo - 10, font: 'Helvetica-Bold', fontSize: 8 });
        const detailH = doc.heightOfString(detail || ' ', { width: colDetail - 10, font: 'Helvetica', fontSize: 8 });
        const rowH = Math.max(infoH, detailH, 14) + 8;

        // Check if we need a new page
        if (doc.y + rowH > doc.page.height - doc.page.margins.bottom - 30) {
          doc.addPage();
          drawTableHeader();
        }

        const rowY = doc.y;

        // Alternating row background
        if (i % 2 === 1) {
          doc.rect(startX, rowY, pageWidth, rowH).fill('#f8fafc');
        }

        // Cell borders
        doc.rect(startX, rowY, pageWidth, rowH).stroke('#cccccc');
        // Vertical lines
        doc.moveTo(startX + colNo, rowY).lineTo(startX + colNo, rowY + rowH).stroke('#cccccc');
        doc.moveTo(startX + colNo + colInfo, rowY).lineTo(startX + colNo + colInfo, rowY + rowH).stroke('#cccccc');

        // Cell text
        doc.font('Helvetica-Bold').fontSize(8).fillColor('#222');
        doc.text(no + '.', startX + 2, rowY + 4, { width: colNo - 4, align: 'center' });

        doc.font('Helvetica-Bold').fontSize(8).fillColor('#333');
        doc.text(info, startX + colNo + 5, rowY + 4, { width: colInfo - 10 });

        doc.font('Helvetica').fontSize(8).fillColor('#222');
        doc.text(detail || '', startX + colNo + colInfo + 5, rowY + 4, { width: colDetail - 10 });

        doc.y = rowY + rowH;
      }

      // ── Footer ──
      doc.moveDown(1.5);
      const footerY = doc.y;
      doc
        .moveTo(doc.page.margins.left, footerY)
        .lineTo(doc.page.margins.left + pageWidth, footerY)
        .strokeColor('#dddddd')
        .lineWidth(0.5)
        .stroke();
      doc.moveDown(0.5);
      doc
        .font('Helvetica')
        .fontSize(7)
        .fillColor('#888')
        .text(
          `Generated by CERT-In & ICAN Indigenous Cybersecurity Products Initiative | ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`,
          { align: 'center' }
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
