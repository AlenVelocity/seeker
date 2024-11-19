from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from datetime import datetime, timedelta
from models import Transaction, PaginatedResponse, TransactionCreate, TransactionReturn, MonthlyData
from services.transaction_service import TransactionService
from exceptions import ResourceNotFoundException, InvalidOperationException

router = APIRouter(prefix="/api/transactions", tags=["transactions"])
transaction_service = TransactionService()

@router.get("")
async def get_transactions(
    search: Optional[str] = None,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1)
):
    try:
        return await transaction_service.get_transactions(search, page, limit)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("")
async def create_transaction(transaction: TransactionCreate):
    try:
        return await transaction_service.create_transaction(transaction)
    except ResourceNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except InvalidOperationException as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{transaction_id}/return")
async def return_book(
    transaction_id: int,
    return_data: TransactionReturn
):
    try:
        return await transaction_service.return_book(transaction_id, return_data)
    except ResourceNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except InvalidOperationException as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/monthly-data")
async def get_monthly_data():
    try:
        return await transaction_service.get_monthly_data()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/recent")
async def get_recent_transactions(limit: int = 5):
    try:
        return await transaction_service.get_recent_transactions(limit)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{transaction_id}")
async def get_transaction_by_id(transaction_id: int):
    try:
        return await transaction_service.get_transaction_by_id(transaction_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{transaction_id}", response_model=Transaction)
async def delete_transaction(transaction_id: int):
    try:
        return await transaction_service.delete_transaction(transaction_id)
    except ResourceNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))