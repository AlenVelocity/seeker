from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from services.book_service import BookService
from exceptions import LibraryException, ResourceNotFoundException
from models import Book, PaginatedResponse, FrappeBook, BookCreate, MonthlyData
from datetime import datetime, timedelta

from database import prisma

router = APIRouter(prefix="/api/books", tags=["books"])
book_service = BookService()

@router.get("/overview")
async def get_overview():
    try:
        return await book_service.get_overview()
    except LibraryException as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/search/frappe")
async def search_frappe_books(
    title: Optional[str] = None,
    authors: Optional[str] = None,
    isbn: Optional[str] = None,
    publisher: Optional[str] = None,
    page: int = Query(default=1, ge=1)
):
    try:
        return await book_service.search_frappe_books(title, authors, isbn, publisher, page)
    except LibraryException as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("")
async def get_books(
    search: Optional[str] = None,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1)
):
    try:
        return await book_service.get_books(search, page, limit)
    except LibraryException as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{book_id}")
async def get_book_by_id(book_id: int):
    try:
        return await book_service.get_book_by_id(book_id)
    except ResourceNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except LibraryException as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("")
async def create_book(book: BookCreate):
    try:
        return await book_service.create_book(book)
    except LibraryException as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/import-multiple")
async def import_multiple_books(books: List[BookCreate]):
    try:
        return await book_service.import_multiple_books(books)
    except LibraryException as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/{book_id}")
async def update_book(book_id: int, book: BookCreate):
    try:
        return await book_service.update_book(book_id, book)
    except ResourceNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except LibraryException as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/{book_id}")
async def delete_book(book_id: int):
    try:
        return await book_service.delete_book(book_id)
    except ResourceNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except LibraryException as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/monthly-data")
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


