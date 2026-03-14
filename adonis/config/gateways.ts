const gatewayConfig = {
  auth: {
    token: process.env.GATEWAY_AUTH_TOKEN || 'tk_f2198cc671b5289fa856',
    secret: process.env.GATEWAY_AUTH_SECRET || '3d15e8ed6131446ea7e3456728b1211f',
  },
  one: {
    name: process.env.GATEWAY_ONE_NAME || 'Gateway 1',
    baseUrl: process.env.GATEWAY_ONE_BASE_URL || 'http://localhost:3001',
    loginPath: '/login',
  },
  two: {
    name: process.env.GATEWAY_TWO_NAME || 'Gateway 2',
    baseUrl: process.env.GATEWAY_TWO_BASE_URL || 'http://localhost:3002',
  },
}

export default gatewayConfig

export function normalizeGatewayName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '')
}
