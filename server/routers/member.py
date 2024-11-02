from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from database import prisma
from models import Member, PaginatedResponse, MemberCreate

router = APIRouter(prefix="/api/members", tags=["members"])

@router.get("", response_model=PaginatedResponse)
async def get_members(
    search: Optional[str] = None,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1)
):
    where = {}
    if search:
        where = {
            "OR": [
                {"name": {"contains": search}},
                {"email": {"contains": search}},
                {"phone": {"contains": search}}
            ]
        }

    total = await prisma.member.count(where=where)
    members = await prisma.member.find_many(
        where=where,
        skip=(page - 1) * limit,
        take=limit,
        order={"createdAt": "desc"},
        include={
            "transactions": {
                "where": {
                    "returnDate": None
                }
            }
        }
    )

    return PaginatedResponse(
        items=members,
        total=total,
        page=page,
        size=limit,
        pages=(total + limit - 1) // limit
    )

@router.get("/{member_id}", response_model=Member)
async def get_member_by_id(member_id: int):
    member = await prisma.member.find_unique(
        where={"id": member_id},
        include={"transactions": True}
    )
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return member

@router.post("", response_model=Member)
async def create_member(member: MemberCreate):
    try:
        created_member = await prisma.member.create(
            data={
                "name": member.name,
                "email": member.email,
                "phone": member.phone,
                "address": member.address,
                "status": member.status,
                "imageUrl": member.imageUrl,
                "outstandingDebt": 0
            },
            include={"transactions": True}
        )
        return created_member
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{member_id}", response_model=Member)
async def update_member(member_id: int, member: MemberCreate):
    try:
        updated_member = await prisma.member.update(
            where={"id": member_id},
            data={
                "name": member.name,
                "email": member.email,
                "phone": member.phone,
                "address": member.address,
                "status": member.status,
                "imageUrl": member.imageUrl
            },
            include={"transactions": True}
        )
        return updated_member
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{member_id}", response_model=Member)
async def delete_member(member_id: int):
    try:
        # Check if member has active loans
        member = await prisma.member.find_unique(
            where={"id": member_id},
            include={
                "transactions": {
                    "where": {
                        "returnDate": None
                    }
                }
            }
        )
        
        if member.transactions or member.outstandingDebt > 0:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete member with active loans or outstanding debt"
            )
            
        deleted_member = await prisma.member.delete(
            where={"id": member_id},
            include={"transactions": True}
        )
        return deleted_member
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{member_id}/pay-debt")
async def pay_debt(member_id: int, amount: float = Query(..., gt=0)):  # Use Query parameter instead of body
    try:
        member = await prisma.member.find_unique(
            where={"id": member_id},
            include={"transactions": True}
        )
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")
            
        if amount > member.outstandingDebt:
            raise HTTPException(status_code=400, detail="Payment amount cannot exceed outstanding debt")
            
        updated_member = await prisma.member.update(
            where={"id": member_id},
            data={"outstandingDebt": member.outstandingDebt - amount},
            include={"transactions": True}
        )
        return updated_member
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{member_id}/clear-debt")
async def clear_debt(member_id: int):
    try:
        member = await prisma.member.find_unique(
            where={"id": member_id},
            include={"transactions": True}
        )
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")
            
        updated_member = await prisma.member.update(
            where={"id": member_id},
            data={"outstandingDebt": 0},
            include={"transactions": True}
        )
        return updated_member
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 