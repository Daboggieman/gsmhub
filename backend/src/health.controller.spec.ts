import { ServiceUnavailableException } from '@nestjs/common';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('reports liveness without checking dependencies', () => {
    const controller = new HealthController({ readyState: 0 } as any);
    expect(controller.live()).toEqual(expect.objectContaining({ status: 'ok' }));
  });

  it('reports readiness when MongoDB is connected', () => {
    const controller = new HealthController({ readyState: 1 } as any);
    expect(controller.ready()).toEqual({ status: 'ok', database: 'connected' });
  });

  it('rejects readiness when MongoDB is unavailable', () => {
    const controller = new HealthController({ readyState: 0 } as any);
    expect(() => controller.ready()).toThrow(ServiceUnavailableException);
  });
});
