// The JWT secret key should be stored securely in an environment variable in a real application.
// For this example, we use a constant string.
export const jwtConstants = {
  // DO NOT use this value in production! Use process.env.JWT_SECRET
  secret: 'DO_NOT_USE_THIS_SECRET_IN_PRODUCTION',
  // Token expiration time
  expiresIn: '48h', // Set to a short time for security, usually 5-15 minutes
};