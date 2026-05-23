export interface ChecklistTemplate {
  id: string;
  user_id: string;
  name: string;
  is_default: boolean;
  created_at: string;
  items?: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  template_id: string;
  label: string;
  position: number;
}

export interface TradeChecklistResponse {
  id: string;
  trade_id: string;
  template_id: string;
  item_label: string;
  checked: boolean;
  position: number;
}
