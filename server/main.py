from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import book, member, transaction
from database import prisma

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(book.router)
app.include_router(member.router)
app.include_router(transaction.router)

@app.on_event("startup")
async def startup():
    await prisma.connect()

@app.on_event("shutdown")
async def shutdown():
    await prisma.disconnect() 