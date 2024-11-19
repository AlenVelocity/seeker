from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from enum import Enum

class TransactionType(str, Enum):
    ISSUE = "ISSUE"
    RETURN = "RETURN"

class Book(BaseModel):
    id: int
    title: str
    author: str
    isbn: str
    quantity: int
    publisher: Optional[str] = None
    imageUrl: Optional[str] = None
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True

class Member(BaseModel):
    id: int
    name: str
    email: str
    address: Optional[str] = None
    outstandingDebt: float = 0
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True

class TransactionCreate(BaseModel):
    bookId: int = Field(..., description="ID of the book to be issued")
    memberId: int = Field(..., description="ID of the member borrowing the book")
    issueDate: datetime = Field(default_factory=datetime.now, description="Date when the book is issued")

class TransactionReturn(BaseModel):
    return_date: datetime = Field(..., description="Date when the book is returned")
    rent_fee: float = Field(..., ge=0, description="Fee charged for the rental period")
    add_to_debt: bool = Field(default=False, description="Whether to add the fee to member's debt")

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
    type: TransactionType
    bookId: int
    memberId: int
    issueDate: datetime
    returnDate: Optional[datetime] = None
    rentFee: Optional[float] = None
    relatedTransactionId: Optional[int] = None
    relatedTransaction: Optional['Transaction'] = None
    relatedReturns: List['Transaction'] = []
    createdAt: datetime
    updatedAt: datetime
    book: Book
    member: Member

    class Config:
        from_attributes = True

class PaginatedResponse(BaseModel):
    items: List[Transaction]
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

# Add support for recursive relationships
Transaction.update_forward_refs()

