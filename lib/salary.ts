import { db } from "./db";
import { startOfMonth, endOfMonth } from "date-fns";

export interface SalaryCalculation {
    employeeId: string;
    employeeName: string;
    workedDays: number;
    workedDates: string[];
    grossSalary: number;
    advanceAmount: number;
    netSalary: number;
    dailySalary: number;
}

export async function calculateEmployeeSalary(
    employeeId: string,
    startDate: Date,
    endDate: Date
): Promise<SalaryCalculation | null> {
    const employee = await db.employee.findUnique({
        where: { id: employeeId, isDeleted: false },
        include: {
            workdays: {
                where: {
                    date: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
                orderBy: { date: "asc" },
            },
        },
    });

    if (!employee) return null;

    const workedDates = employee.workdays.map((wd) =>
        new Date(wd.date).toISOString().split("T")[0]
    );

    const grossSalary = employee.workdays.reduce((total, workday) => {
        return total + employee.dailySalary * workday.multiplier;
    }, 0);

    const netSalary = grossSalary - employee.advanceAmount;

    return {
        employeeId: employee.id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        workedDays: employee.workdays.length,
        workedDates,
        grossSalary,
        advanceAmount: employee.advanceAmount,
        netSalary,
        dailySalary: employee.dailySalary,
    };
}

export async function calculateAllSalaries(
    startDate: Date,
    endDate: Date
): Promise<SalaryCalculation[]> {
    const employees = await db.employee.findMany({
        where: { isDeleted: false },
        include: {
            workdays: {
                where: {
                    date: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
                orderBy: { date: "asc" },
            },
        },
    });

    return employees.map((employee) => {
        const workedDates = employee.workdays.map((wd) =>
            new Date(wd.date).toISOString().split("T")[0]
        );

        const grossSalary = employee.workdays.reduce((total, workday) => {
            return total + employee.dailySalary * workday.multiplier;
        }, 0);

        const netSalary = grossSalary - employee.advanceAmount;

        return {
            employeeId: employee.id,
            employeeName: `${employee.firstName} ${employee.lastName}`,
            workedDays: employee.workdays.length,
            workedDates,
            grossSalary,
            advanceAmount: employee.advanceAmount,
            netSalary,
            dailySalary: employee.dailySalary,
        };
    });
}

export async function getMonthlyStats(date: Date = new Date()) {
    const startDate = startOfMonth(date);
    const endDate = endOfMonth(date);

    const [activeEmployees, workdays, employees] = await Promise.all([
        db.employee.count({
            where: { employmentStatus: "ACTIVE", isDeleted: false },
        }),
        db.workday.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                employee: true,
            },
        }),
        db.employee.findMany({
            where: { isDeleted: false },
        }),
    ]);

    const totalSalary = workdays.reduce((sum, workday) => {
        return sum + workday.employee.dailySalary * workday.multiplier;
    }, 0);

    const totalAdvances = employees.reduce((sum, emp) => {
        return sum + emp.advanceAmount;
    }, 0);

    return {
        activeEmployees,
        totalSalary,
        totalAdvances,
    };
}
