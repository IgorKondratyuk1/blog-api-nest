export function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export const basicAuthValue = 'Basic YWRtaW46cXdlcnR5';
export const usersPassword = '12345678';
