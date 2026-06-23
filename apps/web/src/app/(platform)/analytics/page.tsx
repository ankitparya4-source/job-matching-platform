import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getRecruiterAnalytics, getCandidateAnalytics } from "@/lib/actions/analytics-actions";
import { FunnelChart, TrendsChart, SkillsChart, StatusChart } from "./charts";

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (session.user.role === "RECRUITER") {
    const data = await getRecruiterAnalytics();
    
    return (
      <div className="dashboard">
        <h1 className="page-title">Analytics</h1>
        
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">{data.stats.totalJobs}</span>
            <span className="stat-label">Total Jobs</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{data.stats.totalApplications}</span>
            <span className="stat-label">Total Applications</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{data.stats.avgMatchScore}%</span>
            <span className="stat-label">Avg Match Score</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{data.stats.totalHires}</span>
            <span className="stat-label">Total Hires</span>
          </div>
        </div>

        <div className="charts-grid">
          <div className="chart-card">
            <h2 className="chart-title">Hiring Funnel</h2>
            <div className="chart-container">
              <FunnelChart data={data.funnelData} />
            </div>
          </div>

          <div className="chart-card">
            <h2 className="chart-title">Application Trends (30 Days)</h2>
            <div className="chart-container">
              <TrendsChart data={data.trendsData} />
            </div>
          </div>

          <div className="chart-card">
            <h2 className="chart-title">Top Skills in Demand</h2>
            <div className="chart-container">
              <SkillsChart data={data.topSkillsData} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CANDIDATE VIEW
  const data = await getCandidateAnalytics();
  
  return (
    <div className="dashboard">
      <h1 className="page-title">My Analytics</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{data.stats.totalApplications}</span>
          <span className="stat-label">Applications</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{data.stats.interviews}</span>
          <span className="stat-label">Interviews</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{data.stats.offers}</span>
          <span className="stat-label">Offers</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{data.stats.avgMatchScore}%</span>
          <span className="stat-label">Avg Match Score</span>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h2 className="chart-title">Application Status</h2>
          <div className="chart-container">
            <StatusChart data={data.statusData} />
          </div>
        </div>

        <div className="chart-card">
          <h2 className="chart-title">Application Trends (30 Days)</h2>
          <div className="chart-container">
            <TrendsChart data={data.trendsData} />
          </div>
        </div>
      </div>
    </div>
  );
}
