from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr

class Book(BaseModel):
    id: int
    title: str
    author: str
    isbn: str
    quantity: int
    publisher: Optional[str] = None
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True

class Member(BaseModel):
    id: int
    name: str
    outstandingDebt: float
    email: EmailStr
    address: Optional[str] = None
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True

class TransactionCreate(BaseModel):
    bookId: int
    memberId: int
    issueDate: datetime

class TransactionReturn(BaseModel):
    return_date: datetime
    rent_fee: float
    add_to_debt: bool = False

class MemberCreate(BaseModel):
    name: str
    email: EmailStr
    address: Optional[str] = None

class BookCreate(BaseModel):
    title: str
    author: str
    isbn: str
    quantity: int
    publisher: Optional[str] = None

class Transaction(BaseModel):
    id: int
    bookId: int
    memberId: int
    issueDate: datetime
    returnDate: Optional[datetime] = None
    rentFee: Optional[float] = None
    addToDebt: bool = False
    createdAt: datetime
    updatedAt: datetime
    book: Book
    member: Member

    class Config:
        from_attributes = True

class PaginatedResponse(BaseModel):
    items: List
    total: int
    page: int
    size: int
    pages: int

class FrappeBook(BaseModel):
    title: str
    authors: str
    isbn: str
    publisher: Optional[str] = None
    publishedDate: Optional[str] = None 

class MonthlyData(BaseModel):
    name: str
    loans: int
    returns: int

