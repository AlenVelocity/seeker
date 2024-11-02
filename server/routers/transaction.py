from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from datetime import datetime, timedelta
from database import prisma
from models import Transaction, PaginatedResponse, TransactionCreate, TransactionReturn, MonthlyData
from typing import Optional, List, Dict, Any

router = APIRouter(prefix="/api/transactions", tags=["transactions"])

@router.get("", response_model=PaginatedResponse)
async def get_transactions(
    search: Optional[str] = None,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1)
):
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
            "member": True
        }
    )

    return PaginatedResponse(
        items=transactions,
        total=total,
        page=page,
        size=limit,
        pages=(total + limit - 1) // limit
    )

@router.post("", response_model=Transaction)
async def create_transaction(transaction: TransactionCreate):
    try:
        # Check book availability
        book = await prisma.book.find_unique(where={"id": transaction.bookId})
        if not book:
            raise HTTPException(status_code=404, detail="Book not found")
        if book.quantity <= 0:
            raise HTTPException(status_code=400, detail="Book is out of stock")

        # Create transaction and update book quantity
        async with prisma.tx() as tx:
            created_transaction = await prisma.transaction.create(
                data={
                    "bookId": transaction.bookId,
                    "memberId": transaction.memberId,
                    "issueDate": transaction.issueDate
                },
                include={
                    "book": True,
                    "member": True
                }
            )
            
            await prisma.book.update(
                where={"id": transaction.bookId},
                data={"quantity": book.quantity - 1}
            )

        return created_transaction
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{transaction_id}/return", response_model=Transaction)
async def return_book(
    transaction_id: int,
    return_data: TransactionReturn
):
    try:
        transaction = await prisma.transaction.find_unique(
            where={"id": transaction_id},
            include={"book": True, "member": True}
        )
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
        if transaction.returnDate:
            raise HTTPException(status_code=400, detail="Book already returned")

        # Calculate rent fee (e.g., $1 per day)

        async with prisma.tx() as tx:
            # Update transaction
            updated_transaction = await prisma.transaction.update(
                where={"id": transaction_id},
                data={
                    "returnDate": return_data.return_date,
                    "rentFee": return_data.rent_fee
                },
                include={"book": True, "member": True}
            )
            
            # Update book quantity
            await prisma.book.update(
                where={"id": transaction.bookId},
                data={"quantity": transaction.book.quantity + 1}
            )
            
            # Update member debt if requested
            if return_data.add_to_debt:
                await prisma.member.update(
                    where={"id": transaction.memberId},
                    data={"outstandingDebt": transaction.member.outstandingDebt + return_data.rent_fee}
                )

        return updated_transaction
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
@router.get("/monthly-data", response_model=List[MonthlyData])
async def get_monthly_data():
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
        data = await get_month_data(month)
        monthly_data.append(data)

    return monthly_data

async def get_month_data(month: Dict[str, Any]) -> MonthlyData:
    loans = await prisma.transaction.count(
        where={
            "issueDate": {
                "gte": month["start"],
                "lte": month["end"]
            }
        }
    )
    returns = await prisma.transaction.count(
        where={
            "returnDate": {
                "gte": month["start"],
                "lte": month["end"]
            }
        }
    )
    return MonthlyData(
        name=month["name"],
        loans=loans,
        returns=returns
    )

@router.get("/recent")
async def get_recent_transactions(limit: int = 5):
    transactions = await prisma.transaction.find_many(
        take=limit,
        order={"createdAt": "desc"},
        include={
            "book": True,
            "member": True
        }
    )
    return transactions

@router.delete("/{transaction_id}", response_model=Transaction)
async def delete_transaction(transaction_id: int):
    try:
        # First get the transaction to check if it exists
        transaction = await prisma.transaction.find_unique(
            where={"id": transaction_id},
            include={"book": True}
        )
        
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
            
        # If book hasn't been returned, restore its quantity
        if not transaction.returnDate:
            await prisma.book.update(
                where={"id": transaction.bookId},
                data={"quantity": transaction.book.quantity + 1}
            )
            
        # Delete the transaction
        deleted_transaction = await prisma.transaction.delete(
            where={"id": transaction_id},
            include={"book": True, "member": True}
        )
        return deleted_transaction
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 