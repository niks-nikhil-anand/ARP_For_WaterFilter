'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import AgentNavbar from '@/components/agent/AgentNavbar'
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  IndianRupee,
  Wrench,
  Star,
  Award,
  Target,
  Activity
} from 'lucide-react'

const AnalyticsPage = () => {
  const agentName = "Rajesh Kumar"

  // Sample analytics data
  const [analytics] = useState({
    // Current Month Stats
    currentMonth: {
      ticketsResolved: 42,
      ticketsPending: 8,
      totalRevenue: 125000,
      avgResolutionTime: 3.2,
      customerSatisfaction: 4.7
    },
    // Previous Month Stats for comparison
    previousMonth: {
      ticketsResolved: 38,
      ticketsPending: 12,
      totalRevenue: 115000,
      avgResolutionTime: 3.8,
      customerSatisfaction: 4.5
    },
    // Weekly breakdown
    weeklyData: [
      { week: 'Week 1', resolved: 12, revenue: 32000 },
      { week: 'Week 2', resolved: 10, revenue: 28000 },
      { week: 'Week 3', resolved: 11, revenue: 35000 },
      { week: 'Week 4', resolved: 9, revenue: 30000 }
    ],
    // Issue type breakdown
    issueTypes: [
      { type: 'Water Filter Repair', count: 18, percentage: 42.9 },
      { type: 'Regular Maintenance', count: 12, percentage: 28.6 },
      { type: 'Filter Replacement', count: 8, percentage: 19.0 },
      { type: 'New Installation', count: 4, percentage: 9.5 }
    ],
    // Performance metrics
    performance: {
      completionRate: 95,
      firstTimeFixRate: 88,
      customerRetention: 92,
      avgPartsUsed: 2.3
    },
    // Recent achievements
    achievements: [
      { title: 'Top Performer', description: 'Most tickets resolved this month', date: '2025-11-15' },
      { title: 'Customer Favorite', description: 'Highest satisfaction rating', date: '2025-11-10' },
      { title: 'Speed Demon', description: 'Fastest avg resolution time', date: '2025-11-05' }
    ]
  })

  const calculatePercentageChange = (current, previous) => {
    const change = ((current - previous) / previous) * 100
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change > 0,
      isNegative: change < 0
    }
  }

  const StatCard = ({ title, value, icon: Icon, change, suffix = '', prefix = '' }) => {
    return (
      <Card className="dark:bg-gray-900 dark:border-gray-800">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 dark:bg-blue-950 p-3 rounded-lg">
              <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            {change && (
              <Badge className={change.isPositive
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : change.isNegative
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  : 'bg-gray-100 text-gray-800'
              }>
                {change.isPositive && <TrendingUp className="h-3 w-3 mr-1 inline" />}
                {change.isNegative && <TrendingDown className="h-3 w-3 mr-1 inline" />}
                {change.value}%
              </Badge>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {prefix}{value}{suffix}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navbar */}
      <AgentNavbar agentName={agentName} />

      {/* Header Section */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Activity className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                Analytics Dashboard
              </h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                Performance metrics for <span className="font-semibold text-blue-600 dark:text-blue-400">{agentName}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">Current Month</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {new Date().toLocaleDateString('en-IN', {
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Key Metrics */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Key Performance Indicators
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Tickets Resolved"
              value={analytics.currentMonth.ticketsResolved}
              icon={CheckCircle2}
              change={calculatePercentageChange(
                analytics.currentMonth.ticketsResolved,
                analytics.previousMonth.ticketsResolved
              )}
            />
            <StatCard
              title="Pending Tickets"
              value={analytics.currentMonth.ticketsPending}
              icon={Clock}
              change={calculatePercentageChange(
                analytics.previousMonth.ticketsPending,
                analytics.currentMonth.ticketsPending
              )}
            />
            <StatCard
              title="Total Revenue"
              value={analytics.currentMonth.totalRevenue.toLocaleString('en-IN')}
              icon={IndianRupee}
              prefix="₹"
              change={calculatePercentageChange(
                analytics.currentMonth.totalRevenue,
                analytics.previousMonth.totalRevenue
              )}
            />
            <StatCard
              title="Avg Resolution Time"
              value={analytics.currentMonth.avgResolutionTime}
              icon={Activity}
              suffix=" hrs"
              change={calculatePercentageChange(
                analytics.previousMonth.avgResolutionTime,
                analytics.currentMonth.avgResolutionTime
              )}
            />
          </div>
        </div>

        {/* Performance Metrics */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Performance Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="bg-green-100 dark:bg-green-950 p-3 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <Target className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Completion Rate</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {analytics.performance.completionRate}%
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="bg-blue-100 dark:bg-blue-950 p-3 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <Wrench className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">First-Time Fix</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {analytics.performance.firstTimeFixRate}%
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="bg-purple-100 dark:bg-purple-950 p-3 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <Star className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Customer Retention</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {analytics.performance.customerRetention}%
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="bg-yellow-100 dark:bg-yellow-950 p-3 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <Star className="h-8 w-8 text-yellow-600 dark:text-yellow-400 fill-current" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Satisfaction Score</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {analytics.currentMonth.customerSatisfaction}/5
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Weekly Breakdown and Issue Types */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Performance */}
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Weekly Breakdown
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                Tickets resolved and revenue generated per week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.weeklyData.map((week, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{week.week}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {week.resolved} tickets
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600 dark:text-green-400">
                        ₹{week.revenue.toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        ₹{Math.round(week.revenue / week.resolved).toLocaleString('en-IN')}/ticket
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Issue Type Distribution */}
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                Issue Type Distribution
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                Breakdown of tickets by issue type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.issueTypes.map((issue, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900 dark:text-white">{issue.type}</p>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {issue.count}
                        </Badge>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {issue.percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${issue.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="dark:text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              Recent Achievements
            </CardTitle>
            <CardDescription className="dark:text-gray-400">
              Your recent accomplishments and milestones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analytics.achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 rounded-lg border border-yellow-200 dark:border-yellow-800"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-yellow-500 dark:bg-yellow-600 p-2 rounded-full">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white mb-1">
                        {achievement.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {achievement.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(achievement.date).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 border-none text-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Excellent Performance!</h3>
              <p className="text-blue-100 mb-4">
                You're performing {calculatePercentageChange(
                  analytics.currentMonth.ticketsResolved,
                  analytics.previousMonth.ticketsResolved
                ).value}% better than last month
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-3xl font-bold">{analytics.currentMonth.ticketsResolved}</p>
                  <p className="text-sm text-blue-100">Resolved</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-3xl font-bold">₹{(analytics.currentMonth.totalRevenue / 1000).toFixed(0)}K</p>
                  <p className="text-sm text-blue-100">Revenue</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-3xl font-bold">{analytics.currentMonth.customerSatisfaction}</p>
                  <p className="text-sm text-blue-100">Rating</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-3xl font-bold">{analytics.performance.completionRate}%</p>
                  <p className="text-sm text-blue-100">Completion</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AnalyticsPage
