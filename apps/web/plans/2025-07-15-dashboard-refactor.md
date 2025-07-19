# Dashboard Refactor Plan - July 15, 2025

## Overview
Complete refactor of the overview dashboard to focus on spending insights and analytics rather than account balance tracking. The goal is to provide users with clear visibility into "where their money goes" through data visualization and trend analysis.

## Current State
- Overview page uses simple `DashboardContent` component
- Default landing page is `/transactions` for operational work
- Existing timeframe controls in `/transactions` with sophisticated navigation
- Current dashboard shows basic summary cards and recent transactions

## Target State
Transform overview page into a comprehensive spending analytics dashboard with:
- Multi-period insights (daily/weekly/monthly views)
- Category-based spending analysis
- Trend visualization and comparisons
- Pattern recognition and spending intelligence

## Architecture Decisions

### Timeframe Management
- **Decision**: Reuse existing `TimeframeControls` component and `useTimeframeStore`
- **Rationale**: Consistent UX across pages, shared state, proven functionality
- **Implementation**: Import existing component, ensure styling fits overview layout

### Data Filtering
- **Decision**: Leverage existing transaction hooks with timeframe store integration
- **Rationale**: Centralized data management, consistent filtering logic
- **Implementation**: Use `useTransactions` hook with timeframe store current period

## Component Structure

### 1. Header Section
```
TimeframeControls (reused from transactions)
├── Previous/Next navigation buttons
├── Period selector dropdown
└── Daily/Weekly/Monthly segmented control
```

### 2. Summary Cards Row
```
SummaryCards
├── TotalSpentCard - Total spent this period
├── AverageSpendingCard - Daily/weekly average
├── BiggestTransactionCard - Most expensive transaction
└── TransactionCountCard - Number of transactions
```

### 3. Category Analysis Section
```
CategoryAnalysis
├── CategoryBreakdownChart - Pie/donut chart
│   ├── Interactive segments
│   ├── Category colors from existing system
│   └── Percentage and amount displays
└── TopCategoriesList - Ranked list
    ├── Category name and icon
    ├── Amount and percentage
    └── Trend indicator (up/down vs previous period)
```

### 4. Spending Trends Section
```
SpendingTrends
├── TimelineChart - Line chart showing spending over time
│   ├── Daily view: spending per day
│   ├── Weekly view: spending per week
│   └── Monthly view: spending per month
└── PeriodComparison - Current vs previous period
    ├── Percentage change
    ├── Amount difference
    └── Visual trend indicator
```

### 5. Transaction Insights Section
```
TransactionInsights
├── ExpensiveTransactions - Top 5-10 biggest transactions
│   ├── Transaction details
│   ├── Category and date
│   └── Amount highlighting
└── SpendingPatterns - Pattern analysis
    ├── Day of week spending distribution
    ├── Spending frequency insights
    └── Time-based patterns
```

### 6. Category Trends Section
```
CategoryTrends
├── CategoryComparison - Period over period analysis
│   ├── Categories with biggest increases
│   ├── Categories with biggest decreases
│   └── Percentage changes
└── CategorySpendingOverTime - Historical category trends
    ├── Multi-line chart per category
    ├── Category selection/filtering
    └── Trend analysis
```

## Implementation Phases

### Phase 1: Foundation (High Priority)
1. **Analyze current `DashboardContent` component**
   - Understand existing structure and dependencies
   - Identify reusable components
   - Plan migration strategy

2. **Design new layout structure**
   - Create responsive grid layout
   - Define card sizes and spacing
   - Plan mobile vs desktop experiences

### Phase 2: Core Components (High Priority)
3. **Integrate TimeframeControls**
   - Add to overview page layout
   - Ensure consistent styling
   - Test period navigation

4. **Create spending analytics components**
   - Summary cards with key metrics
   - Category breakdown visualization
   - Basic trend analysis

### Phase 3: Advanced Analytics (Medium Priority)
5. **Implement charts and visualizations**
   - Timeline chart for spending trends
   - Category pie/donut chart
   - Comparison visualizations

6. **Add insights and intelligence**
   - Period-over-period comparisons
   - Spending pattern analysis
   - Category trend analysis

### Phase 4: Polish and Testing (Low Priority)
7. **Responsive design and UX**
   - Mobile optimization
   - Loading states
   - Empty states

8. **Testing and refinement**
   - Test with different timeframes
   - Verify data accuracy
   - Performance optimization

## Technical Considerations

### Data Processing
- **Transaction Filtering**: Use existing `useTransactions` hook with timeframe store
- **Aggregation Logic**: Create utility functions for category grouping and period calculations
- **Comparison Logic**: Implement previous period comparison utilities
- **Performance**: Consider memoization for expensive calculations

### Chart Libraries
- **Evaluation Needed**: Assess existing chart libraries in project
- **Recommendations**: Consider lightweight options like `recharts` or `chart.js`
- **Integration**: Ensure charts work with existing theme system

### State Management
- **Timeframe State**: Reuse existing `useTimeframeStore`
- **Component State**: Use local state for UI interactions
- **Data State**: Leverage existing TanStack Query setup

### Error Handling
- **Empty States**: Handle periods with no transactions
- **Loading States**: Show skeletons during data fetching
- **Error States**: Graceful error handling for data issues

## Success Metrics

### User Experience
- Users can easily navigate between different time periods
- Insights are immediately visible and actionable
- Interface is responsive and performant

### Functionality
- All charts and analytics update correctly with timeframe changes
- Data accuracy matches raw transaction data
- Comparisons provide meaningful insights

### Technical
- No performance degradation with large datasets
- Consistent styling with existing design system
- Proper error handling and edge cases

## Dependencies

### Existing Components
- `TimeframeControls` - Reuse for period navigation
- `useTimeframeStore` - Shared state management
- `useTransactions` - Data fetching and filtering
- `useCategories` - Category data and metadata

### New Dependencies
- Chart library (TBD based on project needs)
- Date manipulation utilities (extend existing)
- Calculation utilities for analytics

### File Structure
```
src/components/dashboard/
├── overview/
│   ├── summary-cards.tsx
│   ├── category-analysis.tsx
│   ├── spending-trends.tsx
│   ├── transaction-insights.tsx
│   └── category-trends.tsx
├── charts/
│   ├── category-breakdown-chart.tsx
│   ├── timeline-chart.tsx
│   └── comparison-chart.tsx
└── dashboard-overview.tsx (new main component)
```

## Next Steps

1. **Immediate**: Begin Phase 1 analysis of current dashboard content
2. **Short-term**: Implement core summary cards and timeframe integration
3. **Medium-term**: Add visualization components and advanced analytics
4. **Long-term**: Polish UX and add intelligent insights

## Notes
- Focus on spending analysis, not account balance tracking
- Maintain consistency with existing transaction page patterns
- Ensure mobile responsiveness throughout implementation
- Consider progressive enhancement for complex visualizations