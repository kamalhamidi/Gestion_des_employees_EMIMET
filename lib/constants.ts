export const ROLES = {
    ADMIN: "ADMIN",
    MANAGER: "MANAGER",
    USER: "USER",
} as const;

export const EMPLOYMENT_STATUS = {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE",
} as const;

export const SALARY_MULTIPLIERS = [
    { value: 1.0, label: "Normal (1x)" },
    { value: 1.5, label: "Overtime (1.5x)" },
    { value: 2.0, label: "Holiday (2x)" },
] as const;

export const ITEMS_PER_PAGE = 20;
