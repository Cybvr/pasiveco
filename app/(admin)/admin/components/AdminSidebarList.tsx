'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

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
  pageSize?: number;
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
  pageSize = 12,
}: AdminSidebarListProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    setCurrentPage(1);
  }, [items]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return items.slice(startIndex, startIndex + pageSize);
  }, [currentPage, items, pageSize]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 space-y-1 overflow-y-auto pr-1 custom-scrollbar">
        {loading ? (
          <p className="text-[10px] uppercase font-bold text-muted-foreground text-center py-8 tracking-widest">{loadingMessage}</p>
        ) : items.length === 0 ? (
          <p className="text-[10px] uppercase font-bold text-muted-foreground text-center py-8 tracking-widest">{emptyMessage}</p>
        ) : (
          paginatedItems.map((item) => {
            const id = getId(item);
            const isSelected = selectedId === id;

            return (
              <div
                key={id}
                onClick={() => onSelect(item)}
                className={cn(
                  "group relative cursor-pointer overflow-hidden border px-2 py-2 transition-all duration-200",
                  isSelected
                    ? "border-primary/50 bg-primary/5 shadow-sm"
                    : "border-transparent bg-card/30 hover:border-border hover:bg-accent/50"
                )}
              >
                <div className="relative z-10 flex items-center justify-between gap-2">
                  <div className={cn("min-w-0 flex-1", renderExtra && "flex items-center gap-2")}>
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
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {renderActions && renderActions(item)}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:text-destructive hover:bg-destructive/10"
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

      {!loading && items.length > pageSize && (
        <div className="mt-2 flex shrink-0 items-center justify-between border-t pt-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {currentPage} / {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
