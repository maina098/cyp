import { ResultsGateway } from './results.gateway';

describe('ResultsGateway', () => {
  it('allows public election subscribers without authentication', () => {
    const gateway = new ResultsGateway({} as any, {} as any);
    const client = { id: 'client-1', data: {}, join: jest.fn() } as any;

    const result = gateway.handleSubscribe('election-1', client);

    expect(result).toEqual({ ok: true, electionId: 'election-1' });
    expect(client.join).toHaveBeenCalledWith('election:election-1');
  });

  it('still restricts admin-only subscriptions to admins', () => {
    const gateway = new ResultsGateway({} as any, {} as any);
    const client = { id: 'client-2', data: { user: { role: 'USER' } }, join: jest.fn() } as any;

    const result = gateway.handleSubscribeApplications('election-1', client);

    expect(result).toEqual({ ok: false, error: 'Forbidden: Admin access required' });
    expect(client.join).not.toHaveBeenCalled();
  });
});
