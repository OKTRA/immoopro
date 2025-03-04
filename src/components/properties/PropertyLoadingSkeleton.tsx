
import React from 'react';

export default function PropertyLoadingSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="animate-pulse">
        <div className="h-8 w-1/3 bg-muted rounded mb-4"></div>
        <div className="h-64 bg-muted rounded mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-2 h-60 bg-muted rounded"></div>
          <div className="h-60 bg-muted rounded"></div>
        </div>
      </div>
    </div>
  );
}
