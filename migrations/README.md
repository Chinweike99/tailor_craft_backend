# Prisma Migrations

This folder contains all database migrations for the TailorCraft Backend.

## Migration Commands

### Create a new migration (development)
When you add/modify models in `schema.prisma`:
```bash
npm run db:migrate:dev
```
This will:
- Create a new migration file
- Apply it to your database
- Regenerate Prisma Client

### Apply migrations (production)
```bash
npm run db:migrate:deploy
```
This applies pending migrations in production without prompting.

### Create migration without applying
```bash
npx prisma migrate dev --create-only --name your_migration_name
```

### Check migration status
```bash
npx prisma migrate status
```

### Reset database (⚠️ DESTRUCTIVE - development only)
```bash
npx prisma migrate reset
```

## Migration History

- **0_init** - Initial baseline migration with all existing tables (Booking, Design, Guide, Material, Payment, Reminder, Review, User, PendingVerification, RevokedToken)

## Adding New Models

1. Add your new model to `schema.prisma`
2. Run `npm run db:migrate:dev`
3. Enter a descriptive name for the migration (e.g., "add_notification_table")
4. Prisma will create the migration and apply it
5. Existing tables remain untouched

## Example: Adding a new Notification model

```prisma
model Notification {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId    String   @db.Uuid
  message   String
  read      Boolean  @default(false)
  createdAt DateTime @default(now()) @db.Timestamptz(6)
  
  User      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

Then run:
```bash
npm run db:migrate:dev
```
