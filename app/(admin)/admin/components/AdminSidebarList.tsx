'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface AdminSidebarListProps<T> {
  items: T[];
  selectedId?: string;
  onSelect: (item: T) => void;
  onDelete?: (item: T) => void;
  getId: (item: T) => string;
  getTitle: (item: T) => string;
  getSubtitle?: (item: T) => React.ReactNode;
  renderExtra?: (item: T) => React.ReactNode;
  renderActions?: (item: T) => React.ReactNode;
  emptyMessage?: string;
  loading?: boolean;
  loadingMessage?: string;
}

export function AdminSidebarList<T>({
  items,
  selectedId,
  onSelect,
  onDelete,
  getId,
  getTitle,
  getSubtitle,
  renderExtra,
  renderActions,
  emptyMessage = "No items found",
  loading = false,
  loadingMessage = "Loading...",
}: AdminSidebarListProps<T>) {
  return (
    <div className="space-y-1.5 overflow-y-auto max-h-[600px] pr-1 custom-scrollbar">
      {loading ? (
        <p className="text-[10px] uppercase font-bold text-muted-foreground text-center py-8 tracking-widest">{loadingMessage}</p>
      ) : items.length === 0 ? (
        <p className="text-[10px] uppercase font-bold text-muted-foreground text-center py-8 tracking-widest">{emptyMessage}</p>
      ) : (
        items.map((item) => {
          const id = getId(item);
          const isSelected = selectedId === id;

          return (
            <div 
              key={id} 
              onClick={() => onSelect(item)}
              className={cn(
                "group p-3 rounded-xl cursor-pointer transition-all duration-200 border relative overflow-hidden",
                isSelected 
                  ? "border-primary/50 bg-primary/5 shadow-sm" 
                  : "border-transparent hover:border-border hover:bg-accent/50 bg-card/30"
              )}
            >
              <div className="flex items-center justify-between gap-3 relative z-10">
                <div className={cn("min-w-0 flex-1", renderExtra && "flex items-center gap-3")}>
                  {renderExtra && renderExtra(item)}
                  <div className="min-w-0 flex-1">
                    <p className={cn(
                      "text-sm font-bold truncate tracking-tight",
                      isSelected ? "text-primary" : "text-foreground"
                    )}>
                      {getTitle(item)}
                    </p>
                    {getSubtitle && (
                      <div className="mt-0.5">
                        {getSubtitle(item)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {renderActions && renderActions(item)}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
              {isSelected && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
