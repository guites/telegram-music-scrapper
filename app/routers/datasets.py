from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from crud import DatasetCrud
from dependencies import get_db
from schemas import DatasetCreate

router = APIRouter(
    prefix="/datasets",
    tags=["datasets"],
)


@router.post("/", status_code=201)
def create_dataset(dataset: DatasetCreate, db: Session = Depends(get_db)):
    dataset_crud = DatasetCrud(db)
    dataset_crud.create_dataset(dataset.file_name, dataset.telegram_message_ids)


@router.post("/messages", status_code=201)
def create_dataset_message(telegram_message_id: int, db: Session = Depends(get_db)):
    dataset_crud = DatasetCrud(db)
    dataset_crud.create_dataset_message(telegram_message_id)
