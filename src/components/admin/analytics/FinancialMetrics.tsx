import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function FinancialMetrics() {
  const [metrics, setMetrics] = useState({
    mrr: 0,
    subscriptionRevenue: 0,
    churnRate: 0,
    activeSubscribers: 0
  });

  useEffect(() => {
    fetchFinancialMetrics();
    
    const channel = supabase
      .channel('financial-metrics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, fetchFinancialMetrics)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchFinancialMetrics)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchFinancialMetrics = async () => {
    // Get active subscribers
    const { data: activeSubscribers } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_expires_at')
      .not('subscription_tier', 'is', null)
      .not('subscription_tier', 'eq', 'free')
      .or('subscription_expires_at.is.null,subscription_expires_at.gt.' + new Date().toISOString());

    const activeCount = activeSubscribers?.length || 0;

    // Get subscription payments from last month
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const { data: recentSubs } = await supabase
      .from('payments')
      .select('amount, plan_name')
      .eq('status', 'completed')
      .not('plan_name', 'is', null)
      .gte('created_at', lastMonth.toISOString());

    const subscriptionRevenue = recentSubs?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    
    // Calculate MRR (Monthly Recurring Revenue) - assuming subscriptions are monthly
    const mrr = subscriptionRevenue;

    // Get expired subscriptions for churn calculation
    const { data: expiredSubs } = await supabase
      .from('profiles')
      .select('*')
      .not('subscription_tier', 'is', null)
      .not('subscription_tier', 'eq', 'free')
      .lt('subscription_expires_at', new Date().toISOString())
      .gte('subscription_expires_at', lastMonth.toISOString());

    const churnedCount = expiredSubs?.length || 0;
    const totalSubscribers = activeCount + churnedCount;
    const churnRate = totalSubscribers > 0 ? (churnedCount / totalSubscribers) * 100 : 0;

    setMetrics({
      mrr,
      subscriptionRevenue,
      churnRate,
      activeSubscribers: activeCount
    });
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{metrics.mrr.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">MRR from subscriptions</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Subscription Revenue</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{metrics.subscriptionRevenue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">{metrics.activeSubscribers} active subscribers</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.churnRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">Last 30 days</p>
        </CardContent>
      </Card>
    </div>
  );
}
