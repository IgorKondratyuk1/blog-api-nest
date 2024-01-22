export class CookiesOptions {
  public static createOptions(isHttpOnly: boolean, secure: string, maxAge: number) {
    return {
      httpOnly: isHttpOnly,
      secure: secure !== 'development',
      maxAge: maxAge * 1000, //ms from now TODO cookies time
    };
  }
}
