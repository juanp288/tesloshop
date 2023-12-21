import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { MessagesWsService } from './messages-ws.service';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly messagesWsService: MessagesWsService) {}

  handleConnection(client: Socket, ...args: any[]) {
    this.messagesWsService.registerClient(client);
    console.log(`Conectados: ${client.id}`);
  }

  handleDisconnect(client: any) {
    console.log(
      `Cliente desconectado: ${this.messagesWsService.getConnectedClients()}`,
    );
    this.messagesWsService.removeClient(client.id);
  }
}
