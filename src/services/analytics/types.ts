
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
}

export interface PageVisits {
  page: string;
  visits: number;
  unique_visitors: number;
  average_duration: number;
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
