"""Remove is music col from telegram messages

Revision ID: 4cb5316a3c34
Revises: a1177de94e01
Create Date: 2023-08-20 00:23:02.080044

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "4cb5316a3c34"
down_revision: Union[str, None] = "a1177de94e01"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table("telegram_messages", schema=None) as batch_op:
        batch_op.drop_column("is_music")

    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table("telegram_messages", schema=None) as batch_op:
        batch_op.add_column(sa.Column("is_music", sa.BOOLEAN(), nullable=True))

    # ### end Alembic commands ###
