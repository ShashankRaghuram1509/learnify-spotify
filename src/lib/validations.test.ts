import { signUpSchema } from './validations';

describe('signUpSchema', () => {
  it('should validate a correct sign-up object', () => {
    const validInput = {
      email: 'test@example.com',
      password: 'Password123',
      fullName: 'Test User',
    };
    const result = signUpSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('should invalidate an incorrect email', () => {
    const invalidInput = {
      email: 'invalid-email',
      password: 'Password123',
      fullName: 'Test User',
    };
    const result = signUpSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });

  it('should invalidate a password that is too short', () => {
    const invalidInput = {
      email: 'test@example.com',
      password: 'short',
      fullName: 'Test User',
    };
    const result = signUpSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });

  it('should invalidate a password without a number', () => {
    const invalidInput = {
      email: 'test@example.com',
      password: 'Password',
      fullName: 'Test User',
    };
    const result = signUpSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });

  it('should invalidate a password without an uppercase letter', () => {
    const invalidInput = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
    };
    const result = signUpSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });

  it('should invalidate a password without a lowercase letter', () => {
    const invalidInput = {
      email: 'test@example.com',
      password: 'PASSWORD123',
      fullName: 'Test User',
    };
    const result = signUpSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });

  it('should invalidate an empty full name', () => {
    const invalidInput = {
      email: 'test@example.com',
      password: 'Password123',
      fullName: '',
    };
    const result = signUpSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });
});

import { signInSchema } from './validations';

describe('signInSchema', () => {
  it('should validate a correct sign-in object', () => {
    const validInput = {
      email: 'test@example.com',
      password: 'password123',
    };
    const result = signInSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('should invalidate an incorrect email', () => {
    const invalidInput = {
      email: 'invalid-email',
      password: 'password123',
    };
    const result = signInSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });

  it('should invalidate an empty password', () => {
    const invalidInput = {
      email: 'test@example.com',
      password: '',
    };
    const result = signInSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });
});

import { paymentVerificationSchema } from './validations';

describe('paymentVerificationSchema', () => {
  it('should validate a correct payment verification object', () => {
    const validInput = {
      razorpay_order_id: 'order_123',
      razorpay_payment_id: 'pay_123',
      razorpay_signature: 'sig_123',
      amount: 1000,
      planName: 'Premium',
    };
    const result = paymentVerificationSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('should invalidate a missing razorpay_order_id', () => {
    const invalidInput = {
      razorpay_payment_id: 'pay_123',
      razorpay_signature: 'sig_123',
      amount: 1000,
      planName: 'Premium',
    };
    const result = paymentVerificationSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });

  it('should invalidate a negative amount', () => {
    const invalidInput = {
      razorpay_order_id: 'order_123',
      razorpay_payment_id: 'pay_123',
      razorpay_signature: 'sig_123',
      amount: -1000,
      planName: 'Premium',
    };
    const result = paymentVerificationSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });

  it('should invalidate an invalid planName', () => {
    const invalidInput = {
      razorpay_order_id: 'order_123',
      razorpay_payment_id: 'pay_123',
      razorpay_signature: 'sig_123',
      amount: 1000,
      planName: 'InvalidPlan',
    };
    const result = paymentVerificationSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });
});
