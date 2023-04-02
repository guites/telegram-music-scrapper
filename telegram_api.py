import json
import sys

from decouple import config
from glob import glob
from telethon import TelegramClient
from telethon.tl.functions.channels import GetParticipantsRequest
from telethon.tl.functions.messages import GetHistoryRequest
from telethon.tl.types import ChannelParticipantsSearch, PeerChannel


api_id = config("API_ID")
api_hash = config("API_HASH")
client = TelegramClient("anon", api_id, api_hash)
channel_id = int(config("CHANNEL_ID"))


async def get_channel_messages(
    channel, starting_offset_id=0, limit=100, total_count_limit=200
):
    offset_id = starting_offset_id
    all_messages = []
    total_messages = 0

    while True:
        print("Current Offset ID is:", offset_id, "; Total Messages:", total_messages)
        history = await client(
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


async def get_participants(channel, refetch=False):
    if not refetch:
        try:
            with open("user_data.json", "r") as outfile:
                all_user_details = json.load(outfile)
            return all_user_details
        except FileNotFoundError:
            pass

    print("Fetching from telegram API...")
    offset = 0
    limit = 100
    all_participants = []

    while True:
        participants = await client(
            GetParticipantsRequest(
                channel, ChannelParticipantsSearch(""), offset, limit, hash=0
            )
        )
        if not participants.users:
            break
        all_participants.extend(participants.users)
        offset += len(participants.users)

    all_user_details = []
    for participant in all_participants:
        all_user_details.append(
            {
                "id": participant.id,
                "first_name": participant.first_name,
                "last_name": participant.last_name,
                "user": participant.username,
                "phone": participant.phone,
                "is_bot": participant.bot,
            }
        )

    with open("user_data.json", "w") as outfile:
        json.dump(all_user_details, outfile)

    return all_user_details


def get_newest_message_id():
    message_files = glob("*-messages.json")
    message_ids = []
    for f in message_files:
        message_id = f.split("-")[0]
        message_ids.append(int(message_id))
    if len(message_ids) > 0:
        return min(message_ids)
    return 0


async def main():
    input_channel = PeerChannel(channel_id)
    channel = await client.get_entity(input_channel)

    starting_message_offset_id = get_newest_message_id()
    print(f"starting at message_id {starting_message_offset_id}")
    messages, earliest_message_id = await get_channel_messages(
        channel, starting_message_offset_id
    )

    save_file = f"{earliest_message_id}-messages.json"

    with open(save_file, "w") as outfile:
        json.dump(messages, outfile, default=str)
    print(f"saved messages at {save_file}")


with client:
    client.loop.run_until_complete(main())
