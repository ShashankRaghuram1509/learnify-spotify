import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import UpgradeToProPage from '../pages/dashboard/student/UpgradeToPro';
import { supabase } from '@/integrations/supabase/client';
import { vi } from 'vitest';
import { useAuth } from '@/hooks/useAuth';
import { Toaster } from "@/components/ui/toaster";

// Mock supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
    auth: {
      getSession: vi.fn(),
    },
  },
}));

// Mock useAuth hook
vi.mock('@/hooks/useAuth');

describe('UpgradeToProPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({ user: { id: '123' }, role: 'student', login: vi.fn(), logout: vi.fn(), signup: vi.fn() } as any);

    // Mock Razorpay as a constructor function
    window.Razorpay = vi.fn(function(options) {
      return {
        open: () => {
          // Immediately invoke the handler for the test
          options.handler({
            razorpay_order_id: 'order_123',
            razorpay_payment_id: 'pay_123',
            razorpay_signature: 'sig_123',
          });
        },
      };
    });
  });

  it('should call payment verification function with Authorization header', async () => {
    // Arrange
    const mockSession = { data: { session: { access_token: 'fake-token' } } };
    vi.mocked(supabase.auth.getSession).mockResolvedValue(mockSession as any);

    const mockOrderData = { keyId: 'key', amount: 299900, currency: 'INR', orderId: 'order_123' };
    vi.mocked(supabase.functions.invoke)
      // First call for creating the order
      .mockResolvedValueOnce({ data: mockOrderData, error: null })
      // Second call for verifying the payment
      .mockResolvedValueOnce({ data: { success: true }, error: null });

    render(
      <>
        <UpgradeToProPage />
        <Toaster />
      </>
    );

    // Act
    const premiumPlanCard = screen.getByText('Premium', {selector: 'h3'}).closest('div[class*="border-primary"]');
    if (!premiumPlanCard) {
      throw new Error("Could not find premium plan card");
    }
    const premiumButton = within(premiumPlanCard).getByRole('button', { name: /Choose Premium/i });
    fireEvent.click(premiumButton);

    // Assert
    await waitFor(() => {
      const verifyCall = vi.mocked(supabase.functions.invoke).mock.calls.find(
        call => call[0] === 'razorpay-verify-payment'
      );

      expect(verifyCall).toBeDefined();

      // This is the key assertion
      const invokeOptions = verifyCall[1] as any;
      expect(invokeOptions.headers).toHaveProperty('Authorization', `Bearer ${mockSession.data.session.access_token}`);
    });
  });
});
