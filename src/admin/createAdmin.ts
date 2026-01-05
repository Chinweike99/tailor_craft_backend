import config from "../config/config";
import { prisma } from "../config/database";
import { ConflictError } from "../utils/error.utils";
import argon2 from 'argon2'

const createAdmin = async()=> {
    
    const existingAdmin = await prisma.user.findFirst({
        where: { role: "ADMIN"}
    });

    if(existingAdmin){
        console.log("Admin already exists:", existingAdmin.email);
        throw new ConflictError(`Admin ${existingAdmin.email} already exists`)
    }

    const hashedPassword = await argon2.hash(config.admin.pass);
    const newAdmin = await prisma.user.create({
        data:{
            name: config.admin.name,
            email: config.admin.email,
            phone: config.admin.phone,
            password: hashedPassword,
            role: 'ADMIN',
            isVerified: true
        }
    })
    console.log("Admin created: ", newAdmin)
}

createAdmin()
  .catch((err) => {
    console.error("❌ Failed to create admin:", err);
  })
  .finally(() => {
    prisma.$disconnect();
  });

/**
 * Command to create admin:
 * npx tsx src/admin/createAdmin.ts
 */


