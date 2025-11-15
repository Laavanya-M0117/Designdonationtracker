import { useState, useMemo } from 'react';
import { NGO, Donation } from '../lib/blockchain';

export type SearchableItem = NGO | Donation;
export type SortField = 'name' | 'amount' | 'timestamp' | 'totalReceived';
export type SortDirection = 'asc' | 'desc';

export interface SearchFilters {
  query: string;
  approved?: boolean;
  minAmount?: number;
  maxAmount?: number;
  dateFrom?: Date;
  dateTo?: Date;
  ngoWallet?: string;
}

export function useSearch<T extends SearchableItem>(
  items: T[],
  searchFields: (keyof T)[],
  initialFilters: Partial<SearchFilters> = {}
) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    ...initialFilters,
  });
  
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const filteredAndSortedItems = useMemo(() => {
    let filtered = items;

    // Early return if items array is empty
    if (items.length === 0) {
      return filtered;
    }

    // Text search
    if (filters.query) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(item =>
        searchFields.some(field => {
          const value = item[field];
          return value && String(value).toLowerCase().includes(query);
        })
      );
    }

    // NGO-specific filters
    if (items.length > 0 && 'approved' in items[0] && filters.approved !== undefined) {
      filtered = filtered.filter(item => 
        (item as NGO).approved === filters.approved
      );
    }

    // Donation-specific filters
    if (items.length > 0 && 'amount' in items[0]) {
      if (filters.minAmount !== undefined) {
        filtered = filtered.filter(item => 
          parseFloat((item as Donation).amount) >= filters.minAmount!
        );
      }
      
      if (filters.maxAmount !== undefined) {
        filtered = filtered.filter(item => 
          parseFloat((item as Donation).amount) <= filters.maxAmount!
        );
      }

      if (filters.ngoWallet) {
        filtered = filtered.filter(item => 
          (item as Donation).ngo.toLowerCase() === filters.ngoWallet!.toLowerCase()
        );
      }
    }

    // Date filters
    if (filters.dateFrom && items.length > 0 && 'timestamp' in items[0]) {
      const fromTime = filters.dateFrom.getTime() / 1000;
      filtered = filtered.filter(item => 
        (item as Donation).timestamp >= fromTime
      );
    }

    if (filters.dateTo && items.length > 0 && 'timestamp' in items[0]) {
      const toTime = filters.dateTo.getTime() / 1000;
      filtered = filtered.filter(item => 
        (item as Donation).timestamp <= toTime
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = (a as NGO).name || '';
          bValue = (b as NGO).name || '';
          break;
        case 'amount':
          aValue = parseFloat((a as Donation).amount || '0');
          bValue = parseFloat((b as Donation).amount || '0');
          break;
        case 'timestamp':
          aValue = (a as Donation).timestamp || 0;
          bValue = (b as Donation).timestamp || 0;
          break;
        case 'totalReceived':
          aValue = parseFloat((a as NGO).totalReceived || '0');
          bValue = parseFloat((b as NGO).totalReceived || '0');
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      const result = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sortDirection === 'asc' ? result : -result;
    });

    return filtered;
  }, [items, filters, sortField, sortDirection, searchFields]);

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({ query: '' });
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return {
    filteredItems: filteredAndSortedItems,
    filters,
    updateFilters,
    clearFilters,
    sortField,
    sortDirection,
    toggleSort,
    totalItems: items.length,
    filteredCount: filteredAndSortedItems.length,
  };
}