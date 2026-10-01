const assert = require('node:assert/strict');
const test = require('node:test');
const { JwtAuthGuard } = require('../dist/jwt-auth.guard');

function context(request) {
  return {
    getHandler: () => function handler() {},
    getClass: () => class Controller {},
    switchToHttp: () => ({ getRequest: () => request }),
  };
}

test('requires and verifies a Bearer token', async () => {
  const reflector = { getAllAndOverride: () => false };
  const jwt = { verifyAsync: async (token) => ({ sub: token }) };
  const guard = new JwtAuthGuard(reflector, jwt);
  const request = { headers: { authorization: 'Bearer user-id' } };

  assert.equal(await guard.canActivate(context(request)), true);
  assert.deepEqual(request.user, { sub: 'user-id' });
  await assert.rejects(() => guard.canActivate(context({ headers: {} })));
});
