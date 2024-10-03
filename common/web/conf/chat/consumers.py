# ===============================================================================================
# ========================================== IMPORT =============================================
# ===============================================================================================

# ______________________________ Include for [///] ___________________________________

import json
from channels.generic.websocket import AsyncWebsocketConsumer

# ______________________________ Include for models apps ____________________________

from users.models import Player
from chat.models import Friends, Messages, GameInvitation, Notification


# ===============================================================================================
# ======================================= SocialConsumer ========================================
# ===============================================================================================


class SocialConsumer(AsyncWebsocketConsumer):
    """
    Manages the WebSocket connection for social updates between users.
    Handles group communication for real-time social updates.

    Attributes:
    -----------
    room_name : str
        Name of the current WebSocket room.
    room_group_name : str
        Name of the group where the WebSocket connections are managed.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room_name = None
        self.room_group_name = None

    async def connect(self):
        """
        Establishes a WebSocket connection and joins the 'social' room.
        """
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'social_{self.room_name}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        """
        Handles the disconnection from the WebSocket and removes the client from the group.
        """
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        """
        Receives messages from the WebSocket and broadcasts them to the group.
        
        Parameters:
        -----------
        text_data : str
            The JSON-encoded string containing the message.
        """
        try:
            text_data_json = json.loads(text_data)
            updateId = text_data_json['updateId']
            senderId = text_data_json['senderId']
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'social_updateId',
                    'updateId': updateId,
                    'senderId' : senderId
                }
            )
        except json.JSONDecodeError as e:
            print(f'Error: {e}')
        except Exception as e:
            print(f'Error: {e}')

    async def social_updateId(self, event):
        """
        Broadcasts the social update to all connected clients in the group.
        
        Parameters:
        -----------
        event : dict
            The event containing the update ID and sender ID.
        """
        try:
            updateId = event['updateId']
            senderId = event['senderId']

            await self.send(text_data=json.dumps({
                'updateId': updateId,
                'senderId' : senderId
            }))
        except Exception as e:
            print(f'Error: {e}')


# ===============================================================================================
# ======================================= ChatConsumer ==========================================
# ===============================================================================================


class ChatConsumer(AsyncWebsocketConsumer):
    """
    Manages WebSocket communication for real-time chat between users.
    Handles sending and receiving chat messages within a room.

    Attributes:
    -----------
    room_name : str
        Name of the current chat room.
    room_group_name : str
        Name of the group where the WebSocket connections are managed.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room_name = None
        self.room_group_name = None

    async def connect(self):
        """
        Establishes a WebSocket connection and joins the 'chat' room.
        """
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        """
        Handles the disconnection from the WebSocket and removes the client from the group.
        """
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        """
        Receives a chat message from the WebSocket and broadcasts it to the group.

        Parameters:
        -----------
        text_data : str
            The JSON-encoded string containing the message, sender ID, and contact ID.
        """
        try:
            text_data_json = json.loads(text_data)
            message = text_data_json['message']
            senderId = text_data_json['senderId']
            contactId = text_data_json['contactId']

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'senderId' : senderId,
                    'contactId' : contactId
                }
            )
        except json.JSONDecodeError as e:
            print(f'Error: {e}')
        except Exception as e:
            print(f'Error: {e}')

    async def chat_message(self, event):
        """
        Broadcasts the chat message to all connected clients in the group.

        Parameters:
        -----------
        event : dict
            The event containing the message, sender ID, and contact ID.
        """
        try:
            message = event['message']
            senderId = event['senderId']
            contactId = event['contactId']

            await self.send(text_data=json.dumps({
                'message': message,
                'senderId' : senderId,
                'contactId' : contactId
            }))
        except Exception as e:
            print(f'Error: {e}')
