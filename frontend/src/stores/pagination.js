import { defineStore } from 'pinia';

export const usePaginationStore = defineStore('pagination', {
  state: () => ({
    pagination: {
      page: 1,
      perPage: 10,
      total: 0
    },
    sorting: {
      field: 'createdAt',
      order: 'desc'
    },
    filters: {}
  }),

  getters: {
    paginationParams: (state) => ({
      skip: (state.pagination.page - 1) * state.pagination.perPage,
      limit: state.pagination.perPage,
      sort: state.sorting.field ? {
        field: state.sorting.field,
        order: state.sorting.order
      } : null,
      filters: state.filters
    })
  },

  actions: {
    updatePagination(params) {
      this.pagination = {
        ...this.pagination,
        ...params
      };
    },

    updateSort(params) {
      this.sorting = {
        ...this.sorting,
        ...params
      };
    },

    updateFilters(filters) {
      this.filters = filters;
      // Reset to first page when filters change
      this.pagination.page = 1;
    },

    reset() {
      this.pagination = {
        page: 1,
        perPage: 10,
        total: 0
      };
      this.sorting = {
        field: 'createdAt',
        order: 'desc'
      };
      this.filters = {};
    },

    $reset() {
      // Reset to initial state
      this.pagination = {
        page: 1,
        perPage: 10,
        total: 0
      };
      this.sorting = {
        field: 'createdAt',
        order: 'desc'
      };
      this.filters = {};
    }
  }
});
