"""init database

Revision ID: 7af292860f22
Revises: 
Create Date: 2023-08-19 21:45:10.562965

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "7af292860f22"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "artists",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=True),
        sa.Column("longitude", sa.String(), nullable=True),
        sa.Column("latitude", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    with op.batch_alter_table("artists", schema=None) as batch_op:
        batch_op.create_index(batch_op.f("ix_artists_id"), ["id"], unique=False)
        batch_op.create_index(batch_op.f("ix_artists_name"), ["name"], unique=True)

    op.create_table(
        "telegram_messages",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("telegram_id", sa.Integer(), nullable=True),
        sa.Column("date", sa.String(), nullable=True),
        sa.Column("message", sa.String(), nullable=True),
        sa.Column("is_webpage", sa.Boolean(), nullable=True),
        sa.Column("site_name", sa.String(), nullable=True),
        sa.Column("webpage_url", sa.String(), nullable=True),
        sa.Column("webpage_title", sa.String(), nullable=True),
        sa.Column("webpage_description", sa.String(), nullable=True),
        sa.Column("is_music", sa.Boolean(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    with op.batch_alter_table("telegram_messages", schema=None) as batch_op:
        batch_op.create_index(
            batch_op.f("ix_telegram_messages_id"), ["id"], unique=False
        )
        batch_op.create_index(
            batch_op.f("ix_telegram_messages_telegram_id"), ["telegram_id"], unique=True
        )

    op.create_table(
        "telegram_sessions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("session_name", sa.String(), nullable=True),
        sa.Column("in_use", sa.Boolean(), nullable=True),
        sa.Column("last_used", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    with op.batch_alter_table("telegram_sessions", schema=None) as batch_op:
        batch_op.create_index(
            batch_op.f("ix_telegram_sessions_id"), ["id"], unique=True
        )
        batch_op.create_index(
            batch_op.f("ix_telegram_sessions_session_name"),
            ["session_name"],
            unique=True,
        )

    op.create_table(
        "telegram_message_artists",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("telegram_message_id", sa.Integer(), nullable=True),
        sa.Column("artist_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(
            ["artist_id"],
            ["artists.id"],
        ),
        sa.ForeignKeyConstraint(
            ["telegram_message_id"],
            ["telegram_messages.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("telegram_message_id", "artist_id"),
    )
    with op.batch_alter_table("telegram_message_artists", schema=None) as batch_op:
        batch_op.create_index(
            batch_op.f("ix_telegram_message_artists_id"), ["id"], unique=False
        )

    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table("telegram_message_artists", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_telegram_message_artists_id"))

    op.drop_table("telegram_message_artists")
    with op.batch_alter_table("telegram_sessions", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_telegram_sessions_session_name"))
        batch_op.drop_index(batch_op.f("ix_telegram_sessions_id"))

    op.drop_table("telegram_sessions")
    with op.batch_alter_table("telegram_messages", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_telegram_messages_telegram_id"))
        batch_op.drop_index(batch_op.f("ix_telegram_messages_id"))

    op.drop_table("telegram_messages")
    with op.batch_alter_table("artists", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_artists_name"))
        batch_op.drop_index(batch_op.f("ix_artists_id"))

    op.drop_table("artists")
    # ### end Alembic commands ###
