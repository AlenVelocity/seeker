from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.book import router as book_router
from routers.member import router as member_router
from routers.transaction import router as transaction_router
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
app.include_router(book_router)
app.include_router(member_router)
app.include_router(transaction_router)

@app.on_event("startup")
async def startup():
    await prisma.connect()

@app.on_event("shutdown")
async def shutdown():
    await prisma.disconnect() 