from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from services.member_service import MemberService
from exceptions import LibraryException, ResourceNotFoundException, InvalidOperationException
from models import Member, PaginatedResponse, MemberCreate

router = APIRouter(prefix="/api/members", tags=["members"])
member_service = MemberService()

@router.get("")
async def get_members(
    search: Optional[str] = None,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1)
):
    try:
        return await member_service.get_members(search, page, limit)
    except LibraryException as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{member_id}")
async def get_member_by_id(member_id: int):
    try:
        return await member_service.get_member_by_id(member_id)
    except ResourceNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except LibraryException as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("")
async def create_member(member: MemberCreate):
    try:
        return await member_service.create_member(member)
    except LibraryException as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/{member_id}")
async def update_member(member_id: int, member: MemberCreate):
    try:
        return await member_service.update_member(member_id, member)
    except ResourceNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except LibraryException as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/{member_id}")
async def delete_member(member_id: int):
    try:
        return await member_service.delete_member(member_id)
    except ResourceNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except InvalidOperationException as e:
        raise HTTPException(status_code=400, detail=str(e))
    except LibraryException as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/{member_id}/pay-debt")
async def pay_debt(member_id: int, amount: float = Query(..., gt=0)):
    try:
        return await member_service.pay_debt(member_id, amount)
    except ResourceNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except InvalidOperationException as e:
        raise HTTPException(status_code=400, detail=str(e))
    except LibraryException as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/{member_id}/clear-debt")
async def clear_debt(member_id: int):
    try:
        return await member_service.clear_debt(member_id)
    except ResourceNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except LibraryException as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error") 