import { WebSocket } from "ws";
import { UserInfo } from "../entity/User";

export class WsClients extends Map<WebSocket, string> {}

export abstract class WsBody {
  abstract action:
    | "result"
    | "updateClientsCount"
    | "sendMessage"
    | "receiveMessage";
  abstract data: object;
}

export class WsCommonResultBody extends WsBody {
  action: "result";
  data: {
    code: number;
    msg: string;
  };
}

export class WsUpdateClientsCountBody extends WsBody {
  action: "updateClientsCount";
  data: {
    roomId: string;
    count: number;
  };
}

export class WsSendMessageBody extends WsBody {
  action: "sendMessage";
  data: {
    message: string;
  };
}

export class WsReceiveMessageBody extends WsBody {
  action: "receiveMessage";
  data: {
    roomId: string;
    sender: UserInfo;
    message: string;
  };
}
