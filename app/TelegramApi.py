import os
import json

from decouple import config
from glob import glob
from telethon import TelegramClient
from telethon.tl.functions.messages import GetHistoryRequest
from telethon.tl.types import PeerChannel


class TelegramApi:
    def __init__(self):
        self.api_id = config("API_ID")
        self.api_hash = config("API_HASH")
        self.client = TelegramClient("anon", self.api_id, self.api_hash)
        self.channel_id = int(config("CHANNEL_ID"))

    def _get_oldest_message_id(self):
        # TODO: this should be a database query
        message_files = glob("*-messages.json")
        message_ids = []
        for f in message_files:
            message_id = f.split("-")[0]
            message_ids.append(int(message_id))
        if len(message_ids) > 0:
            return min(message_ids)
        return 0
    
    async def get_channel_messages(self, channel, limit=10, total_count_limit=20):
        offset_id = self.starting_offset_id
        all_messages = []
        total_messages = 0

        while True:
            print("Current Offset ID is:", offset_id, "; Total Messages:", total_messages)
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
        await self.client.connect()
        input_channel = PeerChannel(self.channel_id)
        channel = await self.client.get_entity(input_channel)
        messages, offset_id = await self.get_channel_messages(channel)
        self.starting_offset_id = offset_id

        save_file = os.path.join(f"{self.starting_offset_id}-messages.json")
        with open(save_file, "w") as outfile:
            json.dump(messages, outfile, default=str)

        print(f"saved messages at {save_file}")

        return messages
    
    def create_loop(self):
        with self.client:
            return self.client.loop.run_until_complete(self._run_get_messages_routine())
    
    def set_message_offset(self, offset):
        self.starting_offset_id = offset

if __name__ == "__main__":
    telegram_api = TelegramApi()
    telegram_api.create_loop()