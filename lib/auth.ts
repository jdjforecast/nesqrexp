import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

// Check if user is authenticated, redirect to login if not
export function checkAuth() {
  const { userId } = auth();
  
  if (!userId) {
    redirect('/login');
  }
  
  return userId;
}

// Check if user is admin
export function isAdmin() {
  const { userId } = auth();
  // In a real app, you would check if the user has admin role
  // For now, we'll use a predefined admin ID or check if they have admin metadata
  // This is a placeholder - replace with your actual admin check logic
  const adminIds = ['admin1', 'admin2']; // Replace with actual admin IDs
  
  return adminIds.includes(userId || '');
}

// Check if user is admin, redirect to homepage if not
export function checkAdmin() {
  if (!isAdmin()) {
    redirect('/');
  }
}

// Get current user ID
export function getCurrentUserId() {
  const { userId } = auth();
  return userId;
} 