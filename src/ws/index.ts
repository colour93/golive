import { Request } from "express";

import { parse } from "url";
import { chatHandle } from "./chat";
import { getUserInfoByUsername } from "../service/user";
import sessionParser from "..";
import { Socket } from "net";

export async function wssCtrl(request: Request, socket: Socket, head: Buffer) {
  const { pathname } = parse(request.url);

  const username = await getUsernameFromSession(request);

  switch (pathname) {
    case "/ws/chat":
      await chatHandle(request, socket, head, username);
      break;

    default:
      socket.destroy();
      return;
  }
}

// 因为 ws 不能很好直接用 express-session
// 所以有这个
async function getUsernameFromSession(
  request: Request
): Promise<string | null> {
  return new Promise(async (resolve) => {
    sessionParser(request, {} as any, async () => {
      if (request.session.username) {
        const user = await getUserInfoByUsername(request.session.username);
        resolve(user ? request.session.username : null);
      } else {
        resolve(null);
      }
      return;
    });
  });
}
