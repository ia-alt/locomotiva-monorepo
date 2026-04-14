import { prisma } from "../src/modules/_core/infra/database/prisma/prisma-instance";

const email = process.argv[2];

if (!email) {
    console.error("Usage: npm run promote-to-admin <user@email.com>");
    process.exit(1);
}



async function main() {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            console.log("Error: user not found");
            process.exit(0);
        }

        if (user.userType === "admin") {
            console.log("Error: user is already admin");
            process.exit(0);
        }

        await prisma.user.update({
            where: { email },
            data: { userType: "admin" },
        });

        console.log(`Success: user ${user.name} promoted to admin`);
    } catch (error) {
        console.error("An error occurred:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
