from prisma import Prisma
from datetime import datetime

async def migrate_transactions():
    """Convert existing transactions to the new ledger system"""
    db = Prisma()
    await db.connect()

    try:
        async with db.tx() as transaction:
            old_transactions = await db.transaction.find_many(
                where={
                    "type": None  
                },
                include={
                    "book": True,
                    "member": True
                }
            )

            print(f"Found {len(old_transactions)} transactions to migrate")

            for old_tx in old_transactions:
                # Create ISSUE transaction
                issue_tx = await db.transaction.update(
                    where={"id": old_tx.id},
                    data={
                        "type": "ISSUE",
                        "issueDate": old_tx.issueDate,
                        "bookId": old_tx.bookId,
                        "memberId": old_tx.memberId,
                    }
                )

                if old_tx.returnDate:
                    await db.transaction.create(
                        data={
                            "type": "RETURN",
                            "bookId": old_tx.bookId,
                            "memberId": old_tx.memberId,
                            "issueDate": old_tx.issueDate,
                            "returnDate": old_tx.returnDate,
                            "rentFee": old_tx.rentFee,
                            "relatedTransactionId": issue_tx.id
                        }
                    )

            print("Migration completed successfully")

    except Exception as e:
        print(f"Error during migration: {str(e)}")
        raise e

    finally:
        await db.disconnect()

if __name__ == "__main__":
    import asyncio
    asyncio.run(migrate_transactions()) 