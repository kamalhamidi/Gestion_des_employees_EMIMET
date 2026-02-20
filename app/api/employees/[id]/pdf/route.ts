import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jsPDF } from "jspdf";
import { formatCurrency, formatShortDate } from "@/lib/utils";
import { auth } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const employee = await db.employee.findUnique({
            where: { id: params.id, isDeleted: false },
            include: {
                sector: true,
                function: true,
                workdays: {
                    orderBy: { date: "desc" },
                },
                advances: {
                    orderBy: { createdAt: "desc" },
                },
            },
        });

        if (!employee) {
            return NextResponse.json({ error: "Employee not found" }, { status: 404 });
        }

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        const contentWidth = pageWidth - margin * 2;
        let y = 20;

        // Colors
        const primaryColor: [number, number, number] = [41, 98, 255];
        const darkColor: [number, number, number] = [30, 30, 30];
        const grayColor: [number, number, number] = [120, 120, 120];
        const lightBg: [number, number, number] = [245, 247, 250];

        // ===== HEADER =====
        // Blue header bar
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, pageWidth, 45, "F");

        // Company name
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("EMIMET", margin, 20);

        // Document title
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.text("Fiche Employé / Employee Record", margin, 32);

        // Date on the right
        doc.setFontSize(9);
        const dateStr = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
        doc.text(dateStr, pageWidth - margin, 32, { align: "right" });

        y = 55;

        // ===== EMPLOYEE NAME SECTION =====
        doc.setTextColor(...darkColor);
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text(`${employee.firstName} ${employee.lastName}`, margin, y);
        y += 7;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...grayColor);
        doc.text(`ID: ${employee.employeeId}`, margin, y);

        // Status badge
        const statusText = employee.employmentStatus === "ACTIVE" ? "ACTIF" : "INACTIF";
        const statusColor: [number, number, number] = employee.employmentStatus === "ACTIVE" ? [34, 197, 94] : [156, 163, 175];
        const statusWidth = doc.getTextWidth(statusText) + 10;
        doc.setFillColor(...statusColor);
        doc.roundedRect(pageWidth - margin - statusWidth, y - 7, statusWidth, 10, 2, 2, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text(statusText, pageWidth - margin - statusWidth + 5, y - 0.5);

        y += 15;

        // ===== HELPER FUNCTIONS =====
        const drawSectionTitle = (title: string) => {
            checkPageBreak(15);
            doc.setFillColor(...primaryColor);
            doc.rect(margin, y - 1, 4, 8, "F");
            doc.setTextColor(...darkColor);
            doc.setFontSize(13);
            doc.setFont("helvetica", "bold");
            doc.text(title, margin + 8, y + 5);
            y += 14;
        };

        const drawField = (label: string, value: string, xOffset = 0, width = contentWidth) => {
            checkPageBreak(12);
            doc.setTextColor(...grayColor);
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.text(label, margin + xOffset, y);
            y += 5;
            doc.setTextColor(...darkColor);
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(value || "—", margin + xOffset, y);
            y += 8;
        };

        const drawFieldRow = (label1: string, value1: string, label2: string, value2: string) => {
            checkPageBreak(14);
            const halfWidth = contentWidth / 2;
            const savedY = y;

            doc.setTextColor(...grayColor);
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.text(label1, margin, y);
            doc.text(label2, margin + halfWidth, y);
            y += 5;
            doc.setTextColor(...darkColor);
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(value1 || "—", margin, y);
            doc.text(value2 || "—", margin + halfWidth, y);
            y += 8;
        };

        const drawSeparator = () => {
            doc.setDrawColor(230, 230, 230);
            doc.setLineWidth(0.3);
            doc.line(margin, y, pageWidth - margin, y);
            y += 6;
        };

        function checkPageBreak(needed: number) {
            if (y + needed > doc.internal.pageSize.getHeight() - 20) {
                doc.addPage();
                y = 20;
            }
        }

        // ===== PERSONAL INFORMATION =====
        drawSectionTitle("Informations Personnelles");

        drawFieldRow("CIN", employee.cin, "Date de Naissance", formatShortDate(employee.dateOfBirth));
        drawFieldRow("Téléphone", employee.phoneNumber, "Date d'Embauche", formatShortDate(employee.joinDate));
        drawField("Adresse", employee.address);

        drawSeparator();

        // ===== EMPLOYMENT DETAILS =====
        drawSectionTitle("Détails d'Emploi");

        drawFieldRow("Secteur", employee.sector.name, "Fonction", employee.function.name);
        drawFieldRow("Salaire Journalier", formatCurrency(employee.dailySalary), "Statut", statusText);

        drawSeparator();

        // ===== SALARY SUMMARY =====
        drawSectionTitle("Résumé Salarial");

        const totalWorkedDays = employee.workdays.length;
        const totalGrossSalary = employee.workdays.reduce((sum, w) => sum + employee.dailySalary * w.multiplier, 0);
        const totalAdvances = employee.advanceAmount;
        const netSalary = totalGrossSalary - totalAdvances;

        // Summary boxes
        checkPageBreak(30);
        const boxWidth = (contentWidth - 10) / 3;
        const boxes = [
            { label: "Jours Travaillés", value: totalWorkedDays.toString(), color: primaryColor },
            { label: "Salaire Brut", value: formatCurrency(totalGrossSalary), color: [34, 197, 94] as [number, number, number] },
            { label: "Salaire Net", value: formatCurrency(netSalary), color: [234, 88, 12] as [number, number, number] },
        ];

        boxes.forEach((box, i) => {
            const x = margin + i * (boxWidth + 5);
            doc.setFillColor(box.color[0], box.color[1], box.color[2]);
            doc.roundedRect(x, y, boxWidth, 25, 3, 3, "F");
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.text(box.label, x + boxWidth / 2, y + 8, { align: "center" });
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text(box.value, x + boxWidth / 2, y + 19, { align: "center" });
        });
        y += 33;

        // Advance amount row
        drawFieldRow("Montant des Avances", formatCurrency(totalAdvances), "", "");

        drawSeparator();

        // ===== WORK HISTORY TABLE =====
        if (employee.workdays.length > 0) {
            drawSectionTitle("Historique de Travail");

            // Table header
            checkPageBreak(12);
            doc.setFillColor(...lightBg);
            doc.rect(margin, y - 2, contentWidth, 10, "F");
            doc.setTextColor(...grayColor);
            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");
            doc.text("DATE", margin + 3, y + 4);
            doc.text("MULTIPLICATEUR", margin + 60, y + 4);
            doc.text("MONTANT", margin + 120, y + 4);
            y += 12;

            // Table rows (show last 30)
            const workdaysToShow = employee.workdays.slice(0, 30);
            workdaysToShow.forEach((w, i) => {
                checkPageBreak(10);
                if (i % 2 === 0) {
                    doc.setFillColor(252, 252, 253);
                    doc.rect(margin, y - 4, contentWidth, 8, "F");
                }
                doc.setTextColor(...darkColor);
                doc.setFontSize(9);
                doc.setFont("helvetica", "normal");
                doc.text(formatShortDate(w.date), margin + 3, y);
                doc.text(`${w.multiplier}x`, margin + 60, y);
                doc.text(formatCurrency(employee.dailySalary * w.multiplier), margin + 120, y);
                y += 8;
            });

            if (employee.workdays.length > 30) {
                doc.setTextColor(...grayColor);
                doc.setFontSize(8);
                doc.text(`... et ${employee.workdays.length - 30} jours supplémentaires`, margin + 3, y);
                y += 8;
            }

            drawSeparator();
        }

        // ===== ADVANCES HISTORY =====
        if (employee.advances && employee.advances.length > 0) {
            drawSectionTitle("Historique des Avances");

            checkPageBreak(12);
            doc.setFillColor(...lightBg);
            doc.rect(margin, y - 2, contentWidth, 10, "F");
            doc.setTextColor(...grayColor);
            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");
            doc.text("DATE", margin + 3, y + 4);
            doc.text("MONTANT", margin + 60, y + 4);
            doc.text("NOTES", margin + 110, y + 4);
            y += 12;

            employee.advances.forEach((adv: any, i: number) => {
                checkPageBreak(10);
                if (i % 2 === 0) {
                    doc.setFillColor(252, 252, 253);
                    doc.rect(margin, y - 4, contentWidth, 8, "F");
                }
                doc.setTextColor(...darkColor);
                doc.setFontSize(9);
                doc.setFont("helvetica", "normal");
                doc.text(formatShortDate(adv.createdAt), margin + 3, y);
                doc.text(formatCurrency(adv.amount), margin + 60, y);
                const notes = (adv.notes || "—").substring(0, 30);
                doc.text(notes, margin + 110, y);
                y += 8;
            });

            drawSeparator();
        }

        // ===== NOTES =====
        if (employee.notes) {
            drawSectionTitle("Notes");
            checkPageBreak(15);
            doc.setTextColor(...darkColor);
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            const splitNotes = doc.splitTextToSize(employee.notes, contentWidth);
            doc.text(splitNotes, margin, y);
            y += splitNotes.length * 5 + 5;
        }

        // ===== FOOTER =====
        const totalPages = doc.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            const pageHeight = doc.internal.pageSize.getHeight();
            doc.setDrawColor(230, 230, 230);
            doc.setLineWidth(0.3);
            doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
            doc.setTextColor(...grayColor);
            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.text("EMIMET — Gestion des Employés", margin, pageHeight - 8);
            doc.text(`Page ${i}/${totalPages}`, pageWidth - margin, pageHeight - 8, { align: "right" });
        }

        // Generate PDF buffer
        const pdfOutput = doc.output("arraybuffer");
        const fileName = `${employee.firstName}_${employee.lastName}_${employee.employeeId}.pdf`;

        return new NextResponse(Buffer.from(pdfOutput), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${fileName}"`,
            },
        });
    } catch (error) {
        console.error("PDF generation error:", error);
        return NextResponse.json(
            { error: "Failed to generate PDF" },
            { status: 500 }
        );
    }
}
