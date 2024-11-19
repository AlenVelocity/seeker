from typing import Optional
from database import prisma
from exceptions import ResourceNotFoundException, InvalidOperationException
from models import MemberCreate

class MemberService:
    async def get_members(self, search: Optional[str], page: int, limit: int):
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

        return {
            "items": members,
            "total": total,
            "page": page,
            "size": limit,
            "pages": (total + limit - 1) // limit
        }

    async def get_member_by_id(self, member_id: int):
        member = await prisma.member.find_unique(
            where={"id": member_id},
            include={"transactions": True}
        )
        if not member:
            raise ResourceNotFoundException("Member not found")
        return member

    async def create_member(self, member: MemberCreate):
        return await prisma.member.create(
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

    async def update_member(self, member_id: int, member: MemberCreate):
        existing_member = await self.get_member_by_id(member_id)
        if not existing_member:
            raise ResourceNotFoundException("Member not found")

        return await prisma.member.update(
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

    async def delete_member(self, member_id: int):
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
        
        if not member:
            raise ResourceNotFoundException("Member not found")
        
        if member.transactions or member.outstandingDebt > 0:
            raise InvalidOperationException(
                "Cannot delete member with active loans or outstanding debt"
            )
            
        return await prisma.member.delete(
            where={"id": member_id},
            include={"transactions": True}
        )

    async def pay_debt(self, member_id: int, amount: float):
        member = await self.get_member_by_id(member_id)
        
        if amount > member.outstandingDebt:
            raise InvalidOperationException("Payment amount cannot exceed outstanding debt")
            
        return await prisma.member.update(
            where={"id": member_id},
            data={"outstandingDebt": member.outstandingDebt - amount},
            include={"transactions": True}
        )

    async def clear_debt(self, member_id: int):
        member = await self.get_member_by_id(member_id)
        
        return await prisma.member.update(
            where={"id": member_id},
            data={"outstandingDebt": 0},
            include={"transactions": True}
        ) 