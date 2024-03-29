from sys import exit
from telethon import TelegramClient
from telethon.tl.functions.messages import GetHistoryRequest
from telethon.tl.types import PeerChannel

import models as models

from crud import TelegramCrud, TelegramSessionCrud
from database import DatabaseWrapper, engine
from definitions import TELEGRAM_API_ID, TELEGRAM_API_HASH, TELEGRAM_CHANNEL_ID


class TelegramApi:
    """A class to interact with the Telegram API.

    Raises:
        ValueError: If the TELEGRAM_API_ID, TELEGRAM_API_HASH or TELEGRAM_CHANNEL_ID environment variables are not defined.
    """

    def __init__(self, session_name):
        self.api_id = TELEGRAM_API_ID
        self.api_hash = TELEGRAM_API_HASH
        self.channel_id = int(TELEGRAM_CHANNEL_ID)
        self.client = TelegramClient(session_name, self.api_id, self.api_hash)

        if self.api_id is None or self.api_hash is None:
            raise ValueError(
                "Please define the Telegram API ID, API Hash and Channel ID environment variables."
            )

    async def get_channel_messages(self, channel, limit=10, total_count_limit=20):
        offset_id = self.starting_offset_id
        all_messages = []
        total_messages = 0

        while True:
            print(
                "Current Offset ID is:", offset_id, "; Total Messages:", total_messages
            )
            history = await self.client(
                GetHistoryRequest(
                    peer=channel,
                    offset_id=offset_id,
                    offset_date=None,
                    add_offset=0,
                    limit=limit,
                    max_id=0,
                    min_id=0,
                    hash=0,
                )
            )
            if not history.messages:
                break
            messages = history.messages
            for message in messages:
                all_messages.append(message.to_dict())
            offset_id = messages[len(messages) - 1].id
            total_messages = len(all_messages)
            if total_count_limit != 0 and total_messages >= total_count_limit:
                break

        return all_messages, offset_id

    async def _run_get_messages_routine(self):
        if not self.client.is_connected():
            print("Connecting to Telegram Servers...")
            await self.client.connect()
        print("Connected to Telegram Servers!")
        input_channel = PeerChannel(self.channel_id)
        channel = await self.client.get_entity(input_channel)
        messages, offset_id = await self.get_channel_messages(channel, 100, 100)
        self.starting_offset_id = offset_id
        print("Done getting messages. Last Offset ID:", offset_id)
        return messages, offset_id

    def create_loop(self):
        with self.client:
            return self.client.loop.run_until_complete(self._run_get_messages_routine())

    def set_message_offset(self, offset):
        self.starting_offset_id = offset


if __name__ == "__main__":
    # create database tables if this is the first time running the script
    models.Base.metadata.create_all(bind=engine)
    # receive session name and trim input
    telethon_session_name = input("Enter a name for your Telethon session: ").strip()
    if telethon_session_name == "":
        print("Please enter a valid name for your Telethon session.")
        exit(1)

    # check if session name already exists
    with DatabaseWrapper() as db:
        telegram_crud = TelegramCrud(db)
        telegram_session_crud = TelegramSessionCrud(db)

    if (
        telegram_session_crud.get_telegram_session_by_name(telethon_session_name)
        is not None
    ):
        print("A session with that name already exists.")
        exit(1)
    telegram_api = TelegramApi(telethon_session_name)
    telegram_api.set_message_offset(0)
    telegram_api.create_loop()
    telegram_api.client.disconnect()
    # if we reached this point, we have successfully connected to Telegram
    # save session as valid in database
    with DatabaseWrapper() as db:
        telegram_session_crud = TelegramSessionCrud(db)
    telegram_session_crud.save_telegram_session(telethon_session_name)
