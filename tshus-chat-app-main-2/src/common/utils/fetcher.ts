import axios, { AxiosResponse } from 'axios';
import { getCookie } from './cookie';

// API Host
const host = 'localhost';

// Server Port
const port = '8080';

// Base Url
export const BASE_URL = `http://${host}:${port}`;

// Base Url
export const AWS_URL = `https://myimagechat.s3.ap-southeast-1.amazonaws.com`;

// API api
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  },
});

// Add an interceptor to set the token in the request headers
api.interceptors.request.use((config) => {
  // Get token fom cookie
  const token = getCookie('token');

  // Check token is valid
  if (token) {
    // Set token to auth header
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Fetching
const fetching = async (response: any) => {
  // Get Status
  const status = response?.status || 500;

  // Fetch response data
  const data = response?.data?.data;

  // Return Data
  return { status, data, message: response?.data?.message };
};

// Custom Fetcher
const POST = async (url: string, data: any) => {
  // Create Fetch
  const response: AxiosResponse = await api
    .post(url, data)
    .then((res) => res)
    .catch((err) => err.response);

  // Return Fetching
  return fetching(response);
};

const PUT = async (url: string, data: any) => {
  // Create Fetch
  const response: any = await api
    .put(url, data)
    .then((res) => res)
    .catch((err) => err.response);

  // Return Fetching
  return fetching(response);
};

// Fetcher Upload file
const UPLOAD = async (
  url: string,
  payload: FormData,
) => {
  // Send file list
  const response: any = await api
    .post(url, payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((res) => res)
    .catch((err) => err.response);

  // Return Fetching
  return fetching(response);
};

// Fetcher Get
export const GET = async (
  url: string,
  params: { [key: string]: any } | null = null,
) => {
  // Response
  const response: any = await api
    .get(url, { params })
    .then((res) => res)
    .catch((err) => err.response);

  // Return Fetching
  return fetching(response);
};

// Fetcher Delete
const DELETE = async (
  url: string,
  params: { [key: string]: any } | null = null,
) => {
  // Response
  const response: any = await api
    .delete(url, { params })
    .then((res) => res)
    .catch((err) => err.response);
  // Return Fetching
  return fetching(response);
};

type Config = {
  method: string;
  url: string;
  payload?: FormData | any;
  params?: { [key: string]: any };
  admin?: boolean;
};

export const fetcher = async (config: Config) => {
  // Switch Case
  switch (config.method) {
    case 'POST':
      // Return Fetcher
      return await POST(config.url, config.payload);
    case 'PUT':
      // Return Fetcher
      return await PUT(config.url, config.payload);
    case 'GET':
      // Return Fetcher
      return await GET(config.url, config?.payload);
    case 'DELETE':
      // Return Fetcher
      return await DELETE(config.url, config?.payload);
    case 'UPLOAD':
      // Return Fetcher
      return await UPLOAD(config.url, config.payload);
  }
};
