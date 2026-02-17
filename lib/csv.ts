import { SalaryCalculation } from "./salary";

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
