const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const { getPool } = require('../config/db');

class PDFService {
    /**
     * Add professional header to PDF document with title and reference number
     * @private
     * @param {PDFDocument} pdf - PDFKit document instance
     * @param {string} title - Document title to display
     * @param {string} referenceNumber - Reference number (tender/offer/etc)
     * @returns {void}
     */
    addHeader(pdf, title, referenceNumber) {
        pdf.fontSize(14).font('Helvetica-Bold').text('MyNet.tn', { align: 'left' });
        pdf.fontSize(9).text('Platform de Gestion des Marchés Publics', { align: 'left' });
        pdf.moveUp(0.8);
        pdf.fontSize(16).font('Helvetica-Bold').text(title, { align: 'right' });
        pdf.fontSize(10).text(`الرقم المرجعي: ${referenceNumber}`, { align: 'right' });
        pdf.moveTo(50, pdf.y + 10).lineTo(550, pdf.y + 10).stroke();
        pdf.moveDown(1);
    }

    /**
     * Add footer with company info, page number, generation date, and confidentiality notice
     * @private
     * @param {PDFDocument} pdf - PDFKit document instance
     * @param {number} pageNum - Current page number
     * @returns {void}
     */
    addFooter(pdf, pageNum) {
        pdf.moveTo(50, pdf.page.height - 70).lineTo(550, pdf.page.height - 70).stroke();
        pdf.fontSize(8);
        pdf.text('MyNet.tn - نظام إدارة المناقصات والمشتريات', 50, pdf.page.height - 60, { align: 'center' });
        pdf.text(`صفحة ${pageNum}`, pdf.page.width / 2, pdf.page.height - 50, { align: 'center' });
        pdf.text(`تاريخ التوليد: ${new Date().toLocaleString('ar-TN')}`, pdf.page.width / 2, pdf.page.height - 40, { align: 'center' });
        pdf.text('وثيقة سرية - قابلة للتدقيق والتحقق', pdf.page.width / 2, pdf.page.height - 30, { align: 'center' });
    }

    /**
     * Add draft watermark to PDF (diagonal text behind content)
     * @private
     * @param {PDFDocument} pdf - PDFKit document instance
     * @param {string} text - Watermark text to display
     * @param {boolean} [isDraft=false] - Only add watermark if true
     * @returns {void}
     */
    addWatermark(pdf, text, isDraft = false) {
        if (!isDraft) return;
        
        const fontSize = 60;
        const opacity = 0.1;
        
        pdf.save();
        pdf.opacity(opacity);
        pdf.fontSize(fontSize).font('Helvetica-Bold').rotate(-45, {
            origin: [pdf.page.width / 2, pdf.page.height / 2]
        }).text('مسودة - DRAFT', {
            align: 'center',
            valign: 'center'
        });
        pdf.restore();
    }

    /**
     * Add QR code image to PDF at specified coordinates
     * @async
     * @private
     * @param {PDFDocument} pdf - PDFKit document instance
     * @param {string} url - URL to encode in QR code
     * @param {number} x - X coordinate for QR code placement
     * @param {number} y - Y coordinate for QR code placement
     * @param {number} [size=100] - QR code size in pixels
     * @returns {Promise<void>}
     */
    async addQRCode(pdf, url, x, y, size = 100) {
        try {
            const qrCode = await QRCode.toDataURL(url, { width: size });
            pdf.image(qrCode, x, y, { width: size, height: size });
        } catch (error) {
            // QR code generation failed - continue without it
        }
    }

    /**
     * Create professional table in PDF with header and alternating row colors
     * @private
     * @param {PDFDocument} pdf - PDFKit document instance
     * @param {Array} data - Array of row data objects
     * @param {Array} columns - Column names to display
     * @param {Object} [options={}] - Table formatting options
     * @param {number} [options.startX=50] - Starting X coordinate
     * @param {number} [options.startY=pdf.y] - Starting Y coordinate
     * @param {number} [options.width=500] - Table width
     * @param {number} [options.rowHeight=25] - Height of each row
     * @returns {number} Y coordinate after table
     */
    createTable(pdf, data, columns, options = {}) {
        const { startX = 50, startY = pdf.y, width = 500, rowHeight = 25 } = options;
        const columnWidth = width / columns.length;

        // رأس الجدول
        pdf.fillColor('#2c3e50').rect(startX, startY, width, rowHeight).fill();
        pdf.fillColor('white').fontSize(10).font('Helvetica-Bold');

        columns.forEach((col, i) => {
            pdf.text(col, startX + (i * columnWidth) + 5, startY + 5, {
                width: columnWidth - 10,
                align: 'right'
            });
        });

        // صفوف الجدول
        pdf.fillColor('black').font('Helvetica').fontSize(9);
        let currentY = startY + rowHeight;
        let rowCount = 0;

        data.forEach((row, idx) => {
            // فاصل صفحات إذا لزم الأمر
            if (currentY > pdf.page.height - 100) {
                pdf.addPage();
                currentY = 50;
                this.addFooter(pdf, pdf.bufferedPageRange().count);
            }

            const isEvenRow = idx % 2 === 0;
            if (isEvenRow) {
                pdf.fillColor('#ecf0f1').rect(startX, currentY, width, rowHeight).fill();
                pdf.fillColor('black');
            }

            columns.forEach((col, i) => {
                const value = row[col.toLowerCase().replace(/\s+/g, '_')] || '';
                pdf.text(String(value), startX + (i * columnWidth) + 5, currentY + 5, {
                    width: columnWidth - 10,
                    align: 'right'
                });
            });

            currentY += rowHeight;
        });

        return currentY;
    }

    /**
     * Generate tender document PDF with all tender details
     * @async
     * @param {string} tenderId - ID of tender to generate document for
     * @param {boolean} [isDraft=false] - Mark document as draft
     * @returns {Promise<PDFDocument>} Generated PDF document stream
     * @throws {Error} When tender not found or generation fails
     */
    async generateTenderDocument(tenderId, isDraft = false) {
        const pool = getPool();

        try {
            const result = await pool.query(
                `SELECT t.*, u.company_name, u.full_name, u.phone, u.email
                 FROM tenders t
                 LEFT JOIN users u ON t.buyer_id = u.id
                 WHERE t.id = $1`,
                [tenderId]
            );

            if (result.rows.length === 0) {
                throw new Error('Tender not found');
            }

            const tender = result.rows[0];
            const pdf = new PDFDocument({
                size: 'A4',
                margin: 50,
                bufferPages: true
            });

            // رأس
            this.addHeader(pdf, 'وثيقة المناقصة', tender.tender_number);
            this.addWatermark(pdf, 'DRAFT', isDraft);

            // معلومات أساسية
            pdf.fontSize(11).font('Helvetica-Bold').text('المعلومات الأساسية', { align: 'right' });
            pdf.moveDown(0.3);

            const basicInfo = [
                { label: 'العنوان:', value: tender.title },
                { label: 'الفئة:', value: tender.category },
                { label: 'الحالة:', value: tender.status },
                { label: 'العملة:', value: tender.currency }
            ];

            pdf.fontSize(10).font('Helvetica');
            basicInfo.forEach(item => {
                pdf.text(`${item.label} ${item.value}`, { align: 'right' });
                pdf.moveDown(0.3);
            });
            pdf.moveDown(0.5);

            // معلومات مالية
            pdf.fontSize(11).font('Helvetica-Bold').text('البيانات المالية', { align: 'right' });
            pdf.moveDown(0.3);
            pdf.fontSize(10).font('Helvetica');
            pdf.text(`الميزانية الدنيا: ${tender.budget_min} ${tender.currency}`, { align: 'right' });
            pdf.text(`الميزانية العليا: ${tender.budget_max} ${tender.currency}`, { align: 'right' });
            pdf.moveDown(0.5);

            // التواريخ
            pdf.fontSize(11).font('Helvetica-Bold').text('التواريخ الحرجة', { align: 'right' });
            pdf.moveDown(0.3);
            pdf.fontSize(10).font('Helvetica');
            pdf.text(`النشر: ${new Date(tender.publish_date).toLocaleDateString('ar-TN')}`, { align: 'right' });
            pdf.text(`الإغلاق: ${new Date(tender.deadline).toLocaleDateString('ar-TN')}`, { align: 'right' });
            pdf.text(`الفتح: ${new Date(tender.opening_date).toLocaleDateString('ar-TN')}`, { align: 'right' });
            pdf.moveDown(1);

            // معلومات المشتري
            pdf.fontSize(11).font('Helvetica-Bold').text('معلومات المشتري', { align: 'right' });
            pdf.moveDown(0.3);
            pdf.fontSize(10).font('Helvetica');
            pdf.text(`الشركة: ${tender.company_name}`, { align: 'right' });
            pdf.text(`المسؤول: ${tender.full_name}`, { align: 'right' });
            pdf.text(`الهاتف: ${tender.phone}`, { align: 'right' });
            pdf.text(`البريد: ${tender.email}`, { align: 'right' });
            pdf.moveDown(1);

            // QR Code للتحقق
            const verifyUrl = `https://mynet.tn/verify/tender/${tenderId}`;
            await this.addQRCode(pdf, verifyUrl, pdf.page.width - 150, pdf.y, 80);
            pdf.fontSize(8).text('امسح هذا الرمز للتحقق من صحة الوثيقة', 
                pdf.page.width - 150, pdf.y + 85, { width: 100, align: 'center' });

            // تذييل
            this.addFooter(pdf, 1);

            return pdf;
        } catch (error) {
            throw new Error(`Failed to generate tender PDF: ${error.message}`);
        }
    }

    /**
     * Generate offer evaluation report PDF with scoring and recommendation
     * @async
     * @param {string} offerId - ID of offer to generate report for
     * @param {boolean} [isDraft=false] - Mark document as draft
     * @returns {Promise<PDFDocument>} Generated PDF document stream
     * @throws {Error} When offer not found or generation fails
     */
    async generateOfferEvaluationReport(offerId, isDraft = false) {
        const pool = getPool();

        try {
            const result = await pool.query(
                `SELECT o.*, t.title as tender_title, t.tender_number,
                        s.company_name as supplier_name, s.average_rating
                 FROM offers o
                 LEFT JOIN tenders t ON o.tender_id = t.id
                 LEFT JOIN users s ON o.supplier_id = s.id
                 WHERE o.id = $1`,
                [offerId]
            );

            if (result.rows.length === 0) {
                throw new Error('Offer not found');
            }

            const offer = result.rows[0];
            const pdf = new PDFDocument({
                size: 'A4',
                margin: 50,
                bufferPages: true
            });

            // رأس
            this.addHeader(pdf, 'تقرير تقييم العرض', offer.offer_number);
            this.addWatermark(pdf, 'DRAFT', isDraft);

            // بيانات العرض
            pdf.fontSize(11).font('Helvetica-Bold').text('بيانات العرض', { align: 'right' });
            pdf.moveDown(0.3);
            pdf.fontSize(10).font('Helvetica');
            
            const offerData = [
                { label: 'المناقصة:', value: `${offer.tender_number} - ${offer.tender_title}` },
                { label: 'المورد:', value: offer.supplier_name },
                { label: 'التقييم:', value: `${offer.average_rating}/5 نجوم` },
                { label: 'المبلغ:', value: `${offer.total_amount} TND` },
                { label: 'وقت التسليم:', value: offer.delivery_time },
                { label: 'شروط الدفع:', value: offer.payment_terms },
                { label: 'الحالة:', value: offer.status },
                { label: 'درجة التقييم:', value: offer.evaluation_score || 'قيد التقييم' },
                { label: 'الملاحظات:', value: offer.evaluation_notes || 'بدون ملاحظات' }
            ];

            offerData.forEach(item => {
                pdf.text(`${item.label} ${item.value}`, { align: 'right' });
                pdf.moveDown(0.3);
            });
            pdf.moveDown(1);

            // حالة الترسية
            if (offer.is_winner) {
                pdf.fillColor('green').fontSize(12).font('Helvetica-Bold')
                    .text('✓ هذا العرض فائز', { align: 'center' });
            } else {
                pdf.fillColor('red').fontSize(12).font('Helvetica-Bold')
                    .text('✗ هذا العرض لم يفز', { align: 'center' });
            }
            pdf.fillColor('black');

            // QR Code
            const verifyUrl = `https://mynet.tn/verify/offer/${offerId}`;
            await this.addQRCode(pdf, verifyUrl, pdf.page.width - 150, pdf.y + 30, 80);
            pdf.fontSize(8).text('امسح هنا للتحقق', 
                pdf.page.width - 150, pdf.y + 110, { width: 100, align: 'center' });

            // تذييل
            this.addFooter(pdf, 1);

            return pdf;
        } catch (error) {
            throw new Error(`Failed to generate evaluation report: ${error.message}`);
        }
    }

    /**
     * Generate award certificate PDF for winning supplier
     * @async
     * @param {string} tenderId - ID of tender
     * @param {string} supplierId - ID of awarded supplier
     * @returns {Promise<PDFDocument>} Generated certificate PDF document
     * @throws {Error} When data not found or generation fails
     */
    async generateAwardCertificate(tenderId, supplierId) {
        const pool = getPool();

        try {
            const result = await pool.query(
                `SELECT t.title, t.tender_number, u.company_name
                 FROM tenders t
                 LEFT JOIN users u ON u.id = $1
                 WHERE t.id = $2`,
                [supplierId, tenderId]
            );

            if (result.rows.length === 0) {
                throw new Error('Data not found');
            }

            const data = result.rows[0];
            const pdf = new PDFDocument({
                size: 'A4',
                margin: 60,
                bufferPages: true
            });

            // عنوان احترافي
            pdf.fontSize(32).font('Helvetica-Bold').text('🏆', { align: 'center' });
            pdf.fontSize(24).text('شهادة الترسية', { align: 'center' });
            pdf.fontSize(10).text('═══════════════════════════════════', { align: 'center' });
            pdf.moveDown(1);

            // النص الرئيسي
            pdf.fontSize(12).font('Helvetica');
            pdf.text('تشهد هذه الشهادة بأن:', { align: 'center' });
            pdf.moveDown(0.5);

            pdf.fontSize(16).font('Helvetica-Bold').text(data.company_name, { align: 'center' });
            pdf.moveDown(0.5);

            pdf.fontSize(12).font('Helvetica');
            pdf.text('فاز بالمناقصة:', { align: 'center' });
            pdf.fontSize(14).font('Helvetica-Bold').text(data.tender_number, { align: 'center' });
            pdf.moveDown(0.3);

            pdf.fontSize(12).font('Helvetica');
            pdf.text('الموضوع:', { align: 'center' });
            pdf.fontSize(13).font('Helvetica-Bold').text(data.title, { align: 'center' });
            pdf.moveDown(2);

            // التاريخ
            pdf.fontSize(11).text(`تاريخ الترسية: ${new Date().toLocaleDateString('ar-TN')}`, { align: 'center' });
            pdf.moveDown(2);

            // QR Code
            const verifyUrl = `https://mynet.tn/verify/award/${tenderId}/${supplierId}`;
            await this.addQRCode(pdf, verifyUrl, (pdf.page.width - 100) / 2, pdf.y, 100);

            // توقيع
            pdf.moveDown(3);
            pdf.fontSize(10).text('_____________________', { align: 'center' });
            pdf.fontSize(9).text('التوقيع الرسمي', { align: 'center' });

            // تذييل
            this.addFooter(pdf, 1);

            return pdf;
        } catch (error) {
            throw new Error(`Failed to generate certificate: ${error.message}`);
        }
    }

    /**
     * Generate transaction report PDF for supplier showing all offers in date range
     * @async
     * @param {string} supplierId - ID of supplier
     * @param {Date} startDate - Report start date
     * @param {Date} endDate - Report end date
     * @returns {Promise<PDFDocument>} Generated report PDF document
     * @throws {Error} When database query fails or report generation fails
     */
    async generateTransactionReport(supplierId, startDate, endDate) {
        const pool = getPool();

        try {
            const offersResult = await pool.query(
                `SELECT o.offer_number, t.title, o.total_amount, o.status, o.created_at
                 FROM offers o
                 LEFT JOIN tenders t ON o.tender_id = t.id
                 WHERE o.supplier_id = $1 
                 AND o.created_at BETWEEN $2 AND $3
                 ORDER BY o.created_at DESC`,
                [supplierId, startDate, endDate]
            );

            const pdf = new PDFDocument({
                size: 'A4',
                margin: 50,
                bufferPages: true
            });

            // رأس
            this.addHeader(pdf, 'تقرير سجل المعاملات', `${startDate} إلى ${endDate}`);

            // ملخص
            pdf.fontSize(11).font('Helvetica-Bold').text('ملخص المعاملات', { align: 'right' });
            pdf.moveDown(0.3);
            pdf.fontSize(10).font('Helvetica');
            pdf.text(`إجمالي العروض: ${offersResult.rows.length}`, { align: 'right' });
            pdf.text(`الفترة: من ${startDate} إلى ${endDate}`, { align: 'right' });
            pdf.moveDown(1);

            // جدول العروض
            if (offersResult.rows.length > 0) {
                const tableData = offersResult.rows.map(row => ({
                    offer_number: row.offer_number,
                    title: row.title,
                    amount: `${row.total_amount} TND`,
                    status: row.status,
                    date: new Date(row.created_at).toLocaleDateString('ar-TN')
                }));

                this.createTable(pdf, tableData, 
                    ['رقم العرض', 'المناقصة', 'المبلغ', 'الحالة', 'التاريخ'],
                    { width: 500, rowHeight: 20 }
                );
            }

            pdf.moveDown(2);
            pdf.fontSize(9).text(`تم إنشاء التقرير: ${new Date().toLocaleString('ar-TN')}`, { align: 'center' });

            // تذييل
            this.addFooter(pdf, 1);

            return pdf;
        } catch (error) {
            throw new Error(`Failed to generate transaction report: ${error.message}`);
        }
    }
}

module.exports = new PDFService();
