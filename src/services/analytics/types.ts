
export interface VisitStatistic {
  id: string;
  visitor_id: string;
  session_id: string;
  page: string;
  referrer?: string;
  user_agent?: string;
  device_type?: string;
  browser?: string;
  country?: string;
  city?: string;
  visit_time: Date;
  duration_seconds?: number;
  is_bounce: boolean;
  is_new_user: boolean;
}

export interface VisitorSummary {
  total_visitors: number;
  new_visitors: number;
  returning_visitors: number;
  average_duration: number;
  bounce_rate: number;
  popular_devices?: Array<{name: string, count: number}>;
  popular_browsers?: Array<{name: string, count: number}>;
  visit_trends?: Array<{date: string, count: number}>;
}

export interface PageVisits {
  page: string;
  visits: number;
  unique_visitors: number;
  average_duration: number;
  bounce_rate?: number;
  trend_percentage?: number;
}

export interface DeviceBreakdown {
  device_type: string;
  count: number;
  percentage: number;
}

export interface GeographicData {
  country: string;
  count: number;
  percentage: number;
}

export interface RealTimeVisitorData {
  current_visitors: number;
  pages_being_viewed: {page: string, count: number}[];
  last_updated: Date;
}

export interface VisitorSegment {
  segment_name: string;
  visitor_count: number;
  percentage: number;
}
