import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

async function main() {
    console.log("🌱 Starting database seed...");

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const admin = await db.user.upsert({
        where: { email: "admin@emimet.com" },
        update: {},
        create: {
            email: "admin@emimet.com",
            password: hashedPassword,
            name: "Admin User",
            role: "ADMIN",
        },
    });
    console.log("✅ Admin user created:", admin.email);

    // Create sectors
    const woodSector = await db.sector.upsert({
        where: { name: "Wood Carpentry" },
        update: {},
        create: { name: "Wood Carpentry" },
    });

    const aluminumSector = await db.sector.upsert({
        where: { name: "Aluminum" },
        update: {},
        create: { name: "Aluminum" },
    });

    const ironSector = await db.sector.upsert({
        where: { name: "Iron Work" },
        update: {},
        create: { name: "Iron Work" },
    });

    console.log("✅ Sectors created");

    // Create functions
    const seniorCarpenter = await db.function.upsert({
        where: { name: "Senior Carpenter" },
        update: {},
        create: { name: "Senior Carpenter" },
    });

    const carpenter = await db.function.upsert({
        where: { name: "Carpenter" },
        update: {},
        create: { name: "Carpenter" },
    });

    const installer = await db.function.upsert({
        where: { name: "Installer" },
        update: {},
        create: { name: "Installer" },
    });

    const assistant = await db.function.upsert({
        where: { name: "Assistant" },
        update: {},
        create: { name: "Assistant" },
    });

    console.log("✅ Functions created");

    // Create sample employees
    const employees = [
        {
            employeeId: "EMP-001",
            cin: "AB123456",
            firstName: "Mohammed",
            lastName: "Alami",
            dateOfBirth: new Date("1985-05-15"),
            phoneNumber: "+212612345678",
            address: "123 Rue Hassan II, Casablanca",
            sectorId: woodSector.id,
            functionId: seniorCarpenter.id,
            dailySalary: 250.0,
            joinDate: new Date("2020-01-15"),
            employmentStatus: "ACTIVE" as const,
        },
        {
            employeeId: "EMP-002",
            cin: "CD789012",
            firstName: "Fatima",
            lastName: "Bennani",
            dateOfBirth: new Date("1990-08-22"),
            phoneNumber: "+212623456789",
            address: "456 Avenue Mohammed V, Rabat",
            sectorId: aluminumSector.id,
            functionId: installer.id,
            dailySalary: 200.0,
            joinDate: new Date("2021-03-10"),
            employmentStatus: "ACTIVE" as const,
        },
        {
            employeeId: "EMP-003",
            cin: "EF345678",
            firstName: "Youssef",
            lastName: "Tazi",
            dateOfBirth: new Date("1988-11-30"),
            phoneNumber: "+212634567890",
            address: "789 Boulevard Zerktouni, Marrakech",
            sectorId: woodSector.id,
            functionId: carpenter.id,
            dailySalary: 220.0,
            advanceAmount: 500.0,
            joinDate: new Date("2019-07-01"),
            employmentStatus: "ACTIVE" as const,
        },
        {
            employeeId: "EMP-004",
            cin: "GH901234",
            firstName: "Amina",
            lastName: "Idrissi",
            dateOfBirth: new Date("1995-03-18"),
            phoneNumber: "+212645678901",
            address: "321 Rue de Fes, Tangier",
            sectorId: ironSector.id,
            functionId: assistant.id,
            dailySalary: 150.0,
            joinDate: new Date("2022-09-05"),
            employmentStatus: "ACTIVE" as const,
        },
    ];

    for (const employeeData of employees) {
        await db.employee.upsert({
            where: { cin: employeeData.cin },
            update: {},
            create: employeeData,
        });
    }

    console.log("✅ Sample employees created");

    // Create some sample workdays for the current month
    const now = new Date();
    const emp1 = await db.employee.findUnique({ where: { cin: "AB123456" } });
    const emp2 = await db.employee.findUnique({ where: { cin: "CD789012" } });

    if (emp1 && emp2) {
        for (let i = 1; i <= 15; i++) {
            const workDate = new Date(now.getFullYear(), now.getMonth(), i);

            await db.workday.upsert({
                where: {
                    date_employeeId: {
                        date: workDate,
                        employeeId: emp1.id,
                    },
                },
                update: {},
                create: {
                    date: workDate,
                    employeeId: emp1.id,
                    multiplier: i % 7 === 0 ? 1.5 : 1.0, // Overtime on every 7th day
                },
            });

            await db.workday.upsert({
                where: {
                    date_employeeId: {
                        date: workDate,
                        employeeId: emp2.id,
                    },
                },
                update: {},
                create: {
                    date: workDate,
                    employeeId: emp2.id,
                    multiplier: 1.0,
                },
            });
        }
        console.log("✅ Sample workdays created");
    }

    console.log("🎉 Seed completed successfully!");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await db.$disconnect();
    });
