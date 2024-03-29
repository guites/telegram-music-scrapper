"""Add UNIQUE constraint to telegram message id on dataset messages

Revision ID: df337cb36d34
Revises: 4cb5316a3c34
Create Date: 2023-08-20 12:44:28.252837

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "df337cb36d34"
down_revision: Union[str, None] = "4cb5316a3c34"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table("dataset_telegram_messages", schema=None) as batch_op:
        batch_op.create_unique_constraint(
            "uq_dataset_telegram_messages_telegram_message_ids", ["telegram_message_id"]
        )

    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table("dataset_telegram_messages", schema=None) as batch_op:
        batch_op.drop_constraint(
            "uq_dataset_telegram_messages_telegram_message_ids", type_="unique"
        )

    # ### end Alembic commands ###
