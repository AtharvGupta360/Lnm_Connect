import React from 'react';
import { motion } from 'framer-motion';

export const PostSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
      <div className="flex items-start space-x-3">
        {/* Avatar skeleton */}
        <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
        
        <div className="flex-1 space-y-3">
          {/* User info skeleton */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/6"></div>
          </div>
          
          {/* Title skeleton */}
          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
          
          {/* Tags skeleton */}
          <div className="flex space-x-2">
            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
            <div className="h-6 bg-gray-200 rounded-full w-24"></div>
          </div>
          
          {/* Content skeleton */}
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
          
          {/* Actions skeleton */}
          <div className="flex items-center space-x-6 pt-4 border-t border-gray-100">
            <div className="h-5 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProfileSidebarSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
      {/* Cover */}
      <div className="h-16 bg-gray-200"></div>
      
      <div className="px-4 pb-4 -mt-8">
        {/* Avatar */}
        <div className="w-16 h-16 bg-gray-300 rounded-full ring-4 ring-white"></div>
        
        <div className="mt-2 space-y-2">
          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-full"></div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100">
          <div className="text-center space-y-1">
            <div className="h-5 bg-gray-200 rounded w-8 mx-auto"></div>
            <div className="h-3 bg-gray-200 rounded w-12 mx-auto"></div>
          </div>
          <div className="text-center space-y-1">
            <div className="h-5 bg-gray-200 rounded w-8 mx-auto"></div>
            <div className="h-3 bg-gray-200 rounded w-12 mx-auto"></div>
          </div>
          <div className="text-center space-y-1">
            <div className="h-5 bg-gray-200 rounded w-8 mx-auto"></div>
            <div className="h-3 bg-gray-200 rounded w-12 mx-auto"></div>
          </div>
        </div>
        
        {/* Button */}
        <div className="mt-4 h-10 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
};

export const RecommendationCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
      
      <div className="p-4 space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center space-x-3 animate-pulse">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              <div className="h-2 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const LoadingSpinner = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} border-4 border-gray-200 border-t-indigo-600 rounded-full`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );
};

export default {
  PostSkeleton,
  ProfileSidebarSkeleton,
  RecommendationCardSkeleton,
  LoadingSpinner
};
