export const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const checkPasswordStrength = (password: string) => {
  let score = 0;
  let message = "";

  if (password.length >= 8) score++;
  if (password.match(/[A-Z]/)) score++;
  if (password.match(/[0-9]/)) score++;
  if (password.match(/[^A-Za-z0-9]/)) score++;

  switch (score) {
    case 0:
    case 1:
      message = "弱";
      break;
    case 2:
      message = "中";
      break;
    case 3:
      message = "强";
      break;
    case 4:
      message = "非常强";
      break;
  }

  return { score, message };
};
