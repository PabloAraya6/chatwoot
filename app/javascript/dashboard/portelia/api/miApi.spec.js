import miApi from './miApi';

vi.mock('dashboard/store', () => ({
  default: { getters: { getCurrentUser: { access_token: 'agent-token' } } },
}));

afterEach(() => vi.unstubAllGlobals());

it('passes the caller signal without losing agent authentication', () => {
  const get = vi.fn();
  vi.stubGlobal('axios', { get });
  const { signal } = new AbortController();

  miApi.get('personas/12', { signal });

  expect(get).toHaveBeenCalledWith('/mi/api/personas/12', {
    headers: { Authorization: 'Bearer agent-token' },
    signal,
  });
});
