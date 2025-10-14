import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Star, Filter } from 'lucide-react';

/**
 * FilterBar Component
 * Provides sorting and filtering options for threads
 */
const FilterBar = ({ 
  activeFilter = 'hot', 
  onFilterChange,
  showSearch = true,
  onSearch,
  customFilters = []
}) => {
  const defaultFilters = [
    { id: 'hot', label: 'Hot', icon: TrendingUp, description: 'Most active discussions' },
    { id: 'new', label: 'New', icon: Clock, description: 'Recently created' },
    { id: 'top', label: 'Top', icon: Star, description: 'Highest voted' },
  ];

  const filters = customFilters.length > 0 ? customFilters : defaultFilters;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Filter Buttons */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-semibold text-gray-700 mr-2">Sort by:</span>
          {filters.map((filter) => {
            const Icon = filter.icon;
            return (
              <motion.button
                key={filter.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onFilterChange && onFilterChange(filter.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                  activeFilter === filter.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={filter.description}
              >
                <Icon className="w-4 h-4" />
                {filter.label}
              </motion.button>
            );
          })}
        </div>

        {/* Search Input */}
        {showSearch && (
          <input
            type="text"
            placeholder="Search discussions..."
            onChange={(e) => onSearch && onSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        )}
      </div>
    </div>
  );
};

export default FilterBar;
