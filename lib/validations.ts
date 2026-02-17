import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const userSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    role: z.enum(["ADMIN", "MANAGER", "USER"]),
});

export const sectorSchema = z.object({
    name: z.string().min(2, "Sector name must be at least 2 characters"),
});

export const functionSchema = z.object({
    name: z.string().min(2, "Function name must be at least 2 characters"),
});

export const employeeSchema = z.object({
    cin: z.string().min(5, "CIN must be at least 5 characters"),
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    dateOfBirth: z.string().or(z.date()),
    phoneNumber: z.string().min(10, "Phone number must be at least 10 characters"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    sectorId: z.string().min(1, "Sector is required"),
    functionId: z.string().min(1, "Function is required"),
    dailySalary: z.number().positive("Daily salary must be positive"),
    advanceAmount: z.number().min(0, "Advance amount cannot be negative").default(0),
    joinDate: z.string().or(z.date()),
    employmentStatus: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
    notes: z.string().optional(),
    profilePhoto: z.string().optional(),
    idProofPhoto: z.string().optional(),
});

export const workdaySchema = z.object({
    date: z.string().or(z.date()),
    employeeId: z.string().min(1, "Employee is required"),
    multiplier: z.number().min(1).max(2, "Multiplier must be between 1 and 2"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type UserInput = z.infer<typeof userSchema>;
export type SectorInput = z.infer<typeof sectorSchema>;
export type FunctionInput = z.infer<typeof functionSchema>;
export type EmployeeInput = z.infer<typeof employeeSchema>;
export type WorkdayInput = z.infer<typeof workdaySchema>;
