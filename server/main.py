from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.book import router as book_router
from routers.member import router as member_router
from routers.transaction import router as transaction_router
from database import prisma
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
    logger.info("Application starting up")
    await prisma.connect()
    logger.info("Connected to database")

@app.on_event("shutdown")
async def shutdown():
    logger.info("Application shutting down")
    await prisma.disconnect()
    logger.info("Disconnected from database")