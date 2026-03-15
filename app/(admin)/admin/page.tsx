
'use client';

import { useEffect, useState } from 'react'
import { getAllUsers } from '@/services/userService'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    premiumUsers: 0,
    recentUsers: []
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        const users = await getAllUsers()
        const activeUsers = users.filter(user => user.isActive)
        const adminUsers = users.filter(user => user.role === 'admin')
        const premiumUsers = users.filter(user => user.metadata?.signUpMethod === 'premium')
        
        setStats({
          totalUsers: users.length,
          activeUsers: activeUsers.length,
          adminUsers: adminUsers.length,
          premiumUsers: premiumUsers.length,
          recentUsers: users.slice(0, 5)
        })
      } catch (error) {
        console.error('Error fetching user stats:', error)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 bg-card rounded-lg">
          <h3 className="font-medium text-muted-foreground">Total Users</h3>
          <p className="text-2xl font-bold">{stats.totalUsers}</p>
        </div>
        <div className="p-6 bg-card rounded-lg">
          <h3 className="font-medium text-muted-foreground">Active Users</h3>
          <p className="text-2xl font-bold">{stats.activeUsers}</p>
        </div>
        <div className="p-6 bg-card rounded-lg">
          <h3 className="font-medium text-muted-foreground">Admin Users</h3>
          <p className="text-2xl font-bold">{stats.adminUsers}</p>
        </div>
        <div className="p-6 bg-card rounded-lg">
          <h3 className="font-medium text-muted-foreground">Premium Users</h3>
          <p className="text-2xl font-bold">{stats.premiumUsers}</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Users</h2>
        <div className="bg-card rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 font-medium">Name</th>
                <th className="text-left p-4 font-medium">Email</th>
                <th className="text-left p-4 font-medium">Role</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentUsers.map((user: any, index: number) => (
                <tr key={index} className="border-b last:border-0">
                  <td className="p-4">{user.displayName || 'N/A'}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4 capitalize">{user.role || 'user'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4">
                    {user.createdAt?.toDate ? 
                      user.createdAt.toDate().toLocaleDateString() : 
                      'N/A'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
