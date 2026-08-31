import axios, { AxiosInstance } from 'axios';
import toast from 'react-hot-toast';
import { AuthResponse, LoginRequest, SignupRequest, Analysis, ChatMessage, ChatRequest, JDMatchResponse } from '@/types';
import { User } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use((config) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/signup', data);
    return response.data;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/login', data);
    return response.data;
  }

  async submitGithub(githubUrl: string): Promise<Analysis> {
    const response = await this.client.post<Analysis>('/profile/github', { githubUrl });
    return response.data;
  }

  async submitLinkedIn(linkedinUrl: string): Promise<Analysis> {
    const response = await this.client.post<Analysis>('/profile/linkedin', { linkedinUrl });
    return response.data;
  }

  async submitResume(file: File): Promise<Analysis> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.client.post<Analysis>('/profile/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getAnalyses(): Promise<Analysis[]> {
    const response = await this.client.get<Analysis[]>('/analysis');
    return response.data;
  }

  async getAnalysisById(id: number): Promise<Analysis> {
    const response = await this.client.get<Analysis>(`/analysis/${id}`);
    return response.data;
  }

  async sendChatMessage(data: ChatRequest): Promise<ChatMessage> {
    const response = await this.client.post<ChatMessage>('/chat', data);
    return response.data;
  }

  async getChatHistory(): Promise<ChatMessage[]> {
    const response = await this.client.get<ChatMessage[]>('/chat/history');
    return response.data;
  }

  async googleAuth(accessToken: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/google', { accessToken });
    return response.data;
  }

  // JD Matcher methods
  async analyzeJDMatchText(
    jdText: string,
    resumeFile: File,
    jobTitle?: string,
    companyName?: string
  ): Promise<JDMatchResponse> {
    const formData = new FormData();
    formData.append('jdText', jdText);
    formData.append('resume', resumeFile);
    if (jobTitle) formData.append('jobTitle', jobTitle);
    if (companyName) formData.append('companyName', companyName);

    const response = await this.client.post<JDMatchResponse>(
      '/jd-match/analyze-text',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async analyzeJDMatchFile(
    jdFile: File,
    resumeFile: File,
    jobTitle?: string,
    companyName?: string
  ): Promise<JDMatchResponse> {
    const formData = new FormData();
    formData.append('jdFile', jdFile);
    formData.append('resume', resumeFile);
    if (jobTitle) formData.append('jobTitle', jobTitle);
    if (companyName) formData.append('companyName', companyName);

    const response = await this.client.post<JDMatchResponse>(
      '/jd-match/analyze-file',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async getJDMatches(): Promise<JDMatchResponse[]> {
    const response = await this.client.get<JDMatchResponse[]>('/jd-match');
    return response.data;
  }

  async getJDMatchById(id: number): Promise<JDMatchResponse> {
    const response = await this.client.get<JDMatchResponse>(`/jd-match/${id}`);
    return response.data;
  }

  async sendSignupOTP(email: string): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>('/auth/send-signup-otp', { email });
    return response.data;
  }

  async verifySignupOTP(
    email: string, 
    otp: string, 
    signupData: SignupRequest
  ): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/verify-signup-otp', {
      email,
      otp,
      fullName: signupData.fullName,
      password: signupData.password,
    });
    return response.data;
  }

  async sendPasswordResetOTP(email: string): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>('/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(email: string, otp: string, newPassword: string): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>('/auth/reset-password', {
      email,
      otp,
      newPassword,
    });
    return response.data;
  }

  // New token-related methods
  async getTokenBalance(): Promise<{ tokens: number; monthlyLimit: number; resetDate: string }> {
    try {
      const response = await this.client.get('/user/tokens');
      return response.data;
    } catch (error: any) {
      toast.error('Failed to fetch token balance');
      throw error;
    }
  }

  // New account management methods
  
  

  async sendDeleteAccountOTP(email: string): Promise<{ message: string }> {
    const loadingToast = toast.loading('Sending verification code...');
    try {
      const response = await this.client.post('/auth/send-delete-account-otp', { email });
      toast.success('Verification code sent!', { id: loadingToast });
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send OTP', { id: loadingToast });
      throw error;
    }
  }

  async deleteAccount(email: string, otp: string): Promise<{ message: string }> {
    const loadingToast = toast.loading('Deleting account...');
    try {
      const response = await this.client.post('/auth/delete-account', { email, otp });
      toast.success('Account deleted successfully', { id: loadingToast });
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Account deletion failed', { id: loadingToast });
      throw error;
    }
  }

  async refreshTokenBalance(): Promise<{ tokens: number; resetDate: string }> {
    const response = await this.client.get<{ tokens: number; monthlyLimit: number; resetDate: string }>('/user/tokens/refresh');
    return {
      tokens: response.data.tokens,
      resetDate: response.data.resetDate
    };
  }

  async updateProfile(data: {
    fullName?: string;
    experience?: string;
    designation?: string;
    currentCompany?: string;
  }): Promise<{ message: string; user: User }> {
    const response = await this.client.put<{ message: string; user: User }>('/user/profile', data);
    return response.data;
  }
}

export const api = new ApiClient();