from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from database import prisma
from exceptions import ResourceNotFoundException, InvalidOperationException
from models import TransactionCreate, TransactionReturn, MonthlyData

class TransactionService:
    async def create_transaction(self, transaction: TransactionCreate):
        book = await prisma.book.find_unique(where={"id": transaction.bookId})
        if not book:
            raise ResourceNotFoundException("Book not found")
        if book.quantity <= 0:
            raise InvalidOperationException("Book is out of stock")

        active_loans = await prisma.transaction.count(
            where={
                "memberId": transaction.memberId,
                "type": "ISSUE",
                "relatedTo": None
            }
        )
        if active_loans >= 5:
            raise InvalidOperationException("Member has reached maximum number of active loans")

        async with prisma.tx() as tx:
            created_transaction = await prisma.transaction.create(
                data={
                    "type": "ISSUE",
                    "bookId": transaction.bookId,
                    "memberId": transaction.memberId,
                    "issueDate": transaction.issueDate
                },
                include={
                    "book": True,
                    "member": True,
                    "relatedTo": True
                }
            )
            
            await prisma.book.update(
                where={"id": transaction.bookId},
                data={"quantity": book.quantity - 1}
            )

        return created_transaction

    async def return_book(self, transaction_id: int, return_data: TransactionReturn):
        issue_transaction = await prisma.transaction.find_unique(
            where={"id": transaction_id},
            include={
                "book": True,
                "member": True,
                "relatedTo": True
            }
        )
        
        if not issue_transaction:
            raise ResourceNotFoundException("Transaction not found")
        if issue_transaction.type != "ISSUE":
            raise InvalidOperationException("Can only return books from ISSUE transactions")
        if issue_transaction.relatedTo:
            raise InvalidOperationException("Book already returned")

        async with prisma.tx() as tx:
            return_transaction = await prisma.transaction.create(
                data={
                    "type": "RETURN",
                    "bookId": issue_transaction.bookId,
                    "memberId": issue_transaction.memberId,
                    "issueDate": issue_transaction.issueDate,
                    "returnDate": return_data.return_date,
                    "rentFee": return_data.rent_fee,
                    "relatedTransactionId": transaction_id
                },
                include={
                    "book": True,
                    "member": True,
                    "relatedTransaction": True
                }
            )
            
            await prisma.book.update(
                where={"id": issue_transaction.bookId},
                data={"quantity": issue_transaction.book.quantity + 1}
            )
            
            if return_data.add_to_debt:
                await prisma.member.update(
                    where={"id": issue_transaction.memberId},
                    data={"outstandingDebt": issue_transaction.member.outstandingDebt + return_data.rent_fee}
                )

        return return_transaction

    async def get_transactions(self, search: Optional[str], page: int, limit: int):
        where = {}
        if search:
            where = {
                "OR": [
                    {"book": {"title": {"contains": search}}},
                    {"member": {"name": {"contains": search}}}
                ]
            }

        total = await prisma.transaction.count(where=where)
        transactions = await prisma.transaction.find_many(
            where=where,
            skip=(page - 1) * limit,
            take=limit,
            order={"createdAt": "desc"},
            include={
                "book": True,
                "member": True,
                "relatedTransaction": True,
                "relatedTo": True
            }
        )

        return {
            "items": transactions,
            "total": total,
            "page": page,
            "size": limit,
            "pages": (total + limit - 1) // limit
        }

    async def get_monthly_data(self) -> List[MonthlyData]:
        start_of_year = datetime.now().replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        months = [
            {
                "name": (start_of_year + timedelta(days=30*i)).strftime("%b"),
                "start": start_of_year + timedelta(days=30*i),
                "end": start_of_year + timedelta(days=30*(i+1) - 1)
            }
            for i in range(12)
        ]

        monthly_data = []
        for month in months:
            loans = await prisma.transaction.count(
                where={
                    "type": "ISSUE",
                    "createdAt": {
                        "gte": month["start"],
                        "lte": month["end"]
                    }
                }
            )
            returns = await prisma.transaction.count(
                where={
                    "type": "RETURN",
                    "createdAt": {
                        "gte": month["start"],
                        "lte": month["end"]
                    }
                }
            )
            monthly_data.append(MonthlyData(
                name=month["name"],
                loans=loans,
                returns=returns
            ))

        return monthly_data

    async def get_recent_transactions(self, limit: int = 5):
        return await prisma.transaction.find_many(
            take=limit,
            order={"createdAt": "desc"},
            include={
                "book": True,
                "member": True,
                "relatedTransaction": True,
                "relatedTo": True
            }
        )

    async def delete_transaction(self, transaction_id: int):
        transaction = await prisma.transaction.find_unique(
            where={"id": transaction_id},
            include={
                "book": True,
                "member": True,
                "relatedTransaction": True,
                "relatedTo": True
            }
        )
        
        if not transaction:
            raise ResourceNotFoundException("Transaction not found")

        async with prisma.tx() as tx:
            if transaction.type == "ISSUE" and transaction.relatedTo:
                await prisma.transaction.delete(where={"id": transaction.relatedTo.id})
                    
                await prisma.book.update(
                    where={"id": transaction.bookId},
                    data={"quantity": transaction.book.quantity - 1}
                )

            elif transaction.type == "RETURN" and transaction.relatedTransaction:
                await prisma.book.update(
                    where={"id": transaction.bookId},
                    data={"quantity": transaction.book.quantity - 1}
                )
                
                if transaction.rentFee and transaction.member.outstandingDebt >= transaction.rentFee:
                    await prisma.member.update(
                        where={"id": transaction.memberId},
                        data={"outstandingDebt": transaction.member.outstandingDebt - transaction.rentFee}
                    )

            deleted_transaction = await prisma.transaction.delete(
                where={"id": transaction_id},
                include={
                    "book": True,
                    "member": True,
                    "relatedTransaction": True,
                    "relatedTo": True
                }
            )

            if transaction.type == "ISSUE" and not transaction.relatedTo:
                await prisma.book.update(
                    where={"id": transaction.bookId},
                    data={"quantity": transaction.book.quantity + 1}
                )

        return deleted_transaction

    async def get_transaction_by_id(self, transaction_id: int):
        return await prisma.transaction.find_unique(where={"id": transaction_id})