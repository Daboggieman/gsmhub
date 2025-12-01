import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Observable, firstValueFrom, throwError, timer } from 'rxjs'; // Import timer
import { catchError, retry, delayWhen, tap, map } from 'rxjs/operators'; // Import map
import { ConfigService } from '@nestjs/config';
import { ApiResponse } from '../../common/utils/response-formatter.util'; // Import ApiResponse for consistent error handling

@Injectable()
export class ExternalApiService {
  private readonly logger = new Logger(ExternalApiService.name);
  private readonly BASE_URL: string;
  private lastRequestTime: number = 0;
  private readonly requestInterval: number; // Minimum interval between requests in ms

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.BASE_URL = this.configService.get<string>('GSM_ARENA_API_URL') || 'https://api-mobilespecs.azharimm.dev';
    this.requestInterval = this.configService.get<number>('EXTERNAL_API_REQUEST_INTERVAL') || 100; // Default 100ms
  }

  private validateResponse<T>(response: AxiosResponse<T>): T {
    const apiResponse = response.data as any; // Cast to any to check for common API response structure

    if (apiResponse && apiResponse.status === false) {
      this.logger.error(`External API returned status: false. Message: ${apiResponse.message || 'Unknown error'}`);
      throw new HttpException(apiResponse.message || 'External API error', HttpStatus.BAD_GATEWAY);
    }
    
    if (apiResponse && (apiResponse.data === undefined || apiResponse.data === null)) {
      this.logger.error(`External API response missing data field. Response: ${JSON.stringify(apiResponse)}`);
      throw new HttpException('External API response malformed: missing data', HttpStatus.BAD_GATEWAY);
    }

    return apiResponse.data; // Assuming the actual data is nested under 'data'
  }

  private async makeRequest<T>(
    method: 'get' | 'post' | 'put' | 'delete' | 'patch',
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    // Basic rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.requestInterval) {
      const delayAmount = this.requestInterval - timeSinceLastRequest;
      this.logger.debug(`Rate limit hit, delaying request by ${delayAmount}ms`);
      await new Promise(resolve => setTimeout(resolve, delayAmount));
    }
    this.lastRequestTime = Date.now();


    const fullUrl = `${this.BASE_URL}${url}`;
    let request$: Observable<AxiosResponse<T>>;

    switch (method) {
      case 'get':
        request$ = this.httpService.get<T>(fullUrl, config);
        break;
      case 'post':
        request$ = this.httpService.post<T>(fullUrl, data, config);
        break;
      // Add other HTTP methods as needed
      default:
        throw new HttpException('Unsupported HTTP method', HttpStatus.METHOD_NOT_ALLOWED); // Directly throw
    }

    const retryCount = this.configService.get<number>('EXTERNAL_API_RETRY_COUNT', 3); // Default to 3
    const retryDelayMs = this.configService.get<number>('EXTERNAL_API_RETRY_DELAY_MS', 1000); // Default to 1000ms

    const response = await firstValueFrom(
      request$.pipe(
        retry({
          count: retryCount,
          delay: (error, retryAttempt) => { // retryAttempt is 1-based
            const delayMs = retryDelayMs * retryAttempt;
            this.logger.warn(
              `Retrying request to ${fullUrl} (attempt ${retryAttempt}). Delaying for ${delayMs}ms. Error: ${error.message}`,
            );
            return timer(delayMs); // Use timer to create an observable that emits after delayMs
          },
        }),
        catchError(error => {
          this.logger.error(`Error on ${method.toUpperCase()} request to ${fullUrl}: ${error.message}`, error.stack);
          if (error.response) {
            throw new HttpException(error.response.data, error.response.status);
          } else if (error.request) {
            throw new HttpException('No response received from external API', HttpStatus.SERVICE_UNAVAILABLE);
          } else {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
          }
        }),
        tap(response => {
            this.logger.debug(`Successful ${method.toUpperCase()} request to ${fullUrl}. Status: ${response.status}`);
        })
      ),
    );

    return this.validateResponse(response); // Validate and extract data
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.makeRequest<T>('get', url, null, config);
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.makeRequest<T>('post', url, data, config);
  }
}