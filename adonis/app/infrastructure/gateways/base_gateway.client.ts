import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios'
import gatewayConfig from '#config/gateways'

interface BearerAuthenticatedClientOptions {
  baseURL: string
  getToken: () => Promise<string>
}

interface HeaderAuthenticatedClientOptions {
  baseURL: string
  headers?: Record<string, string>
}

export default abstract class BaseGatewayClient {
  protected createClient(config: AxiosRequestConfig): AxiosInstance {
    return axios.create({
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      ...config,
    })
  }

  protected createBearerAuthenticatedClient(
    options: BearerAuthenticatedClientOptions
  ): AxiosInstance {
    const client = this.createClient({ baseURL: options.baseURL })

    client.interceptors.request.use(async (config) => {
      const token = await options.getToken()
      const headers = AxiosHeaders.from(config.headers)

      headers.set('Authorization', `Bearer ${token}`)
      config.headers = headers

      return config
    })

    return client
  }

  protected createHeaderAuthenticatedClient(
    options: HeaderAuthenticatedClientOptions
  ): AxiosInstance {
    return this.createClient({
      baseURL: options.baseURL,
      headers: {
        'Gateway-Auth-Token': gatewayConfig.auth.token,
        'Gateway-Auth-Secret': gatewayConfig.auth.secret,
        ...options.headers,
      },
    })
  }

  protected async unwrap<T>(request: Promise<AxiosResponse<T>>, gatewayName: string): Promise<T> {
    try {
      const response = await request
      return response.data
    } catch (error) {
      throw this.toGatewayError(error, gatewayName)
    }
  }

  private toGatewayError(error: unknown, gatewayName: string) {
    if (error instanceof AxiosError) {
      const status = error.response?.status
      const statusSuffix = typeof status === 'number' ? ` with status ${status}` : ''
      return new Error(`${gatewayName} request failed${statusSuffix}`)
    }

    return error instanceof Error ? error : new Error(`${gatewayName} request failed`)
  }
}
