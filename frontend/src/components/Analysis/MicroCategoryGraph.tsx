'use client';

import { motion } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { MicroCategory } from '@/types';
import { useState } from 'react';

interface MicroCategoryGraphProps {
  category: MicroCategory;
}

export default function MicroCategoryGraph({ category }: MicroCategoryGraphProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const getPathColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  return (
    <div className="relative">
      <motion.div
        whileHover={{ scale: 1.05 }}
        onHoverStart={() => setShowTooltip(true)}
        onHoverEnd={() => setShowTooltip(false)}
        className="glass-card p-3"
      >
        <div className="w-16 h-16 mx-auto mb-2">
          <CircularProgressbar
            value={category.categoryScore}
            text={`${category.categoryScore}`}
            styles={buildStyles({
              textSize: '28px',
              pathColor: getPathColor(category.categoryScore),
              textColor: '#fff',
              trailColor: 'rgba(255, 255, 255, 0.1)',
            })}
          />
        </div>
        <p className="text-xs text-center font-medium leading-tight">
          {category.categoryName}
        </p>
      </motion.div>

      {showTooltip && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 border border-white/20 text-white text-xs rounded-lg p-3 w-48 shadow-xl"
        >
          <p>{category.categoryDescription}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </motion.div>
      )}
    </div>
  );
}