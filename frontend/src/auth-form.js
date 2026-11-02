export function createAuthPayload(mode, form) {
  const credentials = {
    email: form.email.trim(),
    password: form.password
  };

  if (mode === 'register') {
    return {
      name: form.name.trim(),
      ...credentials
    };
  }

  return credentials;
}
