import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("fr-MA", {
        style: "currency",
        currency: "MAD",
    }).format(amount);
}

export function formatDate(date: Date | string): string {
    return new Intl.DateTimeFormat("fr-MA", {
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(new Date(date));
}

export function formatShortDate(date: Date | string): string {
    return new Intl.DateTimeFormat("fr-MA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date(date));
}

export function generateEmployeeId(): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 7);
    return `EMP-${timestamp}-${randomStr}`.toUpperCase();
}
