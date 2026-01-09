import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, BookOpen, ArrowLeft, Mail, KeyRound, Phone, Lock, Check } from 'lucide-react';
import { z } from 'zod';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

const emailAuthSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
});

const emailSchema = z.string().email('Invalid email address').max(255);
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters').max(100);

type AuthStep = 'credentials' | 'forgot-password' | 'new-password';
type SignupStep = 'email' | 'otp' | 'details';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') === 'signup' ? 'signup' : 'login';
  });
  const [authStep, setAuthStep] = useState<AuthStep>('credentials');
  const [signupStep, setSignupStep] = useState<SignupStep>('email');
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const { signIn, user, loading: authLoading } = useAuth();
  const { isProfileComplete, loading: profileLoading } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Check for password recovery token in URL hash
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');
    
    if (accessToken && type === 'recovery') {
      setAuthStep('new-password');
      toast({
        title: 'Reset Link Verified',
        description: 'Please enter your new password.',
      });
    }
  }, [toast]);

  useEffect(() => {
    if (!authLoading && !profileLoading && user && authStep !== 'new-password') {
      if (isProfileComplete) {
        navigate(from, { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    }
  }, [user, authLoading, profileLoading, isProfileComplete, navigate, from, authStep]);

  const signInWithGoogle = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth`
        }
      });
      if (error) {
        toast({
          title: 'Google Sign-in Failed',
          description: error.message,
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to initiate Google sign-in',
        variant: 'destructive',
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  // Step 1: Send OTP to email
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validation = emailSchema.safeParse(email);
      if (!validation.success) {
        toast({
          title: 'Validation Error',
          description: validation.error.errors[0].message,
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: 'Failed to send OTP',
          description: data.error || 'Please try again.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'OTP Sent!',
          description: 'Check your email for the verification code.',
        });
        setSignupStep('otp');
        setResendCooldown(30);
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (otp.length !== 6) {
        toast({
          title: 'Invalid OTP',
          description: 'Please enter the 6-digit code.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: 'Verification Failed',
          description: data.error || 'Please try again.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Email Verified!',
          description: 'Now complete your account setup.',
        });
        setSignupStep('details');
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Complete signup
  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validation = passwordSchema.safeParse(password);
      if (!validation.success) {
        toast({
          title: 'Validation Error',
          description: validation.error.errors[0].message,
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        toast({
          title: 'Passwords do not match',
          description: 'Please make sure both passwords are the same.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/complete-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: 'Signup Failed',
          description: data.error || 'Please try again.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Account Created!',
          description: 'Please sign in with your credentials.',
        });
        // Reset and switch to login
        setSignupStep('email');
        setActiveTab('login');
        setOtp('');
        setPhone('');
        setConfirmPassword('');
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: 'Failed to resend OTP',
          description: data.error || 'Please try again.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'OTP Resent!',
          description: 'Check your email for the new code.',
        });
        setResendCooldown(30);
        setOtp('');
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validation = emailAuthSchema.safeParse({ email, password });
      if (!validation.success) {
        toast({
          title: 'Validation Error',
          description: validation.error.errors[0].message,
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      const { error } = await signIn(email, password);
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: 'Login failed',
            description: 'Invalid email or password. Please try again.',
            variant: 'destructive',
          });
        } else if (error.message.includes('Email not confirmed')) {
          toast({
            title: 'Email Not Verified',
            description: 'Please verify your email before logging in.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Login failed',
            description: error.message,
            variant: 'destructive',
          });
        }
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validation = emailSchema.safeParse(email);
      if (!validation.success) {
        toast({
          title: 'Validation Error',
          description: validation.error.errors[0].message,
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          title: 'Failed to send reset link',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Reset Link Sent',
          description: 'Please check your email and click the password reset link.',
        });
        setAuthStep('credentials');
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validation = passwordSchema.safeParse(password);
      if (!validation.success) {
        toast({
          title: 'Validation Error',
          description: validation.error.errors[0].message,
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        toast({
          title: 'Passwords do not match',
          description: 'Please make sure both passwords are the same.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        toast({
          title: 'Failed to reset password',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Password Reset Successful',
          description: 'Your password has been updated. You are now logged in.',
        });
        window.history.replaceState(null, '', window.location.pathname);
        setAuthStep('credentials');
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (authStep === 'forgot-password') {
      setAuthStep('credentials');
    } else if (authStep === 'new-password') {
      supabase.auth.signOut();
      window.history.replaceState(null, '', window.location.pathname);
      setAuthStep('credentials');
      setPassword('');
      setConfirmPassword('');
    }
  };

  const handleSignupBack = () => {
    if (signupStep === 'otp') {
      setSignupStep('email');
      setOtp('');
    } else if (signupStep === 'details') {
      setSignupStep('otp');
      setPassword('');
      setConfirmPassword('');
      setPhone('');
    }
  };

  const getCardDescription = () => {
    switch (authStep) {
      case 'forgot-password':
        return 'Enter your email to receive a password reset link';
      case 'new-password':
        return 'Create a new password for your account';
      default:
        if (activeTab === 'signup') {
          switch (signupStep) {
            case 'email':
              return 'Enter your email to receive a verification code';
            case 'otp':
              return `Enter the 6-digit code sent to ${email}`;
            case 'details':
              return 'Complete your account setup';
          }
        }
        return 'Sign in to your account or create a new one';
    }
  };

  // Signup step indicator
  const SignupStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[
        { step: 'email', icon: Mail, label: 'Email' },
        { step: 'otp', icon: KeyRound, label: 'Verify' },
        { step: 'details', icon: Lock, label: 'Details' },
      ].map((item, index) => {
        const isActive = signupStep === item.step;
        const isCompleted = 
          (signupStep === 'otp' && item.step === 'email') ||
          (signupStep === 'details' && (item.step === 'email' || item.step === 'otp'));
        
        return (
          <div key={item.step} className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${
              isCompleted 
                ? 'bg-primary text-primary-foreground' 
                : isActive 
                  ? 'bg-primary/20 text-primary ring-2 ring-primary' 
                  : 'bg-muted text-muted-foreground'
            }`}>
              {isCompleted ? (
                <Check className="h-4 w-4" />
              ) : (
                <item.icon className="h-4 w-4" />
              )}
            </div>
            {index < 2 && (
              <div className={`w-8 h-0.5 mx-1 ${
                isCompleted ? 'bg-primary' : 'bg-muted'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">EXAM Simplex</CardTitle>
          <CardDescription>{getCardDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Forgot Password - Enter Email */}
          {authStep === 'forgot-password' && (
            <div className="space-y-4">
              <Button variant="ghost" size="sm" onClick={handleBack} className="mb-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Reset Link
                </Button>
              </form>
            </div>
          )}

          {/* Set New Password */}
          {authStep === 'new-password' && (
            <div className="space-y-4">
              <Button variant="ghost" size="sm" onClick={handleBack} className="mb-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              
              <form onSubmit={handleSetNewPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Reset Password
                </Button>
              </form>
            </div>
          )}

          {/* Main Credentials View */}
          {authStep === 'credentials' && (
            <div className="space-y-4">
              {/* Google Sign-in */}
              <Button 
                variant="outline" 
                className="w-full gap-2" 
                onClick={signInWithGoogle}
                disabled={googleLoading || loading}
              >
                {googleLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                )}
                Continue with Google
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSignupStep('email'); }}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sign In
                    </Button>
                    <div className="text-center">
                      <Button
                        type="button"
                        variant="link"
                        onClick={() => setAuthStep('forgot-password')}
                        className="text-sm"
                      >
                        Forgot your password?
                      </Button>
                    </div>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <SignupStepIndicator />
                  
                  {/* Step 1: Email */}
                  {signupStep === 'email' && (
                    <form onSubmit={handleSendOTP} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={loading}
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Send Verification Code
                      </Button>
                    </form>
                  )}

                  {/* Step 2: OTP Verification */}
                  {signupStep === 'otp' && (
                    <div className="space-y-4">
                      <Button variant="ghost" size="sm" onClick={handleSignupBack} className="mb-2">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Change Email
                      </Button>
                      
                      <form onSubmit={handleVerifyOTP} className="space-y-4">
                        <div className="space-y-2">
                          <Label>Verification Code</Label>
                          <div className="flex justify-center">
                            <InputOTP
                              value={otp}
                              onChange={setOtp}
                              maxLength={6}
                              disabled={loading}
                            >
                              <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                              </InputOTPGroup>
                            </InputOTP>
                          </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
                          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Verify Code
                        </Button>
                        <div className="text-center">
                          <Button
                            type="button"
                            variant="link"
                            onClick={handleResendOTP}
                            disabled={resendCooldown > 0 || loading}
                            className="text-sm"
                          >
                            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Step 3: Phone + Password */}
                  {signupStep === 'details' && (
                    <div className="space-y-4">
                      <Button variant="ghost" size="sm" onClick={handleSignupBack} className="mb-2">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                      
                      <form onSubmit={handleCompleteSignup} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="signup-phone">Phone Number</Label>
                          <Input
                            id="signup-phone"
                            type="tel"
                            placeholder="+91 98765 43210"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            disabled={loading}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-password">Password</Label>
                          <Input
                            id="signup-password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                          <Input
                            id="signup-confirm-password"
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={loading}
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Create Account
                        </Button>
                      </form>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
