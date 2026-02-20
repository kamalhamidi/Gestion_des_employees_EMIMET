import { SalaryCalculation } from "./salary";
import { format, eachDayOfInterval, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

export interface DetailedSalaryData {
    employeeId: string;
    employeeName: string;
    dailySalary: number;
    workedDaysMap: Record<string, number>; // date string -> multiplier
    workedDays: number;
    grossSalary: number;
}

/**
 * Generate a detailed attendance-matrix CSV report
 * Columns: N° | Nom | Day1 | Day2 | ... | DayN | Jours Travaillés | Salaire Brut (MAD)
 * Rows: one per employee
 * Cells: multiplier value if worked, empty if not
 */
export function generateDetailedCSV(
    data: DetailedSalaryData[],
    startDate: string,
    endDate: string
): string {
    const start = parseISO(startDate);
    const end = parseISO(endDate);

    // Generate all dates in the range
    const allDates = eachDayOfInterval({ start, end });
    const dateKeys = allDates.map((d) => format(d, "yyyy-MM-dd"));
    const dateHeaders = allDates.map((d) => format(d, "dd/MM", { locale: fr }));

    // Day names for sub-header (Lun, Mar, Mer, etc.)
    const dayNames = allDates.map((d) =>
        format(d, "EEE", { locale: fr }).replace(".", "")
    );

    const lines: string[] = [];

    // === Title section ===
    lines.push(escapeRow(["RAPPORT DE SALAIRE DÉTAILLÉ — EMIMET Construction"]));
    lines.push(
        escapeRow([
            `Période: ${format(start, "dd/MM/yyyy")} au ${format(end, "dd/MM/yyyy")}`,
        ])
    );
    lines.push(
        escapeRow([
            `Généré le: ${format(new Date(), "dd/MM/yyyy à HH:mm", { locale: fr })}`,
        ])
    );
    lines.push(escapeRow([`Nombre d'employés: ${data.length}`]));
    lines.push(""); // empty separator

    // === Day names sub-header ===
    const dayNameRow = ["", "", ...dayNames, "", ""];
    lines.push(escapeRow(dayNameRow));

    // === Main header ===
    const headers = [
        "N°",
        "Nom Complet",
        ...dateHeaders,
        "Jours Travaillés",
        "Salaire Brut (MAD)",
    ];
    lines.push(escapeRow(headers));

    // === Data rows ===
    let totalWorkedDays = 0;
    let totalGrossSalary = 0;
    const dailyTotals: number[] = new Array(dateKeys.length).fill(0);

    // Sort employees alphabetically
    const sortedData = [...data].sort((a, b) =>
        a.employeeName.localeCompare(b.employeeName, "fr")
    );

    sortedData.forEach((employee, index) => {
        const row: string[] = [];
        row.push((index + 1).toString()); // N°
        row.push(employee.employeeName);

        // Day cells: show multiplier if worked, empty if not
        dateKeys.forEach((dateKey, di) => {
            const multiplier = employee.workedDaysMap[dateKey];
            if (multiplier !== undefined) {
                row.push(multiplier === 1 ? "✓" : `✓ x${multiplier}`);
                dailyTotals[di]++;
            } else {
                row.push("");
            }
        });

        row.push(employee.workedDays.toString());
        row.push(employee.grossSalary.toFixed(2));

        totalWorkedDays += employee.workedDays;
        totalGrossSalary += employee.grossSalary;

        lines.push(escapeRow(row));
    });

    // === Separator ===
    lines.push("");

    // === Totals footer row ===
    const totalsRow: string[] = [];
    totalsRow.push("");
    totalsRow.push("TOTAL");
    dateKeys.forEach((_, di) => {
        totalsRow.push(dailyTotals[di] > 0 ? dailyTotals[di].toString() : "");
    });
    totalsRow.push(totalWorkedDays.toString());
    totalsRow.push(totalGrossSalary.toFixed(2));
    lines.push(escapeRow(totalsRow));

    // === Summary section ===
    lines.push("");
    lines.push("");
    lines.push(escapeRow(["RÉSUMÉ"]));
    lines.push(escapeRow(["Total employés", data.length.toString()]));
    lines.push(escapeRow(["Total jours travaillés", totalWorkedDays.toString()]));
    lines.push(
        escapeRow(["Total salaire brut (MAD)", totalGrossSalary.toFixed(2)])
    );
    lines.push(
        escapeRow([
            "Moyenne salaire brut/employé (MAD)",
            data.length > 0 ? (totalGrossSalary / data.length).toFixed(2) : "0.00",
        ])
    );
    lines.push(
        escapeRow([
            "Moyenne jours/employé",
            data.length > 0 ? (totalWorkedDays / data.length).toFixed(1) : "0",
        ])
    );

    return lines.join("\n");
}

function escapeRow(cells: string[]): string {
    return cells
        .map((cell) => {
            const str = cell.toString();
            // Wrap in quotes if contains comma, quote, or newline
            if (str.includes(",") || str.includes('"') || str.includes("\n")) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        })
        .join(",");
}

/**
 * Legacy simple CSV generator (kept for backward compatibility)
 */
export function generateCSV(data: SalaryCalculation[]): string {
    const headers = [
        "Employee Name",
        "Worked Days",
        "Worked Dates",
        "Daily Salary (MAD)",
        "Gross Salary (MAD)",
        "Advance (MAD)",
        "Net Salary (MAD)",
    ];

    const rows = data.map((item) => [
        item.employeeName,
        item.workedDays.toString(),
        item.workedDates.join("; "),
        item.dailySalary.toFixed(2),
        item.grossSalary.toFixed(2),
        item.advanceAmount.toFixed(2),
        item.netSalary.toFixed(2),
    ]);

    const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    return csvContent;
}

export function downloadCSV(csv: string, filename: string): void {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
