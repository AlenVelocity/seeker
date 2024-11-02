from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from datetime import datetime, timedelta
import httpx
from database import prisma
from models import Book, PaginatedResponse, FrappeBook, BookCreate, MonthlyData

router = APIRouter(prefix="/api/books", tags=["books"])

@router.get("/overview")
async def get_overview():
    # Get current date and last month's date
    now = datetime.now()
    last_month = now - timedelta(days=30)
    last_week = now - timedelta(days=7)

    # Get various counts
    total_books = await prisma.book.count()
    total_members = await prisma.member.count()
    
    # Get new books count
    new_books = await prisma.book.count(
        where={"createdAt": {"gte": last_month}}
    )
    
    # Get new members count
    new_members = await prisma.member.count(
        where={"createdAt": {"gte": last_month}}
    )
    
    # Get active loans
    active_loans = await prisma.transaction.count(
        where={"returnDate": None}
    )
    
    # Get last week's loans for comparison
    last_week_loans = await prisma.transaction.count(
        where={
            "issueDate": {"gte": last_week},
            "returnDate": None
        }
    )
    
    # Calculate loan increase percentage
    loan_increase = (
        ((last_week_loans - active_loans) / active_loans * 100)
        if active_loans > 0 else 0
    )
    

    return {
        "totalBooks": total_books,
        "totalMembers": total_members,
        "newBooks": new_books,
        "newMembers": new_members,
        "activeLoans": active_loans,
        "loanIncrease": loan_increase,
    }

@router.get("/search/frappe", response_model=List[FrappeBook])
async def search_frappe_books(
    title: Optional[str] = None,
    authors: Optional[str] = None,
    isbn: Optional[str] = None,
    publisher: Optional[str] = None,
    page: int = Query(default=1, ge=1)
):
    async with httpx.AsyncClient() as client:
        params = {k: v for k, v in locals().items() if v is not None and k != "client"}
        response = await client.get("https://frappe.io/api/method/frappe-library", params=params)
        
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to fetch books from Frappe API")
            
        return response.json()["message"]

@router.get("", response_model=PaginatedResponse)
async def get_books(
    search: Optional[str] = None,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1)
):
    where = {}
    if search:
        where = {
            "OR": [
                {"title": {"contains": search}},
                {"author": {"contains": search}},
                {"isbn": {"contains": search}}
            ]
        }

    total = await prisma.book.count(where=where)
    books = await prisma.book.find_many(
        where=where,
        skip=(page - 1) * limit,
        take=limit,
        order={"createdAt": "desc"}
    )

    return PaginatedResponse(
        items=books,
        total=total,
        page=page,
        size=limit,
        pages=(total + limit - 1) // limit
    )

@router.get("/{book_id}", response_model=Book)
async def get_book_by_id(book_id: int):
    book = await prisma.book.find_unique(where={"id": book_id})
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book

@router.post("", response_model=Book)
async def create_book(book: BookCreate):
    try:
        created_book = await prisma.book.create(
            data={
                "title": book.title,
                "author": book.author,
                "isbn": book.isbn,
                "quantity": book.quantity,
                "publisher": book.publisher,
                "imageUrl": book.imageUrl
            }
        )
        return created_book
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/import", response_model=Book)
async def import_book(book: BookCreate):
    try:
        created_book = await prisma.book.create(
            data={
                "title": book.title,
                "author": book.author,
                "isbn": book.isbn,
                "quantity": book.quantity,
                "publisher": book.publisher
            }
        )
        return created_book
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/import-multiple", response_model=dict)
async def import_multiple_books(books: List[BookCreate]):
    imported = 0
    total = len(books)
    
    for book in books:
        try:
            await prisma.book.create(
                data={
                    "title": book.title,
                    "author": book.author,
                    "isbn": book.isbn,
                    "quantity": book.quantity,
                    "publisher": book.publisher
                }
            )
            imported += 1
        except Exception:
            continue
            
    return {
        "imported": imported,
        "total": total
    }

@router.put("/{book_id}", response_model=Book)
async def update_book(book_id: int, book: BookCreate):
    try:
        updated_book = await prisma.book.update(
            where={"id": book_id},
            data={
                "title": book.title,
                "author": book.author,
                "isbn": book.isbn,
                "quantity": book.quantity,
                "publisher": book.publisher,
                "imageUrl": book.imageUrl
            }
        )
        return updated_book
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{book_id}", response_model=Book)
async def delete_book(book_id: int):
    try:
        deleted_book = await prisma.book.delete(where={"id": book_id})
        return deleted_book
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
        monthly_data.append(MonthlyData(
            name=month["name"],
            loans=loans,
            returns=returns
        ))

    return monthly_data


