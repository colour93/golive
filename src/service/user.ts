import { AppDataSource } from "../data-source";
import { User, UserInfo, UserLiveInfo, UserProfile } from "../entity/User";

const config = require(process.env.CONFIG_PATH);

const userRepo = AppDataSource.getRepository(User);

/**
 * 通过 username 获取 userInfo
 * @param username
 * @returns
 */
export async function getUserInfoByUsername(
  username: string
): Promise<UserInfo | null> {
  const user = await userRepo.findOne({ where: { username } });
  if (!user) return null;
  return convertUserToUserInfo(user);
}

/**
 * 通过 username 获取 userProfile
 * @param username
 * @returns
 */
export async function getUserProfileByUsername(
  username: string
): Promise<UserInfo | null> {
  const user = await userRepo.findOne({ where: { username } });
  if (!user) return null;
  return convertUserToUserProfile(user);
}

export async function getUserLiveInfoByUsername(
  username: string
): Promise<UserLiveInfo | null> {
  const userInfo = await getUserInfoByUsername(username);
  if (!userInfo) return null;
  return convertUserInfoToUserLiveInfo(userInfo);
}

/**
 * 通过 username 获取头像
 * @param username
 * @returns
 */
export async function getUserAvatarByUsername(username: string): Promise<{
  avatar: Buffer | null;
  avatarExt: "png" | "jpeg" | "webp" | null;
} | null> {
  const result = await userRepo.findOne({ where: { username } });
  if (!result) return null;
  const { avatar, avatarExt } = result;
  return { avatar, avatarExt };
}

export async function updateUserProfileByUsername(
  username: string,
  updateObj: object
): Promise<boolean> {
  const user = await userRepo.findOne({ where: { username } });
  if (!user) return false;

  Object.assign(user, updateObj);
  return (await userRepo.save(user)) ? true : false;
}

/**
 * 将 User 转为 UserInfo
 * @param user
 * @returns
 */
function convertUserToUserInfo(user: User): UserInfo {
  const { id, username, nickname, verified } = user;
  const avatarUrl = "/api/live/avatar/" + username;
  return { id, username, nickname, verified, avatarUrl };
}

/**
 * 将 User 转为 UserInfo
 * @param user
 * @returns
 */
function convertUserInfoToUserLiveInfo(user: UserInfo): UserLiveInfo {
  return {
    user,
    stream:
      user.verified === 1
        ? {
            flv: `/live/${user.username}.flv`,
            hls: `/live/${user.username}.m3u8`,
          }
        : null,
    ws:
      user.verified === 1
        ? {
            chat: `${config.tls?.enable ? "wss" : "ws"}://${config.host}:${
              config.tls?.enable ? config.tls.port : config.port
            }/ws/chat?roomId=${user.username}`,
          }
        : null,
  };
}

/**
 * 将 User 转为 UserProfile
 * @param user
 * @returns
 */
function convertUserToUserProfile(user: User): UserProfile {
  const { id, username, nickname, verified, key } = user;
  const avatarUrl = "/api/live/avatar/" + username;

  const streamServer =
    verified === 1
      ? `rtmp://${config.host}:${config.livego.rtmp_port}/${config.livego.app_name}`
      : null;
  const liveroom =
    verified === 1
      ? config.tls?.enable
        ? `https://${config.host}:${config.tls.port}/#/live/${username}`
        : `http://${config.host}:${config.port}/#/live/${username}`
      : null;
  const streamKey = verified === 1 ? key : null;
  return {
    id,
    username,
    nickname,
    verified,
    avatarUrl,
    streamServer,
    streamKey,
    liveroom,
  };
}
