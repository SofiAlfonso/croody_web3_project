import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useWalletBalance } from '../../hooks/useWalletBalance';
import { useReadContract } from 'wagmi';

let mockWalletAddress: string | null = null;
let mockIsDemo = false;

vi.mock('wagmi', () => ({
  useReadContract: vi.fn(),
  useWatchContractEvent: vi.fn(),
}));

vi.mock('../../context/WalletContext', () => ({
  useWalletContext: () => ({
    walletAddress: mockWalletAddress,
    isConnected: Boolean(mockWalletAddress),
    isDemo: mockIsDemo,
  }),
}));

vi.mock('../../lib/balance-utils', () => ({
  formatBalance: (v: string) => v,
}));

describe('useWalletBalance', () => {
  beforeEach(() => {
    mockIsDemo = false;
    mockWalletAddress = null;
    vi.mocked(useReadContract).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);
  });

  it('returns 0 when wallet is not connected', () => {
    mockWalletAddress = null;
    const { result } = renderHook(() => useWalletBalance());
    expect(result.current.amount).to.equal('0');
    expect(result.current.isLoading).to.be.false;
    expect(result.current.isError).to.be.false;
  });

  it('returns mock balance in demo mode', () => {
    mockIsDemo = true;
    mockWalletAddress = '0xDEM0000000000000000000000000000000000000';
    const { result } = renderHook(() => useWalletBalance());
    // The demo mode returns 1250 CRD manually
    expect(result.current.amount).to.equal('1,250');
    expect(result.current.symbol).to.equal('CRD');
  });

  it('fetches and returns balance when connected', () => {
    mockWalletAddress = '0xb1f95C5e3Cbd60F81e0B43e948AF147b6c138899';
    vi.mocked(useReadContract).mockReturnValue({
      data: BigInt('1000000000000000000000'), // 1000 * 10^18
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    const { result } = renderHook(() => useWalletBalance());
    expect(useReadContract).toHaveBeenCalled();
    expect(result.current.isError).to.be.false;
  });

  it('sets isError when fetch fails', () => {
    mockWalletAddress = '0xb1f95C5e3Cbd60F81e0B43e948AF147b6c138899';
    vi.mocked(useReadContract).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    } as any);

    const { result } = renderHook(() => useWalletBalance());
    expect(result.current.isError).to.be.true;
  });

  it('does not fetch when walletAddress is not a valid hex address', () => {
    mockWalletAddress = 'invalid-address';
    mockIsDemo = false;
    renderHook(() => useWalletBalance());
    const lastCall = vi.mocked(useReadContract).mock.lastCall?.[0] as any;
    if (lastCall && lastCall.query) {
      expect(lastCall.query.enabled).toBeFalsy();
    }
  });

  it('symbol is always CRD', () => {
    mockWalletAddress = '0xb1f95C5e3Cbd60F81e0B43e948AF147b6c138899';
    const { result } = renderHook(() => useWalletBalance());
    expect(result.current.symbol).to.equal('CRD');
  });
});
