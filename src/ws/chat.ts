import { WebSocket, WebSocketServer } from "ws";
import { Request } from "express";
import {
  getUserInfoByUsername,
  getUserLiveInfoByUsername,
} from "../service/user";
import { UserInfo, UserLiveInfo } from "../entity/User";
import { parse } from "url";
import {
  WsBody,
  WsClients,
  WsCommonResultBody,
  WsReceiveMessageBody,
  WsSendMessageBody,
  WsUpdateClientsCountBody,
} from "../types/ws";
import { Socket } from "net";

const chatWss = new WebSocketServer({ noServer: true });

const chatClients = new Map() as WsClients;

chatWss.on(
  "connection",
  (
    ws: WebSocket,
    request: Request,
    userLiveInfo: UserLiveInfo,
    username: string | null
  ) => {
    ws.on("error", console.error);

    chatClients.set(ws, userLiveInfo.user.username);
    updateClientsCount(chatClients, userLiveInfo.user.username);

    ws.on("close", () => {
      chatClients.delete(ws);
      updateClientsCount(chatClients, userLiveInfo.user.username);
    });

    ws.on("message", (data, isBinary) => {
      try {
        const obj: WsBody = JSON.parse(data.toString());

        switch (obj.action) {
          case "sendMessage":
            sendMessageCtrl(ws, obj as WsSendMessageBody, username);
            break;

          default:
            ws.send(
              JSON.stringify({
                action: "result",
                data: {
                  code: 400,
                  msg: "未知操作",
                },
              } as WsCommonResultBody)
            );
            break;
        }
      } catch (error) {
        ws.send(
          JSON.stringify({
            action: "result",
            data: {
              code: 400,
              msg: "请求体格式有误",
            },
          } as WsCommonResultBody)
        );
      }
    });
  }
);

function updateClientsCount(clients: WsClients, username: string) {
  let count = 0;

  clients.forEach((roomId, client) => {
    if (roomId === username) count++;
  });

  clients.forEach((roomId, client) => {
    if (roomId === username) {
      client.send(
        JSON.stringify({
          action: "updateClientsCount",
          data: {
            roomId,
            count,
          },
        } as WsUpdateClientsCountBody)
      );
    }
  });
}

async function sendMessageCtrl(
  ws: WebSocket,
  reqBody: WsSendMessageBody,
  senderUsername: string
) {
  if (!senderUsername) {
    ws.send(
      JSON.stringify({
        action: "result",
        data: {
          code: 401,
          msg: "未登录",
        },
      } as WsCommonResultBody)
    );
    return;
  }

  const sender = await getUserInfoByUsername(senderUsername);
  if (!sender) {
    ws.send(
      JSON.stringify({
        action: "result",
        data: {
          code: 401,
          msg: "登录信息有误",
        },
      } as WsCommonResultBody)
    );
    return;
  }

  try {
    const { data } = reqBody;
    const { message } = data;

    sendMessage(sender, message, chatClients.get(ws));

    ws.send(
      JSON.stringify({
        action: "result",
        data: {
          code: 0,
          msg: "发送成功",
        },
      } as WsCommonResultBody)
    );
  } catch (error) {
    ws.send(
      JSON.stringify({
        action: "result",
        data: {
          code: 400,
          msg: "请求体有误",
        },
      } as WsCommonResultBody)
    );
  }
}

function sendMessage(sender: UserInfo, message: string, target: string) {
  chatClients.forEach((roomId, client) => {
    if (roomId === target) {
      client.send(
        JSON.stringify({
          action: "receiveMessage",
          data: {
            roomId,
            sender,
            message,
          },
        } as WsReceiveMessageBody)
      );
    }
  });
}

export async function chatHandle(
  request: Request,
  socket: Socket,
  head: Buffer,
  username: string | null
) {
  const { search } = parse(request.url);
  const searchParams = new URLSearchParams(search);

  const roomId = searchParams.get("roomId");
  if (!roomId) {
    socket.write("HTTP/1.1 400 Bad Request\r\n\r\n");
    socket.destroy();
  }

  const userLiveInfo = await getUserLiveInfoByUsername(roomId);
  if (!userLiveInfo) {
    socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    socket.destroy();
  }

  chatWss.handleUpgrade(request, socket, head, (ws) => {
    chatWss.emit("connection", ws, request, userLiveInfo, username);
  });
}
