export function checkEmail(email: string): boolean {
  return /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/.test(
    email
  );
}

export function checkNickname(nickname: string): boolean {
  return !/\s/.test(nickname);
}

export function checkUsername(username: string): boolean {
  return /^[a-zA-Z][a-zA-Z0-9_-]{2,16}$/.test(username);
}
