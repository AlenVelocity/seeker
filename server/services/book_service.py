from datetime import datetime, timedelta
from typing import Optional, List
import httpx
from database import prisma
from exceptions import ResourceNotFoundException, InvalidOperationException
from models import BookCreate, MonthlyData

class BookService:
    async def get_overview(self):
        now = datetime.now()
        last_month = now - timedelta(days=30)
        last_week = now - timedelta(days=7)

        total_books = await prisma.book.count()
        total_members = await prisma.member.count()
        new_books = await prisma.book.count(
            where={"createdAt": {"gte": last_month}}
        )
        new_members = await prisma.member.count(
            where={"createdAt": {"gte": last_month}}
        )
        active_loans = await prisma.transaction.count(
            where={"returnDate": None}
        )
        last_week_loans = await prisma.transaction.count(
            where={
                "issueDate": {"gte": last_week},
                "returnDate": None
            }
        )
        
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

    async def search_frappe_books(self, title: Optional[str], authors: Optional[str],
                                isbn: Optional[str], publisher: Optional[str], page: int):
        async with httpx.AsyncClient() as client:
            params = {k: v for k, v in locals().items() 
                     if v is not None and k not in ["self", "client"]}
            response = await client.get(
                "https://frappe.io/api/method/frappe-library",
                params=params
            )
            
            if response.status_code != 200:
                raise InvalidOperationException("Failed to fetch books from Frappe API")
                
            return response.json()["message"]

    async def get_books(self, search: Optional[str], page: int, limit: int):
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

        return {
            "items": books,
            "total": total,
            "page": page,
            "size": limit,
            "pages": (total + limit - 1) // limit
        }

    async def get_book_by_id(self, book_id: int):
        book = await prisma.book.find_unique(where={"id": book_id})
        if not book:
            raise ResourceNotFoundException("Book not found")
        return book

    async def create_book(self, book: BookCreate):
        return await prisma.book.create(
            data={
                "title": book.title,
                "author": book.author,
                "isbn": book.isbn,
                "quantity": book.quantity,
                "publisher": book.publisher,
                "imageUrl": book.imageUrl
            }
        )

    async def import_multiple_books(self, books: List[BookCreate]):
        imported = 0
        total = len(books)
        
        for book in books:
            try:
                await self.create_book(book)
                imported += 1
            except Exception:
                continue
                
        return {
            "imported": imported,
            "total": total
        }

    async def update_book(self, book_id: int, book: BookCreate):
        existing_book = await self.get_book_by_id(book_id)
        if not existing_book:
            raise ResourceNotFoundException("Book not found")
            
        return await prisma.book.update(
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

    async def delete_book(self, book_id: int):
        existing_book = await self.get_book_by_id(book_id)
        if not existing_book:
            raise ResourceNotFoundException("Book not found")
            
        return await prisma.book.delete(where={"id": book_id}) 